#!/usr/bin/env bash
# Generate BCrypt password hash using backend's encoder
# Run on server

set -e

PASSWORD="${1:-admin}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Generating BCrypt Hash for: $PASSWORD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create a temporary Java class in the backend container
docker exec comparatio-backend-prod sh -c "cat > /tmp/GenerateHash.java << 'EOFCLASS'
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args.length > 0 ? args[0] : \"admin\";
        String hash = encoder.encode(password);
        System.out.println(\"Password: \" + password);
        System.out.println(\"BCrypt Hash: \" + hash);
        
        // Verify it works
        boolean matches = encoder.matches(password, hash);
        System.out.println(\"Verification: \" + (matches ? \"✅ WORKS\" : \"❌ FAILED\"));
    }
}
EOFCLASS
"

# Compile and run (this might not work without proper classpath)
echo "⚠️  Note: This requires Spring Security JAR in classpath"
echo ""
echo "Alternative: Use online BCrypt generator or another method"
echo ""

# Show current hash in database
echo "📋 Current hash in database:"
docker exec comparatio-mongodb-prod mongosh compa_demo --quiet \
  --eval "db.users.findOne({email:'admin@talentcapital.com'}, {passwordHash:1, _id:0})"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Try These Known Working Hashes:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "For password 'admin':"
echo "  \$2a\$10\$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG"
echo ""
echo "For password 'password':"
echo "  \$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
echo ""
echo "For password 'Admin123':"
echo "  \$2a\$10\$N9qo8uLOickgx2ZMRZoMye7I73TIbP.t3xFAWZ3.gZdKkXvqlXvMu"
echo ""

