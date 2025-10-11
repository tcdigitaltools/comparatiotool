# 🐳 Docker Compose Deployment Explained

## ✅ **YES! You're Absolutely Right!**

Based on **official Docker Compose documentation**, you only need the `docker-compose.yml` file on the server when using **pre-built images from Docker Hub**.

---

## 🎯 **Two Types of Compose Files**

### **Type 1: Development (with `build:`)**

```yaml
services:
  backend:
    build: ./backend          # ← Builds from source code
    image: my-backend
```

**Requires:**
- ✅ Source code
- ✅ Build tools (Maven, Node, etc.)
- ✅ Full repository

**Used for:** Local development

---

### **Type 2: Production (with `image:` only)**

```yaml
services:
  backend:
    image: talentcapital/comparatio-backend:latest  # ← Pulls from Docker Hub
```

**Requires:**
- ✅ Only docker-compose.yml
- ✅ Only .env file
- ❌ NO source code needed!
- ❌ NO build tools needed!

**Used for:** Production deployment

---

## 📊 **What You Have**

### **Development Compose** (`infra/docker-compose.dev.yml`)
```yaml
services:
  backend:
    build:                           # ← Builds locally
      context: ../compa-ratio/BackEnd
      dockerfile: Dockerfile.llcompa_ratioll
```

**Needs:** Full source code (for local development)

### **Production Compose** (`infra/docker-compose.prod.yml`)
```yaml
services:
  backend:
    image: talentcapital/comparatio-backend:latest  # ← Pulls from Docker Hub
```

**Needs:** Just this compose file! ✨

---

## 🎯 **ANSWER: How It Actually Works**

### **What Docker Compose Does:**

According to official Docker Compose docs:

1. **Reads** `docker-compose.yml`
2. **Sees** `image: talentcapital/comparatio-backend:latest`
3. **Checks** if image exists locally
4. **If not**, runs: `docker pull talentcapital/comparatio-backend:latest`
5. **Creates** container from that image
6. **Starts** the container

**No building, no source code needed!**

---

## 🚀 **Minimal Deployment (RECOMMENDED)**

### **What You Need on Production Server:**

```
/opt/comparatio/
├── docker-compose.yml    # Just the compose file
└── .env                  # Configuration
```

**That's ALL you need!** 🎉

### **Steps:**

```bash
# 1. SSH to server
ssh ubuntu@your-server

# 2. Create directory
mkdir -p /opt/comparatio
cd /opt/comparatio

# 3. Create docker-compose.yml
nano docker-compose.yml
# Paste the production compose content (see below)

# 4. Create .env
nano .env
# Set your config (see below)

# 5. Login to Docker Hub (for private images)
docker login -u talentcapital

# 6. Pull and start
docker compose pull    # Pulls images from Docker Hub
docker compose up -d   # Starts containers

# 7. Done!
```

---

## 📝 **Standalone docker-compose.yml for Server**

Save this as `/opt/comparatio/docker-compose.yml`:

```yaml
name: comparatio

services:
  mongodb:
    image: mongo:7.0
    container_name: comparatio-mongodb
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

  backend:
    image: ${BACKEND_IMAGE:-talentcapital/comparatio-backend}:latest
    container_name: comparatio-backend
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

  frontend:
    image: ${FRONTEND_IMAGE:-talentcapital/comparatio-frontend}:latest
    container_name: comparatio-frontend
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
    driver: bridge

volumes:
  mongodb_data:
  backend_uploads:
```

---

## 📝 **Standalone .env for Server**

Save this as `/opt/comparatio/.env`:

```bash
# Images from Docker Hub
BACKEND_IMAGE=talentcapital/comparatio-backend
FRONTEND_IMAGE=talentcapital/comparatio-frontend

# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# Java
JAVA_OPTS="-Xmx2g -Xms1g"

# MongoDB
MONGO_URI=mongodb://mongodb:27017
MONGO_DB=comparatio_production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your_secure_secret_here

# API URL
NEXT_PUBLIC_API_URL=http://your-domain-or-ip:8080
```

---

## 🎯 **Complete Minimal Deployment**

### **On Your Mac (Push Images):**

```bash
docker login -u talentcapital
./push_optimized_m3.sh
```

### **On Production Server (Deploy):**

