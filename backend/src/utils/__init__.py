"""Utilities module"""

from .config import settings, get_settings
from .logger import logger, get_logger, LogContext
from .exceptions import (
    StudentCompanionError,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    ServiceUnavailableError,
    BedrockError,
    OpenSearchError,
    RateLimitError,
    DocumentProcessingError,
    UnsupportedFileTypeError,
)
from .validators import (
    validate_email,
    validate_message,
    validate_document_type,
    validate_file_size,
    validate_user_id,
    validate_conversation_id,
    sanitize_filename,
)

__all__ = [
    # Config
    "settings",
    "get_settings",
    # Logging
    "logger",
    "get_logger",
    "LogContext",
    # Exceptions
    "StudentCompanionError",
    "AuthenticationError",
    "AuthorizationError",
    "ValidationError",
    "NotFoundError",
    "ConflictError",
    "ServiceUnavailableError",
    "BedrockError",
    "OpenSearchError",
    "RateLimitError",
    "DocumentProcessingError",
    "UnsupportedFileTypeError",
    # Validators
    "validate_email",
    "validate_message",
    "validate_document_type",
    "validate_file_size",
    "validate_user_id",
    "validate_conversation_id",
    "sanitize_filename",
]

