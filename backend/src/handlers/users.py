"""
Users Handler
Handles user profile and preferences
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr

from ..utils import logger, validate_email
from ..services import dynamo_service
from ..models import User, UserCreate, UserUpdate, UserProfile

router = APIRouter(prefix="/user", tags=["Users"])


# ==================== REQUEST MODELS ====================

class CreateUserRequest(BaseModel):
    """Request to create a user"""
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    provider: str = "email"


class UpdateUserRequest(BaseModel):
    """Request to update user profile"""
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    preferences: Optional[dict] = None


# ==================== HELPER FUNCTIONS ====================

async def get_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from authorization header"""
    if authorization and authorization.startswith("Bearer "):
        # TODO: Validate Firebase token and extract UID
        # For now, return None
        return None
    return None


async def require_auth(authorization: Optional[str] = Header(None)) -> str:
    """Require authentication"""
    user_id = await get_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


# ==================== ENDPOINTS ====================

@router.post("/register")
async def register_user(request: CreateUserRequest) -> dict:
    """
    Register a new user (called after Firebase auth)
    Creates the user profile in DynamoDB
    """
    try:
        # Check if user already exists
        existing = await dynamo_service.get_user(request.firebase_uid)
        if existing:
            # Update last login and return existing user
            await dynamo_service.update_user_last_login(request.firebase_uid)
            return {
                "user": UserProfile.from_user(existing).model_dump(),
                "created": False
            }
        
        # Create new user
        user_create = UserCreate(
            firebase_uid=request.firebase_uid,
            email=request.email,
            display_name=request.display_name,
            photo_url=request.photo_url,
            provider=request.provider
        )
        
        user = await dynamo_service.create_user(user_create)
        
        logger.info("User registered", user_id=user.id, email=user.email)
        
        return {
            "user": UserProfile.from_user(user).model_dump(),
            "created": True
        }
        
    except Exception as e:
        logger.error("User registration failed", error=str(e))
        raise HTTPException(status_code=500, detail="Registration failed")


@router.get("/profile")
async def get_profile(user_id: str = Depends(require_auth)) -> dict:
    """Get current user's profile"""
    user = await dynamo_service.get_user(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "role": user.role.value,
            "preferences": user.preferences.model_dump(),
            "stats": user.stats.model_dump(),
            "created_at": user.created_at.isoformat(),
            "last_login": user.last_login.isoformat() if user.last_login else None
        }
    }


@router.put("/profile")
async def update_profile(
    request: UpdateUserRequest,
    user_id: str = Depends(require_auth)
) -> dict:
    """Update user profile"""
    try:
        update_data = UserUpdate(
            display_name=request.display_name,
            photo_url=request.photo_url,
            preferences=request.preferences
        )
        
        user = await dynamo_service.update_user(user_id, update_data)
        
        return {
            "user": UserProfile.from_user(user).model_dump(),
            "updated": True
        }
        
    except Exception as e:
        logger.error("Profile update failed", user_id=user_id, error=str(e))
        raise HTTPException(status_code=500, detail="Update failed")


@router.get("/stats")
async def get_user_stats(user_id: str = Depends(require_auth)) -> dict:
    """Get user statistics"""
    user = await dynamo_service.get_user(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get conversation count
    conversations = await dynamo_service.list_conversations(user_id, limit=1000)
    
    return {
        "total_conversations": len(conversations),
        "total_messages": user.stats.total_messages,
        "member_since": user.created_at.isoformat(),
        "last_active": user.last_login.isoformat() if user.last_login else None
    }


@router.delete("/account")
async def delete_account(user_id: str = Depends(require_auth)) -> dict:
    """Delete user account and all data"""
    try:
        # Delete all conversations
        conversations = await dynamo_service.list_conversations(user_id)
        for conv in conversations:
            await dynamo_service.delete_conversation(conv.id, user_id)
        
        # Note: User record deletion would need to be implemented
        # For now, we just delete conversations
        
        logger.info("User account deletion initiated", user_id=user_id)
        
        return {
            "deleted": True,
            "conversations_deleted": len(conversations)
        }
        
    except Exception as e:
        logger.error("Account deletion failed", user_id=user_id, error=str(e))
        raise HTTPException(status_code=500, detail="Deletion failed")

