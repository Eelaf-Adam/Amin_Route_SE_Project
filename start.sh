#!/bin/bash
echo "Starting Amin Route Stack with Docker Compose..."
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose up --build -d
else
    docker-compose up --build -d
fi
echo "Stack launched!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000/docs"
