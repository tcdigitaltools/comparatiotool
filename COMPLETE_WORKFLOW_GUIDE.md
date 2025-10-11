# 🚀 Complete Workflow Guide

## Table of Contents

1. [Local Development to Docker Hub Push](#1-local-development-to-docker-hub-push)
2. [Production Server Deployment](#2-production-server-deployment)
3. [Update & Redeploy Workflow](#3-update--redeploy-workflow)

---

# 1. 💻 Local Development to Docker Hub Push

## Complete Workflow from Your Mac M3

### **Step 1: Make Code Changes Locally**

```bash
# Work on your code
cd /Users/wasiq/Downloads/llcompa_ratioll

# Edit backend files
nano compa-ratio/BackEnd/src/main/java/...

# Edit frontend files
nano FrontEnd/src/app/...
```

### **Step 2: Test Changes Locally**

```bash
# Start local environment
make up

# Access locally
# Frontend: http://localhost:3000
# Backend: http://localhost:8080

# Check logs
make logs

# Run tests
make test

# Health check
make smoke

# Stop when done testing
make down
```

### **Step 3: Commit Changes to Git**

```bash
# Check what changed
git status

# Add files
git add .

# Commit with message
git commit -m "Your descriptive message here"

# Example:
git commit -m "Added new feature for salary calculation"
```

### **Step 4: Login to Docker Hub**

```bash
# Login once (stays logged in)
docker login -u talentcapital
# Enter password when prompted

# Verify
docker info 2>&1 | grep Username
# Should show: Username: talentcapital
```

### **Step 5: Push to Docker Hub**

```bash
# Push both backend and frontend
./push_optimized_m3.sh
```

**Or use Make:**
```bash
make push
```

**This will:**
- ✅ Build backend (Java Spring Boot) for ARM64 + AMD64
- ✅ Build frontend (Next.js) for ARM64 + AMD64
- ✅ Tag with `latest` and `sha-<git-hash>`
- ✅ Push to private Docker Hub repos
- ⏱️ Takes: 10-20 minutes on M3

### **Step 6: Push Git Changes**

```bash
# Push code to GitHub
git push origin main
```

### **Step 7: Verify on Docker Hub**

Check your images are pushed:
- https://hub.docker.com/r/talentcapital/comparatio-backend
- https://hub.docker.com/r/talentcapital/comparatio-frontend

---

## 📋 **Quick Daily Workflow**

```bash
# 1. Make changes to code
# ... edit files ...

# 2. Test locally
make up
# ... test at localhost:3000 ...
make down

# 3. Commit
git add .
git commit -m "Description of changes"

# 4. Push to Docker Hub
./push_optimized_m3.sh

# 5. Push to GitHub
git push origin main
```

**Done! Your changes are now:**
- ✅ In Git repository
- ✅ In Docker Hub as images
- ✅ Ready for production deployment

---

# 2. 🌍 Production Server Deployment

## How to Pull and Host on Live Server

### **Prerequisites on Production Server**

Your production server needs:
- Ubuntu 20.04+ (or any Linux)
- Docker & Docker Compose installed
- SSH access
- Internet access to pull from Docker Hub

---

## 🖥️ **Initial Server Setup (One-Time)**

### **Step 1: SSH to Your Server**

```bash
ssh user@your-server-ip
# Example: ssh ubuntu@203.0.113.45
```

### **Step 2: Install Docker (if not installed)**

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again for group to take effect
exit
ssh user@your-server-ip

# Verify installation
docker --version
docker compose version
```

### **Step 3: Clone Repository on Server**

```bash
# Clone your repo
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Or use HTTPS if you don't have SSH keys
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool
```

### **Step 4: Configure Environment**

```bash
# Copy environment template
cp infra/.env.example infra/.env

# Edit configuration
nano infra/.env
```

**Important Production Settings:**

```bash
# Docker Hub credentials
DOCKERHUB_USERNAME=talentcapital
BACKEND_IMAGE=talentcapital/comparatio-backend
FRONTEND_IMAGE=talentcapital/comparatio-frontend

# Ports (change if 8080/3000 are used)
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Production Java settings
JAVA_OPTS="-Xmx1g -Xms512m"

# External MongoDB (recommended for production)
MONGO_URI=mongodb://your-production-mongo:27017
MONGO_DB=comparatio_production

# Or use containerized MongoDB
MONGO_ENABLE=true

# CRITICAL: Change JWT secret in production!
JWT_SECRET=your_super_secure_random_secret_here_change_this_in_production

# Frontend API URL
NEXT_PUBLIC_API_URL=http://your-server-ip:8080
```

**Generate secure JWT secret:**
```bash
# Generate random secret
openssl rand -hex 32
# Copy output and paste as JWT_SECRET
```

### **Step 5: Login to Docker Hub on Server**

```bash
# Login to pull private images
docker login -u talentcapital
# Enter password or access token
```

### **Step 6: Pull Images from Docker Hub**

```bash
# Pull latest images
docker compose -f infra/docker-compose.prod.yml pull
```

**Or use Make:**
```bash
make prod-pull
```

### **Step 7: Start Production Services**

```bash
# Start in production mode
docker compose -f infra/docker-compose.prod.yml up -d
```

**Or use Make:**
```bash
make prod-up
```

**Expected output:**
```
✅ Network comparatio-network-prod        Created
✅ Volume comparatio-backend-uploads-prod Created
✅ Volume comparatio-mongodb-data-prod    Created
✅ Container comparatio-mongodb-prod      Started
✅ Container comparatio-backend-prod      Started
✅ Container comparatio-frontend-prod     Started
```

### **Step 8: Verify Deployment**

```bash
# Check containers are running
docker ps

# Should see:
# comparatio-mongodb-prod   (healthy)
# comparatio-backend-prod   (healthy)
# comparatio-frontend-prod  (healthy)

# Check health
curl http://localhost:8080/actuator/health
curl http://localhost:3000/

# View logs
docker compose -f infra/docker-compose.prod.yml logs -f
```

### **Step 9: Access Your Live Application**

```
http://your-server-ip:3000
```

**Login with:**
- Email: `admin@talentcapital.com`
- Password: `admin`

---

## 🔒 **Optional: Setup Domain & SSL (Recommended)**

### **Using Nginx Reverse Proxy**

1. **Install Nginx:**
```bash
sudo apt-get install nginx -y
```

2. **Create Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/comparatio
```

**Add:**
```nginx
server {
    listen 80;
    server_name comparatio.yourdomain.com;

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
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/comparatio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Setup SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d comparatio.yourdomain.com
```

**Access via HTTPS:**
```
https://comparatio.yourdomain.com
```

---

## 🔄 **Auto-Start on Server Boot (Optional)**

```bash
# Copy systemd service
sudo cp infra/systemd/llcompa_ratioll.service /etc/systemd/system/

# Edit paths if needed
sudo nano /etc/systemd/system/llcompa_ratioll.service

# Enable and start
sudo systemctl enable llcompa_ratioll.service
sudo systemctl start llcompa_ratioll.service

# Check status
sudo systemctl status llcompa_ratioll.service
```

---

# 3. 🔄 Update & Redeploy Workflow

## When You Make Changes and Want to Update Production

### **On Your Mac (Development):**

```bash
# 1. Make code changes
# ... edit files ...

# 2. Test locally
make up
# ... test at localhost:3000 ...
make down

# 3. Commit changes
git add .
git commit -m "Updated feature X"

# 4. Push to Docker Hub (M3 optimized)
./push_optimized_m3.sh

# 5. Push to GitHub
git push origin main
```

### **On Production Server:**

```bash
# 1. SSH to server
ssh user@your-server-ip

# 2. Navigate to project
cd comparatiotool

# 3. Pull latest code (optional)
git pull origin main

# 4. Pull latest Docker images
make prod-pull

# Or manually:
docker compose -f infra/docker-compose.prod.yml pull

# 5. Restart services with new images
make prod-up

# Or manually:
docker compose -f infra/docker-compose.prod.yml up -d

# 6. Verify update
docker ps
curl http://localhost:8080/actuator/health
curl http://localhost:3000/
```

---

## 📊 **Complete Workflow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│ LOCAL DEVELOPMENT (Your Mac M3)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. Edit Code                                                │
│    ↓                                                        │
│ 2. Test Locally (make up)                                   │
│    ↓                                                        │
│ 3. Commit to Git (git commit)                               │
│    ↓                                                        │
│ 4. Push to Docker Hub (./push_optimized_m3.sh)             │
│    ↓                                                        │
│ 5. Push to GitHub (git push)                                │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ DOCKER HUB (talentcapital)                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ • talentcapital/comparatio-backend:latest                   │
│ • talentcapital/comparatio-frontend:latest                  │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION SERVER (Your Live Server)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. docker login -u talentcapital                            │
│    ↓                                                        │
│ 2. make prod-pull (pulls from Docker Hub)                   │
│    ↓                                                        │
│ 3. make prod-up (starts containers)                         │
│    ↓                                                        │
│ 4. Access at http://your-server-ip:3000                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 📝 Quick Command Reference

## **On Your Mac (Development)**

| Task | Command |
|------|---------|
| Start local dev | `make up` |
| Stop local dev | `make down` |
| View logs | `make logs` |
| Test health | `make smoke` |
| Run tests | `make test` |
| **Push to Docker Hub** | `./push_optimized_m3.sh` |
| Commit to Git | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |

## **On Production Server**

| Task | Command |
|------|---------|
| Clone repo | `git clone git@github.com:tcdigitaltools/comparatiotool.git` |
| Configure | `cp infra/.env.example infra/.env && nano infra/.env` |
| Login to Docker Hub | `docker login -u talentcapital` |
| **Pull latest images** | `make prod-pull` |
| **Start services** | `make prod-up` |
| Check status | `docker ps` |
| View logs | `make prod-logs` |
| Stop services | `make prod-down` |
| Update deployment | `make prod-pull && make prod-up` |

---

# 🎯 Example: Complete Update Cycle

## **Scenario: You fixed a bug and want to deploy**

### **On Your Mac:**

```bash
# 1. Fix the bug
nano FrontEnd/src/features/calculator/components/CompaRatioCalculator.tsx

# 2. Test locally
make up
# Open http://localhost:3000 and test
make down

# 3. Commit
git add .
git commit -m "Fixed calculator rounding bug"

# 4. Push to Docker Hub
./push_optimized_m3.sh
# ⏱️ Wait 10-20 minutes

# 5. Push to GitHub
git push origin main
```

### **On Production Server:**

```bash
# 1. SSH to server
ssh ubuntu@your-server-ip

# 2. Pull updates
cd comparatiotool
git pull origin main

# 3. Pull new Docker images
make prod-pull

# 4. Restart with new images
make prod-up

# 5. Verify
curl http://localhost:3000/
```

**Your bug fix is now live!** ✅

---

# 🏗️ Detailed Server Setup Guide

## **First-Time Production Deployment**

### **Server Requirements:**

- **OS**: Ubuntu 22.04 LTS (recommended) or 20.04
- **RAM**: 4GB minimum, 8GB recommended
- **Disk**: 40GB minimum
- **CPU**: 2 cores minimum
- **Network**: Public IP with ports 80, 443, 3000, 8080 open

### **Complete Server Setup Steps:**

#### **1. Prepare Server**

```bash
# SSH to server
ssh ubuntu@your-server-ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install essentials
sudo apt-get install -y git curl wget
```

#### **2. Install Docker**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin -y

# Add your user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify
docker --version
docker compose version
```

#### **3. Clone Repository**

```bash
# Option A: SSH (if you have SSH keys setup)
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Option B: HTTPS
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool
```

#### **4. Configure for Production**

```bash
# Create .env from template
cp infra/.env.example infra/.env

# Edit configuration
nano infra/.env
```

**Production .env settings:**

```bash
# Docker Hub (for pulling private images)
DOCKERHUB_USERNAME=talentcapital
BACKEND_IMAGE=talentcapital/comparatio-backend
FRONTEND_IMAGE=talentcapital/comparatio-frontend

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Production Java settings (increase for production)
JAVA_OPTS="-Xmx2g -Xms1g"

# MongoDB - Option 1: External (Recommended)
MONGO_URI=mongodb://your-mongodb-server:27017
MONGO_DB=comparatio_production
MONGO_ENABLE=false

# MongoDB - Option 2: Use Docker container
# MONGO_URI=mongodb://mongodb:27017
# MONGO_DB=comparatio_production
# MONGO_ENABLE=true

# CRITICAL: Generate new JWT secret for production!
# Run: openssl rand -hex 32
JWT_SECRET=your_generated_secret_here

# Frontend API URL (use your domain or IP)
NEXT_PUBLIC_API_URL=http://your-domain.com:8080
```

#### **5. Login to Docker Hub**

```bash
# Login to pull private images
docker login -u talentcapital
# Enter password when prompted
```

#### **6. Pull Images**

```bash
# Pull latest images from Docker Hub
make prod-pull

# Or manually:
docker compose -f infra/docker-compose.prod.yml pull
```

#### **7. Start Production Services**

```bash
# Start all services
make prod-up

# Or manually:
docker compose -f infra/docker-compose.prod.yml up -d
```

#### **8. Verify Deployment**

```bash
# Check all containers are running
docker ps

# You should see:
# comparatio-backend-prod    (Up, healthy)
# comparatio-frontend-prod   (Up, healthy)
# comparatio-mongodb-prod    (Up, healthy - if MONGO_ENABLE=true)

# Test health endpoints
curl http://localhost:8080/actuator/health
curl http://localhost:3000/

# View logs
docker compose -f infra/docker-compose.prod.yml logs -f
# Press Ctrl+C to exit logs
```

#### **9. Access Your Application**

Open in browser:
```
http://your-server-ip:3000
```

**Login:**
- Email: `admin@talentcapital.com`
- Password: `admin`

---

## 🔥 **Production Server Management**

### **View Logs**

```bash
# All services
make prod-logs

# Specific service
docker logs comparatio-backend-prod -f
docker logs comparatio-frontend-prod -f
```

### **Restart Services**

```bash
# Restart all
make prod-down
make prod-up

# Restart specific service
docker restart comparatio-backend-prod
docker restart comparatio-frontend-prod
```

### **Update to Latest Version**

```bash
# Pull latest code
git pull origin main

# Pull latest Docker images
make prod-pull

# Restart with new images
make prod-up
```

### **Check Resource Usage**

```bash
# Docker stats
docker stats

# Disk usage
docker system df

# Container logs size
docker ps --size
```

### **Backup Important Data**

```bash
# Backup MongoDB data
docker exec comparatio-mongodb-prod mongodump --out /tmp/backup
docker cp comparatio-mongodb-prod:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)

# Backup uploads volume
docker run --rm -v comparatio-backend-uploads-prod:/data -v $(pwd):/backup ubuntu tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data
```

---

## 🌐 **Exposing to Internet**

### **Option 1: Direct Access (Quick Test)**

```bash
# Open firewall ports
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
sudo ufw enable

# Access via
http://your-server-ip:3000
```

### **Option 2: Nginx Reverse Proxy (Production)**

```bash
# Install Nginx
sudo apt-get install nginx -y

# Create config
sudo nano /etc/nginx/sites-available/comparatio
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name comparatio.yourdomain.com;

    client_max_body_size 50M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend uploads
    location /uploads {
        proxy_pass http://localhost:8080/uploads;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/comparatio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Option 3: SSL/HTTPS with Let's Encrypt**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d comparatio.yourdomain.com

# Auto-renewal is setup automatically
# Test renewal
sudo certbot renew --dry-run
```

**Access securely:**
```
https://comparatio.yourdomain.com
```

---

# 🎯 Summary: Two Main Workflows

## **Workflow 1: Push from Local (Mac M3) to Docker Hub**

```bash
# On your Mac
git add .
git commit -m "Changes"
./push_optimized_m3.sh          # Push to Docker Hub
git push origin main             # Push to GitHub
```

## **Workflow 2: Deploy on Production Server**

```bash
# On production server
cd comparatiotool
git pull origin main             # Pull latest code
docker login -u talentcapital    # Login (once)
make prod-pull                   # Pull Docker images
make prod-up                     # Start services
```

---

# 🆘 **Common Production Issues**

### **Issue: Cannot connect to server**

**Check firewall:**
```bash
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
```

### **Issue: Containers not starting**

**Check logs:**
```bash
docker compose -f infra/docker-compose.prod.yml logs
```

**Common fixes:**
- Check MongoDB connection in `.env`
- Ensure ports aren't already in use: `sudo lsof -i :8080`
- Check disk space: `df -h`

### **Issue: Out of memory**

**Increase swap:**
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### **Issue: Images not pulling (private repo)**

**Login again:**
```bash
docker logout
docker login -u talentcapital
make prod-pull
```

---

# 📚 **Full Documentation References**

- **Local Development**: `DOCKER_DEPLOYMENT.md`
- **M3 Specific**: `APPLE_M3_DOCKER_GUIDE.md`
- **Docker Hub Push**: `DOCKER_HUB_PUSH.md`
- **Quick Login**: `LOGIN_AND_PUSH.md`
- **Infrastructure**: `infra/README.md`

---

**You're all set! Start with local development, push to Docker Hub, then deploy to production!** 🚀

