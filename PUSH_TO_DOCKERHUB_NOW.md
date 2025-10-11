# 🚀 Push to Docker Hub - Ready to Execute

## ✅ Configuration Complete

Your Docker Hub settings are configured:
- **Username**: `talentcapital`
- **Backend Image**: `talentcapital/comparatio-backend`
- **Frontend Image**: `talentcapital/comparatio-frontend`

---

## 🎯 **EXECUTE NOW: 3 Simple Commands**

### **Step 1: Login to Docker Hub**

```bash
docker login -u talentcapital
```

**You'll be prompted for:**
- Password: Enter your Docker Hub password or access token

### **Step 2: Initialize Multi-Arch Builder**

```bash
make buildx-init
```

**Expected output:**
```
🏗️  Initializing Docker Buildx...
📦 Creating new builder 'comparatio-builder'...
✅ Buildx initialization complete!
   Builder: comparatio-builder
   Platforms: linux/amd64, linux/arm64
```

### **Step 3: Build and Push to Docker Hub**

```bash
make push
```

**This will:**
- Build backend for both amd64 and arm64
- Build frontend for both amd64 and arm64  
- Tag with `latest` and `sha-<git-hash>`
- Push all images to Docker Hub

**Expected duration:** 5-15 minutes

**Expected output:**
```
🏗️  Building and pushing multi-architecture images...
   Docker Hub: talentcapital
   Git SHA: b2eca4a

📦 Building backend image...
   Image: talentcapital/comparatio-backend
[=====>] Building...
✅ Backend image pushed successfully!

🎨 Building frontend image...
   Image: talentcapital/comparatio-frontend
[=====>] Building...
✅ Frontend image pushed successfully!

🎉 All images built and pushed!

📋 Image tags:
   Backend:  talentcapital/comparatio-backend:latest
   Backend:  talentcapital/comparatio-backend:sha-b2eca4a
   Frontend: talentcapital/comparatio-frontend:latest
   Frontend: talentcapital/comparatio-frontend:sha-b2eca4a
```

---

## 🪟 **WINDOWS USERS**

### Using Git Bash (Recommended)

```bash
docker login -u talentcapital
bash infra/scripts/buildx_init.sh
bash infra/scripts/build_push_all.sh
```

### Using PowerShell

```powershell
# Step 1: Login
docker login -u talentcapital

# Step 2: Initialize buildx
docker buildx create --name comparatio-builder --use --bootstrap
docker buildx inspect --bootstrap

# Step 3: Build and push
# Get commit hash
$SHORT_SHA = git rev-parse --short HEAD

# Build backend
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-backend:latest `
  --tag "talentcapital/comparatio-backend:sha-$SHORT_SHA" `
  --push `
  compa-ratio/BackEnd

# Build frontend
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file FrontEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-frontend:latest `
  --tag "talentcapital/comparatio-frontend:sha-$SHORT_SHA" `
  --push `
  FrontEnd
```

---

## ✅ Verify After Push

### Check on Docker Hub

Visit:
- https://hub.docker.com/r/talentcapital/comparatio-backend
- https://hub.docker.com/r/talentcapital/comparatio-frontend

### Verify Multi-Arch

```bash
docker buildx imagetools inspect talentcapital/comparatio-backend:latest
```

Should show both `linux/amd64` and `linux/arm64` platforms

---

## 🔄 After Successful Push

### Deploy to Production

```bash
# On your production server
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Configure environment
cp infra/.env.example infra/.env
nano infra/.env

# Pull images and start
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d

# Verify
docker ps
curl http://localhost:8080/actuator/health
```

### Or Use Make Commands

```bash
make prod-pull
make prod-up
```

---

## 📊 What You'll Get

After successful push, you'll have:

### Docker Hub Repository Structure

```
talentcapital/comparatio-backend
├── latest (multi-arch manifest)
│   ├── linux/amd64
│   └── linux/arm64
└── sha-b2eca4a (multi-arch manifest)
    ├── linux/amd64
    └── linux/arm64

talentcapital/comparatio-frontend
├── latest (multi-arch manifest)
│   ├── linux/amd64
│   └── linux/arm64
└── sha-b2eca4a (multi-arch manifest)
    ├── linux/amd64
    └── linux/arm64
```

### Platform Support

Your images will work on:
- ✅ AWS EC2 (Intel)
- ✅ AWS Graviton (ARM)
- ✅ Google Cloud
- ✅ Azure
- ✅ DigitalOcean
- ✅ Local Docker Desktop (Mac Intel/Silicon, Windows)
- ✅ Raspberry Pi 4 (ARM64)
- ✅ Any Linux server (Intel or ARM)

---

## 🎉 Ready to Execute!

**Run these 3 commands now:**

```bash
docker login -u talentcapital
make buildx-init
make push
```

**Then verify at:**
https://hub.docker.com/u/talentcapital

---

**For detailed instructions and troubleshooting, see `DOCKER_HUB_PUSH.md`**

