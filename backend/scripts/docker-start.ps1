# Student Companion Backend - Docker Start Script (PowerShell)
# Usage: .\scripts\docker-start.ps1 [-Mode dev|prod]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod")]
    [string]$Mode = "dev"
)

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Split-Path -Parent $ScriptDir

Set-Location $BackendDir

Write-Host "🐳 Student Companion Backend - Docker Setup" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Visit: https://docs.docker.com/desktop/install/windows-install/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file. Please edit it with your credentials." -ForegroundColor Green
        Write-Host ""
        Write-Host "   Required for AWS:" -ForegroundColor Yellow
        Write-Host "   - AWS_ACCESS_KEY_ID" -ForegroundColor Yellow
        Write-Host "   - AWS_SECRET_ACCESS_KEY" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host "❌ env.example not found. Please create .env manually." -ForegroundColor Red
        exit 1
    }
}

if ($Mode -eq "prod") {
    Write-Host "🚀 Starting in PRODUCTION mode..." -ForegroundColor Green
    Write-Host ""
    docker-compose -f docker-compose.prod.yml up --build -d
    Write-Host ""
    Write-Host "✅ Production server started!" -ForegroundColor Green
    Write-Host "   API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "   Health: http://localhost:8000/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Stop: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Starting in DEVELOPMENT mode..." -ForegroundColor Green
    Write-Host "   This includes local DynamoDB and OpenSearch" -ForegroundColor Gray
    Write-Host ""
    docker-compose up --build -d
    Write-Host ""
    Write-Host "✅ Development environment started!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   📡 Services:" -ForegroundColor Cyan
    Write-Host "   - API:                  http://localhost:8000" -ForegroundColor White
    Write-Host "   - Health Check:         http://localhost:8000/health" -ForegroundColor White
    Write-Host "   - DynamoDB Local:       http://localhost:8001" -ForegroundColor White
    Write-Host "   - OpenSearch:           http://localhost:9200" -ForegroundColor White
    Write-Host "   - OpenSearch Dashboard: http://localhost:5601" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 View logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "🛑 Stop: docker-compose down" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Ready to go!" -ForegroundColor Green

