FROM python:3.10-slim-bookworm

WORKDIR /app

# Set environment variables to optimize Python performance
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Install dependencies using a single layer to reduce image size
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ALL application code and directories
COPY . .  

# Copy only necessary application files
COPY alu_brain ./alu_brain
COPY prompt_engine ./prompt_engine
COPY document_processor.py retrieval_engine.py retrieval_engine_extended.py main.py ./

# Create necessary directories with proper permissions
RUN mkdir -p data/uploads data/documents data/vector_index && \
    chmod -R 777 data

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application with optimized settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
