"""
Document data models for Student Companion Backend
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class DocumentStatus(str, Enum):
    """Document processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentCategory(str, Enum):
    """Document categories for organization"""
    ADMISSIONS = "admissions"
    ACADEMICS = "academics"
    WELLNESS = "wellness"
    POLICIES = "policies"
    LIBRARY = "library"
    CAMPUS = "campus"
    FINANCIAL = "financial"
    CAREER = "career"
    GENERAL = "general"


class DocumentCreate(BaseModel):
    """Model for creating a new document"""
    filename: str
    content_type: str
    category: DocumentCategory = DocumentCategory.GENERAL
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class DocumentChunk(BaseModel):
    """A chunk of document content for RAG"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    content: str
    chunk_index: int
    start_char: int
    end_char: int
    embedding: Optional[List[float]] = None  # Vector embedding
    metadata: dict = Field(default_factory=dict)
    
    def to_opensearch(self) -> dict:
        """Convert to OpenSearch document format"""
        return {
            "_id": self.id,
            "document_id": self.document_id,
            "content": self.content,
            "chunk_index": self.chunk_index,
            "embedding": self.embedding,
            "metadata": self.metadata,
        }


class DocumentStats(BaseModel):
    """Document processing statistics"""
    file_size_bytes: int = 0
    page_count: Optional[int] = None
    word_count: int = 0
    chunk_count: int = 0
    processing_time_ms: Optional[int] = None


class Document(BaseModel):
    """Complete document model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # Who uploaded it
    filename: str
    original_filename: str
    content_type: str
    category: DocumentCategory = DocumentCategory.GENERAL
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    s3_key: str  # S3 object key
    s3_bucket: str
    status: DocumentStatus = DocumentStatus.PENDING
    stats: DocumentStats = Field(default_factory=DocumentStats)
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
    
    def to_dynamo(self) -> dict:
        """Convert to DynamoDB item format"""
        return {
            "PK": f"DOC#{self.id}",
            "SK": f"META#{self.id}",
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "content_type": self.content_type,
            "category": self.category.value,
            "description": self.description,
            "tags": self.tags,
            "s3_key": self.s3_key,
            "s3_bucket": self.s3_bucket,
            "status": self.status.value,
            "stats": self.stats.model_dump(),
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "type": "DOCUMENT",
            # GSI for listing by user
            "GSI1PK": f"USER#{self.user_id}",
            "GSI1SK": f"DOC#{self.created_at.isoformat()}",
            # GSI for listing by category
            "GSI2PK": f"CATEGORY#{self.category.value}",
            "GSI2SK": f"DOC#{self.created_at.isoformat()}",
            # GSI for listing by status
            "GSI3PK": f"STATUS#{self.status.value}",
            "GSI3SK": f"DOC#{self.created_at.isoformat()}",
        }
    
    @classmethod
    def from_dynamo(cls, item: dict) -> "Document":
        """Create Document from DynamoDB item"""
        return cls(
            id=item["id"],
            user_id=item["user_id"],
            filename=item["filename"],
            original_filename=item["original_filename"],
            content_type=item["content_type"],
            category=DocumentCategory(item.get("category", "general")),
            description=item.get("description"),
            tags=item.get("tags", []),
            s3_key=item["s3_key"],
            s3_bucket=item["s3_bucket"],
            status=DocumentStatus(item.get("status", "pending")),
            stats=DocumentStats(**item.get("stats", {})),
            error_message=item.get("error_message"),
            created_at=datetime.fromisoformat(item["created_at"]),
            updated_at=datetime.fromisoformat(item["updated_at"]),
            processed_at=datetime.fromisoformat(item["processed_at"]) if item.get("processed_at") else None,
        )
    
    @property
    def s3_url(self) -> str:
        """Get S3 URL for the document"""
        return f"s3://{self.s3_bucket}/{self.s3_key}"
    
    def mark_processing(self) -> None:
        """Mark document as being processed"""
        self.status = DocumentStatus.PROCESSING
        self.updated_at = datetime.utcnow()
    
    def mark_completed(self, stats: Optional[DocumentStats] = None) -> None:
        """Mark document as processed"""
        self.status = DocumentStatus.COMPLETED
        self.processed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        if stats:
            self.stats = stats
    
    def mark_failed(self, error_message: str) -> None:
        """Mark document as failed"""
        self.status = DocumentStatus.FAILED
        self.error_message = error_message
        self.updated_at = datetime.utcnow()


class DocumentSummary(BaseModel):
    """Summary of a document for listing"""
    id: str
    filename: str
    category: DocumentCategory
    status: DocumentStatus
    file_size_bytes: int
    created_at: datetime
    
    @classmethod
    def from_document(cls, doc: Document) -> "DocumentSummary":
        """Create summary from full document"""
        return cls(
            id=doc.id,
            filename=doc.original_filename,
            category=doc.category,
            status=doc.status,
            file_size_bytes=doc.stats.file_size_bytes,
            created_at=doc.created_at,
        )

