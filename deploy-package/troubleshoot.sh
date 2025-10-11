#!/usr/bin/env bash
# ========================================
# Comparatio Troubleshooting Script
# Diagnoses common deployment issues
# ========================================

echo "🔍 Troubleshooting Comparatio Deployment..."
echo ""

# Check logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Backend Container Logs (Last 50 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs comparatio-backend-prod --tail=50 2>&1 || docker logs comparatio-backend --tail=50 2>&1
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Common Issues Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check MongoDB connection
if docker ps --format '{{.Names}}' | grep -q mongodb; then
    echo "✅ MongoDB container is running"
    if docker exec comparatio-mongodb-prod mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1 || \
       docker exec comparatio-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is accessible"
    else
        echo "❌ MongoDB is not responding"
    fi
else
    echo "⚠️  MongoDB container not found"
    echo "   Check MONGO_URI in .env points to external MongoDB"
fi

# Check environment variables
echo ""
echo "🔧 Environment Variables Check:"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check critical vars
    if grep -q "JWT_SECRET=" .env && ! grep -q "JWT_SECRET=fda10b388526a9b0ebda6d8a7f2d2345a1af5" .env; then
        echo "✅ JWT_SECRET is configured (not default)"
    else
        echo "⚠️  JWT_SECRET may need to be set/changed"
    fi
    
    if grep -q "MONGO_URI=" .env; then
        echo "✅ MONGO_URI is configured"
        grep "MONGO_URI=" .env | head -1
    fi
else
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env"
fi

# Check ports
echo ""
echo "🔌 Port Availability Check:"
for port in 3000 8080 27017; do
    if sudo lsof -i :$port > /dev/null 2>&1 || lsof -i :$port > /dev/null 2>&1; then
        PROCESS=$(sudo lsof -i :$port 2>/dev/null || lsof -i :$port 2>/dev/null | tail -1 | awk '{print $1}')
        echo "   Port $port: In use by $PROCESS"
    else
        echo "   Port $port: Available"
    fi
done

# Check disk space
echo ""
echo "💾 Disk Space:"
df -h / | tail -1 | awk '{print "   Used: " $5 " | Free: " $4}'

# Check Docker space
echo ""
echo "🐳 Docker Disk Usage:"
docker system df | grep -v "TYPE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 Recommended Actions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check backend logs for specific error:"
echo "   docker logs comparatio-backend-prod --tail=100"
echo ""
echo "2. Verify MongoDB connection:"
echo "   Check MONGO_URI in .env file"
echo ""
echo "3. Try restarting backend:"
echo "   docker compose restart backend"
echo ""
echo "4. If still failing, restart all:"
echo "   docker compose down"
echo "   docker compose pull"
echo "   docker compose up -d"
echo ""
echo "5. Check real-time logs:"
echo "   docker compose logs -f backend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

