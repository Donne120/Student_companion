"""
OpenSearch Service for RAG (Retrieval Augmented Generation)
Handles semantic search over the knowledge base
"""

from typing import Optional, List, Dict, Any
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import boto3

from ..utils import settings, logger, OpenSearchError
from ..models import DocumentChunk


class OpenSearchService:
    """Service for OpenSearch operations (RAG)"""
    
    def __init__(self):
        self.index_name = settings.opensearch_index
        self.client = None
        
        if settings.opensearch_endpoint:
            self._init_client()
    
    def _init_client(self) -> None:
        """Initialize OpenSearch client with AWS authentication"""
        try:
            # Get AWS credentials
            credentials = boto3.Session().get_credentials()
            
            awsauth = AWS4Auth(
                credentials.access_key,
                credentials.secret_key,
                settings.aws_region,
                "es",
                session_token=credentials.token
            )
            
            # Parse endpoint
            endpoint = settings.opensearch_endpoint.replace("https://", "").replace("http://", "")
            
            self.client = OpenSearch(
                hosts=[{"host": endpoint, "port": 443}],
                http_auth=awsauth,
                use_ssl=True,
                verify_certs=True,
                connection_class=RequestsHttpConnection,
                timeout=30
            )
            
            logger.info("OpenSearch client initialized", endpoint=endpoint)
            
        except Exception as e:
            logger.error("Failed to initialize OpenSearch client", error=str(e))
            self.client = None
    
    def is_available(self) -> bool:
        """Check if OpenSearch is available"""
        if not self.client:
            return False
        
        try:
            self.client.cluster.health()
            return True
        except Exception:
            return False
    
    async def create_index(self) -> bool:
        """Create the knowledge base index with proper mappings"""
        if not self.client:
            raise OpenSearchError("OpenSearch client not initialized")
        
        try:
            # Check if index exists
            if self.client.indices.exists(index=self.index_name):
                logger.info("Index already exists", index=self.index_name)
                return True
            
            # Create index with mappings for semantic search
            index_body = {
                "settings": {
                    "index": {
                        "number_of_shards": 1,
                        "number_of_replicas": 1,
                        "knn": True,
                        "knn.algo_param.ef_search": 100
                    }
                },
                "mappings": {
                    "properties": {
                        "document_id": {"type": "keyword"},
                        "content": {"type": "text", "analyzer": "standard"},
                        "chunk_index": {"type": "integer"},
                        "embedding": {
                            "type": "knn_vector",
                            "dimension": 1536,  # Titan embedding dimension
                            "method": {
                                "name": "hnsw",
                                "space_type": "l2",
                                "engine": "nmslib",
                                "parameters": {
                                    "ef_construction": 128,
                                    "m": 24
                                }
                            }
                        },
                        "metadata": {
                            "type": "object",
                            "properties": {
                                "category": {"type": "keyword"},
                                "filename": {"type": "keyword"},
                                "page_number": {"type": "integer"},
                                "title": {"type": "text"}
                            }
                        },
                        "created_at": {"type": "date"}
                    }
                }
            }
            
            self.client.indices.create(index=self.index_name, body=index_body)
            logger.info("Index created", index=self.index_name)
            return True
            
        except Exception as e:
            logger.error("Failed to create index", error=str(e))
            raise OpenSearchError(f"Failed to create index: {str(e)}")
    
    async def index_chunk(self, chunk: DocumentChunk) -> str:
        """Index a document chunk"""
        if not self.client:
            raise OpenSearchError("OpenSearch client not initialized")
        
        try:
            doc_body = chunk.to_opensearch()
            doc_body["created_at"] = chunk.metadata.get("created_at", "")
            
            response = self.client.index(
                index=self.index_name,
                id=chunk.id,
                body=doc_body,
                refresh=True
            )
            
            return response["_id"]
            
        except Exception as e:
            logger.error("Failed to index chunk", chunk_id=chunk.id, error=str(e))
            raise OpenSearchError(f"Failed to index chunk: {str(e)}")
    
    async def index_chunks_bulk(self, chunks: List[DocumentChunk]) -> int:
        """Bulk index multiple chunks"""
        if not self.client:
            raise OpenSearchError("OpenSearch client not initialized")
        
        if not chunks:
            return 0
        
        try:
            actions = []
            for chunk in chunks:
                actions.append({"index": {"_index": self.index_name, "_id": chunk.id}})
                doc_body = chunk.to_opensearch()
                doc_body["created_at"] = chunk.metadata.get("created_at", "")
                actions.append(doc_body)
            
            response = self.client.bulk(body=actions, refresh=True)
            
            if response.get("errors"):
                logger.warning("Some chunks failed to index", errors=response["errors"])
            
            indexed_count = len([item for item in response["items"] if item["index"]["status"] in [200, 201]])
            logger.info("Bulk indexed chunks", count=indexed_count)
            
            return indexed_count
            
        except Exception as e:
            logger.error("Bulk indexing failed", error=str(e))
            raise OpenSearchError(f"Bulk indexing failed: {str(e)}")
    
    async def search_semantic(
        self,
        query_embedding: List[float],
        k: int = 5,
        category: Optional[str] = None,
        min_score: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Semantic search using vector similarity (k-NN)
        
        Args:
            query_embedding: Vector embedding of the query
            k: Number of results to return
            category: Optional category filter
            min_score: Minimum similarity score
        
        Returns:
            List of matching documents with scores
        """
        if not self.client:
            logger.warning("OpenSearch not available, returning empty results")
            return []
        
        try:
            # Build k-NN query
            query = {
                "size": k,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "knn": {
                                    "embedding": {
                                        "vector": query_embedding,
                                        "k": k
                                    }
                                }
                            }
                        ]
                    }
                }
            }
            
            # Add category filter if specified
            if category:
                query["query"]["bool"]["filter"] = [
                    {"term": {"metadata.category": category}}
                ]
            
            response = self.client.search(index=self.index_name, body=query)
            
            results = []
            for hit in response["hits"]["hits"]:
                score = hit["_score"]
                if score >= min_score:
                    results.append({
                        "id": hit["_id"],
                        "content": hit["_source"].get("content", ""),
                        "document_id": hit["_source"].get("document_id", ""),
                        "metadata": hit["_source"].get("metadata", {}),
                        "score": score
                    })
            
            logger.debug("Semantic search completed", results_count=len(results))
            return results
            
        except Exception as e:
            logger.error("Semantic search failed", error=str(e))
            return []
    
    async def search_keyword(
        self,
        query: str,
        k: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Keyword-based search (fallback when embeddings unavailable)
        
        Args:
            query: Search query text
            k: Number of results to return
            category: Optional category filter
        
        Returns:
            List of matching documents with scores
        """
        if not self.client:
            logger.warning("OpenSearch not available, returning empty results")
            return []
        
        try:
            # Build text query
            query_body = {
                "size": k,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "multi_match": {
                                    "query": query,
                                    "fields": ["content^2", "metadata.title^3"],
                                    "type": "best_fields",
                                    "fuzziness": "AUTO"
                                }
                            }
                        ]
                    }
                }
            }
            
            if category:
                query_body["query"]["bool"]["filter"] = [
                    {"term": {"metadata.category": category}}
                ]
            
            response = self.client.search(index=self.index_name, body=query_body)
            
            results = []
            for hit in response["hits"]["hits"]:
                results.append({
                    "id": hit["_id"],
                    "content": hit["_source"].get("content", ""),
                    "document_id": hit["_source"].get("document_id", ""),
                    "metadata": hit["_source"].get("metadata", {}),
                    "score": hit["_score"]
                })
            
            return results
            
        except Exception as e:
            logger.error("Keyword search failed", error=str(e))
            return []
    
    async def hybrid_search(
        self,
        query: str,
        query_embedding: Optional[List[float]] = None,
        k: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Hybrid search combining semantic and keyword search
        
        Args:
            query: Search query text
            query_embedding: Optional vector embedding
            k: Number of results to return
            category: Optional category filter
        
        Returns:
            Combined and deduplicated results
        """
        results = []
        seen_ids = set()
        
        # Try semantic search first if embedding available
        if query_embedding:
            semantic_results = await self.search_semantic(
                query_embedding=query_embedding,
                k=k,
                category=category
            )
            for result in semantic_results:
                if result["id"] not in seen_ids:
                    result["search_type"] = "semantic"
                    results.append(result)
                    seen_ids.add(result["id"])
        
        # Supplement with keyword search
        keyword_results = await self.search_keyword(
            query=query,
            k=k,
            category=category
        )
        for result in keyword_results:
            if result["id"] not in seen_ids:
                result["search_type"] = "keyword"
                results.append(result)
                seen_ids.add(result["id"])
        
        # Sort by score and return top k
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:k]
    
    async def delete_document_chunks(self, document_id: str) -> int:
        """Delete all chunks for a document"""
        if not self.client:
            return 0
        
        try:
            response = self.client.delete_by_query(
                index=self.index_name,
                body={
                    "query": {
                        "term": {"document_id": document_id}
                    }
                },
                refresh=True
            )
            
            deleted = response.get("deleted", 0)
            logger.info("Deleted document chunks", document_id=document_id, count=deleted)
            return deleted
            
        except Exception as e:
            logger.error("Failed to delete chunks", document_id=document_id, error=str(e))
            return 0
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        if not self.client:
            return {"available": False}
        
        try:
            stats = self.client.indices.stats(index=self.index_name)
            index_stats = stats["indices"].get(self.index_name, {})
            
            return {
                "available": True,
                "document_count": index_stats.get("primaries", {}).get("docs", {}).get("count", 0),
                "size_bytes": index_stats.get("primaries", {}).get("store", {}).get("size_in_bytes", 0),
                "index_name": self.index_name
            }
            
        except Exception as e:
            logger.error("Failed to get stats", error=str(e))
            return {"available": False, "error": str(e)}


# Singleton instance
opensearch_service = OpenSearchService()

