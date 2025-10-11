# 🔍 How to Check if Application is Running on Server

## ⚡ Quick Check Commands

### **1. Check All Containers**

```bash
docker ps
```

**Expected output (if running):**
```
NAMES                       STATUS                   PORTS
comparatio-frontend         Up 5 minutes (healthy)   0.0.0.0:3000->3000/tcp
comparatio-backend          Up 5 minutes (healthy)   0.0.0.0:8080->8080/tcp
comparatio-mongodb          Up 5 minutes (healthy)   0.0.0.0:27017->27017/tcp
```

**Look for:**
- ✅ **STATUS**: Should say "Up" and "(healthy)"
- ✅ **PORTS**: Should show port mappings
- ❌ **"Restarting"**: Something is wrong
- ❌ **"Exited"**: Container crashed

---

### **2. Check with Docker Compose**

```bash
docker compose ps
```

**Expected output:**
```
NAME                       IMAGE                                    STATUS
comparatio-backend         talentcapital/comparatio-backend:latest  Up (healthy)
comparatio-frontend        talentcapital/comparatio-frontend:latest Up (healthy)
comparatio-mongodb         mongo:7.0                                Up (healthy)
```

---

### **3. Check Health Endpoints**

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Expected: {"status":"UP","components":{"mongo":{"status":"UP"},...}}
```

```bash
# Frontend health
curl http://localhost:3000/

# Expected: HTML content with "Compa Ratio"
```

---

### **4. Check Specific Service Status**

```bash
# Check backend
docker inspect comparatio-backend --format='{{.State.Status}}'
# Expected: running

# Check if healthy
docker inspect comparatio-backend --format='{{.State.Health.Status}}'
# Expected: healthy
```

---

## 📊 **Detailed Status Check**

### **Complete Health Check Script**

```bash
#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Comparatio Application Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✅ Docker is installed"

# Check containers
echo ""
echo "📦 Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep comparatio || echo "❌ No comparatio containers running"

echo ""
echo "🏥 Health Checks:"

# Backend health
if curl -f -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy (port 8080)"
    curl -s http://localhost:8080/actuator/health | grep -o '"status":"[^"]*"' | head -1
else
    echo "❌ Backend health check failed"
fi

# Frontend health
if curl -f -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Frontend is healthy (port 3000)"
else
    echo "❌ Frontend health check failed"
fi

# MongoDB
if docker exec comparatio-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is healthy (port 27017)"
else
    echo "❌ MongoDB health check failed"
fi

echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   Backend:  http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Save as `check_status.sh` and run:
```bash
chmod +x check_status.sh
./check_status.sh
```

---

## 🔍 **Detailed Checks**

### **Check Container Logs**

```bash
# All services
docker compose logs

# Last 100 lines
docker compose logs --tail=100

# Follow logs (live)
docker compose logs -f

# Specific service
docker logs comparatio-backend
docker logs comparatio-frontend
docker logs comparatio-mongodb

# Last 50 lines, following
docker logs comparatio-backend --tail=50 -f
```

---

### **Check Resource Usage**

```bash
# Real-time stats
docker stats

# Expected output:
# NAME                  CPU %   MEM USAGE / LIMIT     MEM %
# comparatio-backend    2.5%    800MiB / 2GiB        40%
# comparatio-frontend   0.5%    200MiB / 2GiB        10%
# comparatio-mongodb    1.0%    400MiB / 2GiB        20%
```

---

### **Check Networks**

```bash
# List networks
docker network ls | grep comparatio

# Expected:
# comparatio-network-prod   bridge    local

# Inspect network
docker network inspect comparatio-network-prod
```

---

### **Check Volumes**

```bash
# List volumes
docker volume ls | grep comparatio

# Expected:
# comparatio-mongodb-data-prod
# comparatio-backend-uploads-prod

# Check volume size
docker system df -v | grep comparatio
```

---

## 🌐 **External Access Check**

### **From Outside the Server**

```bash
# From your Mac or any computer
curl http://your-server-ip:3000/
curl http://your-server-ip:8080/actuator/health
```

### **Check if Ports are Open**

```bash
# On server, check listening ports
sudo lsof -i :3000
sudo lsof -i :8080
sudo lsof -i :27017

# Or use netstat
sudo netstat -tlnp | grep -E ':(3000|8080|27017)'

# Or use ss
sudo ss -tlnp | grep -E ':(3000|8080|27017)'
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: Containers not showing in `docker ps`**

**Check all containers (including stopped):**
```bash
docker ps -a | grep comparatio
```

**If status is "Exited":**
```bash
# Check why it exited
docker logs comparatio-backend

