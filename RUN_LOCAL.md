# 🚀 Run Application Locally

## ✅ Quick Start

### **Option 1: Docker Compose (Recommended)**

```bash
# Start all services (backend, frontend, MongoDB)
cd /Users/wasiq/Downloads/llcompa_ratioll
make up

# Or manually:
docker compose -f infra/docker-compose.dev.yml up --build
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend: http://localhost:8080
- 💾 MongoDB: localhost:27017

**Login:**
- Email: `admin@talentcapital.com`
- Password: `admin`

**Stop:**
```bash
make down
# Or: docker compose -f infra/docker-compose.dev.yml down
```

---

### **Option 2: Run Natively (Without Docker)**

**Prerequisites:**
- Java 21
- Maven 3.9+
- Node 20+
- MongoDB running on localhost:27017

#### **Terminal 1 - Start Backend:**

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll/compa-ratio/BackEnd

# Using Maven wrapper (recommended):
./mvnw clean spring-boot:run

# Or with installed Maven:
mvn clean spring-boot:run
```

**Backend runs on:** http://localhost:8080

**Check health:**
```bash
curl http://localhost:8080/actuator/health
```

#### **Terminal 2 - Start Frontend:**

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll/FrontEnd

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

**Frontend runs on:** http://localhost:3000

---

## 🔧 CORS Configuration

### **Backend Already Allows:**
- ✅ `http://localhost:3000` (local frontend)
- ✅ `https://compa.talentcapitalme.com` (production)
- ✅ `http://compa.talentcapitalme.com` (production)

### **Frontend API URL:**
- Local: `http://localhost:8080` (default)
- Production: Set via `NEXT_PUBLIC_API_URL` env var

**CORS is already configured correctly!**

---

## 🐛 Troubleshooting CORS Issues

### **Problem: "CORS error" when accessing localhost:3000**

**Cause:** Backend not running or CORS not configured

**Fix:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:8080/actuator/health
   # Should return: {"status":"UP"}
   ```

2. **Check CORS headers:**
   ```bash
   curl -X OPTIONS http://localhost:8080/api/auth/login \
     -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -v 2>&1 | grep "Access-Control-Allow-Origin"
   
   # Should show: Access-Control-Allow-Origin: http://localhost:3000
   ```

3. **Restart backend:**
   ```bash
   # If using Docker:
   docker compose -f infra/docker-compose.dev.yml restart backend
   
   # If running natively:
   # Ctrl+C to stop, then restart with mvn spring-boot:run
   ```

4. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete`
   - Clear cached images and files
   - Or use incognito mode

---

### **Problem: "Cannot connect to backend"**

**Fix:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Check MongoDB is running:**
   ```bash
   # If using Docker Compose:
   docker ps | grep mongodb
   
   # Should show: comparatio-mongodb-dev
   ```

3. **Check backend logs:**
   ```bash
   # If using Docker:
   docker logs comparatio-backend-dev --tail=50
   
   # Look for errors or "Started" message
   ```

---

### **Problem: "401 Unauthorized" on login**

**Fix:**

Create admin user manually:

```bash
# If using Docker:
docker exec comparatio-mongodb-dev mongosh compa_demo --eval '
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

# Then restart backend:
docker compose -f infra/docker-compose.dev.yml restart backend
```

---

## 📋 Useful Commands

### **Check what's running:**
```bash
# Docker containers:
docker ps

# Ports in use:
lsof -i :3000  # Frontend
lsof -i :8080  # Backend
lsof -i :27017 # MongoDB
```

### **View logs:**
```bash
# All services:
docker compose -f infra/docker-compose.dev.yml logs -f

# Just backend:
docker logs comparatio-backend-dev -f

# Just frontend:
docker logs comparatio-frontend-dev -f
```

### **Restart services:**
```bash
# All:
docker compose -f infra/docker-compose.dev.yml restart

# Just backend:
docker compose -f infra/docker-compose.dev.yml restart backend

# Just frontend:
docker compose -f infra/docker-compose.dev.yml restart frontend
```

### **Stop and clean up:**
```bash
# Stop all:
make down

# Stop and remove volumes (fresh start):
docker compose -f infra/docker-compose.dev.yml down -v

# Clean up Docker:
docker system prune -a
```

---

## 🎯 Quick Test Script

```bash
#!/bin/bash
# Test local setup

echo "=== Testing Backend ==="
curl -s http://localhost:8080/actuator/health | jq

echo ""
echo "=== Testing CORS ==="
curl -X OPTIONS http://localhost:8080/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep "Access-Control-Allow-Origin"

echo ""
echo "=== Testing Login ==="
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@talentcapital.com","password":"admin"}' | jq

echo ""
echo "=== Testing Frontend ==="
curl -s http://localhost:3000 | head -n 5
```

Save as `test_local.sh`, then:
```bash
chmod +x test_local.sh
./test_local.sh
```

---

## ✅ Success Checklist

- [ ] Backend health check returns `{"status":"UP"}`
- [ ] CORS headers show `Access-Control-Allow-Origin: http://localhost:3000`
- [ ] Login API returns a token
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with `admin@talentcapital.com` / `admin`
- [ ] No CORS errors in browser console (F12)

---

## 🌐 Environment Variables

### **For Local Development:**

Create `FrontEnd/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### **For Production:**

Set in `infra/.env`:
```bash
NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com
```

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) for specific error messages
2. **Check backend logs** for Java exceptions
3. **Verify MongoDB is running** and accepting connections
4. **Try incognito mode** to rule out cache issues
5. **Restart everything:**
   ```bash
   make down
   make up
   ```

---

## 🚀 Ready to Deploy?

Once local works, deploy to production:

```bash
# Build and push to Docker Hub:
make buildx-init
make push

# On server:
make prod-pull
make prod-up
```

