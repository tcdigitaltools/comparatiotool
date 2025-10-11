# 🚀 Docker Deployment Quick Reference

## 📦 What Was Created

### Dockerfiles
- ✅ `compa-ratio/BackEnd/Dockerfile.llcompa_ratioll` - Multi-stage Java 21 build
- ✅ `FrontEnd/Dockerfile.llcompa_ratioll` - Multi-stage Next.js standalone build
- ✅ `.dockerignore` files for all directories

### Infrastructure
- ✅ `infra/docker-compose.dev.yml` - Development with local builds
- ✅ `infra/docker-compose.prod.yml` - Production with Docker Hub images
- ✅ `infra/.env.example` - Environment configuration template

### Scripts
- ✅ `infra/scripts/dev_up.sh` - Start development
- ✅ `infra/scripts/dev_down.sh` - Stop development
- ✅ `infra/scripts/smoke_test.sh` - Health checks
- ✅ `infra/scripts/buildx_init.sh` - Setup multi-arch builder
- ✅ `infra/scripts/build_push_all.sh` - Build and push to Docker Hub
- ✅ `infra/scripts/prod_pull.sh` - Pull production images
- ✅ `infra/scripts/prod_up.sh` - Start production

### Automation
- ✅ `Makefile` - Common operations
- ✅ `infra/systemd/llcompa_ratioll.service` - Auto-start on boot

### Documentation
- ✅ `infra/README.md` - Complete guide with discovery notes

---

## 🎯 Discovery Summary

### Backend
- **Tool**: Maven 3.9
- **Java**: 21
- **Port**: 8080
- **Health**: `/actuator/health` ✅
- **Jar**: `target/comparatio-0.0.1-SNAPSHOT.jar`

### Frontend
- **Framework**: Next.js 15.5.4
- **Node**: 20
- **Manager**: npm
- **Port**: 3000
- **Output**: Standalone (Docker-optimized)

---

## ⚡ Quick Commands

### Local Development
```bash
# Setup
cp infra/.env.example infra/.env
# Edit DOCKERHUB_USERNAME in infra/.env

# Start everything
make up

# View logs
make logs

# Test health
make smoke

# Stop
make down
```

### Docker Hub Deployment
```bash
# One-time setup
docker login
make buildx-init

# Build and push (multi-arch: amd64 + arm64)
make push
```

**Images will be pushed to:**
- `${DOCKERHUB_USERNAME}/compa-ratio-backend:latest`
- `${DOCKERHUB_USERNAME}/compa-ratio-backend:sha-<git-hash>`
- `${DOCKERHUB_USERNAME}/compa-ratio-frontend:latest`
- `${DOCKERHUB_USERNAME}/compa-ratio-frontend:sha-<git-hash>`

### Production Server
```bash
# Clone repo
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Configure
cp infra/.env.example infra/.env
nano infra/.env  # Set DOCKERHUB_USERNAME and other vars

# Deploy
make prod-pull
make prod-up

# Verify
make smoke
```

---

## 🔧 Configuration Required

### infra/.env
```bash
# Required
DOCKERHUB_USERNAME=your_dockerhub_username

# Database (use external MongoDB in production)
MONGO_URI=mongodb://your-mongo-host:27017
MONGO_DB=compa_prod

# Security (CHANGE THIS!)
JWT_SECRET=your_secure_random_secret

# Optional
BACKEND_PORT=8080
FRONTEND_PORT=3000
JAVA_OPTS=-Xmx1g -Xms512m
```

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│   Docker Network: llcompa_ratioll       │
│                                         │
│  Frontend (Next.js)  →  Backend (Java)  │
│       :3000              :8080          │
│                             ↓           │
│                        MongoDB          │
│                         :27017          │
└─────────────────────────────────────────┘
```

**Health Checks:**
- Backend: Spring Boot Actuator
- Frontend: HTTP GET /
- MongoDB: mongosh ping

**Volumes:**
- `backend_uploads` - File uploads persistence
- `mongodb_data` - Database persistence (optional)

---

## 🐳 Multi-Architecture Support

Both images built for:
- ✅ `linux/amd64` (Intel/AMD servers, most cloud providers)
- ✅ `linux/arm64` (AWS Graviton, Apple Silicon, ARM servers)

---

## 📝 Next Steps

1. **Configure Environment**
   ```bash
   cp infra/.env.example infra/.env
   nano infra/.env
   ```

2. **Test Locally**
   ```bash
   make up
   make smoke
   ```

3. **Push to Docker Hub**
   ```bash
   docker login
   make buildx-init
   make push
   ```

4. **Deploy to Production**
   - SSH to your server
   - Clone the repo
   - Configure .env
   - Run `make prod-pull && make prod-up`

5. **Optional: Auto-start on Boot**
   ```bash
   sudo cp infra/systemd/llcompa_ratioll.service /etc/systemd/system/
   sudo systemctl enable llcompa_ratioll.service
   sudo systemctl start llcompa_ratioll.service
   ```

---

## 🆘 Common Issues

### Port Already in Use
```bash
# Change ports in .env
BACKEND_PORT=8081
FRONTEND_PORT=3001
```

### Build Fails
```bash
make clean
docker system prune -a
make build-dev
```

### Health Check Fails
```bash
# Check logs
make logs

# Test manually
curl http://localhost:8080/actuator/health
curl http://localhost:3000/
```

---

## 📚 Full Documentation

See `infra/README.md` for complete documentation including:
- Detailed discovery notes
- Troubleshooting guide
- Production deployment
- Security considerations
- Monitoring setup

---

**Ready to deploy!** 🎉

