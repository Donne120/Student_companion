"""
Feedback Handler
Handles user feedback and ratings
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, Field

from ..utils import logger
from ..services import dynamo_service
from ..models import Feedback, FeedbackCreate, FeedbackType, FeedbackCategory

router = APIRouter(prefix="/feedback", tags=["Feedback"])


# ==================== REQUEST MODELS ====================

class SubmitFeedbackRequest(BaseModel):
    """Request to submit feedback"""
    type: str = Field(..., description="Feedback type: thumbs_up, thumbs_down, rating, comment, bug_report, feature_request")
    category: str = Field(default="general", description="Feedback category")
    rating: Optional[int] = Field(None, ge=1, le=5, description="Rating 1-5")
    comment: Optional[str] = Field(None, max_length=2000)
    message_id: Optional[str] = None
    conversation_id: Optional[str] = None
    metadata: Optional[dict] = None


# ==================== HELPER FUNCTIONS ====================

async def get_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """Extract user ID from authorization header"""
    if authorization and authorization.startswith("Bearer "):
        return None  # TODO: Validate Firebase token
    return None


# ==================== ENDPOINTS ====================

@router.post("")
@router.post("/")
async def submit_feedback(
    request: SubmitFeedbackRequest,
    user_id: Optional[str] = Depends(get_user_id)
) -> dict:
    """Submit feedback"""
    try:
        # Parse feedback type
        try:
            feedback_type = FeedbackType(request.type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid feedback type. Must be one of: {[t.value for t in FeedbackType]}"
            )
        
        # Parse category
        try:
            category = FeedbackCategory(request.category)
        except ValueError:
            category = FeedbackCategory.GENERAL
        
        # Create feedback
        feedback = Feedback(
            user_id=user_id or "anonymous",
            type=feedback_type,
            category=category,
            rating=request.rating,
            comment=request.comment,
            message_id=request.message_id,
            conversation_id=request.conversation_id,
            metadata=request.metadata or {}
        )
        
        # Save to DynamoDB
        await dynamo_service.create_feedback(feedback)
        
        logger.info(
            "Feedback submitted",
            feedback_id=feedback.id,
            type=feedback_type.value,
            user_id=user_id
        )
        
        return {
            "success": True,
            "feedback_id": feedback.id,
            "message": "Thank you for your feedback!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Feedback submission failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to submit feedback")


@router.post("/quick")
async def quick_feedback(
    message_id: str,
    is_helpful: bool,
    user_id: Optional[str] = Depends(get_user_id)
) -> dict:
    """Quick thumbs up/down feedback for a message"""
    feedback_type = FeedbackType.THUMBS_UP if is_helpful else FeedbackType.THUMBS_DOWN
    
    feedback = Feedback(
        user_id=user_id or "anonymous",
        type=feedback_type,
        category=FeedbackCategory.RESPONSE_QUALITY,
        message_id=message_id
    )
    
    await dynamo_service.create_feedback(feedback)
    
    return {
        "success": True,
        "feedback_id": feedback.id
    }


@router.get("")
@router.get("/")
async def list_feedback(
    type: Optional[str] = None,
    unresolved_only: bool = False,
    limit: int = 50,
    user_id: Optional[str] = Depends(get_user_id)
) -> dict:
    """List feedback (admin only in production)"""
    try:
        feedbacks = await dynamo_service.list_feedback(
            user_id=user_id,  # Filter by user if not admin
            unresolved_only=unresolved_only,
            limit=limit
        )
        
        return {
            "feedback": [
                {
                    "id": f.id,
                    "type": f.type.value,
                    "category": f.category.value,
                    "rating": f.rating,
                    "comment": f.comment,
                    "created_at": f.created_at.isoformat(),
                    "is_resolved": f.is_resolved
                }
                for f in feedbacks
            ],
            "count": len(feedbacks)
        }
        
    except Exception as e:
        logger.error("List feedback failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to list feedback")


@router.get("/stats")
async def feedback_stats() -> dict:
    """Get feedback statistics"""
    try:
        # Get all feedback for stats
        all_feedback = await dynamo_service.list_feedback(limit=1000)
        
        thumbs_up = sum(1 for f in all_feedback if f.type == FeedbackType.THUMBS_UP)
        thumbs_down = sum(1 for f in all_feedback if f.type == FeedbackType.THUMBS_DOWN)
        ratings = [f.rating for f in all_feedback if f.rating is not None]
        
        return {
            "total_feedback": len(all_feedback),
            "thumbs_up": thumbs_up,
            "thumbs_down": thumbs_down,
            "satisfaction_rate": (thumbs_up / (thumbs_up + thumbs_down) * 100) if (thumbs_up + thumbs_down) > 0 else None,
            "average_rating": sum(ratings) / len(ratings) if ratings else None,
            "total_ratings": len(ratings),
            "unresolved_count": sum(1 for f in all_feedback if not f.is_resolved)
        }
        
    except Exception as e:
        logger.error("Feedback stats failed", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to get stats")

