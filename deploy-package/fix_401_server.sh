#!/usr/bin/env bash
# Fix 401 Error on Production Server
# Run this on your server: bash fix_401_server.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing 401 Error on Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check if admin exists
echo "📋 Step 1: Checking if admin user exists..."
ADMIN_EXISTS=$(docker exec comparatio-mongodb-prod mongosh compa_demo \
  --quiet --eval 'db.users.countDocuments({email:"admin@talentcapital.com"})' 2>/dev/null || echo "0")

if [ "$ADMIN_EXISTS" -gt 0 ]; then
    echo "✅ Admin user already exists"
    echo ""
else
    echo "⚠️  Admin user NOT found. Creating..."
    echo ""
    
    # Create admin user
    docker exec comparatio-mongodb-prod mongosh compa_demo --eval '
    db.users.insertOne({
      email: "admin@talentcapital.com",
      username: "admin",
      fullName: "Talent Capital Administrator",
      passwordHash: "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG",
      role: "SUPER_ADMIN",
      name: "Talent Capital",
      active: true,
      industry: "Technology",
      performanceRatingScale: "FIVE_POINT",
      currency: "USD",
      createdAt: new Date(),
      updatedAt: new Date()
    })
    '
    
    if [ $? -eq 0 ]; then
        echo "✅ Admin user created successfully!"
    else
        echo "❌ Failed to create admin user"
        exit 1
    fi
    echo ""
fi

# Step 2: Verify admin user
echo "📋 Step 2: Verifying admin user..."
docker exec comparatio-mongodb-prod mongosh compa_demo \
  --eval 'db.users.findOne({email:"admin@talentcapital.com"}, {email:1, username:1, role:1, active:1})'
echo ""

# Step 3: Test login API
echo "📋 Step 3: Testing login API..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST https://api.talentcapitalme.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://compa.talentcapitalme.com" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Login successful!"
    echo ""
    echo "Token preview:"
    echo "$BODY" | jq -r '.token' 2>/dev/null | cut -c1-60 || echo "$BODY"
    echo "..."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS! Login is working!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Now test in browser:"
    echo "  🌐 URL: https://compa.talentcapitalme.com"
    echo "  📧 Email: admin@talentcapital.com"
    echo "  🔑 Password: admin"
    echo ""
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Still getting 401!"
    echo ""
    echo "Response:"
    echo "$BODY"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Troubleshooting"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Check backend logs:"
    echo "   docker logs comparatio-backend-prod --tail=50"
    echo ""
    echo "2. Check if backend is healthy:"
    echo "   docker ps"
    echo ""
    echo "3. Restart backend:"
    echo "   docker compose restart backend"
    echo "   sleep 30"
    echo ""
    echo "4. Test internal login:"
    echo "   docker exec comparatio-backend-prod curl -s http://localhost:8080/api/auth/login \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"admin@talentcapital.com\",\"password\":\"admin\"}'"
    echo ""
else
    echo "❌ Unexpected error (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    echo ""
    echo "Check logs:"
    echo "  docker logs comparatio-backend-prod --tail=50"
fi
echo ""

