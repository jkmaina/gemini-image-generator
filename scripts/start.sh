#!/bin/bash

# Check if .env.local exists, if not create it from .env.example
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example"
  cp .env.example .env.local
  echo "Please edit .env.local to add your Gemini API key"
  exit 1
fi

# Check if GEMINI_API_KEY is set in .env.local
if grep -q "GEMINI_API_KEY=your_api_key_here" .env.local; then
  echo "Error: Please set your Gemini API key in .env.local"
  exit 1
fi

# Export environment variables from .env.local
export $(grep -v '^#' .env.local | xargs)

# Build and start the Docker container
docker-compose up -d

# Wait for the container to start
echo "Waiting for the API to start..."
sleep 5

# Check if the API is healthy
response=$(curl -s http://localhost:3000/api/health)
if [[ $response == *"healthy"* ]]; then
  echo "API is running and healthy!"
  echo "Access the API at: http://localhost:3000"
  echo "API Documentation: http://localhost:3000/docs"
else
  echo "API failed to start properly. Check logs with: docker-compose logs"
fi