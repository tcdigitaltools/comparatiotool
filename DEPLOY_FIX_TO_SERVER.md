# 🚀 Deploy Password Fix to Production Server

## Step-by-Step Deployment Guide

---

## **Step 1: On Your Local Machine (Build & Push to Docker Hub)**

### 1.1 Commit Your Changes (if using Git)

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Check what changed
git status

# Add the fix
git add compa-ratio/BackEnd/src/main/java/talentcapitalme/com/comparatio/config/AdminUserConfig.java

# Commit
git commit -m "Fix: Prevent password reset on backend restart by using CommandLineRunner"

# Push to repository (if using git)
git push origin main  # or your branch name
```

### 1.2 Build and Push Docker Images

**Option A: Using Make (Easiest)**

```bash
# Make sure you're in the project root
cd /Users/wasiq/Downloads/llcompa_ratioll

# Initialize buildx (one-time setup if not done)
make buildx-init

# Build and push both backend and frontend
make push
```

**Option B: Manual Build (Backend Only - Since we only changed backend)**

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Make sure you're logged into Docker Hub
docker login -u talentcapital

# Build and push backend only
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest \
  --tag talentcapital/comparatio-backend:sha-$(git rev-parse --short HEAD) \
  --push \
  compa-ratio/BackEnd
```

**Expected output:**
```
✅ Backend image pushed successfully!
```

---

## **Step 2: On Production Server (Pull & Deploy)**

### 2.1 SSH into Your Server

```bash
ssh user@your-server-ip
# Or
ssh user@164.92.232.41  # Your production server
```

### 2.2 Navigate to Project Directory

```bash
cd ~/comparatiotool
# Or wherever your project is located
```

### 2.3 Pull Latest Images

```bash
# Pull latest backend image from Docker Hub
docker compose -f infra/docker-compose.prod.yml pull backend

# Or pull all images
make prod-pull
```

**Expected output:**
```
📥 Pulling latest production images from Docker Hub...
✅ Images pulled successfully!
```

### 2.4 Restart Backend Service (Zero Downtime)

**Option A: Rolling Restart (Recommended - Zero Downtime)**

```bash
# Restart only backend with new image
docker compose -f infra/docker-compose.prod.yml up -d --no-deps backend
```

**Option B: Full Restart (If needed)**

```bash
# Stop services
docker compose -f infra/docker-compose.prod.yml down

# Start services
docker compose -f infra/docker-compose.prod.yml up -d
```

**Option C: Using Make**

```bash
# Pull and restart
make prod-pull
docker compose -f infra/docker-compose.prod.yml up -d --no-deps backend
```

### 2.5 Verify Deployment

```bash
# Check container status
docker compose -f infra/docker-compose.prod.yml ps

# Check backend logs for admin user initialization
docker logs comparatio-backend-prod --tail=50 | grep -i admin

# Expected log output:
# ✅ Admin user already exists: admin@talentcapital.com
# ℹ️  Skipping admin user creation - existing user will be preserved
```

### 2.6 Test Login

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Try logging in with your existing password - it should work!
```

---

## **Quick One-Liner Commands**

### On Local Machine:
```bash
cd /Users/wasiq/Downloads/llcompa_ratioll && make buildx-init && make push
```

### On Server:
```bash
cd ~/comparatiotool && docker compose -f infra/docker-compose.prod.yml pull backend && docker compose -f infra/docker-compose.prod.yml up -d --no-deps backend
```

---

## **Verification Checklist**

After deployment, verify:

- [ ] Backend container is running: `docker ps | grep backend`
- [ ] Logs show admin user exists: `docker logs comparatio-backend-prod | grep admin`
- [ ] Health check passes: `curl http://localhost:8080/actuator/health`
- [ ] Can login with existing password (not reset to "admin")
- [ ] Restart backend again: `docker restart comparatio-backend-prod`
- [ ] After restart, password still works (not reset)

---

## **Troubleshooting**

### If images don't pull:

```bash
# Check Docker Hub login
docker login -u talentcapital

# Check image exists
docker pull talentcapital/comparatio-backend:latest
```

### If backend won't start:

```bash
# Check logs
docker logs comparatio-backend-prod --tail=100

# Check for errors
docker logs comparatio-backend-prod 2>&1 | grep -i error
```

### If password still resets:

```bash
# Check if old image is still being used
docker images | grep comparatio-backend

# Force pull
docker pull talentcapital/comparatio-backend:latest --force

# Rebuild container
docker compose -f infra/docker-compose.prod.yml up -d --force-recreate backend
```

---

## **What Changed**

- `AdminUserConfig.java` now uses `CommandLineRunner` instead of `@Bean`
- Runs only once on startup
- Never overwrites existing users
- Better logging for debugging

---

## **Expected Behavior After Fix**

✅ **Before Fix:**
- Restart backend → Password resets to "admin"
- Docker reboot → Password resets to "admin"
- After ~24 hours → Password resets to "admin"

✅ **After Fix:**
- Restart backend → Password stays the same ✅
- Docker reboot → Password stays the same ✅
- After any time → Password stays the same ✅

---

## **Need Help?**

Check logs:
```bash
docker logs comparatio-backend-prod --tail=100 | grep -i "admin\|password\|error"
```


