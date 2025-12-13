"""
User data models for Student Companion Backend
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class UserRole(str, Enum):
    """User roles"""
    STUDENT = "student"
    STAFF = "staff"
    ADMIN = "admin"


class UserStatus(str, Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    """Model for creating a new user"""
    firebase_uid: str = Field(..., description="Firebase authentication UID")
    provider: str = Field(default="email", description="Auth provider (email, google)")


class UserUpdate(BaseModel):
    """Model for updating user"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    preferences: Optional[dict] = None


class UserPreferences(BaseModel):
    """User preferences"""
    theme: str = "system"  # light, dark, system
    language: str = "en"
    notifications_enabled: bool = True
    email_notifications: bool = True
    response_style: str = "balanced"  # concise, balanced, detailed
    

class UserStats(BaseModel):
    """User usage statistics"""
    total_conversations: int = 0
    total_messages: int = 0
    total_documents: int = 0
    last_active: Optional[datetime] = None


class User(UserBase):
    """Complete user model"""
    id: str = Field(..., description="User ID (same as Firebase UID)")
    firebase_uid: str
    provider: str = "email"
    status: UserStatus = UserStatus.ACTIVE
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    stats: UserStats = Field(default_factory=UserStats)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True
    
    def to_dynamo(self) -> dict:
        """Convert to DynamoDB item format"""
        return {
            "PK": f"USER#{self.id}",
            "SK": f"PROFILE#{self.id}",
            "id": self.id,
            "firebase_uid": self.firebase_uid,
            "email": self.email,
            "display_name": self.display_name,
            "photo_url": self.photo_url,
            "role": self.role.value,
            "status": self.status.value,
            "provider": self.provider,
            "preferences": self.preferences.model_dump(),
            "stats": self.stats.model_dump(),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "GSI1PK": f"EMAIL#{self.email}",
            "GSI1SK": f"USER#{self.id}",
        }
    
    @classmethod
    def from_dynamo(cls, item: dict) -> "User":
        """Create User from DynamoDB item"""
        return cls(
            id=item["id"],
            firebase_uid=item["firebase_uid"],
            email=item["email"],
            display_name=item.get("display_name"),
            photo_url=item.get("photo_url"),
            role=UserRole(item.get("role", "student")),
            status=UserStatus(item.get("status", "active")),
            provider=item.get("provider", "email"),
            preferences=UserPreferences(**item.get("preferences", {})),
            stats=UserStats(**item.get("stats", {})),
            created_at=datetime.fromisoformat(item["created_at"]),
            updated_at=datetime.fromisoformat(item["updated_at"]),
            last_login=datetime.fromisoformat(item["last_login"]) if item.get("last_login") else None,
        )


class UserProfile(BaseModel):
    """Public user profile (safe to expose)"""
    id: str
    email: str
    display_name: Optional[str]
    photo_url: Optional[str]
    role: UserRole
    created_at: datetime
    
    @classmethod
    def from_user(cls, user: User) -> "UserProfile":
        """Create profile from full user"""
        return cls(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            photo_url=user.photo_url,
            role=user.role,
            created_at=user.created_at,
        )

