# Compa Ratio Calculator

A comprehensive compensation ratio calculator with Spring Boot backend and Next.js frontend.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Local Development](#-local-development)
- [Building & Pushing to Docker Hub](#-building--pushing-to-docker-hub)
- [Production Deployment](#-production-deployment)
- [Architecture](#-architecture)
- [Credentials](#-credentials)

---

## 🚀 Quick Start

### Prerequisites

- **Local Development:**
  - Docker Desktop
  - Git
  - Node.js 20+ (optional, for native development)
  - Java 21+ (optional, for native development)

- **Production Deployment:**
  - Docker & Docker Compose
  - Domain with SSL (Nginx + Certbot)

---

## 💻 Local Development

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Start all services (MongoDB, Backend, Frontend)
make up

# Or manually:
docker compose -f infra/docker-compose.dev.yml up --build
```

**Access:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend: http://localhost:8080
- 💾 MongoDB: localhost:27017

**Stop services:**
```bash
make down
```

### Option 2: Running Natively (Without Docker)

**Terminal 1 - Backend:**
```bash
cd compa-ratio/BackEnd
./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm install
npm run dev
```

**Terminal 3 - MongoDB:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

---

## 🐳 Building & Pushing to Docker Hub

### Initial Setup (One-Time)

```bash
# 1. Login to Docker Hub
docker login -u talentcapital

# 2. Create and use buildx builder
docker buildx create --name comparatio-builder --use
docker buildx inspect --bootstrap
```

### Build & Push Backend

```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Build for multiple architectures (AMD64 + ARM64)
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest \
  --tag talentcapital/comparatio-backend:$(git rev-parse --short HEAD) \
  --push \
  compa-ratio/BackEnd
```

**Build time:** ~2-3 minutes

### Build & Push Frontend

```bash
# Important: Set production API URL
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --tag talentcapital/comparatio-frontend:$(git rev-parse --short HEAD) \
  --push \
  FrontEnd
```

**Build time:** ~3-5 minutes

### Build & Push Both (All-in-One)

```bash
# Use the convenience script
make push

# Or manually:
bash infra/scripts/build_push_all.sh
```

---

## 🌐 Production Deployment

### Server Setup (One-Time)

**On your production server (164.92.232.41):**

```bash
# 1. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in

# 2. Clone repository or copy docker-compose.yml
mkdir -p ~/comparatiotool
cd ~/comparatiotool

# Option A: Clone full repo
git clone git@github.com:tcdigitaltools/comparatiotool.git .

# Option B: Just copy deployment files
# Copy docker-compose.yml and .env from deploy-package/
```

### Configure Environment

Create `.env` file on server:

```bash
cd ~/comparatiotool
cat > .env << 'EOF'
# Docker Hub Configuration
DOCKERHUB_USERNAME=talentcapital

# Docker Images
BACKEND_IMAGE=talentcapital/comparatio-backend
FRONTEND_IMAGE=talentcapital/comparatio-frontend

# Service Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Backend Configuration
JAVA_OPTS="-Xmx512m -Xms256m"
APP_PORT=8080

# MongoDB Configuration
MONGO_URI=mongodb://mongodb:27017
MONGO_DB=compa_demo
MONGO_ENABLE=true
MONGO_PORT=27017

# JWT Configuration (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secret-jwt-key-change-this-in-production

# File Storage
FILE_STORAGE_PATH=/app/uploads
FILE_RETENTION_DAYS=90

# Frontend Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com
EOF
```

### Setup Nginx Reverse Proxy

**1. Install Nginx:**
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

**2. Configure Frontend (compa.talentcapitalme.com):**
```bash
sudo nano /etc/nginx/sites-available/comparatio-frontend
```

```nginx
server {
    listen 80;
    server_name compa.talentcapitalme.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**3. Configure Backend (api.talentcapitalme.com):**
```bash
sudo nano /etc/nginx/sites-available/comparatio-api
```

```nginx
server {
    listen 80;
    server_name api.talentcapitalme.com;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**4. Enable sites and setup SSL:**
```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/comparatio-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/comparatio-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Setup SSL certificates
sudo certbot --nginx -d compa.talentcapitalme.com
sudo certbot --nginx -d api.talentcapitalme.com
```

### Deploy Application

**Initial deployment:**
```bash
cd ~/comparatiotool

# Pull images from Docker Hub
docker compose -f infra/docker-compose.prod.yml pull

# Start services
docker compose -f infra/docker-compose.prod.yml up -d

# Check status
docker compose -f infra/docker-compose.prod.yml ps
```

### Update Deployment (After Local Build & Push)

**After you've built and pushed new images from your local machine:**

```bash
# On production server
cd ~/comparatiotool

# Pull latest images
docker compose -f infra/docker-compose.prod.yml pull

# Restart services (no downtime with recreate)
docker compose -f infra/docker-compose.prod.yml up -d

# Check logs
docker compose -f infra/docker-compose.prod.yml logs -f
```

---

## 📊 Complete Workflow

### Development → Production Flow

**1. On Your Local Machine (Mac):**

```bash
# 1. Make code changes
git add .
git commit -m "Your commit message"
git push origin main

# 2. Build and push Docker images
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest \
  --push \
  compa-ratio/BackEnd

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --build-arg NEXT_PUBLIC_API_URL=https://api.talentcapitalme.com \
  --tag talentcapital/comparatio-frontend:latest \
  --push \
  FrontEnd
```

**Build time:** ~5-8 minutes total

**2. On Production Server (164.92.232.41):**

```bash
# SSH to server
ssh root@164.92.232.41

# Navigate to project
cd ~/comparatiotool

# Pull and deploy
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d

# Verify
docker compose -f infra/docker-compose.prod.yml ps
docker compose -f infra/docker-compose.prod.yml logs -f --tail=50
```

**Deployment time:** ~1-2 minutes

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 21
- Spring Boot 3.5.6
- MongoDB 7.0
- Spring Security with JWT
- BCrypt password encryption
- Actuator for health checks

**Frontend:**
- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- Standalone output for Docker optimization

**Infrastructure:**
- Docker & Docker Compose
- Multi-architecture builds (AMD64 + ARM64)
- Nginx reverse proxy
- Let's Encrypt SSL
- Health checks for all services

### Service Ports

| Service  | Internal | External (Dev) | External (Prod) |
|----------|----------|----------------|-----------------|
| Frontend | 3000     | 3000           | 443 (HTTPS)     |
| Backend  | 8080     | 8080           | 443 (HTTPS)     |
| MongoDB  | 27017    | 27017          | Internal only   |

### Docker Images

**Docker Hub Repository:** `talentcapital/`

- **Backend:** `talentcapital/comparatio-backend:latest`
- **Frontend:** `talentcapital/comparatio-frontend:latest`

**Tags:**
- `latest` - Latest stable release
- `sha-<git-hash>` - Specific commit version

---

## 🔑 Credentials

### Default Admin User

**Email:** `admin@talentcapital.com`  
**Password:** `admin`

**Role:** SUPER_ADMIN

> ⚠️ **Security:** Change the default password after first login!

### Database

**Database Name:** `compa_demo`  
**Host (Production):** `mongodb:27017` (internal Docker network)  
**Host (Local):** `localhost:27017`

---

## 🛠️ Troubleshooting

### Check Service Health

```bash
# On production server
docker compose -f infra/docker-compose.prod.yml ps

# Check individual service logs
docker logs comparatio-backend-prod --tail=100
docker logs comparatio-frontend-prod --tail=100
docker logs comparatio-mongodb-prod --tail=100

# Check health endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:3000/
```

### Common Issues

#### 1. Login Fails with 401

**Cause:** Admin user not created or wrong credentials

**Fix:**
```bash
# Restart backend to trigger admin user creation
docker restart comparatio-backend-prod
sleep 30

# Or delete all users and restart
docker exec comparatio-mongodb-prod mongosh compa_demo --eval 'db.users.deleteMany({})'
docker restart comparatio-backend-prod
```

#### 2. CORS Errors

**Cause:** Frontend using wrong API URL or Nginx adding duplicate headers

**Fix:**
- Ensure frontend built with correct `NEXT_PUBLIC_API_URL`
- Nginx should NOT add CORS headers (Spring Boot handles it)
- Check WebSecurityConfig.java allows your frontend domain

#### 3. MongoDB Connection Issues

**Fix:**
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check MongoDB health
docker exec comparatio-mongodb-prod mongosh --eval "db.adminCommand('ping')"

# Restart if needed
docker restart comparatio-mongodb-prod
```

#### 4. Out of Disk Space

**Fix:**
```bash
# Clean up Docker
docker system prune -a

# Check disk space
df -h
```

---

## 📚 Additional Documentation

- **Local Development:** [RUN_LOCAL.md](RUN_LOCAL.md)
- **Infrastructure Setup:** [infra/README.md](infra/README.md)
- **Deployment Package:** [deploy-package/DEPLOY_README.md](deploy-package/DEPLOY_README.md)

---

## 🔗 Links

**Production:**
- Frontend: https://compa.talentcapitalme.com
- Backend API: https://api.talentcapitalme.com
- Health Check: https://api.talentcapitalme.com/actuator/health

**Docker Hub:**
- Backend: https://hub.docker.com/r/talentcapital/comparatio-backend
- Frontend: https://hub.docker.com/r/talentcapital/comparatio-frontend

**Repository:**
- GitHub: git@github.com:tcdigitaltools/comparatiotool.git

---

## 📝 Quick Reference

### Local Development Commands

```bash
make up          # Start all services
make down        # Stop all services
make logs        # View all logs
make test        # Run tests
make build-dev   # Build dev images
```

### Production Commands

```bash
# On local machine
make push        # Build and push to Docker Hub

# On production server
docker compose -f infra/docker-compose.prod.yml pull    # Pull images
docker compose -f infra/docker-compose.prod.yml up -d   # Deploy
docker compose -f infra/docker-compose.prod.yml logs -f # View logs
docker compose -f infra/docker-compose.prod.yml down    # Stop all
```

---

## 🤝 Support

For issues or questions, contact the development team.

---

**Last Updated:** October 2025

