"""
Configuration management for Student Companion Backend
Loads settings from environment variables and AWS Secrets Manager
"""

import os
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    app_name: str = "Student Companion AI"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    
    # AWS Region
    aws_region: str = Field(default="eu-north-1", alias="AWS_REGION")
    
    # DynamoDB Tables
    dynamodb_table_users: str = Field(
        default="student-companion-users",
        alias="DYNAMODB_TABLE_USERS"
    )
    dynamodb_table_conversations: str = Field(
        default="student-companion-conversations",
        alias="DYNAMODB_TABLE_CONVERSATIONS"
    )
    dynamodb_table_documents: str = Field(
        default="student-companion-documents",
        alias="DYNAMODB_TABLE_DOCUMENTS"
    )
    dynamodb_table_feedback: str = Field(
        default="student-companion-feedback",
        alias="DYNAMODB_TABLE_FEEDBACK"
    )
    
    # S3 Buckets
    s3_bucket_documents: str = Field(
        default="student-companion-documents",
        alias="S3_BUCKET_DOCUMENTS"
    )
    s3_bucket_knowledge_base: str = Field(
        default="student-companion-knowledge-base",
        alias="S3_BUCKET_KNOWLEDGE_BASE"
    )
    
    # OpenSearch
    opensearch_endpoint: Optional[str] = Field(
        default=None,
        alias="OPENSEARCH_ENDPOINT"
    )
    opensearch_index: str = Field(
        default="knowledge-base",
        alias="OPENSEARCH_INDEX"
    )
    
    # Bedrock (Claude 3)
    bedrock_model_id: str = Field(
        default="anthropic.claude-3-sonnet-20240229-v1:0",
        alias="BEDROCK_MODEL_ID"
    )
    bedrock_max_tokens: int = Field(default=4096, alias="BEDROCK_MAX_TOKENS")
    bedrock_temperature: float = Field(default=0.7, alias="BEDROCK_TEMPERATURE")
    
    # Fallback to Hugging Face (during migration)
    huggingface_fallback_enabled: bool = Field(
        default=True,
        alias="HUGGINGFACE_FALLBACK_ENABLED"
    )
    huggingface_endpoint: str = Field(
        default="https://ngum-alu-chatbot.hf.space",
        alias="HUGGINGFACE_ENDPOINT"
    )
    
    # Rate Limiting
    rate_limit_requests_per_minute: int = Field(default=60, alias="RATE_LIMIT_RPM")
    rate_limit_tokens_per_minute: int = Field(default=100000, alias="RATE_LIMIT_TPM")
    
    # CORS
    cors_origins: str = Field(
        default="https://student-companion-cyan.vercel.app,http://localhost:3000,http://localhost:5173",
        alias="CORS_ORIGINS"
    )
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins into a list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment.lower() == "production"
    
    @property
    def is_local(self) -> bool:
        """Check if running locally"""
        return self.environment.lower() in ["development", "local", "dev"]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Convenience function
settings = get_settings()

