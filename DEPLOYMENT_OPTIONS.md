# 🚀 Deployment Options Explained

## ✅ You're Right! Two Ways to Deploy

Since you're pushing **pre-built Docker images** to Docker Hub, you have two deployment options:

---

## 🎯 **Option 1: Minimal Deployment (RECOMMENDED)**

### **What You Need on Server: Just 2 Files!**

You **DON'T need** the full repository! Just:
- ✅ `docker-compose.prod.yml`
- ✅ `.env` file

That's it! The images are already on Docker Hub.

### **How It Works:**

```
Docker Hub (talentcapital)
  ├─ comparatio-backend:latest  ← Pre-built image
  └─ comparatio-frontend:latest ← Pre-built image
                ↓
         Production Server
         Just pulls images!
         (No source code needed)
```

### **Setup on Production Server:**

```bash
# 1. SSH to server
ssh ubuntu@your-server-ip

# 2. Create project directory
mkdir -p /opt/comparatio
cd /opt/comparatio

# 3. Create docker-compose.yml
nano docker-compose.yml
```

**Paste this (standalone compose file):**

```yaml
name: comparatio

services:
  # MongoDB
  mongodb:
    image: mongo:7.0
    container_name: comparatio-mongodb-prod
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: ${MONGO_DB:-compa_demo}
    volumes:
      - mongodb_data:/data/db
    networks:
      - comparatio-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  # Backend
  backend:
    image: talentcapital/comparatio-backend:latest
    container_name: comparatio-backend-prod
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    environment:
      - JAVA_OPTS=${JAVA_OPTS:--Xmx1g -Xms512m}
      - APP_PORT=8080
      - MONGO_URI=${MONGO_URI:-mongodb://mongodb:27017}
      - MONGO_DB=${MONGO_DB:-compa_demo}
      - JWT_SECRET=${JWT_SECRET}
      - FILE_STORAGE_PATH=/app/uploads
    volumes:
      - backend_uploads:/app/uploads
    tmpfs:
      - /tmp:size=1G
    networks:
      - comparatio-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 60s
    depends_on:
      mongodb:
        condition: service_healthy

  # Frontend
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
      - NEXT_PUBLIC_API_URL=http://backend:8080
    networks:
      - comparatio-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 30s
    depends_on:
      backend:
        condition: service_healthy

networks:
  comparatio-network:
    name: comparatio-network-prod
    driver: bridge

volumes:
  mongodb_data:
    name: comparatio-mongodb-data-prod
  backend_uploads:
    name: comparatio-backend-uploads-prod
```

```bash
# 4. Create .env file
nano .env
```

**Paste this:**

```bash
# Docker Hub
DOCKERHUB_USERNAME=talentcapital

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Java Options
JAVA_OPTS="-Xmx2g -Xms1g"

# MongoDB
MONGO_URI=mongodb://mongodb:27017
MONGO_DB=comparatio_production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=change_this_to_a_secure_random_value_in_production

# API URL
NEXT_PUBLIC_API_URL=http://your-server-ip:8080
```

```bash
# 5. Login to Docker Hub (to pull private images)
docker login -u talentcapital

# 6. Pull and start
docker compose pull
docker compose up -d

# 7. Check status
docker ps
```

**Your app is live at:** `http://your-server-ip:3000`

### **✅ Benefits of Minimal Deployment:**

- ✅ **No source code on server** (more secure)
- ✅ **Smaller footprint** (just 2 files)
- ✅ **Faster deployment** (no git clone)
- ✅ **Cleaner updates** (just pull new images)
- ✅ **No build tools needed** (Maven, Node, etc.)

---

## 🗂️ **Option 2: Full Repository Deployment**

### **What You Need: Full Repo**

Clone the entire repository on the server.

### **Why Use This?**

- ✅ Have all scripts (`make` commands)
- ✅ Can rebuild locally if needed
- ✅ Have all documentation
- ✅ Easier to manage configs

### **Setup:**

```bash
# 1. SSH to server
ssh ubuntu@your-server-ip

# 2. Clone full repo
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool

# 3. Configure
cp infra/.env.example infra/.env
nano infra/.env

# 4. Login
docker login -u talentcapital

# 5. Pull and start
make prod-pull
make prod-up
```