# Restart it
docker start comparatio-backend
# Or restart all
docker compose up -d
```

---

### **Issue: Container is "Restarting"**

**Meaning:** Container keeps crashing and Docker is auto-restarting it.

**Solution:**
```bash
# Check logs to see error
docker logs comparatio-backend --tail=100

# Common causes:
# - MongoDB not accessible
# - Port already in use
# - Out of memory
# - Configuration error
```

---

### **Issue: Health Check Failing**

**Check health status:**
```bash
docker inspect comparatio-backend --format='{{json .State.Health}}' | jq .
```

**If unhealthy, check:**
```bash
# View health check logs
docker inspect comparatio-backend | grep -A 10 Health

# Check if port is responding
curl -v http://localhost:8080/actuator/health
```

---

### **Issue: Port is blocked/not accessible**

**Check firewall:**
```bash
# Ubuntu/Debian
sudo ufw status
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp

# Check if port is listening
sudo lsof -i :3000
sudo lsof -i :8080
```

---

## 📱 **Quick Status Dashboard**

Create this alias in your `.bashrc` or `.zshrc`:

```bash
alias comparatio-status='echo "━━━ Comparatio Status ━━━" && \
  docker ps --format "{{.Names}}: {{.Status}}" | grep comparatio && \
  echo "" && \
  echo "Backend Health:" && curl -s http://localhost:8080/actuator/health | grep -o "\"status\":\"[^\"]*\"" | head -1 && \
  echo "Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)" && \
  echo "━━━━━━━━━━━━━━━━━━━━━━━"'
```

**Then just run:**
```bash
comparatio-status
```

---

## 🎯 **Complete Monitoring Commands**

| Check | Command | What to Look For |
|-------|---------|------------------|
| **Running?** | `docker ps` | "Up" status |
| **Healthy?** | `docker ps` | "(healthy)" |
| **Backend?** | `curl localhost:8080/actuator/health` | `"status":"UP"` |
| **Frontend?** | `curl localhost:3000` | HTTP 200 |
| **Logs?** | `docker compose logs -f` | No errors |
| **Resources?** | `docker stats` | CPU/Memory usage |
| **Ports?** | `sudo lsof -i :3000 -i :8080` | Ports listening |

---

## 🔧 **Troubleshooting Commands**

```bash
# Restart everything
docker compose restart

# Restart specific service
docker compose restart backend

# Stop and start fresh
docker compose down
docker compose up -d

# Pull updates and restart
docker compose pull
docker compose up -d

# View detailed container info
docker inspect comparatio-backend

# Check container processes
docker top comparatio-backend

# Execute command inside container
docker exec -it comparatio-backend sh
```

---

## 📈 **Monitoring in Real-Time**

### **Watch Container Status**

```bash
watch -n 5 'docker ps --format "table {{.Names}}\t{{.Status}}"'
```

### **Monitor Logs**

```bash
# Follow all logs
docker compose logs -f

# Follow specific service
docker logs comparatio-backend -f

# Filter for errors
docker compose logs | grep -i error
docker compose logs | grep -i exception
```

---

## ✅ **Complete Health Check Example**

Run this on your server:

```bash
echo "🔍 Checking Comparatio Application..."
echo ""

# 1. Docker running?
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running"
else
    echo "❌ Docker is not running"
    exit 1
fi

# 2. Containers running?
RUNNING=$(docker ps --filter "name=comparatio" --format "{{.Names}}" | wc -l)
echo "📦 Running containers: $RUNNING / 3"
docker ps --filter "name=comparatio" --format "  → {{.Names}}: {{.Status}}"

# 3. Health checks
echo ""
echo "🏥 Health Checks:"

# Backend
if curl -f -s http://localhost:8080/actuator/health > /dev/null; then
    echo "  ✅ Backend: http://localhost:8080"
else
    echo "  ❌ Backend: Failed"
fi

# Frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "  ✅ Frontend: http://localhost:3000"
else
    echo "  ❌ Frontend: Failed"
fi

# 4. Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo ""
echo "🌐 Access at:"
echo "   http://$SERVER_IP:3000"
echo ""
echo "Done! ✅"
```

---

## 🎯 **Quick Status Commands Summary**

```bash
# Are containers running?
docker ps

# Are they healthy?
docker ps | grep healthy

# Check backend
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:3000/

# View logs
docker compose logs -f

# Resource usage
docker stats

# Full info
docker compose ps
```

---

**Save these commands! You'll use them every time you check your server.** 📋

