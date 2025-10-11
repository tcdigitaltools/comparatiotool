#!/usr/bin/env bash
# ========================================
# Development Environment Shutdown Script
# Stops and removes all dev containers and volumes
# ========================================

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🛑 Stopping llcompa_ratioll development environment..."

# Stop services
docker compose -f infra/docker-compose.dev.yml --env-file infra/.env down -v

echo "✅ Development environment stopped and cleaned up."

