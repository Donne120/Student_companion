"""
Input validation utilities for Student Companion Backend
"""

import re
from typing import Optional
from .exceptions import ValidationError


# Email validation regex
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)

# ALU email regex (students and staff)
ALU_EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@(alueducation\.com|alustudent\.com)$"
)

# Supported document types
SUPPORTED_DOCUMENT_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/html": ".html",
    "application/json": ".json",
}

# Maximum file size (10 MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Maximum message length
MAX_MESSAGE_LENGTH = 10000

# Maximum conversation history to send to AI
MAX_HISTORY_MESSAGES = 20


def validate_email(email: str, require_alu: bool = False) -> str:
    """
    Validate email address
    
    Args:
        email: Email address to validate
        require_alu: If True, only ALU emails are accepted
    
    Returns:
        Normalized email address
    
    Raises:
        ValidationError: If email is invalid
    """
    if not email:
        raise ValidationError("Email is required", field="email")
    
    email = email.strip().lower()
    
    if not EMAIL_REGEX.match(email):
        raise ValidationError("Invalid email format", field="email")
    
    if require_alu and not ALU_EMAIL_REGEX.match(email):
        raise ValidationError(
            "Only ALU email addresses are accepted",
            field="email",
            details={"accepted_domains": ["alueducation.com", "alustudent.com"]}
        )
    
    return email


def validate_message(message: str) -> str:
    """
    Validate chat message
    
    Args:
        message: Message to validate
    
    Returns:
        Cleaned message
    
    Raises:
        ValidationError: If message is invalid
    """
    if not message:
        raise ValidationError("Message cannot be empty", field="message")
    
    message = message.strip()
    
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValidationError(
            f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters",
            field="message",
            details={"max_length": MAX_MESSAGE_LENGTH, "actual_length": len(message)}
        )
    
    return message


def validate_document_type(content_type: str, filename: str) -> str:
    """
    Validate document type
    
    Args:
        content_type: MIME type of the document
        filename: Original filename
    
    Returns:
        Validated content type
    
    Raises:
        ValidationError: If document type is not supported
    """
    # Check content type
    if content_type not in SUPPORTED_DOCUMENT_TYPES:
        # Try to infer from filename
        ext = filename.lower().split(".")[-1] if "." in filename else ""
        
        type_by_ext = {
            "pdf": "application/pdf",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "doc": "application/msword",
            "txt": "text/plain",
            "md": "text/markdown",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "xls": "application/vnd.ms-excel",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "html": "text/html",
            "json": "application/json",
        }
        
        if ext in type_by_ext:
            return type_by_ext[ext]
        
        raise ValidationError(
            f"Unsupported document type: {content_type}",
            field="file",
            details={
                "content_type": content_type,
                "supported_types": list(SUPPORTED_DOCUMENT_TYPES.keys())
            }
        )
    
    return content_type


def validate_file_size(size: int) -> int:
    """
    Validate file size
    
    Args:
        size: File size in bytes
    
    Returns:
        Validated size
    
    Raises:
        ValidationError: If file is too large
    """
    if size > MAX_FILE_SIZE:
        raise ValidationError(
            f"File size exceeds maximum of {MAX_FILE_SIZE // (1024 * 1024)} MB",
            field="file",
            details={
                "max_size_bytes": MAX_FILE_SIZE,
                "actual_size_bytes": size,
                "max_size_mb": MAX_FILE_SIZE // (1024 * 1024),
                "actual_size_mb": round(size / (1024 * 1024), 2)
            }
        )
    
    return size


def validate_user_id(user_id: str) -> str:
    """
    Validate user ID
    
    Args:
        user_id: User ID to validate
    
    Returns:
        Validated user ID
    
    Raises:
        ValidationError: If user ID is invalid
    """
    if not user_id:
        raise ValidationError("User ID is required", field="user_id")
    
    user_id = user_id.strip()
    
    if len(user_id) < 3 or len(user_id) > 128:
        raise ValidationError(
            "User ID must be between 3 and 128 characters",
            field="user_id"
        )
    
    return user_id


def validate_conversation_id(conversation_id: str) -> str:
    """
    Validate conversation ID
    
    Args:
        conversation_id: Conversation ID to validate
    
    Returns:
        Validated conversation ID
    
    Raises:
        ValidationError: If conversation ID is invalid
    """
    if not conversation_id:
        raise ValidationError("Conversation ID is required", field="conversation_id")
    
    conversation_id = conversation_id.strip()
    
    # UUID format check (loose)
    if len(conversation_id) < 10 or len(conversation_id) > 64:
        raise ValidationError(
            "Invalid conversation ID format",
            field="conversation_id"
        )
    
    return conversation_id


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe storage
    
    Args:
        filename: Original filename
    
    Returns:
        Sanitized filename
    """
    # Remove path separators
    filename = filename.replace("/", "_").replace("\\", "_")
    
    # Remove special characters except dots, hyphens, underscores
    filename = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit(".", 1) if "." in filename else (filename, "")
        filename = name[:250] + ("." + ext if ext else "")
    
    return filename

