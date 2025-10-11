#!/usr/bin/env bash
# ========================================
# Optimized Push Script for Apple M3
# Builds with better error handling
# ========================================

set -e

cd /Users/wasiq/Downloads/llcompa_ratioll

# Get git hash
SHORT_SHA=$(git rev-parse --short HEAD || echo 'local')

echo "🍎 Optimized build for Apple M3 (ARM64)"
echo "📦 Docker Hub: talentcapital"
echo "🔖 Git SHA: $SHORT_SHA"
echo ""

# Ensure builder is active
docker buildx use comparatio-builder

echo "========================================"
echo "📦 STEP 1/2: Building Backend"
echo "========================================"
echo "Platform: linux/amd64,linux/arm64"
echo "Image: talentcapital/comparatio-backend"
echo ""

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest \
  --tag talentcapital/comparatio-backend:sha-$SHORT_SHA \
  --progress=plain \
  --push \
  compa-ratio/BackEnd

echo ""
echo "✅ Backend pushed successfully!"
echo ""
echo "========================================"
echo "🎨 STEP 2/2: Building Frontend"
echo "========================================"
echo "Platform: linux/amd64,linux/arm64"
echo "Image: talentcapital/comparatio-frontend"
echo ""

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$SHORT_SHA \
  --progress=plain \
  --push \
  FrontEnd

echo ""
echo "✅ Frontend pushed successfully!"
echo ""
echo "========================================"
echo "🎉 ALL DONE!"
echo "========================================"
echo ""
echo "📋 Pushed images:"
echo "   ✅ talentcapital/comparatio-backend:latest"
echo "   ✅ talentcapital/comparatio-backend:sha-$SHORT_SHA"
echo "   ✅ talentcapital/comparatio-frontend:latest"
echo "   ✅ talentcapital/comparatio-frontend:sha-$SHORT_SHA"
echo ""
echo "🌐 View on Docker Hub:"
echo "   https://hub.docker.com/r/talentcapital/comparatio-backend"
echo "   https://hub.docker.com/r/talentcapital/comparatio-frontend"
echo ""
echo "🍎 Optimized for Apple M3 - Build complete!"

