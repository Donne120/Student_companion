# Student Companion AI - AWS Backend

## 🏗️ Production-Ready AWS Backend

This is the complete AWS backend for the Student Companion AI chatbot, designed for scalability, security, and enterprise-grade performance.

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD (eu-north-1)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │  CloudFront  │────▶│      S3      │     │   Route 53   │                │
│  │    (CDN)     │     │  (Frontend)  │     │    (DNS)     │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │     API      │────▶│    Lambda    │────▶│   Bedrock    │                │
│  │   Gateway    │     │  (Handlers)  │     │  (Claude 3)  │                │
│  └──────────────┘     └─────┬────────┘     └──────────────┘                │
│                             │                                               │
│         ┌───────────────────┼───────────────────┐                          │
│         ▼                   ▼                   ▼                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   DynamoDB   │    │  OpenSearch  │    │      S3      │                  │
│  │   (Users &   │    │    (RAG)     │    │  (Documents) │                  │
│  │   History)   │    │              │    │              │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│                                                                              │
│  Supporting: IAM | KMS | Secrets Manager | CloudWatch | CloudTrail         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── handlers/              # Lambda function handlers
│   │   ├── chat.py            # Chat endpoint handler
│   │   ├── documents.py       # Document upload/processing
│   │   ├── users.py           # User management
│   │   ├── health.py          # Health check endpoint
│   │   └── admin.py           # Admin operations
│   │
│   ├── services/              # Business logic services
│   │   ├── bedrock_service.py # Claude 3 integration
│   │   ├── opensearch_service.py # RAG search
│   │   ├── dynamo_service.py  # Database operations
│   │   ├── s3_service.py      # File storage
│   │   └── document_processor.py # PDF/DOCX extraction
│   │
│   ├── models/                # Data models
│   │   ├── user.py            # User model
│   │   ├── conversation.py    # Chat history model
│   │   ├── document.py        # Document model
│   │   └── feedback.py        # Feedback model
│   │
│   ├── utils/                 # Utilities
│   │   ├── config.py          # Configuration
│   │   ├── logger.py          # Logging
│   │   ├── validators.py      # Input validation
│   │   └── exceptions.py      # Custom exceptions
│   │
│   └── knowledge_base/        # ALU Knowledge Base
│       ├── admissions.py      # Admissions data
│       ├── wellness.py        # Wellness & health data
│       ├── academics.py       # Academic programs
│       ├── campus.py          # Campus services
│       └── policies.py        # Policies & procedures
│
├── infrastructure/            # Infrastructure as Code
│   ├── template.yaml          # SAM/CloudFormation template
│   ├── api-gateway.yaml       # API Gateway config
│   └── opensearch.yaml        # OpenSearch config
│
├── scripts/                   # Deployment scripts
│   ├── deploy.sh              # Main deployment script
│   ├── setup_opensearch.py    # OpenSearch index setup
│   ├── seed_knowledge_base.py # Seed initial data
│   └── migrate_from_hf.py     # Migrate from Hugging Face
│
├── tests/                     # Unit & integration tests
│   ├── test_chat.py
│   ├── test_documents.py
│   └── test_search.py
│
├── requirements.txt           # Python dependencies
├── samconfig.toml             # SAM deployment config
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with credentials
- Python 3.11+
- AWS SAM CLI
- Docker (for local testing)

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally with SAM
sam local start-api

# Test endpoints
curl http://localhost:3000/health
curl -X POST http://localhost:3000/chat -d '{"message": "Hello"}'
```

### Deploy to AWS

```bash
# Build
sam build

# Deploy (guided first time)
sam deploy --guided

# Subsequent deployments
sam deploy
```

## 🔑 Environment Variables

Set these in AWS Secrets Manager or Lambda environment:

```
OPENSEARCH_ENDPOINT=https://your-domain.eu-north-1.es.amazonaws.com
DYNAMODB_TABLE_USERS=student-companion-users
DYNAMODB_TABLE_CONVERSATIONS=student-companion-conversations
DYNAMODB_TABLE_DOCUMENTS=student-companion-documents
S3_BUCKET_DOCUMENTS=student-companion-documents
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/chat` | Send message, get AI response |
| GET | `/conversations` | Get user's conversations |
| GET | `/conversations/{id}` | Get specific conversation |
| DELETE | `/conversations/{id}` | Delete conversation |
| POST | `/documents/upload` | Upload document |
| GET | `/documents` | List documents |
| DELETE | `/documents/{id}` | Delete document |
| GET | `/user/profile` | Get user profile |
| PUT | `/user/profile` | Update user profile |
| POST | `/feedback` | Submit feedback |

## 🔒 Security

- All data encrypted at rest (KMS)
- All traffic encrypted in transit (TLS 1.3)
- IAM roles with least privilege
- API Gateway with rate limiting
- CloudTrail audit logging
- Secrets in AWS Secrets Manager

## 📊 Monitoring

- CloudWatch Logs for all Lambda functions
- CloudWatch Metrics for performance
- X-Ray tracing for debugging
- CloudWatch Alarms for errors

## 💰 Cost Optimization

- Lambda: Pay per request
- DynamoDB: On-demand pricing
- OpenSearch: t3.small.search (~$25/mo)
- S3: Standard storage (~$0.023/GB)
- Bedrock: Pay per token

Estimated: $70-150/month for ~1000 users

## 🔄 Migration from Hugging Face

The system includes a migration script to transition from the current HF backend:

```bash
python scripts/migrate_from_hf.py
```

This will:
1. Keep HF as fallback during migration
2. Gradually route traffic to AWS
3. Full cutover when stable

## 📞 Support

- Email: studentcompanionai@gmail.com
- CloudPlexo Partner Support

---

Built with ❤️ for ALU Students

