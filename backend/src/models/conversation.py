"""
Conversation and Message data models for Student Companion Backend
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class MessageRole(str, Enum):
    """Message sender role"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageSource(str, Enum):
    """Source of the response"""
    BEDROCK = "bedrock"
    KNOWLEDGE_BASE = "knowledge_base"
    HUGGINGFACE = "huggingface"
    FALLBACK = "fallback"


class MessageMetadata(BaseModel):
    """Metadata for a message"""
    source: Optional[MessageSource] = None
    model: Optional[str] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    knowledge_sources: Optional[List[str]] = None
    confidence_score: Optional[float] = None


class MessageCreate(BaseModel):
    """Model for creating a new message"""
    content: str = Field(..., min_length=1, max_length=10000)
    role: MessageRole = MessageRole.USER


class Message(BaseModel):
    """Complete message model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    role: MessageRole
    content: str
    metadata: MessageMetadata = Field(default_factory=MessageMetadata)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        from_attributes = True
    
    def to_dynamo(self) -> dict:
        """Convert to DynamoDB item format"""
        return {
            "PK": f"CONV#{self.conversation_id}",
            "SK": f"MSG#{self.created_at.isoformat()}#{self.id}",
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role.value,
            "content": self.content,
            "metadata": self.metadata.model_dump(),
            "created_at": self.created_at.isoformat(),
            "type": "MESSAGE",
        }
    
    @classmethod
    def from_dynamo(cls, item: dict) -> "Message":
        """Create Message from DynamoDB item"""
        return cls(
            id=item["id"],
            conversation_id=item["conversation_id"],
            role=MessageRole(item["role"]),
            content=item["content"],
            metadata=MessageMetadata(**item.get("metadata", {})),
            created_at=datetime.fromisoformat(item["created_at"]),
        )


class ConversationCreate(BaseModel):
    """Model for creating a new conversation"""
    title: Optional[str] = None
    initial_message: Optional[str] = None


class ConversationSummary(BaseModel):
    """Summary of a conversation for listing"""
    id: str
    title: str
    last_message_preview: Optional[str] = None
    message_count: int = 0
    created_at: datetime
    updated_at: datetime


class Conversation(BaseModel):
    """Complete conversation model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str = "New Conversation"
    messages: List[Message] = Field(default_factory=list)
    message_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_archived: bool = False
    
    class Config:
        from_attributes = True
    
    def to_dynamo(self) -> dict:
        """Convert to DynamoDB item format (conversation metadata only)"""
        last_message = self.messages[-1].content[:100] if self.messages else None
        
        return {
            "PK": f"USER#{self.user_id}",
            "SK": f"CONV#{self.id}",
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message_count": self.message_count,
            "last_message_preview": last_message,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_archived": self.is_archived,
            "type": "CONVERSATION",
            "GSI1PK": f"CONV#{self.id}",
            "GSI1SK": f"META",
        }
    
    @classmethod
    def from_dynamo(cls, item: dict, messages: Optional[List[Message]] = None) -> "Conversation":
        """Create Conversation from DynamoDB item"""
        return cls(
            id=item["id"],
            user_id=item["user_id"],
            title=item.get("title", "New Conversation"),
            messages=messages or [],
            message_count=item.get("message_count", 0),
            created_at=datetime.fromisoformat(item["created_at"]),
            updated_at=datetime.fromisoformat(item["updated_at"]),
            is_archived=item.get("is_archived", False),
        )
    
    def to_summary(self) -> ConversationSummary:
        """Convert to summary for listing"""
        return ConversationSummary(
            id=self.id,
            title=self.title,
            last_message_preview=self.messages[-1].content[:100] if self.messages else None,
            message_count=self.message_count,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
    
    def add_message(self, role: MessageRole, content: str, metadata: Optional[MessageMetadata] = None) -> Message:
        """Add a message to the conversation"""
        message = Message(
            conversation_id=self.id,
            role=role,
            content=content,
            metadata=metadata or MessageMetadata(),
        )
        self.messages.append(message)
        self.message_count += 1
        self.updated_at = datetime.utcnow()
        
        # Update title from first user message if default
        if self.title == "New Conversation" and role == MessageRole.USER:
            self.title = content[:50] + ("..." if len(content) > 50 else "")
        
        return message
    
    def get_history_for_ai(self, max_messages: int = 20) -> List[dict]:
        """Get conversation history formatted for AI"""
        history = []
        for msg in self.messages[-max_messages:]:
            history.append({
                "role": msg.role.value,
                "content": msg.content
            })
        return history

