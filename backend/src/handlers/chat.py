"""
Chat Handler
Main endpoint for AI chat interactions
"""

import time
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field

from ..utils import settings, logger, ValidationError, validate_message
from ..services import bedrock_service, opensearch_service, dynamo_service
from ..models import MessageRole, MessageMetadata, MessageSource
from ..knowledge_base import search_knowledge_base

router = APIRouter(prefix="/api", tags=["Chat"])


# ==================== REQUEST/RESPONSE MODELS ====================

class ChatMessage(BaseModel):
    """A message in the conversation history"""
    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., min_length=1, max_length=10000)
    history: List[ChatMessage] = Field(default_factory=list)
    conversation_id: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0, le=1)
    max_tokens: Optional[int] = Field(None, ge=100, le=8000)
    options: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    response: str
    conversation_id: Optional[str] = None
    source: str = "bedrock"
    model: Optional[str] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    knowledge_sources: Optional[List[str]] = None


# ==================== HELPER FUNCTIONS ====================

async def get_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from authorization header (Firebase token)"""
    # In production, validate Firebase token here
    # For now, return None for anonymous users
    if authorization and authorization.startswith("Bearer "):
        # TODO: Validate Firebase token and extract user ID
        return None
    return None


async def fallback_to_huggingface(
    message: str,
    history: List[Dict[str, str]]
) -> Optional[str]:
    """Fallback to Hugging Face backend if Bedrock fails"""
    if not settings.huggingface_fallback_enabled:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.huggingface_endpoint}/api/chat",
                json={
                    "message": message,
                    "history": history
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("response")
    except Exception as e:
        logger.warning("Hugging Face fallback failed", error=str(e))
    
    return None


# ==================== ENDPOINTS ====================

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: Optional[str] = Depends(get_user_id)
) -> ChatResponse:
    """
    Main chat endpoint
    Processes user messages and returns AI responses
    """
    start_time = time.time()
    
    try:
        # Validate message
        message = validate_message(request.message)
        
        logger.info(
            "Chat request received",
            message_length=len(message),
            history_length=len(request.history),
            user_id=user_id
        )
        
        # Convert history to list of dicts
        history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        # Step 1: Search knowledge base for relevant context
        context = None
        knowledge_sources = []
        
        try:
            # Search local knowledge base first
            kb_results = search_knowledge_base(message)
            
            if kb_results:
                # Format context from knowledge base
                context_parts = []
                for result in kb_results[:3]:  # Top 3 results
                    context_parts.append(f"**{result['title']}** ({result['category']})\n{result['content'][:500]}")
                    knowledge_sources.append(result['title'])
                
                context = "\n\n---\n\n".join(context_parts)
                logger.info("Knowledge base context found", sources=len(kb_results))
            
            # Also try OpenSearch if available
            if opensearch_service.is_available():
                try:
                    # Generate embedding for semantic search
                    query_embedding = await bedrock_service.generate_embedding(message)
                    
                    # Search OpenSearch
                    os_results = await opensearch_service.hybrid_search(
                        query=message,
                        query_embedding=query_embedding,
                        k=3
                    )
                    
                    if os_results:
                        for result in os_results:
                            if result["content"] not in (context or ""):
                                if context:
                                    context += f"\n\n---\n\n{result['content']}"
                                else:
                                    context = result["content"]
                                
                                source_name = result.get("metadata", {}).get("title", "Document")
                                if source_name not in knowledge_sources:
                                    knowledge_sources.append(source_name)
                
                except Exception as e:
                    logger.warning("OpenSearch search failed", error=str(e))
        
        except Exception as e:
            logger.warning("Knowledge base search failed", error=str(e))
        
        # Step 2: Generate response with Bedrock (Claude 3)
        response_text = None
        source = MessageSource.BEDROCK
        model = settings.bedrock_model_id
        tokens_used = None
        
        try:
            result = await bedrock_service.generate_response(
                message=message,
                conversation_history=history,
                context=context,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            
            response_text = result["response"]
            tokens_used = result.get("total_tokens")
            source = MessageSource.BEDROCK
            
        except Exception as e:
            logger.error("Bedrock failed, trying fallback", error=str(e))
            
            # Try Hugging Face fallback
            response_text = await fallback_to_huggingface(message, history)
            
            if response_text:
                source = MessageSource.HUGGINGFACE
                model = "huggingface"
            else:
                # Use knowledge base response if available
                if kb_results:
                    response_text = format_knowledge_base_response(message, kb_results)
                    source = MessageSource.KNOWLEDGE_BASE
                    model = "knowledge_base"
                else:
                    raise HTTPException(
                        status_code=503,
                        detail="AI service temporarily unavailable. Please try again."
                    )
        
        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Step 3: Store in conversation history if user is logged in
        conversation_id = request.conversation_id
        if user_id:
            try:
                # Create or get conversation
                if not conversation_id:
                    conversation = await dynamo_service.create_conversation(user_id)
                    conversation_id = conversation.id
                
                # Store user message
                await dynamo_service.add_message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role=MessageRole.USER,
                    content=message
                )
                
                # Store AI response
                await dynamo_service.add_message(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    role=MessageRole.ASSISTANT,
                    content=response_text,
                    metadata={
                        "source": source.value,
                        "model": model,
                        "tokens_used": tokens_used,
                        "latency_ms": latency_ms,
                        "knowledge_sources": knowledge_sources
                    }
                )
            except Exception as e:
                logger.warning("Failed to store conversation", error=str(e))
        
        logger.info(
            "Chat response generated",
            source=source.value,
            latency_ms=latency_ms,
            tokens=tokens_used
        )
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            source=source.value,
            model=model,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
            knowledge_sources=knowledge_sources if knowledge_sources else None
        )
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except Exception as e:
        logger.error("Chat error", error=str(e))
        raise HTTPException(status_code=500, detail="An error occurred processing your request")


def format_knowledge_base_response(query: str, results: List[Dict]) -> str:
    """Format knowledge base results into a response"""
    if not results:
        return "I couldn't find specific information about that. Please contact support@alueducation.com for assistance."
    
    top_result = results[0]
    
    response = f"## {top_result['title']}\n\n"
    response += f"**Category:** {top_result['category']}\n\n"
    response += top_result['content'][:1000]
    
    if len(top_result['content']) > 1000:
        response += "...\n\n"
    
    if len(results) > 1:
        response += "\n\n### Related Information\n\n"
        for result in results[1:3]:
            response += f"- **{result['title']}** ({result['category']})\n"
    
    response += "\n\n---\n\n"
    response += "📧 Need more help? Contact support@alueducation.com\n"
    response += "📞 Phone: +250 788 309 667"
    
    return response


@router.get("/conversations")
async def list_conversations(
    user_id: Optional[str] = Depends(get_user_id),
    limit: int = 50
) -> Dict[str, Any]:
    """List user's conversations"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conversations = await dynamo_service.list_conversations(user_id, limit)
    
    return {
        "conversations": [conv.to_summary().model_dump() for conv in conversations],
        "count": len(conversations)
    }


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    user_id: Optional[str] = Depends(get_user_id)
) -> Dict[str, Any]:
    """Get a specific conversation with messages"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    conversation = await dynamo_service.get_conversation(conversation_id, user_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation": {
            "id": conversation.id,
            "title": conversation.title,
            "messages": [
                {
                    "id": msg.id,
                    "role": msg.role.value,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in conversation.messages
            ],
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat()
        }
    }


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_id: Optional[str] = Depends(get_user_id)
) -> Dict[str, Any]:
    """Delete a conversation"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    success = await dynamo_service.delete_conversation(conversation_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"deleted": True, "conversation_id": conversation_id}

