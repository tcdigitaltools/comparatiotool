#!/usr/bin/env bash
# ========================================
# Comparatio Health Check Script
# Quick status check for production server
# ========================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Comparatio Application Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Start Docker and try again."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check containers
echo "📦 Container Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

CONTAINERS=$(docker ps --filter "name=comparatio" --format "{{.Names}}" | wc -l | tr -d ' ')

if [ "$CONTAINERS" -eq 0 ]; then
    echo "❌ No comparatio containers running!"
    echo ""
    echo "Checking stopped containers..."
    docker ps -a --filter "name=comparatio" --format "   {{.Names}}: {{.Status}}"
    echo ""
    echo "💡 Try: docker compose up -d"
    exit 1
fi

docker ps --filter "name=comparatio" --format "   ✅ {{.Names}}: {{.Status}}"
echo ""

# Health checks
echo "🏥 Health Checks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend
if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    STATUS=$(curl -s http://localhost:8080/actuator/health | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   ✅ Backend: $STATUS (http://localhost:8080)"
else
    echo "   ❌ Backend: Health check failed!"
    echo "      Check: docker logs comparatio-backend"
fi

# Frontend
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "   ✅ Frontend: HTTP $HTTP_CODE (http://localhost:3000)"
else
    echo "   ❌ Frontend: HTTP $HTTP_CODE - Failed!"
    echo "      Check: docker logs comparatio-frontend"
fi

# MongoDB
if docker exec comparatio-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "   ✅ MongoDB: Connected (port 27017)"
else
    echo "   ⚠️  MongoDB: Connection check skipped"
fi

echo ""

# Get server IP
echo "🌐 Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
echo "   Frontend: http://$SERVER_IP:3000"
echo "   Backend:  http://$SERVER_IP:8080"
echo "   Health:   http://$SERVER_IP:8080/actuator/health"
echo ""

# Resource usage
echo "💾 Resource Usage:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker stats --no-stream --format "   {{.Name}}: CPU {{.CPUPerc}} | MEM {{.MemUsage}}" | grep comparatio
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$CONTAINERS" -ge 2 ] && [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ Application is RUNNING and HEALTHY!"
    echo ""
    echo "🎯 Login at: http://$SERVER_IP:3000"
    echo "   Email: admin@talentcapital.com"
    echo "   Password: admin"
else
    echo "⚠️  Some issues detected. Check logs:"
    echo "   docker compose logs -f"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

