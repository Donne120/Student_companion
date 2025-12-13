#!/bin/bash
# Student Companion Backend - Docker Start Script
# Usage: ./scripts/docker-start.sh [dev|prod]

set -e

MODE=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

cd "$BACKEND_DIR"

echo "🐳 Student Companion Backend - Docker Setup"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env file. Please edit it with your credentials."
        echo ""
        echo "   Required for AWS:"
        echo "   - AWS_ACCESS_KEY_ID"
        echo "   - AWS_SECRET_ACCESS_KEY"
        echo ""
    else
        echo "❌ env.example not found. Please create .env manually."
        exit 1
    fi
fi

if [ "$MODE" == "prod" ]; then
    echo "🚀 Starting in PRODUCTION mode..."
    echo ""
    docker-compose -f docker-compose.prod.yml up --build -d
    echo ""
    echo "✅ Production server started!"
    echo "   API: http://localhost:8000"
    echo "   Health: http://localhost:8000/health"
    echo ""
    echo "📋 View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "🛑 Stop: docker-compose -f docker-compose.prod.yml down"
else
    echo "🔧 Starting in DEVELOPMENT mode..."
    echo "   This includes local DynamoDB and OpenSearch"
    echo ""
    docker-compose up --build -d
    echo ""
    echo "✅ Development environment started!"
    echo ""
    echo "   📡 Services:"
    echo "   - API:                  http://localhost:8000"
    echo "   - Health Check:         http://localhost:8000/health"
    echo "   - DynamoDB Local:       http://localhost:8001"
    echo "   - OpenSearch:           http://localhost:9200"
    echo "   - OpenSearch Dashboard: http://localhost:5601"
    echo ""
    echo "📋 View logs: docker-compose logs -f"
    echo "🛑 Stop: docker-compose down"
fi

echo ""
echo "🎉 Ready to go!"

