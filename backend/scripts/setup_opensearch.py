#!/usr/bin/env python3
"""
OpenSearch Index Setup Script
Creates the knowledge base index with proper mappings for RAG
"""

import os
import sys
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def get_opensearch_client():
    """Create OpenSearch client with AWS authentication"""
    # Get endpoint from environment or CloudFormation
    endpoint = os.environ.get("OPENSEARCH_ENDPOINT")
    
    if not endpoint:
        # Try to get from CloudFormation
        cf = boto3.client("cloudformation")
        try:
            response = cf.describe_stacks(StackName="student-companion-backend")
            outputs = response["Stacks"][0]["Outputs"]
            for output in outputs:
                if output["OutputKey"] == "OpenSearchEndpoint":
                    endpoint = output["OutputValue"]
                    break
        except Exception as e:
            print(f"Could not get endpoint from CloudFormation: {e}")
            return None
    
    if not endpoint:
        print("OpenSearch endpoint not found. Set OPENSEARCH_ENDPOINT environment variable.")
        return None
    
    # Get AWS credentials
    session = boto3.Session()
    credentials = session.get_credentials()
    region = os.environ.get("AWS_REGION", "eu-north-1")
    
    awsauth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        region,
        "es",
        session_token=credentials.token
    )
    
    client = OpenSearch(
        hosts=[{"host": endpoint, "port": 443}],
        http_auth=awsauth,
        use_ssl=True,
        verify_certs=True,
        connection_class=RequestsHttpConnection
    )
    
    return client


def create_knowledge_base_index(client, index_name="knowledge-base"):
    """Create the knowledge base index with proper mappings"""
    
    # Check if index exists
    if client.indices.exists(index=index_name):
        print(f"Index '{index_name}' already exists.")
        response = input("Delete and recreate? (y/n): ")
        if response.lower() == "y":
            client.indices.delete(index=index_name)
            print(f"Deleted index '{index_name}'")
        else:
            print("Keeping existing index.")
            return
    
    # Index mapping for RAG with vector search
    index_body = {
        "settings": {
            "index": {
                "number_of_shards": 1,
                "number_of_replicas": 1,
                "knn": True,
                "knn.algo_param.ef_search": 100
            },
            "analysis": {
                "analyzer": {
                    "custom_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase", "stop", "snowball"]
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "document_id": {
                    "type": "keyword"
                },
                "content": {
                    "type": "text",
                    "analyzer": "custom_analyzer"
                },
                "chunk_index": {
                    "type": "integer"
                },
                "embedding": {
                    "type": "knn_vector",
                    "dimension": 1536,
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
                        "title": {"type": "text"},
                        "page_number": {"type": "integer"},
                        "created_at": {"type": "date"}
                    }
                },
                "created_at": {
                    "type": "date"
                }
            }
        }
    }
    
    # Create index
    response = client.indices.create(index=index_name, body=index_body)
    print(f"Created index '{index_name}': {response}")
    
    return response


def main():
    print("=" * 60)
    print("Student Companion - OpenSearch Index Setup")
    print("=" * 60)
    print()
    
    # Get client
    client = get_opensearch_client()
    if not client:
        print("Failed to create OpenSearch client.")
        sys.exit(1)
    
    # Test connection
    try:
        info = client.info()
        print(f"Connected to OpenSearch: {info['version']['distribution']} {info['version']['number']}")
    except Exception as e:
        print(f"Failed to connect to OpenSearch: {e}")
        sys.exit(1)
    
    print()
    
    # Create index
    create_knowledge_base_index(client)
    
    print()
    print("✅ OpenSearch setup complete!")
    print()
    print("Next steps:")
    print("  1. Upload documents to S3")
    print("  2. Run the document processor to index content")
    print("  3. Test search functionality")


if __name__ == "__main__":
    main()

