#!/usr/bin/env bash
# ========================================
# Production Environment Startup Script
# Starts services using pre-built images
# ========================================

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Starting llcompa_ratioll production environment..."

# Check if .env file exists
if [ ! -f "infra/.env" ]; then
    echo "❌ Error: infra/.env not found!"
    echo "   Please create it from infra/.env.example and configure it."
    exit 1
fi

# Start services with MongoDB if requested
if [ "${MONGO_ENABLE:-false}" = "true" ]; then
    echo "🍃 Starting with MongoDB..."
    docker compose -f infra/docker-compose.prod.yml --env-file infra/.env --profile with-mongo up -d
else
    echo "📦 Starting without MongoDB (configure MONGO_URI in .env to point to external MongoDB)..."
    docker compose -f infra/docker-compose.prod.yml --env-file infra/.env up -d
fi

echo ""
echo "✅ Production environment started!"
echo ""
echo "📊 Check status with: docker compose -f infra/docker-compose.prod.yml ps"
echo "📝 View logs with:   docker compose -f infra/docker-compose.prod.yml logs -f"

