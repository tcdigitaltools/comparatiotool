#!/usr/bin/env bash
# ========================================
# Smoke Test Script
# Validates that services are running and healthy
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

BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

echo "🔍 Running smoke tests..."
echo ""

# Test Backend
echo "📡 Testing Backend on :$BACKEND_PORT"
if curl -fsS "http://localhost:${BACKEND_PORT}/actuator/health" >/dev/null 2>&1; then
    echo "✅ Backend health check passed (Actuator)"
elif curl -fsS "http://localhost:${BACKEND_PORT}/health" >/dev/null 2>&1; then
    echo "✅ Backend health check passed (/health)"
elif curl -fsS "http://localhost:${BACKEND_PORT}/" >/dev/null 2>&1; then
    echo "✅ Backend is responding (root endpoint)"
else
    echo "❌ Backend health check failed!"
    exit 1
fi

# Test Frontend
echo "🎨 Testing Frontend on :$FRONTEND_PORT"
if curl -fsS "http://localhost:${FRONTEND_PORT}/" >/dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed!"
    exit 1
fi

echo ""
echo "✅ All smoke tests passed!"
echo ""
echo "🌐 Services available at:"
echo "   Backend:  http://localhost:${BACKEND_PORT}"
echo "   Frontend: http://localhost:${FRONTEND_PORT}"
echo "   Actuator: http://localhost:${BACKEND_PORT}/actuator/health"

