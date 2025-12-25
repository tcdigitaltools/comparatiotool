#!/usr/bin/env bash
# ========================================
# Multi-Architecture Build and Push Script
# Builds both backend and frontend for amd64/arm64
# Pushes to Docker Hub with latest and SHA tags
# ========================================

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Load environment variables
if [ -f "infra/.env" ]; then
    set -a
    source infra/.env
    set +a
fi

# Validate required variables
if [ -z "${DOCKERHUB_USERNAME:-}" ]; then
    echo "❌ Error: DOCKERHUB_USERNAME is not set in infra/.env"
    echo "   Please set it to your Docker Hub username."
    exit 1
fi

# Get short SHA for tagging
SHORT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo 'local')"

echo "🏗️  Building and pushing multi-architecture images..."
echo "   Docker Hub: ${DOCKERHUB_USERNAME}"
echo "   Git SHA: ${SHORT_SHA}"
echo ""

# Ensure buildx is initialized and active
if docker buildx ls | grep -q "comparatio-builder"; then
    echo "✅ Using existing builder 'comparatio-builder'"
    docker buildx use comparatio-builder
else
    echo "⚠️  Buildx not initialized. Running buildx_init.sh..."
    bash "$SCRIPT_DIR/buildx_init.sh"
fi

# Build and push backend
echo "📦 Building backend image..."
echo "   Image: ${BACKEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-backend}"
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
    --tag "${BACKEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-backend}:latest" \
    --tag "${BACKEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-backend}:sha-${SHORT_SHA}" \
    --push \
    compa-ratio/BackEnd

echo "✅ Backend image pushed successfully!"
echo ""

# Build and push frontend
echo "🎨 Building frontend image..."
echo "   Image: ${FRONTEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-frontend}"
# Use HTTPS API URL (use api subdomain if available, otherwise same domain)
API_URL="${NEXT_PUBLIC_API_URL:-https://api.talentcapitalme.com}"
echo "   API URL: ${API_URL}"
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --file FrontEnd/Dockerfile.llcompa_ratioll \
    --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
    --tag "${FRONTEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-frontend}:latest" \
    --tag "${FRONTEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-frontend}:sha-${SHORT_SHA}" \
    --push \
    FrontEnd

echo "✅ Frontend image pushed successfully!"
echo ""
echo "🎉 All images built and pushed!"
echo ""
echo "📋 Image tags:"
echo "   Backend:  ${BACKEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-backend}:latest"
echo "   Backend:  ${BACKEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-backend}:sha-${SHORT_SHA}"
echo "   Frontend: ${FRONTEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-frontend}:latest"
echo "   Frontend: ${FRONTEND_IMAGE:-${DOCKERHUB_USERNAME}/compa-ratio-frontend}:sha-${SHORT_SHA}"

