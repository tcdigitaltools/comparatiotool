# 🔒 Fix: Mixed Content Error (HTTPS → HTTP)

## Issue: Mixed Content Error

**Error:** "The page at 'https://compa.talentcapitalme.com/' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://backend:8080/api/auth/login'"

**Two Problems:**
1. ✅ Frontend is HTTPS, but trying to use HTTP (Mixed Content - blocked by browser)
2. ✅ `backend:8080` is Docker internal name - browser can't reach it (needs public URL)

---

## ✅ **Solution: Use HTTPS API URL**

You need to rebuild the frontend with the correct **HTTPS** API URL that the browser can reach.

### **Option 1: Use API Subdomain (Recommended)**

If you have `api.talentcapitalme.com` set up:

**Rebuild frontend:**
```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$(git rev-parse --short HEAD) \
  --push \
  FrontEnd
```

### **Option 2: Use Same Domain with Path (via Nginx Proxy)**

If you want to use the same domain, set up Nginx to proxy `/api/*` to backend:

**Nginx Config:**
```nginx
server {
    listen 443 ssl;
    server_name compa.talentcapitalme.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Then rebuild frontend with:**
```bash
--build-arg NEXT_PUBLIC_API_URL=https://compa.talentcapitalme.com
```

---

## ✅ **Quick Fix Steps**

### **Step 1: Determine Your API URL**

Choose one:
- **A)** `https://api.talentcapitalme.com` (separate subdomain)
- **B)** `https://compa.talentcapitalme.com` (same domain, Nginx proxies `/api/*`)

### **Step 2: Rebuild Frontend with HTTPS URL**

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# For API subdomain:
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --push \
  FrontEnd

# OR for same domain:
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://compa.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --push \
  FrontEnd
```

### **Step 3: Pull and Restart on Server**

```bash
# On server
docker compose pull frontend
docker compose up -d frontend
```

### **Step 4: Verify**

1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to login
4. Check the API request - should be HTTPS now ✅

---

## 🔧 **Update Build Script (Optional)**

Update `infra/scripts/build_push_all.sh` to always use HTTPS:

```bash
# Find the frontend build section and add:
--build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
```

---

## 📋 **What Changed**

**Before:**
- Frontend built with: `http://localhost:8080` or `http://backend:8080`
- Browser can't reach Docker service names
- Mixed Content error (HTTPS → HTTP)

**After:**
- Frontend built with: `https://api.talentcapitalme.com` (or same domain)
- Browser can reach the API ✅
- All HTTPS, no Mixed Content ✅

---

## 🚀 **Recommended Setup**

**Best Practice:**
- Frontend: `https://compa.talentcapitalme.com`
- Backend API: `https://api.talentcapitalme.com`
- Both use HTTPS
- Set up Nginx/SSL for API subdomain

**Or:**
- Everything on: `https://compa.talentcapitalme.com`
- Nginx proxies `/api/*` → backend:8080
- Frontend uses: `https://compa.talentcapitalme.com` as API URL

---

**Rebuild the frontend with HTTPS API URL and the Mixed Content error will be fixed!** ✅

