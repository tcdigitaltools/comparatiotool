#!/usr/bin/env bash
# Reset Admin Password on Server
# Run on server: bash reset_admin_password.sh

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Resetting Admin Password"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if MongoDB container is running
if ! docker ps | grep -q comparatio-mongodb-prod; then
    echo "❌ MongoDB container not running!"
    echo "   Run: docker compose up -d"
    exit 1
fi

echo "📋 Step 1: Checking current admin user..."
CURRENT_ADMIN=$(docker exec comparatio-mongodb-prod mongosh compa_demo \
  --quiet --eval 'JSON.stringify(db.users.findOne({email:"admin@talentcapital.com"}))' 2>/dev/null)

if [ "$CURRENT_ADMIN" != "null" ]; then
    echo "⚠️  Found existing admin user:"
    echo "$CURRENT_ADMIN" | jq . 2>/dev/null || echo "$CURRENT_ADMIN"
    echo ""
    echo "Deleting old admin..."
    docker exec comparatio-mongodb-prod mongosh compa_demo \
      --eval 'db.users.deleteMany({email:"admin@talentcapital.com"})'
    echo "✅ Old admin deleted"
else
    echo "ℹ️  No existing admin found"
fi
echo ""

echo "📋 Step 2: Creating fresh admin user..."
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

echo "📋 Step 3: Verifying admin user..."
docker exec comparatio-mongodb-prod mongosh compa_demo \
  --eval 'printjson(db.users.findOne({email:"admin@talentcapital.com"}, {email:1, username:1, role:1, active:1, passwordHash:1}))'
echo ""

echo "📋 Step 4: Testing internal login (inside container)..."
INTERNAL_LOGIN=$(docker exec comparatio-backend-prod curl -s \
  -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null)

echo "$INTERNAL_LOGIN" | jq . 2>/dev/null || echo "$INTERNAL_LOGIN"

if echo "$INTERNAL_LOGIN" | jq -e '.token' >/dev/null 2>&1; then
    echo "✅ Internal login works!"
else
    echo "❌ Internal login failed!"
    echo "   Check backend logs: docker logs comparatio-backend-prod --tail=50"
    echo ""
fi
echo ""

echo "📋 Step 5: Testing external login (through Nginx)..."
EXTERNAL_LOGIN=$(curl -s \
  -X POST https://api.talentcapitalme.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' 2>/dev/null)

echo "$EXTERNAL_LOGIN" | jq . 2>/dev/null || echo "$EXTERNAL_LOGIN"

if echo "$EXTERNAL_LOGIN" | jq -e '.token' >/dev/null 2>&1; then
    echo "✅ External login works!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ SUCCESS!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "You can now login at: https://compa.talentcapitalme.com"
    echo ""
    echo "Credentials:"
    echo "  📧 Email:    admin@talentcapital.com"
    echo "  🔑 Password: admin"
    echo ""
else
    echo "❌ External login failed!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Troubleshooting"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if echo "$INTERNAL_LOGIN" | jq -e '.token' >/dev/null 2>&1; then
        echo "Internal works but external fails → Nginx issue"
        echo ""
        echo "Check Nginx config:"
        echo "  cat /etc/nginx/sites-available/comparatio-api"
        echo ""
        echo "Check Nginx logs:"
        echo "  tail -f /var/log/nginx/error.log"
    else
        echo "Both internal and external fail → Backend issue"
        echo ""
        echo "Check backend logs:"
        echo "  docker logs comparatio-backend-prod --tail=100"
        echo ""
        echo "Check if backend is healthy:"
        echo "  docker ps"
        echo "  curl http://localhost:8080/actuator/health"
        echo ""
        echo "Restart backend:"
        echo "  docker compose restart backend"
    fi
fi
echo ""

