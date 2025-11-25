#!/bin/bash

# Set your Docker Hub username
DOCKER_USERNAME="onurpro"

# Build and push backend image
echo "Building backend image..."
docker build -t $DOCKER_USERNAME/vinylo-backend:latest ./backend
echo "Pushing backend image..."
docker push $DOCKER_USERNAME/vinylo-backend:latest

# Build and push frontend image
echo "Building frontend image..."
docker build -t $DOCKER_USERNAME/vinylo-frontend:latest ./frontend
echo "Pushing frontend image..."
docker push $DOCKER_USERNAME/vinylo-frontend:latest

echo "Done! Images pushed to Docker Hub."