```bash
# One-time setup
mkdir -p /opt/comparatio && cd /opt/comparatio

# Copy the docker-compose.yml and .env files above
# (or download them, or copy from the repo)

# Login
docker login -u talentcapital

# Deploy
docker compose pull
docker compose up -d

# Verify
docker ps
curl http://localhost:3000
```

---

## 🆚 **Comparison: Minimal vs Full Repo**

| Aspect | Minimal (2 Files) | Full Repo |
|--------|-------------------|-----------|
| **Files on server** | 2 | ~200 |
| **Size** | <5 KB | ~50 MB |
| **Source code** | ❌ No | ✅ Yes |
| **Build tools** | ❌ Not needed | ❌ Not needed |
| **Make commands** | ❌ No | ✅ Yes |
| **Security** | 🔒 High | 🔓 Lower |
| **Deploy speed** | ⚡ Instant | 🚀 Fast |
| **Updates** | `docker compose pull && up -d` | `make prod-pull && make prod-up` |

---

## ✅ **Recommended Approach**

### **For Production: Use Minimal**

```bash
# Server only needs:
docker-compose.yml  ← Pulls images from Docker Hub
.env               ← Configuration

# No source code needed!
```

### **Why It Works:**

From Docker Compose documentation:

> **When a service uses `image:` instead of `build:`**, 
> Compose pulls the pre-built image from the registry.
> No local source code or build context required.

---

## 📦 **How to Get Files to Server**

### **Method 1: Copy from Repo (Easiest)**

```bash
# On your Mac
scp infra/docker-compose.prod.yml user@server:/opt/comparatio/docker-compose.yml
scp infra/.env.example user@server:/opt/comparatio/.env

# On server
nano /opt/comparatio/.env  # Edit settings
```

### **Method 2: Create Directly on Server**

```bash
# SSH to server
ssh user@server

# Create files
mkdir -p /opt/comparatio && cd /opt/comparatio
nano docker-compose.yml  # Paste content
nano .env               # Paste content
```

### **Method 3: Download from GitHub**

```bash
# On server
cd /opt/comparatio
wget https://raw.githubusercontent.com/tcdigitaltools/comparatiotool/main/infra/docker-compose.prod.yml -O docker-compose.yml
wget https://raw.githubusercontent.com/tcdigitaltools/comparatiotool/main/infra/.env.example -O .env
nano .env  # Edit settings
```

---

## 🔄 **Update Workflow**

### **When You Make Changes:**

**On Mac:**
```bash
# Push new images
./push_optimized_m3.sh
```

**On Server:**
```bash
# Pull and restart
docker compose pull
docker compose up -d
```

**That's it!** No git pull, no source code updates needed!

---

## 📋 **Complete Commands Reference**

### **Minimal Deployment Commands:**

```bash
# Initial deploy
docker login -u talentcapital
docker compose pull
docker compose up -d

# Update
docker compose pull
docker compose up -d

# Stop
docker compose down

# View logs
docker compose logs -f

# Check status
docker compose ps

# Restart specific service
docker compose restart backend
docker compose restart frontend
```

---

## 🎓 **Key Concept: Build vs Pull**

### **docker-compose.dev.yml (Development):**
```yaml
services:
  backend:
    build: ./backend    # ← BUILDS from source
```
**Needs:** Source code on server

### **docker-compose.prod.yml (Production):**
```yaml
services:
  backend:
    image: talentcapital/comparatio-backend:latest  # ← PULLS from registry
```
**Needs:** Only compose file!

---

## ✅ **Final Answer**

**Question 1: How to push from local?**
```bash
docker login -u talentcapital
./push_optimized_m3.sh
```

**Question 2: How to host on server?**

**SIMPLE WAY (Just 2 files needed!):**
```bash
# On server:
1. Copy docker-compose.yml and .env
2. docker login -u talentcapital
3. docker compose pull
4. docker compose up -d
```

**OR with full repo (if you want Make commands):**
```bash
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool
cp infra/.env.example infra/.env
nano infra/.env
docker login -u talentcapital
make prod-pull
make prod-up
```

**Both work! Minimal is more secure and recommended for production.** 🎯

---

**See `DEPLOYMENT_OPTIONS.md` for detailed comparison!**

