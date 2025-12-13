"""
Custom exceptions for Student Companion Backend
"""

from typing import Optional, Any


class StudentCompanionError(Exception):
    """Base exception for all application errors"""
    
    def __init__(
        self,
        message: str,
        error_code: str = "INTERNAL_ERROR",
        status_code: int = 500,
        details: Optional[dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)
    
    def to_dict(self) -> dict[str, Any]:
        """Convert exception to dictionary for API response"""
        return {
            "error": True,
            "error_code": self.error_code,
            "message": self.message,
            "details": self.details
        }


# Authentication Errors
class AuthenticationError(StudentCompanionError):
    """Raised when authentication fails"""
    
    def __init__(self, message: str = "Authentication required", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details
        )


class AuthorizationError(StudentCompanionError):
    """Raised when user lacks permission"""
    
    def __init__(self, message: str = "Permission denied", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="AUTHORIZATION_ERROR",
            status_code=403,
            details=details
        )


# Validation Errors
class ValidationError(StudentCompanionError):
    """Raised when input validation fails"""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[dict] = None):
        details = details or {}
        if field:
            details["field"] = field
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details
        )


# Resource Errors
class NotFoundError(StudentCompanionError):
    """Raised when a resource is not found"""
    
    def __init__(self, resource: str, resource_id: str, details: Optional[dict] = None):
        details = details or {}
        details["resource"] = resource
        details["resource_id"] = resource_id
        super().__init__(
            message=f"{resource} not found: {resource_id}",
            error_code="NOT_FOUND",
            status_code=404,
            details=details
        )


class ConflictError(StudentCompanionError):
    """Raised when there's a resource conflict"""
    
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="CONFLICT",
            status_code=409,
            details=details
        )


# Service Errors
class ServiceUnavailableError(StudentCompanionError):
    """Raised when an external service is unavailable"""
    
    def __init__(self, service: str, details: Optional[dict] = None):
        details = details or {}
        details["service"] = service
        super().__init__(
            message=f"Service unavailable: {service}",
            error_code="SERVICE_UNAVAILABLE",
            status_code=503,
            details=details
        )


class BedrockError(StudentCompanionError):
    """Raised when Bedrock/Claude fails"""
    
    def __init__(self, message: str = "AI service error", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="BEDROCK_ERROR",
            status_code=503,
            details=details
        )


class OpenSearchError(StudentCompanionError):
    """Raised when OpenSearch fails"""
    
    def __init__(self, message: str = "Search service error", details: Optional[dict] = None):
        super().__init__(
            message=message,
            error_code="OPENSEARCH_ERROR",
            status_code=503,
            details=details
        )


# Rate Limiting
class RateLimitError(StudentCompanionError):
    """Raised when rate limit is exceeded"""
    
    def __init__(self, retry_after: int = 60, details: Optional[dict] = None):
        details = details or {}
        details["retry_after"] = retry_after
        super().__init__(
            message="Rate limit exceeded. Please try again later.",
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=429,
            details=details
        )


# Document Processing Errors
class DocumentProcessingError(StudentCompanionError):
    """Raised when document processing fails"""
    
    def __init__(self, message: str, filename: Optional[str] = None, details: Optional[dict] = None):
        details = details or {}
        if filename:
            details["filename"] = filename
        super().__init__(
            message=message,
            error_code="DOCUMENT_PROCESSING_ERROR",
            status_code=422,
            details=details
        )


class UnsupportedFileTypeError(DocumentProcessingError):
    """Raised when file type is not supported"""
    
    def __init__(self, file_type: str, supported_types: list[str]):
        super().__init__(
            message=f"Unsupported file type: {file_type}",
            details={
                "file_type": file_type,
                "supported_types": supported_types
            }
        )

