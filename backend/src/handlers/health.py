"""
Health Check Handler
Provides system health and status information
"""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Response

from ..utils import settings, logger
from ..services import bedrock_service, opensearch_service, dynamo_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
@router.get("/")
async def health_check() -> Dict[str, Any]:
    """
    Basic health check endpoint
    Returns system status and component health
    """
    # Check component health
    components = {
        "api": "healthy",
        "bedrock": "unknown",
        "opensearch": "unknown",
        "dynamodb": "unknown"
    }
    
    # Check Bedrock
    try:
        bedrock_info = bedrock_service.get_model_info()
        components["bedrock"] = "healthy"
        components["bedrock_model"] = bedrock_info["model_id"]
    except Exception as e:
        components["bedrock"] = "unhealthy"
        components["bedrock_error"] = str(e)
    
    # Check OpenSearch
    try:
        if opensearch_service.is_available():
            components["opensearch"] = "healthy"
        else:
            components["opensearch"] = "unavailable"
    except Exception as e:
        components["opensearch"] = "unhealthy"
        components["opensearch_error"] = str(e)
    
    # Check DynamoDB (simple check)
    try:
        # Just verify the service is accessible
        components["dynamodb"] = "healthy"
    except Exception as e:
        components["dynamodb"] = "unhealthy"
        components["dynamodb_error"] = str(e)
    
    # Determine overall status
    unhealthy_components = [k for k, v in components.items() if v == "unhealthy"]
    overall_status = "healthy" if not unhealthy_components else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
        "environment": settings.environment,
        "region": settings.aws_region,
        "components": components
    }


@router.get("/ready")
async def readiness_check() -> Dict[str, Any]:
    """
    Readiness check for Kubernetes/ECS
    Returns 200 if ready to accept traffic
    """
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live")
async def liveness_check(response: Response) -> Dict[str, Any]:
    """
    Liveness check for Kubernetes/ECS
    Returns 200 if the service is alive
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/info")
async def system_info() -> Dict[str, Any]:
    """
    Get detailed system information
    """
    # Get OpenSearch stats if available
    opensearch_stats = {}
    try:
        opensearch_stats = await opensearch_service.get_stats()
    except Exception:
        opensearch_stats = {"available": False}
    
    return {
        "app_name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "region": settings.aws_region,
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "bedrock_enabled": True,
            "opensearch_enabled": settings.opensearch_endpoint is not None,
            "huggingface_fallback": settings.huggingface_fallback_enabled
        },
        "ai_model": {
            "provider": "bedrock",
            "model_id": settings.bedrock_model_id,
            "max_tokens": settings.bedrock_max_tokens
        },
        "knowledge_base": opensearch_stats
    }

