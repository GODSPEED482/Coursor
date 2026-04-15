# Local Setup Guide (Server)

This document outlines how to set up and run the Node.js WebSocket backend the models' message broker alongside the required machine-learning services.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- RabbitMQ server running locally (e.g. via Docker, Homebrew, or standard installation)

## 1. Running the RabbitMQ Broker

Ensure your local RabbitMQ instance is up and running on `localhost:5672`.
- If using Docker:
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

## 2. Booting up the Python Model Workers

The backend relies on the ML workers to ingest and generate data.
Open a terminal, navigate to the `model` directory, activate your venv, and run the Python worker processes:

```bash
cd ../model

# Start the initializer (consumes details)
python course_details_initializer_worker.py

# Start the finalizer (handles user questions and finalizes course parameters)
python course_details_finalizer_worker.py

# Start the course planner (orchestrates syllabus)
python course_planner_worker.py

# Start the content injector (generates actual course segments)
python content_injector_worker.py
```
*(Tip: In a production environment, you might use PM2, Docker Compose, or Supervisor to run all python scripts).*

## 3. Starting the Node.js Server

Once the broker and workers are ready, start the WebSocket server.

```bash
# Navigate to the server folder
cd server

# Install dependencies if you haven't yet
npm install

# Run the development server (uses node --watch)
npm run dev
```

The server should log:
```
[RabbitMQManager] Initialized central reply/log queues.
[Server] WebSocket & HTTP Server listening on port 8080
```

## 4. Connecting the Client

With the `server` running, boot the Vite React application:
```bash
cd ../client
npm run dev
```

Your system is now completely connected end-to-end.
