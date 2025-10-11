# 🚀 Minimal Production Deployment

## 📦 This Package Contains Everything You Need!

Just **4 files** to deploy Comparatio on any server:

```
deploy-package/
├── docker-compose.yml    ← Production services
├── .env.example          ← Configuration template
├── check_health.sh       ← Status check script
└── DEPLOY_README.md      ← This file
```

---

## ⚡ **Quick Deploy (5 Minutes)**

### **Step 1: Copy to Server**

```bash
# From your Mac, copy this folder to server
scp -r deploy-package user@your-server:/opt/comparatio
```

### **Step 2: SSH to Server**

```bash
ssh user@your-server
cd /opt/comparatio
```

### **Step 3: Configure**

```bash
# Create .env from template
cp .env.example .env
nano .env
```

**Edit these critical values:**
```bash
MONGO_URI=mongodb://mongodb:27017  # Or external MongoDB
JWT_SECRET=CHANGE_THIS_TO_SECURE_VALUE
NEXT_PUBLIC_API_URL=http://your-server-ip:8080
```

### **Step 4: Login to Docker Hub**

```bash
docker login -u talentcapital
# Enter password for private image access
```

### **Step 5: Deploy**

```bash
docker compose pull
docker compose up -d
```

### **Step 6: Verify**

```bash
docker ps
curl http://localhost:8080/actuator/health
curl http://localhost:3000/
```

### **Step 7: Check Status**

```bash
./check_health.sh
```

**Expected output:**
```
✅ Docker is running
✅ comparatio-backend: Up (healthy)
✅ comparatio-frontend: Up (healthy)
✅ comparatio-mongodb: Up (healthy)
✅ Application is RUNNING and HEALTHY!
```

### **Step 8: Access**

```
http://your-server-ip:3000

Login:
  Email: admin@talentcapital.com
  Password: admin
```

---

## 🔄 **Update Deployment**

When new images are pushed to Docker Hub:

```bash
docker compose pull
docker compose up -d
```

That's it! Takes 30 seconds.

---

## 📋 **All Commands**

```bash
# Deploy
docker compose up -d

# Stop
docker compose down

# Update
docker compose pull && docker compose up -d

# Logs
docker compose logs -f

# Status
docker compose ps

# Restart
docker compose restart
```

---

## 🎯 **What's Included**

### **Services:**
- ✅ MongoDB (database)
- ✅ Backend (Spring Boot API)
- ✅ Frontend (Next.js app)

### **Features:**
- ✅ Auto-restart on failure
- ✅ Health checks
- ✅ Persistent data volumes
- ✅ Internal networking
- ✅ Multi-architecture support (AMD64 + ARM64)

---

## ⚙️ **Configuration Variables**

Edit `.env` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_PORT` | 8080 | Backend API port |
| `FRONTEND_PORT` | 3000 | Frontend web port |
| `JAVA_OPTS` | "-Xmx1g -Xms512m" | Java memory settings |
| `MONGO_URI` | mongodb://mongodb:27017 | MongoDB connection |
| `JWT_SECRET` | (required) | **MUST CHANGE!** |

---

## 🔒 **Security Notes**

1. **Change JWT_SECRET** in production!
   ```bash
   # Generate secure secret
   openssl rand -hex 32
   ```

2. **Use external MongoDB** for production (recommended)

3. **Setup SSL/HTTPS** with Nginx reverse proxy

4. **Change default admin password** after first login

---

## 🌐 **Production Checklist**

- [ ] Docker installed on server
- [ ] Files copied to `/opt/comparatio`
- [ ] `.env` configured
- [ ] JWT_SECRET changed
- [ ] Logged in to Docker Hub
- [ ] Images pulled
- [ ] Services started
- [ ] Health checks passing
- [ ] Application accessible
- [ ] Admin password changed

---

## 🆘 **Troubleshooting**

### Cannot pull images

```bash
# Login again
docker logout
docker login -u talentcapital
```

### Port already in use

```bash
# Edit .env
BACKEND_PORT=8081
FRONTEND_PORT=3001
```

### Service unhealthy

```bash
# Check logs
docker compose logs backend
docker compose logs frontend
```

---

**That's it! Deploy anywhere with just 2 files!** 🎉

