#!/usr/bin/env bash
# ========================================
# Rebuild Frontend with Correct API URL
# For server: 164.92.232.41
# ========================================

set -e

cd /Users/wasiq/Downloads/llcompa_ratioll

# Server configuration
SERVER_IP="164.92.232.41"
API_URL="http://${SERVER_IP}:8080"
SHORT_SHA=$(git rev-parse --short HEAD || echo 'local')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Rebuilding Frontend for Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Server IP: $SERVER_IP"
echo "API URL: $API_URL"
echo "Git SHA: $SHORT_SHA"
echo ""

# Ensure builder is active
docker buildx use comparatio-builder || {
    echo "Creating builder..."
    docker buildx create --name comparatio-builder --use
}

echo "🎨 Building frontend image with API URL: $API_URL"
echo ""

# Build and push frontend with correct API URL
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL="$API_URL" \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$SHORT_SHA \
  --progress=plain \
  --push \
  FrontEnd

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend Rebuilt and Pushed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Pushed to:"
echo "   talentcapital/comparatio-frontend:latest"
echo "   talentcapital/comparatio-frontend:sha-$SHORT_SHA"
echo ""
echo "🔧 On your server (164.92.232.41), run:"
echo "   docker compose pull frontend"
echo "   docker compose up -d frontend"
echo ""
echo "🌐 Then access:"
echo "   http://164.92.232.41:3000"
echo ""
echo "Frontend will now call: $API_URL/api/auth/login ✅"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

