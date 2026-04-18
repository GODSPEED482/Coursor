FROM python:3.11

WORKDIR /app

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
ENV WORKER_FILE=init.py

# Launch via entrypoint
ENTRYPOINT ["./entrypoint.sh"]
