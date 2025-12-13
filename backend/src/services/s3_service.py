"""
S3 Service for Document Storage
Handles file uploads, downloads, and management
"""

import uuid
from datetime import datetime
from typing import Optional, BinaryIO, Dict, Any
import boto3
from botocore.exceptions import ClientError

from ..utils import settings, logger, sanitize_filename


class S3Service:
    """Service for S3 operations"""
    
    def __init__(self):
        self.client = boto3.client("s3", region_name=settings.aws_region)
        self.resource = boto3.resource("s3", region_name=settings.aws_region)
        self.documents_bucket = settings.s3_bucket_documents
        self.knowledge_base_bucket = settings.s3_bucket_knowledge_base
    
    def _generate_key(self, filename: str, category: str = "general", user_id: Optional[str] = None) -> str:
        """Generate a unique S3 key for a file"""
        safe_filename = sanitize_filename(filename)
        timestamp = datetime.utcnow().strftime("%Y/%m/%d")
        unique_id = str(uuid.uuid4())[:8]
        
        if user_id:
            return f"uploads/{user_id}/{timestamp}/{unique_id}_{safe_filename}"
        else:
            return f"knowledge-base/{category}/{timestamp}/{unique_id}_{safe_filename}"
    
    async def upload_file(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        category: str = "general",
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, str]:
        """
        Upload a file to S3
        
        Args:
            file_content: File bytes
            filename: Original filename
            content_type: MIME type
            category: Document category
            user_id: Optional user ID for user uploads
            metadata: Optional metadata
        
        Returns:
            Dict with bucket, key, and URL
        """
        try:
            bucket = self.documents_bucket if user_id else self.knowledge_base_bucket
            key = self._generate_key(filename, category, user_id)
            
            # Prepare metadata
            s3_metadata = {
                "original-filename": filename,
                "category": category,
                "uploaded-at": datetime.utcnow().isoformat()
            }
            if user_id:
                s3_metadata["user-id"] = user_id
            if metadata:
                s3_metadata.update(metadata)
            
            # Upload to S3
            self.client.put_object(
                Bucket=bucket,
                Key=key,
                Body=file_content,
                ContentType=content_type,
                Metadata=s3_metadata
            )
            
            logger.info(
                "File uploaded to S3",
                bucket=bucket,
                key=key,
                size=len(file_content),
                content_type=content_type
            )
            
            return {
                "bucket": bucket,
                "key": key,
                "url": f"s3://{bucket}/{key}",
                "size": len(file_content)
            }
            
        except ClientError as e:
            logger.error("S3 upload failed", error=str(e))
            raise
    
    async def upload_file_stream(
        self,
        file_stream: BinaryIO,
        filename: str,
        content_type: str,
        category: str = "general",
        user_id: Optional[str] = None
    ) -> Dict[str, str]:
        """Upload a file stream to S3"""
        try:
            bucket = self.documents_bucket if user_id else self.knowledge_base_bucket
            key = self._generate_key(filename, category, user_id)
            
            self.client.upload_fileobj(
                file_stream,
                bucket,
                key,
                ExtraArgs={
                    "ContentType": content_type,
                    "Metadata": {
                        "original-filename": filename,
                        "category": category
                    }
                }
            )
            
            # Get file size
            response = self.client.head_object(Bucket=bucket, Key=key)
            size = response.get("ContentLength", 0)
            
            return {
                "bucket": bucket,
                "key": key,
                "url": f"s3://{bucket}/{key}",
                "size": size
            }
            
        except ClientError as e:
            logger.error("S3 stream upload failed", error=str(e))
            raise
    
    async def download_file(self, bucket: str, key: str) -> bytes:
        """Download a file from S3"""
        try:
            response = self.client.get_object(Bucket=bucket, Key=key)
            content = response["Body"].read()
            
            logger.debug("File downloaded from S3", bucket=bucket, key=key, size=len(content))
            return content
            
        except ClientError as e:
            if e.response["Error"]["Code"] == "NoSuchKey":
                logger.warning("File not found in S3", bucket=bucket, key=key)
                raise FileNotFoundError(f"File not found: s3://{bucket}/{key}")
            raise
    
    async def get_presigned_url(
        self,
        bucket: str,
        key: str,
        expiration: int = 3600,
        for_upload: bool = False
    ) -> str:
        """
        Generate a presigned URL for direct access
        
        Args:
            bucket: S3 bucket name
            key: S3 object key
            expiration: URL expiration in seconds
            for_upload: If True, generate upload URL; else download URL
        
        Returns:
            Presigned URL
        """
        try:
            if for_upload:
                url = self.client.generate_presigned_url(
                    "put_object",
                    Params={"Bucket": bucket, "Key": key},
                    ExpiresIn=expiration
                )
            else:
                url = self.client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": bucket, "Key": key},
                    ExpiresIn=expiration
                )
            
            return url
            
        except ClientError as e:
            logger.error("Failed to generate presigned URL", error=str(e))
            raise
    
    async def delete_file(self, bucket: str, key: str) -> bool:
        """Delete a file from S3"""
        try:
            self.client.delete_object(Bucket=bucket, Key=key)
            logger.info("File deleted from S3", bucket=bucket, key=key)
            return True
            
        except ClientError as e:
            logger.error("S3 delete failed", bucket=bucket, key=key, error=str(e))
            return False
    
    async def list_files(
        self,
        bucket: Optional[str] = None,
        prefix: str = "",
        max_keys: int = 100
    ) -> list[Dict[str, Any]]:
        """List files in a bucket/prefix"""
        try:
            bucket = bucket or self.knowledge_base_bucket
            
            response = self.client.list_objects_v2(
                Bucket=bucket,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                    "url": f"s3://{bucket}/{obj['Key']}"
                })
            
            return files
            
        except ClientError as e:
            logger.error("S3 list failed", bucket=bucket, prefix=prefix, error=str(e))
            return []
    
    async def file_exists(self, bucket: str, key: str) -> bool:
        """Check if a file exists in S3"""
        try:
            self.client.head_object(Bucket=bucket, Key=key)
            return True
        except ClientError:
            return False
    
    async def get_file_metadata(self, bucket: str, key: str) -> Optional[Dict[str, Any]]:
        """Get file metadata from S3"""
        try:
            response = self.client.head_object(Bucket=bucket, Key=key)
            
            return {
                "content_type": response.get("ContentType"),
                "content_length": response.get("ContentLength"),
                "last_modified": response.get("LastModified").isoformat() if response.get("LastModified") else None,
                "metadata": response.get("Metadata", {})
            }
            
        except ClientError:
            return None
    
    def ensure_buckets_exist(self) -> None:
        """Ensure required S3 buckets exist (for local development)"""
        for bucket_name in [self.documents_bucket, self.knowledge_base_bucket]:
            try:
                self.client.head_bucket(Bucket=bucket_name)
                logger.debug("Bucket exists", bucket=bucket_name)
            except ClientError as e:
                error_code = e.response.get("Error", {}).get("Code")
                if error_code == "404":
                    try:
                        self.client.create_bucket(
                            Bucket=bucket_name,
                            CreateBucketConfiguration={
                                "LocationConstraint": settings.aws_region
                            }
                        )
                        logger.info("Bucket created", bucket=bucket_name)
                    except ClientError as create_error:
                        logger.error("Failed to create bucket", bucket=bucket_name, error=str(create_error))


# Singleton instance
s3_service = S3Service()

