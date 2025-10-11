# 🐳 Docker Hub Push Instructions

Complete guide to build and push **comparatio** multi-architecture images to Docker Hub.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Hub Configuration](#docker-hub-configuration)
- [Quick Start (Mac/Linux)](#quick-start-maclinux)
- [Quick Start (Windows)](#quick-start-windows)
- [Manual Push Instructions](#manual-push-instructions)
- [Verify Pushed Images](#verify-pushed-images)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### All Platforms
- Docker Desktop installed and running
- Git installed
- Docker Hub account (create at https://hub.docker.com)
- Internet connection for pushing images

### Mac/Linux
- Terminal or iTerm2
- Make (pre-installed on Mac)

### Windows
- PowerShell 5.1+ or Windows Terminal
- Git Bash (recommended) or WSL2

---

## ⚙️ Docker Hub Configuration

Your images will be pushed to:
- **Backend**: `talentcapital/comparatio-backend:latest` and `talentcapital/comparatio-backend:sha-<hash>`
- **Frontend**: `talentcapital/comparatio-frontend:latest` and `talentcapital/comparatio-frontend:sha-<hash>`

These are configured in `infra/.env`:
```bash
DOCKERHUB_USERNAME=talentcapital
BACKEND_IMAGE=talentcapital/comparatio-backend
FRONTEND_IMAGE=talentcapital/comparatio-frontend
```

---

## 🚀 Quick Start (Mac/Linux)

### Step 1: Login to Docker Hub

```bash
docker login
```

**Enter your credentials:**
- Username: `talentcapital`
- Password: Your Docker Hub password or access token

### Step 2: Initialize Multi-Architecture Builder

```bash
make buildx-init
```

**Expected output:**
```
🏗️  Initializing Docker Buildx for multi-architecture builds...
📦 Creating new builder 'comparatio-builder'...
✅ Buildx initialization complete!
   Builder: comparatio-builder
   Platforms: linux/amd64, linux/arm64
```

### Step 3: Build and Push Images

```bash
make push
```

**This will:**
1. Build backend for amd64 and arm64
2. Build frontend for amd64 and arm64
3. Tag with `latest` and `sha-<git-hash>`
4. Push all images to Docker Hub

**Expected duration:** 5-15 minutes (depending on internet speed)

**Expected output:**
```
🏗️  Building and pushing multi-architecture images...
   Docker Hub: talentcapital
   Git SHA: a1b2c3d

📦 Building backend image...
   Image: talentcapital/comparatio-backend
✅ Backend image pushed successfully!

🎨 Building frontend image...
   Image: talentcapital/comparatio-frontend
✅ Frontend image pushed successfully!

🎉 All images built and pushed!
```

---

## 🪟 Quick Start (Windows)

### Using PowerShell

#### Step 1: Login to Docker Hub

```powershell
docker login
```

Enter credentials:
- Username: `talentcapital`
- Password: Your Docker Hub password

#### Step 2: Navigate to Project

```powershell
cd C:\path\to\llcompa_ratioll
```

#### Step 3: Initialize Buildx

```powershell
.\infra\scripts\buildx_init.sh
```

Or manually:
```powershell
docker buildx create --name comparatio-builder --use --bootstrap
docker buildx inspect --bootstrap
```

#### Step 4: Build and Push

```powershell
.\infra\scripts\build_push_all.sh
```

Or run the commands manually:
```powershell
# Set environment variables
$env:DOCKERHUB_USERNAME="talentcapital"
$env:BACKEND_IMAGE="talentcapital/comparatio-backend"
$env:FRONTEND_IMAGE="talentcapital/comparatio-frontend"
$SHORT_SHA = git rev-parse --short HEAD

# Use the builder
docker buildx use comparatio-builder

# Build and push backend
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-backend:latest `
  --tag talentcapital/comparatio-backend:sha-$SHORT_SHA `
  --push `
  compa-ratio/BackEnd

# Build and push frontend
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file FrontEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-frontend:latest `
  --tag talentcapital/comparatio-frontend:sha-$SHORT_SHA `
  --push `
  FrontEnd
```

### Using Git Bash (Recommended for Windows)

```bash
# Login
docker login

# Initialize buildx
bash infra/scripts/buildx_init.sh

# Push images
bash infra/scripts/build_push_all.sh
```

---

## 📖 Manual Push Instructions

### For Mac/Linux

#### 1. Login to Docker Hub

```bash
docker login -u talentcapital
```

#### 2. Create Multi-Arch Builder (One-Time Setup)

```bash
# Create builder
docker buildx create --name comparatio-builder --use --bootstrap

# Verify
docker buildx inspect --bootstrap
```

**Expected output:**
```
Name:   comparatio-builder
Driver: docker-container

Platforms: linux/amd64*, linux/arm64*, linux/riscv64, linux/ppc64le, ...
```

#### 3. Get Git Commit Hash

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll
SHORT_SHA=$(git rev-parse --short HEAD)
echo "Git SHA: $SHORT_SHA"
```

#### 4. Build and Push Backend

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest \
  --tag talentcapital/comparatio-backend:sha-$SHORT_SHA \
  --push \
  compa-ratio/BackEnd
```

**Expected duration:** 3-8 minutes

#### 5. Build and Push Frontend

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:sha-$SHORT_SHA \
  --push \
  FrontEnd
```

**Expected duration:** 2-5 minutes

### For Windows (PowerShell)

#### 1. Login to Docker Hub

```powershell
docker login -u talentcapital
```

#### 2. Create Multi-Arch Builder

```powershell
docker buildx create --name comparatio-builder --use --bootstrap
docker buildx inspect --bootstrap
```

#### 3. Get Git Commit Hash

```powershell
cd C:\path\to\llcompa_ratioll
$SHORT_SHA = git rev-parse --short HEAD
Write-Host "Git SHA: $SHORT_SHA"
```

#### 4. Build and Push Backend

```powershell
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-backend:latest `
  --tag "talentcapital/comparatio-backend:sha-$SHORT_SHA" `
  --push `
  compa-ratio/BackEnd
```

#### 5. Build and Push Frontend

```powershell
docker buildx build `
  --platform linux/amd64,linux/arm64 `
  --file FrontEnd/Dockerfile.llcompa_ratioll `
  --tag talentcapital/comparatio-frontend:latest `
  --tag "talentcapital/comparatio-frontend:sha-$SHORT_SHA" `
  --push `
  FrontEnd
```

---

## ✅ Verify Pushed Images

### Check on Docker Hub Website

1. Go to https://hub.docker.com/u/talentcapital
2. You should see:
   - `comparatio-backend`
   - `comparatio-frontend`

### Check Locally

```bash
# Mac/Linux
docker buildx imagetools inspect talentcapital/comparatio-backend:latest
docker buildx imagetools inspect talentcapital/comparatio-frontend:latest

# Windows PowerShell
docker buildx imagetools inspect talentcapital/comparatio-backend:latest
docker buildx imagetools inspect talentcapital/comparatio-frontend:latest
```

**Expected output:**
```
Name:      talentcapital/comparatio-backend:latest
MediaType: application/vnd.oci.image.index.v1+json
Digest:    sha256:...

Manifests:
  Name:      talentcapital/comparatio-backend:latest@sha256:...
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/amd64

  Name:      talentcapital/comparatio-backend:latest@sha256:...
  MediaType: application/vnd.oci.image.manifest.v1+json
  Platform:  linux/arm64
```

### Pull and Test

```bash
# Pull the images
docker pull talentcapital/comparatio-backend:latest
docker pull talentcapital/comparatio-frontend:latest

# Check image size
docker images | grep talentcapital
```

---

## 🔍 Troubleshooting

### "denied: requested access to the resource is denied"

**Cause:** Not logged in or insufficient permissions

**Solution:**
```bash
# Logout and login again
docker logout
docker login -u talentcapital

# Verify login
docker info | grep Username
```

### "multiple platforms feature is currently not supported"

**Cause:** Buildx not enabled or builder not created

**Solution (Mac/Linux):**
```bash
# Enable buildx
docker buildx version

# Create builder
make buildx-init
```

**Solution (Windows):**
```powershell
# Check Docker Desktop settings
# Settings → Features in development → Enable containerd image store

# Create builder
docker buildx create --name comparatio-builder --use
```

### Build is Too Slow

**Tip:** Building for multiple architectures takes time. Expect:
- Backend: 5-10 minutes
- Frontend: 3-7 minutes

To speed up:
```bash
# Use cached layers (already implemented in Dockerfiles)
# Or build for single architecture during testing
docker buildx build --platform linux/amd64 ...
```

### "No space left on device"

**Solution (Mac):**
```bash
# Clean Docker
docker system prune -a --volumes -f

# Increase Docker Desktop disk space
# Docker Desktop → Settings → Resources → Disk image size
```

**Solution (Windows):**
```powershell
# Clean Docker
docker system prune -a --volumes -f

# Increase WSL2 disk space or Docker Desktop resources
```

### Network/Upload Issues

**Tips:**
- Use stable internet connection
- Pushing ~500MB per image
- Consider using Docker Hub access token instead of password
- Retry if upload fails: `make push` (it will resume)

---

## 🔐 Using Access Tokens (Recommended)

Instead of using your Docker Hub password, use access tokens:

### Create Access Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it: `comparatio-deploy`
4. Permissions: Read, Write, Delete
5. Copy the token

### Login with Token

```bash
# Mac/Linux
docker login -u talentcapital

# When prompted for password, paste the access token
```

```powershell
# Windows
docker login -u talentcapital

# When prompted for password, paste the access token
```

---

## 📦 What Gets Pushed

### Backend Image (`talentcapital/comparatio-backend`)

**Size:** ~450MB (compressed for both architectures combined)

**Includes:**
- Eclipse Temurin JRE 21 (Alpine)
- Spring Boot application JAR
- Required dependencies
- Health check via Actuator

**Architectures:**
- linux/amd64 (Intel/AMD)
- linux/arm64 (Apple Silicon, AWS Graviton)

### Frontend Image (`talentcapital/comparatio-frontend`)

**Size:** ~250MB (compressed for both architectures combined)

**Includes:**
- Node 20 (Alpine)
- Next.js standalone output
- Static assets
- Public files

**Architectures:**
- linux/amd64 (Intel/AMD)
- linux/arm64 (Apple Silicon, AWS Graviton)

---

## 📝 Complete Workflow Summary

### Mac/Linux One-Liner

```bash
docker login && make buildx-init && make push
```

### Windows PowerShell

```powershell
# One-time setup
docker login
docker buildx create --name comparatio-builder --use --bootstrap

# Build and push
cd infra/scripts
./build_push_all.sh
```

### Windows Git Bash

```bash
docker login && bash infra/scripts/buildx_init.sh && bash infra/scripts/build_push_all.sh
```

---

## 🎯 Quick Command Reference

### Mac/Linux

| Action | Command |
|--------|---------|
| Login | `docker login -u talentcapital` |
| Init buildx | `make buildx-init` |
| Push images | `make push` |
| Verify | `docker buildx imagetools inspect talentcapital/comparatio-backend:latest` |

### Windows PowerShell

| Action | Command |
|--------|---------|
| Login | `docker login -u talentcapital` |
| Init buildx | `docker buildx create --name comparatio-builder --use` |
| Get SHA | `$SHA = git rev-parse --short HEAD` |
| Build backend | See [Manual Instructions](#manual-push-instructions) |
| Build frontend | See [Manual Instructions](#manual-push-instructions) |

### Windows Git Bash

| Action | Command |
|--------|---------|
| Login | `docker login -u talentcapital` |
| Init buildx | `bash infra/scripts/buildx_init.sh` |
| Push images | `bash infra/scripts/build_push_all.sh` |

---

## 🌍 Production Deployment

After pushing to Docker Hub, deploy on any server:

### On Production Server (Linux)

```bash
# Clone repo
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Configure
cp infra/.env.example infra/.env
nano infra/.env  # Review and update settings

# Pull and start
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d

# Verify
docker ps
curl http://localhost:8080/actuator/health
curl http://localhost:3000/
```

### Quick Deploy Commands

```bash
make prod-pull    # Pull latest images
make prod-up      # Start services
docker ps         # Verify running
```

---

## 📊 Image Tags Explained

Each push creates multiple tags:

### Latest Tag
```
talentcapital/comparatio-backend:latest
talentcapital/comparatio-frontend:latest
```
**Use for:** Production deployments that always want the newest version

### SHA Tag
```
talentcapital/comparatio-backend:sha-a1b2c3d
talentcapital/comparatio-frontend:sha-a1b2c3d
```
**Use for:** Reproducible deployments with specific git commits

---

## 🔄 Update Workflow

When you make changes to your code:

### Mac/Linux

```bash
# 1. Commit changes
git add .
git commit -m "Your changes"

# 2. Push to Docker Hub
make push

# 3. Deploy to production
make prod-pull
make prod-up
```

### Windows (Git Bash)

```bash
# 1. Commit changes
git add .
git commit -m "Your changes"

# 2. Push to Docker Hub
bash infra/scripts/build_push_all.sh

# 3. On production server
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d
```

---

## 💡 Pro Tips

### Speed Up Builds

**Build single architecture for testing:**
```bash
# Mac/Linux (arm64 only for Apple Silicon)
docker buildx build --platform linux/arm64 ...

# Windows/Intel (amd64 only)
docker buildx build --platform linux/amd64 ...
```

**Use build cache:**
The Dockerfiles already optimize layer caching. Subsequent builds are much faster.

### Automate with CI/CD

Add to your CI/CD pipeline (GitHub Actions, GitLab CI, etc.):
```yaml
- name: Push to Docker Hub
  run: |
    echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u talentcapital --password-stdin
    make buildx-init
    make push
```

### Tag Specific Versions

```bash
# Custom version tag
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag talentcapital/comparatio-backend:v1.0.0 \
  --push \
  compa-ratio/BackEnd
```

---

## 🆘 Common Errors

### Error: "build requires exactly 1 tag to be specified"

**Cause:** Missing or multiple `--tag` flags

**Solution:** Ensure each `--tag` is on its own line or properly escaped

### Error: "failed to solve: failed to copy files"

**Cause:** File not found or .dockerignore excluding necessary files

**Solution:**
```bash
# Check .dockerignore
cat compa-ratio/BackEnd/.dockerignore
cat FrontEnd/.dockerignore

# Ensure these files exist
ls compa-ratio/BackEnd/pom.xml
ls FrontEnd/package.json
```

### Error: "max depth exceeded"

**Cause:** Docker context too large

**Solution:** Already handled by `.dockerignore` files

---

## 📚 Additional Resources

- **Docker Buildx Docs**: https://docs.docker.com/build/building/multi-platform/
- **Docker Hub**: https://hub.docker.com/u/talentcapital
- **Local Development**: See `DOCKER_DEPLOYMENT.md`
- **Full Infrastructure Guide**: See `infra/README.md`

---

## 🎉 Summary

### Mac/Linux - 3 Commands

```bash
docker login
make buildx-init
make push
```

### Windows PowerShell - 3 Steps

```powershell
docker login
docker buildx create --name comparatio-builder --use
# Run manual build commands from section above
```

### Windows Git Bash - 3 Commands

```bash
docker login
bash infra/scripts/buildx_init.sh
bash infra/scripts/build_push_all.sh
```

---

**After pushing, your images will be available at:**
- https://hub.docker.com/r/talentcapital/comparatio-backend
- https://hub.docker.com/r/talentcapital/comparatio-frontend

**Ready for deployment anywhere!** 🚀

