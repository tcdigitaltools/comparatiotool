# 🔧 Fix: Frontend Network Error - Can't Connect to Backend

## Issue: "Network Error" when trying to login

The frontend is trying to connect to `http://localhost:8080` but can't reach the backend.

---

## 🔍 **Root Cause**

The frontend was built with `NEXT_PUBLIC_API_URL=http://localhost:8080` (default), but:
1. Frontend is running on production domain (`https://compa.talentcapitalme.com`)
2. Backend might be on different URL
3. `localhost:8080` doesn't work from browser (browser's localhost, not server)

---

## ✅ **Solution: Set Correct API URL**

### **Option 1: Use Environment Variable (Recommended)**

Update `docker-compose.yml` to set the correct backend URL:

```yaml
frontend:
  image: talentcapital/comparatio-frontend:latest
  container_name: comparatio-frontend-prod
  restart: unless-stopped
  ports:
    - "${FRONTEND_PORT:-3000}:3000"
  environment:
    - NODE_ENV=production
    - PORT=3000
    - HOSTNAME=0.0.0.0
    - NEXT_PUBLIC_API_URL=http://backend:8080  # ✅ Use Docker service name
```

**Then restart:**
```bash
docker compose up -d frontend
```

---

### **Option 2: Use Your Server's IP/Domain**

If backend is accessible externally:

```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-server-ip:8080
  # Or
  - NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com
```

---

### **Option 3: Rebuild Frontend with Correct URL**

If environment variables don't work (they're baked into Next.js build):

**From your local machine:**
```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Build and push with correct API URL
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=http://backend:8080 \
  --tag talentcapital/comparatio-frontend:latest \
  --push \
  FrontEnd
```

---

## 🔍 **Determine Correct Backend URL**

### **Check Backend Container:**

```bash
# On server
docker ps | grep backend

# Check backend logs
docker logs comparatio-backend-prod --tail=20

# Check if backend is accessible
curl http://localhost:8080/actuator/health
```

### **If Backend is in Same Docker Network:**

Use Docker service name: `http://backend:8080`

### **If Backend is on Same Server:**

Use server IP or `localhost`: `http://your-server-ip:8080`

---

## ✅ **Quick Fix: Update docker-compose.yml**

Edit `deploy-package/docker-compose.yml`:

```yaml
frontend:
  image: talentcapital/comparatio-frontend:latest
  container_name: comparatio-frontend-prod
  restart: unless-stopped
  ports:
    - "${FRONTEND_PORT:-3000}:3000"
  environment:
    - NODE_ENV=production
    - PORT=3000
    - HOSTNAME=0.0.0.0
    - NEXT_PUBLIC_API_URL=http://backend:8080  # ✅ Change this line
  networks:
    - comparatio-network
  depends_on:
    backend:
      condition: service_healthy
```

**Then restart frontend:**
```bash
docker compose -f docker-compose.yml up -d frontend
```

---

## 🔍 **Verify It Works**

1. **Check frontend logs:**
   ```bash
   docker logs comparatio-frontend-prod --tail=50
   ```

2. **Check browser console:**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Try to login
   - Check what URL it's trying to connect to

3. **Test backend connectivity:**
   ```bash
   # From frontend container
   docker exec comparatio-frontend-prod curl http://backend:8080/actuator/health
   
   # Should return: {"status":"UP"}
   ```

---

## ⚠️ **Important Note About Next.js Environment Variables**

`NEXT_PUBLIC_*` variables are **baked into the build** at build time. If the frontend image was built without the correct URL, you may need to:

1. **Rebuild the frontend** with correct `NEXT_PUBLIC_API_URL`, OR
2. **Use runtime configuration** (more complex, requires code changes)

---

## ✅ **Recommended Solution**

**Update docker-compose.yml** to use Docker service name:

```yaml
- NEXT_PUBLIC_API_URL=http://backend:8080
```

This works because both containers are in the same Docker network (`comparatio-network`).

**Then restart:**
```bash
docker compose up -d frontend
```

---

**The key is matching the backend URL that the frontend can actually reach!**

