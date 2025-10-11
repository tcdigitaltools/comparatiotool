#!/usr/bin/env bash
# Debug 401 Login Error
# Run this on your server (164.92.232.41)

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Debugging 401 Login Error"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Step 1: Check if admin user exists in MongoDB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ADMIN_USER=$(docker exec comparatio-mongodb-prod mongosh compa_demo \
  --quiet \
  --eval 'db.users.findOne({email:"admin@talentcapital.com"})' 2>/dev/null || echo "")

if [ -z "$ADMIN_USER" ] || echo "$ADMIN_USER" | grep -q "null"; then
    echo "❌ Admin user NOT found in database!"
    echo ""
    echo "🔧 Fix: Restart backend to create admin user"
    echo "   docker compose restart backend"
    echo "   sleep 30"
    echo ""
else
    echo "✅ Admin user found:"
    echo "$ADMIN_USER" | head -n 10
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Test login on localhost:8080 (internal)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
LOGIN_RESPONSE=$(docker exec comparatio-backend-prod curl -s -w "\n%{http_code}" \
  -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null || echo "ERROR\n500")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Internal login works!"
    echo "Token preview: $(echo "$BODY" | cut -c1-50)..."
    echo ""
    echo "👉 If browser still gets 401, check:"
    echo "   1. What credentials is frontend sending?"
    echo "   2. Browser console for actual request"
    echo "   3. Network tab for request payload"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Authentication failed!"
    echo ""
    echo "Possible causes:"
    echo "  1. Wrong credentials"
    echo "  2. User not found in database"
    echo "  3. Password hash mismatch"
    echo ""
else
    echo "❌ Unexpected error!"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Check backend logs for errors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Recent auth-related errors:"
docker logs comparatio-backend-prod --tail=100 2>&1 | \
  grep -i "auth\|401\|unauthorized\|login\|password\|credential" | \
  tail -n 20 || echo "No auth errors found in logs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Test HTTPS endpoint (external)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTPS_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST https://api.talentcapitalme.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://compa.talentcapitalme.com" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null || echo "ERROR\n500")

HTTPS_CODE=$(echo "$HTTPS_RESPONSE" | tail -n1)
HTTPS_BODY=$(echo "$HTTPS_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTPS_CODE"
echo "Response:"
echo "$HTTPS_BODY"
echo ""

if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS login works!"
    echo ""
    echo "👉 Problem is in the frontend:"
    echo "   - Check browser console"
    echo "   - Verify credentials being sent"
    echo "   - Check if form is using correct email field"
elif [ "$HTTPS_CODE" = "401" ]; then
    echo "❌ HTTPS login also fails"
    echo ""
    if [ "$HTTP_CODE" = "200" ]; then
        echo "⚠️  Internal works but HTTPS fails!"
        echo "   This suggests Nginx or SSL issue"
    else
        echo "⚠️  Both internal and external fail"
        echo "   Backend authentication is broken"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Quick Fixes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -z "$ADMIN_USER" ] || echo "$ADMIN_USER" | grep -q "null"; then
    echo "1️⃣  Create admin user:"
    echo "    docker compose restart backend"
    echo "    sleep 30"
    echo ""
fi

if [ "$HTTP_CODE" = "401" ]; then
    echo "2️⃣  Reset admin password:"
    echo "    docker exec comparatio-mongodb-prod mongosh compa_demo --eval '"
    echo "      db.users.updateOne("
    echo "        { email: \"admin@talentcapital.com\" },"
    echo "        { \$set: { passwordHash: \"\$2a\$10\$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG\" } }"
    echo "      )"
    echo "    '"
    echo ""
fi

echo "3️⃣  View full backend logs:"
echo "    docker logs comparatio-backend-prod --tail=100"
echo ""

echo "4️⃣  Test in browser console:"
echo "    fetch('https://api.talentcapitalme.com/api/auth/login', {"
echo "      method: 'POST',"
echo "      headers: { 'Content-Type': 'application/json' },"
echo "      body: JSON.stringify({"
echo "        email: 'admin@talentcapital.com',"
echo "        password: 'admin'"
echo "      })"
echo "    }).then(r => r.json()).then(console.log)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Debug Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

