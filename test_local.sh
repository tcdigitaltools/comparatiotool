#!/usr/bin/env bash
# Test local development setup

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Local Development Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test Backend Health
echo "📋 Step 1: Testing Backend Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8080"
    curl -s http://localhost:8080/actuator/health | jq . 2>/dev/null || curl -s http://localhost:8080/actuator/health
else
    echo "❌ Backend is NOT running on http://localhost:8080"
    echo "   Run: make up"
    echo "   Or: cd compa-ratio/BackEnd && ./mvnw spring-boot:run"
    exit 1
fi
echo ""

# Test CORS
echo "📋 Step 2: Testing CORS Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CORS_HEADER=$(curl -s -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -i "access-control-allow-origin" || echo "")

if echo "$CORS_HEADER" | grep -q "http://localhost:3000"; then
    echo "✅ CORS is configured correctly"
    echo "   $CORS_HEADER"
else
    echo "❌ CORS headers not found or incorrect"
    echo "   Expected: Access-Control-Allow-Origin: http://localhost:3000"
    echo "   Got: $CORS_HEADER"
fi
echo ""

# Test Login API
echo "📋 Step 3: Testing Login API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login API works!"
    echo "   Token: $(echo "$BODY" | jq -r '.token' 2>/dev/null | cut -c1-50)..."
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Login failed (401 Unauthorized)"
    echo "   Admin user may not exist. Run:"
    echo "   docker exec comparatio-mongodb-dev mongosh compa_demo --eval '"
    echo "   db.users.findOne({email:\"admin@talentcapital.com\"})'"
else
    echo "❌ Login API error (HTTP $HTTP_CODE)"
    echo "   Response: $BODY"
fi
echo ""

# Test Frontend
echo "📋 Step 4: Testing Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is NOT running on http://localhost:3000"
    echo "   Run: make up"
    echo "   Or: cd FrontEnd && npm run dev"
fi
echo ""

# Test MongoDB
echo "📋 Step 5: Testing MongoDB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker ps | grep -q comparatio-mongodb-dev; then
    echo "✅ MongoDB container is running"
    ADMIN_COUNT=$(docker exec comparatio-mongodb-dev mongosh compa_demo \
      --quiet --eval 'db.users.countDocuments({email:"admin@talentcapital.com"})' 2>/dev/null || echo "0")
    
    if [ "$ADMIN_COUNT" -gt 0 ]; then
        echo "✅ Admin user exists in database"
    else
        echo "⚠️  Admin user NOT found in database"
        echo "   Run: docker compose -f infra/docker-compose.dev.yml restart backend"
    fi
elif nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB is running on localhost:27017 (native)"
else
    echo "❌ MongoDB is NOT running"
    echo "   Run: make up"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access your application:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend:  http://localhost:8080"
echo ""
echo "Login credentials:"
echo "  📧 Email:    admin@talentcapital.com"
echo "  🔑 Password: admin"
echo ""

if [ "$HTTP_CODE" = "200" ] && curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Everything looks good! Open http://localhost:3000 in your browser."
else
    echo "⚠️  Some services are not running. Check the errors above."
    echo ""
    echo "Quick fix:"
    echo "  make down && make up"
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

