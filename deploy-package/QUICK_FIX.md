# 🔧 QUICK FIX: Backend Unhealthy Error

## ❌ **The Problem**

Backend can't start because **MongoDB is not running**.

Error shows:
```
UnknownHostException: mongodb
No such container: comparatio-mongodb-prod
```

**Cause:** MongoDB was set as optional profile and didn't start.

---

## ✅ **IMMEDIATE FIX on Your Server**

Run these commands:

```bash
# 1. Stop everything
docker compose down

# 2. Use the fixed compose file
mv docker-compose.yml docker-compose.yml.old
mv docker-compose-fixed.yml docker-compose.yml

# 3. Pull images again
docker compose pull

# 4. Start all services (MongoDB will now start automatically)
docker compose up -d

# 5. Check status
docker ps

# You should now see 3 containers:
# ✅ comparatio-mongodb-prod
# ✅ comparatio-backend-prod
# ✅ comparatio-frontend-prod
```

---

## 🔍 **Verify Fix**

```bash
# Check all containers are healthy
docker ps

# Check backend health
curl http://localhost:8080/actuator/health

# Should show: {"status":"UP","components":{"mongo":{"status":"UP"}...}}
```

---

## 📝 **What Was Fixed**

**Before (Broken):**
```yaml
mongodb:
  profiles:
    - with-mongo  ← MongoDB was optional
```

**After (Fixed):**
```yaml
mongodb:
  # No profiles - MongoDB always starts
```

---

## 🎯 **Alternative: Use External MongoDB**

If you have an external MongoDB server, you don't need the containerized one:

```bash
# Edit .env
nano .env

# Set external MongoDB
MONGO_URI=mongodb://your-external-mongodb-server:27017
MONGO_DB=comparatio_production

# Then comment out or remove MongoDB service from docker-compose.yml
# And remove the depends_on for mongodb in backend service
```

---

## ✅ **Summary**

**Problem:** MongoDB not starting → Backend can't connect

**Fix:** Use `docker-compose-fixed.yml` which always starts MongoDB

**Command:**
```bash
docker compose down
mv docker-compose-fixed.yml docker-compose.yml
docker compose up -d
```

**Or if you have the files locally, just re-upload the fixed docker-compose.yml to your server!**

