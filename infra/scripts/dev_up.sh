#!/usr/bin/env bash
# ========================================
# Development Environment Startup Script
# Builds and starts all services in dev mode
# ========================================

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Starting llcompa_ratioll development environment..."

# Check if .env file exists
if [ ! -f "infra/.env" ]; then
    echo "⚠️  Warning: infra/.env not found. Copying from .env.example..."
    cp infra/.env.example infra/.env
    echo "📝 Please update infra/.env with your configuration."
fi

# Start services with MongoDB if requested
if [ "${MONGO_ENABLE:-false}" = "true" ]; then
    echo "🍃 Starting with MongoDB..."
    docker compose -f infra/docker-compose.dev.yml --env-file infra/.env --profile with-mongo up --build
else
    echo "📦 Starting without MongoDB (configure MONGO_URI in .env to point to external MongoDB)..."
    docker compose -f infra/docker-compose.dev.yml --env-file infra/.env up --build
fi

