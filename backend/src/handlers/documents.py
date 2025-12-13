"""
Documents Handler
Handles document upload, processing, and management
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from pydantic import BaseModel

from ..utils import (
    settings, logger, 
    validate_document_type, validate_file_size, sanitize_filename,
    DocumentProcessingError
)
from ..services import s3_service, dynamo_service, opensearch_service, document_processor, bedrock_service
from ..models import Document, DocumentCategory, DocumentStatus, DocumentSummary

router = APIRouter(prefix="/documents", tags=["Documents"])


# ==================== HELPER FUNCTIONS ====================

async def get_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from authorization header"""
    if authorization and authorization.startswith("Bearer "):
        # TODO: Validate Firebase token
        return None
    return None


async def require_admin(authorization: Optional[str] = Header(None)) -> bool:
    """Check if user is admin (for knowledge base uploads)"""
    # TODO: Implement admin check
    return True  # For now, allow all


# ==================== RESPONSE MODELS ====================

class DocumentResponse(BaseModel):
    """Document response model"""
    id: str
    filename: str
    category: str
    status: str
    message: str


class DocumentListResponse(BaseModel):
    """Document list response"""
    documents: List[dict]
    count: int


# ==================== ENDPOINTS ====================

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form(default="general"),
    description: Optional[str] = Form(None),
    user_id: Optional[str] = Depends(get_user_id)
) -> DocumentResponse:
    """
    Upload a document for processing
    
    The document will be:
    1. Uploaded to S3
    2. Text extracted
    3. Chunked and indexed in OpenSearch for RAG
    """
    try:
        # Validate file type
        content_type = validate_document_type(file.content_type or "", file.filename or "")
        
        # Read file content
        content = await file.read()
        
        # Validate file size
        validate_file_size(len(content))
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename or "document")
        
        logger.info(
            "Document upload started",
            filename=safe_filename,
            size=len(content),
            category=category
        )
        
        # Upload to S3
        s3_result = await s3_service.upload_file(
            file_content=content,
            filename=safe_filename,
            content_type=content_type,
            category=category,
            user_id=user_id
        )
        
        # Create document record
        doc_category = DocumentCategory(category) if category in [c.value for c in DocumentCategory] else DocumentCategory.GENERAL
        
        document = Document(
            user_id=user_id or "system",
            filename=safe_filename,
            original_filename=file.filename or safe_filename,
            content_type=content_type,
            category=doc_category,
            description=description,
            s3_key=s3_result["key"],
            s3_bucket=s3_result["bucket"],
            status=DocumentStatus.PROCESSING
        )
        
        # Save to DynamoDB
        await dynamo_service.create_document(document)
        
        # Process document (extract text, chunk, index)
        try:
            full_text, chunks, stats = await document_processor.process_document(
                content=content,
                filename=safe_filename,
                content_type=content_type,
                document_id=document.id,
                metadata={
                    "category": category,
                    "title": file.filename,
                    "description": description
                }
            )
            
            # Generate embeddings and index chunks
            if opensearch_service.is_available():
                for chunk in chunks:
                    try:
                        embedding = await bedrock_service.generate_embedding(chunk.content)
                        chunk.embedding = embedding
                    except Exception as e:
                        logger.warning("Embedding generation failed for chunk", error=str(e))
                
                # Bulk index chunks
                indexed_count = await opensearch_service.index_chunks_bulk(chunks)
                logger.info("Chunks indexed", document_id=document.id, count=indexed_count)
            
            # Update document status
            await dynamo_service.update_document_status(
                document_id=document.id,
                status=DocumentStatus.COMPLETED,
                stats=stats.model_dump()
            )
            
            return DocumentResponse(
                id=document.id,
                filename=safe_filename,
                category=category,
                status="completed",
                message=f"Document processed successfully. {stats.chunk_count} chunks indexed."
            )
            
        except DocumentProcessingError as e:
            # Update status to failed
            await dynamo_service.update_document_status(
                document_id=document.id,
                status=DocumentStatus.FAILED,
                error_message=str(e)
            )
            
            return DocumentResponse(
                id=document.id,
                filename=safe_filename,
                category=category,
                status="failed",
                message=f"Processing failed: {str(e)}"
            )
        
    except Exception as e:
        logger.error("Document upload failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("", response_model=DocumentListResponse)
@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    category: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    user_id: Optional[str] = Depends(get_user_id)
) -> DocumentListResponse:
    """List documents with optional filters"""
    try:
        doc_status = DocumentStatus(status) if status else None
        
        documents = await dynamo_service.list_documents(
            user_id=user_id,
            category=category,
            status=doc_status,
            limit=limit
        )
        
        return DocumentListResponse(
            documents=[
                {
                    "id": doc.id,
                    "filename": doc.original_filename,
                    "category": doc.category.value,
                    "status": doc.status.value,
                    "size_bytes": doc.stats.file_size_bytes,
                    "chunk_count": doc.stats.chunk_count,
                    "created_at": doc.created_at.isoformat()
                }
                for doc in documents
            ],
            count=len(documents)
        )
        
    except Exception as e:
        logger.error("List documents failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to list documents")


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user_id: Optional[str] = Depends(get_user_id)
) -> dict:
    """Get document details"""
    document = await dynamo_service.get_document(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check ownership if user is logged in
    if user_id and document.user_id != user_id and document.user_id != "system":
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "id": document.id,
        "filename": document.original_filename,
        "category": document.category.value,
        "description": document.description,
        "status": document.status.value,
        "stats": document.stats.model_dump(),
        "created_at": document.created_at.isoformat(),
        "processed_at": document.processed_at.isoformat() if document.processed_at else None,
        "error_message": document.error_message
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user_id: Optional[str] = Depends(get_user_id),
    is_admin: bool = Depends(require_admin)
) -> dict:
    """Delete a document and its chunks"""
    document = await dynamo_service.get_document(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check ownership
    if not is_admin and user_id and document.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Delete from OpenSearch
        if opensearch_service.is_available():
            await opensearch_service.delete_document_chunks(document_id)
        
        # Delete from S3
        await s3_service.delete_file(document.s3_bucket, document.s3_key)
        
        # Delete from DynamoDB
        await dynamo_service.delete_document(document_id)
        
        logger.info("Document deleted", document_id=document_id)
        
        return {"deleted": True, "document_id": document_id}
        
    except Exception as e:
        logger.error("Delete document failed", document_id=document_id, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: str,
    is_admin: bool = Depends(require_admin)
) -> dict:
    """Reprocess a failed document"""
    if not is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    document = await dynamo_service.get_document(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Download from S3
        content = await s3_service.download_file(document.s3_bucket, document.s3_key)
        
        # Update status
        await dynamo_service.update_document_status(
            document_id=document_id,
            status=DocumentStatus.PROCESSING
        )
        
        # Reprocess
        full_text, chunks, stats = await document_processor.process_document(
            content=content,
            filename=document.filename,
            content_type=document.content_type,
            document_id=document.id,
            metadata={
                "category": document.category.value,
                "title": document.original_filename
            }
        )
        
        # Delete old chunks
        if opensearch_service.is_available():
            await opensearch_service.delete_document_chunks(document_id)
            
            # Index new chunks
            for chunk in chunks:
                try:
                    embedding = await bedrock_service.generate_embedding(chunk.content)
                    chunk.embedding = embedding
                except Exception:
                    pass
            
            await opensearch_service.index_chunks_bulk(chunks)
        
        # Update status
        await dynamo_service.update_document_status(
            document_id=document_id,
            status=DocumentStatus.COMPLETED,
            stats=stats.model_dump()
        )
        
        return {
            "reprocessed": True,
            "document_id": document_id,
            "chunks": stats.chunk_count
        }
        
    except Exception as e:
        await dynamo_service.update_document_status(
            document_id=document_id,
            status=DocumentStatus.FAILED,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=f"Reprocessing failed: {str(e)}")

