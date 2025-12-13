"""
DynamoDB Service for Student Companion Backend
Handles all database operations for users, conversations, documents, and feedback
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

from ..utils import settings, logger, NotFoundError, ConflictError
from ..models import (
    User, UserCreate, UserUpdate,
    Conversation, Message, MessageRole,
    Document, DocumentStatus,
    Feedback
)


class DynamoService:
    """Service for DynamoDB operations"""
    
    def __init__(self):
        self.dynamodb = boto3.resource("dynamodb", region_name=settings.aws_region)
        self.client = boto3.client("dynamodb", region_name=settings.aws_region)
        
        # Table references
        self.users_table = self.dynamodb.Table(settings.dynamodb_table_users)
        self.conversations_table = self.dynamodb.Table(settings.dynamodb_table_conversations)
        self.documents_table = self.dynamodb.Table(settings.dynamodb_table_documents)
        self.feedback_table = self.dynamodb.Table(settings.dynamodb_table_feedback)
    
    # ==================== USER OPERATIONS ====================
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        try:
            user = User(
                id=user_data.firebase_uid,
                **user_data.model_dump()
            )
            
            self.users_table.put_item(
                Item=user.to_dynamo(),
                ConditionExpression="attribute_not_exists(PK)"
            )
            
            logger.info("User created", user_id=user.id, email=user.email)
            return user
            
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise ConflictError(f"User already exists: {user_data.firebase_uid}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            response = self.users_table.get_item(
                Key={
                    "PK": f"USER#{user_id}",
                    "SK": f"PROFILE#{user_id}"
                }
            )
            
            if "Item" not in response:
                return None
            
            return User.from_dynamo(response["Item"])
            
        except Exception as e:
            logger.error("Error getting user", user_id=user_id, error=str(e))
            raise
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email using GSI"""
        try:
            response = self.users_table.query(
                IndexName="GSI1",
                KeyConditionExpression=Key("GSI1PK").eq(f"EMAIL#{email.lower()}")
            )
            
            if not response.get("Items"):
                return None
            
            return User.from_dynamo(response["Items"][0])
            
        except Exception as e:
            logger.error("Error getting user by email", email=email, error=str(e))
            raise
    
    async def update_user(self, user_id: str, update_data: UserUpdate) -> User:
        """Update user profile"""
        user = await self.get_user(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        
        update_expr = "SET updated_at = :updated_at"
        expr_values = {":updated_at": datetime.utcnow().isoformat()}
        
        if update_data.display_name is not None:
            update_expr += ", display_name = :display_name"
            expr_values[":display_name"] = update_data.display_name
        
        if update_data.photo_url is not None:
            update_expr += ", photo_url = :photo_url"
            expr_values[":photo_url"] = update_data.photo_url
        
        if update_data.preferences is not None:
            update_expr += ", preferences = :preferences"
            expr_values[":preferences"] = update_data.preferences
        
        self.users_table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"PROFILE#{user_id}"
            },
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values
        )
        
        return await self.get_user(user_id)
    
    async def update_user_last_login(self, user_id: str) -> None:
        """Update user's last login timestamp"""
        self.users_table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"PROFILE#{user_id}"
            },
            UpdateExpression="SET last_login = :last_login, updated_at = :updated_at",
            ExpressionAttributeValues={
                ":last_login": datetime.utcnow().isoformat(),
                ":updated_at": datetime.utcnow().isoformat()
            }
        )
    
    # ==================== CONVERSATION OPERATIONS ====================
    
    async def create_conversation(self, user_id: str, title: Optional[str] = None) -> Conversation:
        """Create a new conversation"""
        conversation = Conversation(
            user_id=user_id,
            title=title or "New Conversation"
        )
        
        self.conversations_table.put_item(Item=conversation.to_dynamo())
        
        logger.info("Conversation created", conversation_id=conversation.id, user_id=user_id)
        return conversation
    
    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[Conversation]:
        """Get conversation with messages"""
        # Get conversation metadata
        response = self.conversations_table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(f"CONV#{conversation_id}")
        )
        
        if not response.get("Items"):
            return None
        
        conv_item = response["Items"][0]
        
        # Verify user owns this conversation
        if conv_item.get("user_id") != user_id:
            return None
        
        # Get messages
        messages_response = self.conversations_table.query(
            KeyConditionExpression=Key("PK").eq(f"CONV#{conversation_id}") & Key("SK").begins_with("MSG#")
        )
        
        messages = [Message.from_dynamo(item) for item in messages_response.get("Items", [])]
        
        return Conversation.from_dynamo(conv_item, messages)
    
    async def list_conversations(self, user_id: str, limit: int = 50) -> List[Conversation]:
        """List user's conversations"""
        response = self.conversations_table.query(
            KeyConditionExpression=Key("PK").eq(f"USER#{user_id}") & Key("SK").begins_with("CONV#"),
            ScanIndexForward=False,  # Most recent first
            Limit=limit
        )
        
        return [Conversation.from_dynamo(item) for item in response.get("Items", [])]
    
    async def add_message(
        self,
        conversation_id: str,
        user_id: str,
        role: MessageRole,
        content: str,
        metadata: Optional[Dict] = None
    ) -> Message:
        """Add a message to a conversation"""
        from ..models.conversation import Message, MessageMetadata
        
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            metadata=MessageMetadata(**(metadata or {}))
        )
        
        # Store message
        self.conversations_table.put_item(Item=message.to_dynamo())
        
        # Update conversation metadata
        self.conversations_table.update_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"CONV#{conversation_id}"
            },
            UpdateExpression="SET message_count = message_count + :inc, updated_at = :updated_at, last_message_preview = :preview",
            ExpressionAttributeValues={
                ":inc": 1,
                ":updated_at": datetime.utcnow().isoformat(),
                ":preview": content[:100]
            }
        )
        
        return message
    
    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation and all its messages"""
        # Verify ownership
        conversation = await self.get_conversation(conversation_id, user_id)
        if not conversation:
            return False
        
        # Delete all messages
        messages_response = self.conversations_table.query(
            KeyConditionExpression=Key("PK").eq(f"CONV#{conversation_id}")
        )
        
        with self.conversations_table.batch_writer() as batch:
            for item in messages_response.get("Items", []):
                batch.delete_item(Key={"PK": item["PK"], "SK": item["SK"]})
        
        # Delete conversation metadata
        self.conversations_table.delete_item(
            Key={
                "PK": f"USER#{user_id}",
                "SK": f"CONV#{conversation_id}"
            }
        )
        
        logger.info("Conversation deleted", conversation_id=conversation_id)
        return True
    
    # ==================== DOCUMENT OPERATIONS ====================
    
    async def create_document(self, document: Document) -> Document:
        """Create a new document record"""
        self.documents_table.put_item(Item=document.to_dynamo())
        logger.info("Document created", document_id=document.id, filename=document.filename)
        return document
    
    async def get_document(self, document_id: str) -> Optional[Document]:
        """Get document by ID"""
        response = self.documents_table.get_item(
            Key={
                "PK": f"DOC#{document_id}",
                "SK": f"META#{document_id}"
            }
        )
        
        if "Item" not in response:
            return None
        
        return Document.from_dynamo(response["Item"])
    
    async def list_documents(
        self,
        user_id: Optional[str] = None,
        category: Optional[str] = None,
        status: Optional[DocumentStatus] = None,
        limit: int = 50
    ) -> List[Document]:
        """List documents with optional filters"""
        if user_id:
            response = self.documents_table.query(
                IndexName="GSI1",
                KeyConditionExpression=Key("GSI1PK").eq(f"USER#{user_id}"),
                ScanIndexForward=False,
                Limit=limit
            )
        elif category:
            response = self.documents_table.query(
                IndexName="GSI2",
                KeyConditionExpression=Key("GSI2PK").eq(f"CATEGORY#{category}"),
                ScanIndexForward=False,
                Limit=limit
            )
        elif status:
            response = self.documents_table.query(
                IndexName="GSI3",
                KeyConditionExpression=Key("GSI3PK").eq(f"STATUS#{status.value}"),
                ScanIndexForward=False,
                Limit=limit
            )
        else:
            response = self.documents_table.scan(Limit=limit)
        
        return [Document.from_dynamo(item) for item in response.get("Items", [])]
    
    async def update_document_status(
        self,
        document_id: str,
        status: DocumentStatus,
        error_message: Optional[str] = None,
        stats: Optional[Dict] = None
    ) -> None:
        """Update document processing status"""
        update_expr = "SET #status = :status, updated_at = :updated_at"
        expr_values = {
            ":status": status.value,
            ":updated_at": datetime.utcnow().isoformat()
        }
        expr_names = {"#status": "status"}
        
        if status == DocumentStatus.COMPLETED:
            update_expr += ", processed_at = :processed_at"
            expr_values[":processed_at"] = datetime.utcnow().isoformat()
        
        if error_message:
            update_expr += ", error_message = :error_message"
            expr_values[":error_message"] = error_message
        
        if stats:
            update_expr += ", stats = :stats"
            expr_values[":stats"] = stats
        
        self.documents_table.update_item(
            Key={
                "PK": f"DOC#{document_id}",
                "SK": f"META#{document_id}"
            },
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names
        )
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document"""
        self.documents_table.delete_item(
            Key={
                "PK": f"DOC#{document_id}",
                "SK": f"META#{document_id}"
            }
        )
        logger.info("Document deleted", document_id=document_id)
        return True
    
    # ==================== FEEDBACK OPERATIONS ====================
    
    async def create_feedback(self, feedback: Feedback) -> Feedback:
        """Create feedback"""
        self.feedback_table.put_item(Item=feedback.to_dynamo())
        logger.info("Feedback created", feedback_id=feedback.id, type=feedback.type.value)
        return feedback
    
    async def list_feedback(
        self,
        user_id: Optional[str] = None,
        unresolved_only: bool = False,
        limit: int = 50
    ) -> List[Feedback]:
        """List feedback"""
        if user_id:
            response = self.feedback_table.query(
                IndexName="GSI1",
                KeyConditionExpression=Key("GSI1PK").eq(f"USER#{user_id}"),
                ScanIndexForward=False,
                Limit=limit
            )
        elif unresolved_only:
            response = self.feedback_table.query(
                IndexName="GSI3",
                KeyConditionExpression=Key("GSI3PK").eq("FEEDBACK_UNRESOLVED"),
                ScanIndexForward=False,
                Limit=limit
            )
        else:
            response = self.feedback_table.scan(Limit=limit)
        
        return [Feedback.from_dynamo(item) for item in response.get("Items", [])]


# Singleton instance
dynamo_service = DynamoService()

