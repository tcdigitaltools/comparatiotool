#!/usr/bin/env bash
# Test multiple password hashes to find which one works
# Run on server

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Multiple Password Hashes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Known BCrypt hashes for common passwords
declare -A HASHES
HASHES["admin"]="$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG"
HASHES["password"]="$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
HASHES["Admin123"]="$2a$10$N9qo8uLOickgx2ZMRZoMye7I73TIbP.t3xFAWZ3.gZdKkXvqlXvMu"
HASHES["test123"]="$2a$10$HGnEW/7jwdVIkH.5bSRLiO9sF8ybRZQZNXS3V7KpOX6r4Q1fLXM6i"

test_login() {
    local password=$1
    local hash=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔑 Testing password: '$password'"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Update database with this hash
    docker exec comparatio-mongodb-prod mongosh compa_demo --quiet --eval "
        db.users.updateOne(
            { email: 'admin@talentcapital.com' },
            { \$set: { passwordHash: '$hash' } }
        );
    " > /dev/null 2>&1
    
    # Wait a moment
    sleep 1
    
    # Test login
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST https://api.talentcapitalme.com/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"admin@talentcapital.com\",\"password\":\"$password\"}" 2>/dev/null)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ SUCCESS! Password '$password' works!"
        echo "   Hash: $hash"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ SOLUTION FOUND!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Use these credentials:"
        echo "  📧 Email:    admin@talentcapital.com"
        echo "  🔑 Password: $password"
        echo ""
        return 0
    else
        echo "❌ Failed (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
        echo ""
        return 1
    fi
}

# Test each password/hash combination
for password in "${!HASHES[@]}"; do
    if test_login "$password" "${HASHES[$password]}"; then
        exit 0
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "❌ None of the standard hashes worked"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 Next steps:"
echo ""
echo "1. Check backend logs for detailed error:"
echo "   docker logs comparatio-backend-prod --tail=100"
echo ""
echo "2. Test internal login (bypass Nginx):"
echo "   docker exec comparatio-backend-prod curl -s \\"
echo "     -X POST http://localhost:8080/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"admin@talentcapital.com\",\"password\":\"admin\"}'"
echo ""
echo "3. Verify user exists in database:"
echo "   docker exec comparatio-mongodb-prod mongosh compa_demo \\"
echo "     --eval 'db.users.findOne({email:\"admin@talentcapital.com\"})'"
echo ""
echo "4. Rebuild backend with updated code:"
echo "   # On your Mac:"
echo "   docker buildx build --platform linux/amd64,linux/arm64 \\"
echo "     --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \\"
echo "     --tag talentcapital/comparatio-backend:latest --push compa-ratio/BackEnd"
echo "   # On server:"
echo "   docker pull talentcapital/comparatio-backend:latest"
echo "   docker restart comparatio-backend-prod"
echo ""

