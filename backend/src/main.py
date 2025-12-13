"""
Student Companion AI - Main FastAPI Application
Production-ready AWS backend for ALU Student Companion chatbot
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
import time

from .utils import settings, logger, StudentCompanionError
from .handlers import (
    chat_router,
    documents_router,
    users_router,
    health_router,
    feedback_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(
        "Starting Student Companion API",
        version=settings.app_version,
        environment=settings.environment,
        region=settings.aws_region
    )
    
    yield
    
    # Shutdown
    logger.info("Shutting down Student Companion API")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="AI-powered student assistant for African Leadership University",
    version=settings.app_version,
    docs_url="/docs" if settings.is_local else None,
    redoc_url="/redoc" if settings.is_local else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests"""
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration_ms = int((time.time() - start_time) * 1000)
    
    # Log request (skip health checks for less noise)
    if not request.url.path.startswith("/health"):
        logger.info(
            "Request processed",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=duration_ms
        )
    
    return response


# Exception handlers
@app.exception_handler(StudentCompanionError)
async def handle_app_error(request: Request, exc: StudentCompanionError):
    """Handle application-specific errors"""
    logger.warning(
        "Application error",
        error_code=exc.error_code,
        message=exc.message,
        path=request.url.path
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


@app.exception_handler(HTTPException)
async def handle_http_error(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "error_code": "HTTP_ERROR",
            "message": exc.detail
        }
    )


@app.exception_handler(Exception)
async def handle_generic_error(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(
        "Unexpected error",
        error=str(exc),
        path=request.url.path
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "error_code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred. Please try again."
        }
    )


# Include routers
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(users_router)
app.include_router(feedback_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs" if settings.is_local else "disabled in production"
    }


# AWS Lambda handler
handler = Mangum(app, lifespan="off")


# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

