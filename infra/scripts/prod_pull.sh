#!/usr/bin/env bash
# ========================================
# Production Image Pull Script
# Pulls latest images from Docker Hub
# ========================================

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "📥 Pulling latest production images from Docker Hub..."

docker compose -f infra/docker-compose.prod.yml --env-file infra/.env pull

echo "✅ Images pulled successfully!"

