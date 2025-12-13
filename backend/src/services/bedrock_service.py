"""
Amazon Bedrock Service for Claude 3 Integration
Handles AI response generation using Claude 3 Sonnet
"""

import json
import time
from typing import Optional, List, Dict, Any
import boto3
from botocore.exceptions import ClientError
from tenacity import retry, stop_after_attempt, wait_exponential

from ..utils import settings, logger, BedrockError


class BedrockService:
    """Service for interacting with Amazon Bedrock (Claude 3)"""
    
    def __init__(self):
        self.client = boto3.client(
            "bedrock-runtime",
            region_name=settings.aws_region
        )
        self.model_id = settings.bedrock_model_id
        self.max_tokens = settings.bedrock_max_tokens
        self.temperature = settings.bedrock_temperature
        
        # System prompt for ALU Student Companion
        self.system_prompt = self._get_system_prompt()
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the AI"""
        return """You are the ALU Student Companion AI, a helpful, friendly, and knowledgeable assistant for students at the African Leadership University (ALU).

Your role is to:
1. Answer questions about ALU's programs, admissions, policies, and campus life
2. Provide information about wellness services, health insurance, and counseling
3. Help students find resources like library databases, career services, and academic support
4. Guide students through administrative processes
5. Be supportive and encouraging while maintaining professionalism

Guidelines:
- Be concise but thorough in your responses
- Use bullet points and formatting when listing information
- If you're not sure about something, say so and suggest where to find accurate information
- Always be respectful and supportive of students
- Provide specific contact information when relevant (emails, phone numbers)
- Reference official ALU resources when possible

You have access to ALU's knowledge base including:
- Admissions requirements and processes
- Academic programs and courses
- Student wellness and health services
- Campus facilities and services
- Policies and procedures
- Library and research resources
- Career services and opportunities

When answering, prioritize information from the knowledge base context provided.
If the context doesn't contain relevant information, use your general knowledge about universities but clarify that students should verify with official ALU sources.

Contact Information:
- General Support: support@alueducation.com
- Phone: +250 788 309 667 (Rwanda)
- Help Center: https://help.alueducation.com
"""
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_response(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Generate a response using Claude 3
        
        Args:
            message: The user's message
            conversation_history: Previous messages in the conversation
            context: Additional context from knowledge base (RAG)
            temperature: Override default temperature
            max_tokens: Override default max tokens
        
        Returns:
            Dict with response text and metadata
        """
        start_time = time.time()
        
        try:
            # Build the messages array
            messages = []
            
            # Add conversation history
            if conversation_history:
                for msg in conversation_history[-20:]:  # Limit history
                    messages.append({
                        "role": msg.get("role", "user"),
                        "content": msg.get("content", "")
                    })
            
            # Build the current message with context
            current_message = message
            if context:
                current_message = f"""Based on the following information from ALU's knowledge base:

---
{context}
---

Student's question: {message}

Please provide a helpful response based on the context above. If the context doesn't fully answer the question, supplement with your knowledge but note that the student should verify with official sources."""
            
            messages.append({
                "role": "user",
                "content": current_message
            })
            
            # Prepare the request body for Claude 3
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens or self.max_tokens,
                "temperature": temperature or self.temperature,
                "system": self.system_prompt,
                "messages": messages
            }
            
            logger.info(
                "Calling Bedrock",
                model=self.model_id,
                message_length=len(message),
                history_length=len(conversation_history) if conversation_history else 0,
                has_context=bool(context)
            )
            
            # Call Bedrock
            response = self.client.invoke_model(
                modelId=self.model_id,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(request_body)
            )
            
            # Parse response
            response_body = json.loads(response["body"].read())
            
            # Extract the response text
            response_text = ""
            if "content" in response_body and len(response_body["content"]) > 0:
                response_text = response_body["content"][0].get("text", "")
            
            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)
            
            # Get token usage
            usage = response_body.get("usage", {})
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            
            logger.info(
                "Bedrock response received",
                latency_ms=latency_ms,
                input_tokens=input_tokens,
                output_tokens=output_tokens
            )
            
            return {
                "response": response_text,
                "model": self.model_id,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "latency_ms": latency_ms,
                "source": "bedrock"
            }
            
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            error_message = e.response.get("Error", {}).get("Message", str(e))
            
            logger.error(
                "Bedrock API error",
                error_code=error_code,
                error_message=error_message
            )
            
            if error_code == "ThrottlingException":
                raise BedrockError(
                    message="AI service is busy. Please try again in a moment.",
                    details={"error_code": error_code}
                )
            elif error_code == "AccessDeniedException":
                raise BedrockError(
                    message="AI service access denied. Please contact support.",
                    details={"error_code": error_code}
                )
            else:
                raise BedrockError(
                    message="AI service error. Please try again.",
                    details={"error_code": error_code, "error_message": error_message}
                )
        
        except Exception as e:
            logger.error("Unexpected Bedrock error", error=str(e))
            raise BedrockError(
                message="An unexpected error occurred with the AI service.",
                details={"error": str(e)}
            )
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate text embedding using Amazon Titan
        Used for semantic search in OpenSearch
        
        Args:
            text: Text to embed
        
        Returns:
            List of floats representing the embedding
        """
        try:
            # Use Amazon Titan Embeddings
            embedding_model = "amazon.titan-embed-text-v1"
            
            request_body = {
                "inputText": text[:8000]  # Titan has 8k token limit
            }
            
            response = self.client.invoke_model(
                modelId=embedding_model,
                contentType="application/json",
                accept="application/json",
                body=json.dumps(request_body)
            )
            
            response_body = json.loads(response["body"].read())
            embedding = response_body.get("embedding", [])
            
            logger.debug(
                "Generated embedding",
                text_length=len(text),
                embedding_dim=len(embedding)
            )
            
            return embedding
            
        except Exception as e:
            logger.error("Embedding generation failed", error=str(e))
            raise BedrockError(
                message="Failed to generate text embedding",
                details={"error": str(e)}
            )
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            "model_id": self.model_id,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "region": settings.aws_region
        }


# Singleton instance
bedrock_service = BedrockService()

