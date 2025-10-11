#!/usr/bin/env bash
# ========================================
# Rebuild All Images for Production
# Server: 164.92.232.41
# Frontend: https://compa.talentcapitalme.com
# Backend: https://api.talentcapitalme.com
# ========================================

set -e

cd /Users/wasiq/Downloads/llcompa_ratioll

# Configuration
FRONTEND_DOMAIN="https://compa.talentcapitalme.com"
API_DOMAIN="https://api.talentcapitalme.com"
SHORT_SHA=$(git rev-parse --short HEAD || echo 'local')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Rebuilding All Images for Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Frontend: $FRONTEND_DOMAIN"
echo "Backend API: $API_DOMAIN"
echo "Git SHA: $SHORT_SHA"
echo ""

# Ensure builder is active
docker buildx use comparatio-builder || {
    echo "Creating builder..."
    docker buildx create --name comparatio-builder --use
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 1/2: Rebuilding Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "CORS will allow: $FRONTEND_DOMAIN"
echo "Building for: linux/amd64, linux/arm64"
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
echo "✅ Backend rebuilt and pushed!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 STEP 2/2: Rebuilding Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "API URL: $API_DOMAIN"
echo "Building for: linux/amd64, linux/arm64"
echo ""

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL="$API_DOMAIN" \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$SHORT_SHA \
  --progress=plain \
  --push \
  FrontEnd

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL IMAGES REBUILT AND PUSHED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Pushed images:"
echo "   ✅ talentcapital/comparatio-backend:latest"
echo "   ✅ talentcapital/comparatio-backend:sha-$SHORT_SHA"
echo "   ✅ talentcapital/comparatio-frontend:latest"
echo "   ✅ talentcapital/comparatio-frontend:sha-$SHORT_SHA"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ON YOUR SERVER, RUN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   docker compose pull"
echo "   docker compose down"
echo "   docker compose up -d"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 THEN ACCESS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Frontend: $FRONTEND_DOMAIN"
echo "   Backend:  $API_DOMAIN"
echo ""
echo "✅ Login will now work with CORS enabled!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

