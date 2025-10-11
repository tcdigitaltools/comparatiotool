#!/usr/bin/env bash
# Test login on production server

set -e

SERVER="https://api.talentcapitalme.com"
FRONTEND="https://compa.talentcapitalme.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Testing Login on Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Server: $SERVER"
echo "Frontend: $FRONTEND"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$SERVER/actuator/health" | jq . || echo "❌ Health check failed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test 2: CORS Preflight"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -X OPTIONS "$SERVER/api/auth/login" \
  -H "Origin: $FRONTEND" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control" || echo "❌ No CORS headers"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Test 3: Login Request"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -X POST "$SERVER/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $FRONTEND" \
  -d '{
    "email": "admin@talentcapital.com",
    "password": "admin"
  }' \
  -w "\n%{http_code}" \
  -s)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Login successful!"
    echo ""
    echo "Token:"
    echo "$BODY" | jq -r '.token' 2>/dev/null | head -c 50
    echo "..."
elif [ "$HTTP_CODE" == "401" ]; then
    echo "❌ 401 Unauthorized - Login failed"
    echo "Possible causes:"
    echo "  1. Wrong credentials"
    echo "  2. Backend not updated"
    echo "  3. Database issue"
else
    echo "❌ Unexpected status: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Test Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

