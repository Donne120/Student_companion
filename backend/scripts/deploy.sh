#!/bin/bash

# Student Companion AI - Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: development, staging, production

set -e

ENVIRONMENT=${1:-development}
STACK_NAME="student-companion-backend-${ENVIRONMENT}"
REGION="eu-north-1"

echo "🚀 Deploying Student Companion Backend"
echo "   Environment: ${ENVIRONMENT}"
echo "   Stack: ${STACK_NAME}"
echo "   Region: ${REGION}"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ AWS credentials verified"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt -q
echo ""

# Build the SAM application
echo "🔨 Building SAM application..."
sam build --template-file infrastructure/template.yaml
echo ""

# Deploy
echo "🚀 Deploying to AWS..."
sam deploy \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --parameter-overrides Environment=${ENVIRONMENT} \
    --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

echo ""
echo "✅ Deployment complete!"
echo ""

# Get outputs
echo "📋 Stack Outputs:"
aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${REGION} \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
echo "🎉 Student Companion Backend deployed successfully!"
echo ""
echo "Next steps:"
echo "  1. Update frontend API_URL with the ApiEndpoint"
echo "  2. Enable Bedrock model access in AWS Console"
echo "  3. Upload knowledge base documents to S3"
echo "  4. Run OpenSearch index setup script"

