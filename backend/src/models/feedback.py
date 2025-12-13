"""
Feedback data models for Student Companion Backend
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum
import uuid


class FeedbackType(str, Enum):
    """Type of feedback"""
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    RATING = "rating"
    COMMENT = "comment"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"


class FeedbackCategory(str, Enum):
    """Category of feedback"""
    RESPONSE_QUALITY = "response_quality"
    ACCURACY = "accuracy"
    HELPFULNESS = "helpfulness"
    SPEED = "speed"
    UI_UX = "ui_ux"
    GENERAL = "general"


class FeedbackCreate(BaseModel):
    """Model for creating feedback"""
    type: FeedbackType
    category: FeedbackCategory = FeedbackCategory.GENERAL
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)
    message_id: Optional[str] = None  # Related message if any
    conversation_id: Optional[str] = None  # Related conversation if any
    metadata: dict = Field(default_factory=dict)


class Feedback(BaseModel):
    """Complete feedback model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: FeedbackType
    category: FeedbackCategory = FeedbackCategory.GENERAL
    rating: Optional[int] = None
    comment: Optional[str] = None
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_resolved: bool = False
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    def to_dynamo(self) -> dict:
        """Convert to DynamoDB item format"""
        return {
            "PK": f"FEEDBACK#{self.id}",
            "SK": f"META#{self.id}",
            "id": self.id,
            "user_id": self.user_id,
            "type": self.type.value,
            "category": self.category.value,
            "rating": self.rating,
            "comment": self.comment,
            "message_id": self.message_id,
            "conversation_id": self.conversation_id,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "is_resolved": self.is_resolved,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolution_notes": self.resolution_notes,
            "entity_type": "FEEDBACK",
            # GSI for listing by user
            "GSI1PK": f"USER#{self.user_id}",
            "GSI1SK": f"FEEDBACK#{self.created_at.isoformat()}",
            # GSI for listing by type
            "GSI2PK": f"FEEDBACK_TYPE#{self.type.value}",
            "GSI2SK": f"FEEDBACK#{self.created_at.isoformat()}",
            # GSI for unresolved feedback
            "GSI3PK": "FEEDBACK_UNRESOLVED" if not self.is_resolved else "FEEDBACK_RESOLVED",
            "GSI3SK": f"FEEDBACK#{self.created_at.isoformat()}",
        }
    
    @classmethod
    def from_dynamo(cls, item: dict) -> "Feedback":
        """Create Feedback from DynamoDB item"""
        return cls(
            id=item["id"],
            user_id=item["user_id"],
            type=FeedbackType(item["type"]),
            category=FeedbackCategory(item.get("category", "general")),
            rating=item.get("rating"),
            comment=item.get("comment"),
            message_id=item.get("message_id"),
            conversation_id=item.get("conversation_id"),
            metadata=item.get("metadata", {}),
            created_at=datetime.fromisoformat(item["created_at"]),
            is_resolved=item.get("is_resolved", False),
            resolved_at=datetime.fromisoformat(item["resolved_at"]) if item.get("resolved_at") else None,
            resolution_notes=item.get("resolution_notes"),
        )
    
    def resolve(self, notes: Optional[str] = None) -> None:
        """Mark feedback as resolved"""
        self.is_resolved = True
        self.resolved_at = datetime.utcnow()
        self.resolution_notes = notes


class FeedbackStats(BaseModel):
    """Aggregated feedback statistics"""
    total_feedback: int = 0
    thumbs_up: int = 0
    thumbs_down: int = 0
    average_rating: Optional[float] = None
    total_ratings: int = 0
    unresolved_count: int = 0
    
    @property
    def satisfaction_rate(self) -> Optional[float]:
        """Calculate satisfaction rate from thumbs up/down"""
        total = self.thumbs_up + self.thumbs_down
        if total == 0:
            return None
        return (self.thumbs_up / total) * 100

