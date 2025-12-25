# 🔒 Fix Mixed Content: Rebuild Frontend with HTTPS API URL

## Issue: Mixed Content Error

Frontend is HTTPS but trying to use HTTP API endpoint. Need to rebuild with HTTPS URL.

---

## ✅ **Solution: Rebuild Frontend with HTTPS API URL**

### **Option 1: Use API Subdomain (Recommended)**

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Set API URL in environment
export NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com

# Build and push
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$(git rev-parse --short HEAD) \
  --push \
  FrontEnd
```

### **Option 2: Use Same Domain (If Nginx Proxies `/api/*`)**

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://compa.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --push \
  FrontEnd
```

### **Option 3: Update Build Script (Permanent Fix)**

The build script has been updated to use `NEXT_PUBLIC_API_URL` from environment. Add to `infra/.env`:

```bash
# Add to infra/.env
NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com
```

Then just run:
```bash
make push
```

---

## 🚀 **Quick Fix Steps**

1. **Determine your API URL:**
   - If you have `api.talentcapitalme.com` → use that
   - If backend is proxied through same domain → use `https://compa.talentcapitalme.com`

2. **Rebuild frontend:**
   ```bash
   cd /Users/wasiq/Downloads/llcompa_ratioll
   
   docker buildx build \
     --platform linux/amd64,linux/arm64 \
     --file FrontEnd/Dockerfile.llcompa_ratioll \
     --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
     --tag talentcapital/comparatio-frontend:latest \
     --push \
     FrontEnd
   ```

3. **Pull and restart on server:**
   ```bash
   # On server
   docker compose pull frontend
   docker compose up -d frontend
   ```

4. **Verify:**
   - Open browser dev tools (F12)
   - Network tab → Try login
   - Check API request URL should be HTTPS ✅

---

## ✅ **After Rebuild**

The Mixed Content error will be fixed because:
- ✅ Frontend uses HTTPS
- ✅ API calls use HTTPS  
- ✅ Browser allows the connection

---

**Rebuild the frontend with HTTPS API URL and the error will be fixed!**

