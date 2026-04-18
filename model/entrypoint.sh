#!/bin/sh

# Start the health check server in the background
python healthcheck.py &

# Get the worker file from environment variable, default to course_planner_worker.py
WORKER_FILE=${WORKER_FILE:-course_planner_worker.py}

echo "Starting worker: $WORKER_FILE"

# Start the specified worker
exec python "$WORKER_FILE"
