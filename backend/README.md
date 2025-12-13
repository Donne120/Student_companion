# 🚀 Student Companion Backend

AWS-powered backend for the Student Companion AI chatbot, built with FastAPI and Amazon Bedrock (Claude 3.7).

## 🐳 Quick Start with Docker

### Prerequisites
- [Docker Desktop](https://docs.docker.com/desktop/) installed and running

### One-Command Setup

**Windows (PowerShell):**
```powershell
cd backend
.\scripts\docker-start.ps1
```

**Linux/Mac:**
```bash
cd backend
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

This will:
1. Create a `.env` file from the template
2. Build the Docker image
3. Start all services (API, DynamoDB Local, OpenSearch)

### Access Points
| Service | URL |
|---------|-----|
| **API** | http://localhost:8000 |
| **Health Check** | http://localhost:8000/health |
| **API Docs** | http://localhost:8000/docs |
| **DynamoDB Local** | http://localhost:8001 |
| **OpenSearch** | http://localhost:9200 |
| **OpenSearch Dashboard** | http://localhost:5601 |

---

## 📦 Docker Commands

### Development Mode (with local AWS services)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up --build -d
```

### Production Mode (connects to AWS)
```bash
# Start production server
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

---

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

**Required for AWS:**
```env
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**Required for AI:**
```env
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

See `env.example` for all available options.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   FastAPI Application (Port 8000)                       │
│   ├── /health          - Health check                   │
│   ├── /api/chat        - Chat endpoint                  │
│   ├── /api/documents   - Document management            │
│   ├── /api/users       - User management                │
│   └── /api/feedback    - Feedback collection            │
│                                                          │
│   Services:                                              │
│   ├── Bedrock Service  - Claude 3.7 AI                  │
│   ├── DynamoDB Service - Data storage                   │
│   ├── OpenSearch       - RAG/Vector search              │
│   └── S3 Service       - Document storage               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── handlers/           # API endpoints
│   │   ├── chat.py         # Chat logic
│   │   ├── documents.py    # Document upload
│   │   ├── users.py        # User management
│   │   └── feedback.py     # Feedback collection
│   ├── services/           # AWS integrations
│   │   ├── bedrock_service.py    # Claude 3.7 AI
│   │   ├── dynamo_service.py     # DynamoDB
│   │   ├── opensearch_service.py # Vector search
│   │   └── s3_service.py         # File storage
│   ├── models/             # Data models
│   ├── knowledge_base/     # ALU knowledge
│   └── utils/              # Utilities
├── infrastructure/         # AWS SAM templates
├── scripts/                # Deployment scripts
├── Dockerfile              # Container definition
├── docker-compose.yml      # Dev environment
├── docker-compose.prod.yml # Production
├── requirements.txt        # Python dependencies
└── env.example             # Environment template
```

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:8000/health
```

### Chat Request
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are ALU admission requirements?"}'
```

### Interactive API Docs
Open http://localhost:8000/docs in your browser.

---

## 🚀 Deployment Options

### Option 1: AWS Lambda (Serverless)
```bash
cd infrastructure
sam build
sam deploy --guided
```

### Option 2: AWS ECS/Fargate (Containers)
```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.eu-north-1.amazonaws.com
docker build -t student-companion-backend .
docker tag student-companion-backend:latest <account>.dkr.ecr.eu-north-1.amazonaws.com/student-companion:latest
docker push <account>.dkr.ecr.eu-north-1.amazonaws.com/student-companion:latest
```

### Option 3: Any Docker Host
```bash
# Build image
docker build -t student-companion-backend .

# Run anywhere
docker run -p 8000:8000 --env-file .env student-companion-backend
```

---

## 🔧 Development

### Without Docker
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn src.main:app --reload --port 8000
```

### With Hot Reload
The docker-compose.yml mounts the code directory, so changes are reflected automatically.

---

## 📞 Support

- **Email:** studentcompanionai@gmail.com
- **GitHub:** https://github.com/Donne120/Student_companion

---

## 📄 License

MIT License - See LICENSE file for details.
