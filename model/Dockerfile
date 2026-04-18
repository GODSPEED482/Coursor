FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and entrypoint
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port for health check
EXPOSE 8080

# Environment variables (to be overridden at runtime)
ENV WORKER_FILE=course_planner_worker.py

# Launch via entrypoint
ENTRYPOINT ["./entrypoint.sh"]