### **✅ Benefits of Full Repo:**

- ✅ Use `make` commands (easier)
- ✅ Have backup of configs
- ✅ Can rebuild if needed
- ✅ Full documentation accessible

---

## 🤔 **Which Option Should You Use?**

| Scenario | Recommended Option | Why |
|----------|-------------------|-----|
| **Production server** | Option 1 (Minimal) | More secure, no source code |
| **Staging server** | Option 2 (Full Repo) | Easier testing and debugging |
| **Multiple servers** | Option 1 (Minimal) | Quick deployment |
| **Single server** | Option 2 (Full Repo) | Convenience of Make commands |

---

## 💡 **Best Practice: Hybrid Approach**

Use **Option 1 (Minimal)** but keep configs in a separate repo:

### **Create deployment-only repo:**

```bash
# On your Mac
mkdir comparatio-deploy
cd comparatio-deploy

# Copy minimal files
cp /path/to/llcompa_ratioll/infra/docker-compose.prod.yml ./
cp /path/to/llcompa_ratioll/infra/.env.example ./

# Initialize git
git init
git add .
git commit -m "Initial deployment config"
git remote add origin git@github.com:tcdigitaltools/comparatio-deploy.git
git push -u origin main
```

### **Then on server:**

```bash
git clone https://github.com/tcdigitaltools/comparatio-deploy.git
cd comparatio-deploy
cp .env.example .env
nano .env
docker login -u talentcapital
docker compose pull
docker compose up -d
```

**Benefits:**
- ✅ Version control for configs
- ✅ No source code on server
- ✅ Easy to update configs

---

## 📋 **Comparison Table**

| Aspect | Minimal (2 Files) | Full Repository |
|--------|-------------------|-----------------|
| **Files on server** | 2 files | ~200 files |
| **Disk space** | <1 MB | ~50 MB |
| **Security** | High (no source) | Lower (source exposed) |
| **Deployment speed** | Very fast | Fast |
| **Updates** | `docker compose pull && up` | `make prod-pull && make prod-up` |
| **Source code access** | No | Yes |
| **Make commands** | No | Yes |
| **Best for** | Production | Development/Staging |

---

## 🎯 **Recommendation for You**

### **For Production Servers:**

Use **Minimal Deployment** (Option 1):

```bash
# Just 2 files on server
/opt/comparatio/
├── docker-compose.yml
└── .env
```

### **Commands:**

```bash
# Deploy
docker login -u talentcapital
docker compose pull
docker compose up -d

# Update
docker compose pull
docker compose up -d

# Stop
docker compose down
```

### **For Staging/Testing Servers:**

Use **Full Repo** (Option 2):

```bash
# Clone everything
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool

# Use Make commands
make prod-pull
make prod-up
```

---

## 🔐 **Important: Private Images Require Login**

No matter which option, you **MUST login** to Docker Hub on the server:

```bash
docker login -u talentcapital
```

This creates credentials so Docker can pull your private images.

---

## ✨ **What Happens Behind the Scenes**

### **When you run `docker compose up`:**

1. **Reads** `docker-compose.yml`
2. **Checks** if images exist locally
3. **If not**, pulls from Docker Hub:
   - `talentcapital/comparatio-backend:latest`
   - `talentcapital/comparatio-frontend:latest`
4. **Creates** containers from those images
5. **Starts** services
6. **No compilation** or building - just runs!

**That's why you don't need source code!**

---

## 📝 **Summary Answer:**

### **Your Question 1: How to push from local?**

**Answer:**
```bash
docker login -u talentcapital
./push_optimized_m3.sh
```

### **Your Question 2: How to host on server?**

**Answer (Minimal - Recommended):**
```bash
# Just copy docker-compose.yml and .env to server
docker login -u talentcapital
docker compose pull
docker compose up -d
```

**Answer (Full - With Repo):**
```bash
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool
cp infra/.env.example infra/.env
nano infra/.env
docker login -u talentcapital
make prod-pull
make prod-up
```

**Both work! Choose based on your needs.** 🚀

---

**See `COMPLETE_WORKFLOW_GUIDE.md` for full step-by-step instructions!**

