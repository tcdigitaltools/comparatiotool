#!/usr/bin/env bash
# ========================================
# Quick Start Script for Local Development
# ========================================

set -e

echo "=========================================="
echo "🚀 llcompa_ratioll Quick Start"
echo "=========================================="
echo ""

# Step 1: Check if .env exists
if [ ! -f "infra/.env" ]; then
    echo "📝 Step 1: Creating environment configuration..."
    cp infra/.env.example infra/.env
    echo "✅ Created infra/.env from template"
    echo ""
    echo "⚠️  IMPORTANT: Edit infra/.env and set:"
    echo "   - DOCKERHUB_USERNAME=your_username"
    echo "   - MONGO_URI=mongodb://mongodb:27017 (or external)"
    echo ""
    read -p "Press Enter after editing infra/.env to continue..."
else
    echo "✅ Step 1: Environment file exists"
fi

echo ""

# Step 2: Start services
echo "🏗️  Step 2: Building and starting services..."
echo "This may take a few minutes on first run..."
echo ""

make up &

# Wait for services
sleep 5

# Step 3: Monitor startup
echo ""
echo "📊 Waiting for services to be healthy..."
echo "You can view logs in another terminal with: make logs"
echo ""

# Wait a bit for services to start
sleep 30

# Step 4: Run smoke test
echo ""
echo "🔍 Step 3: Testing service health..."
if make smoke 2>/dev/null; then
    echo ""
    echo "=========================================="
    echo "✅ SUCCESS! All services are running!"
    echo "=========================================="
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8080"
    echo "   Health:    http://localhost:8080/actuator/health"
    echo ""
    echo "📝 Useful commands:"
    echo "   make logs      - View all logs"
    echo "   make smoke     - Check health"
    echo "   make down      - Stop everything"
    echo ""
else
    echo ""
    echo "⚠️  Services are still starting up..."
    echo "Run 'make smoke' in a minute to verify"
    echo "Or check logs with: make logs"
fi

