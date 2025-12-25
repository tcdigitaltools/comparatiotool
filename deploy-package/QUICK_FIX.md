# ⚡ Quick Fix for Docker Permission Error

## 🔧 **Two Issues Fixed:**

### **1. Docker Permission Error**

Run these commands on your server:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply the change (choose one):
# Option A: Log out and back in (recommended)
exit
# Then SSH back in

# Option B: Apply immediately (without logging out)
newgrp docker

# Test it works
docker ps
```

### **2. Docker Compose Image Names**

The `docker-compose.yml` file has been fixed to use the correct default image names:
- ✅ `talentcapital/comparatio-backend:latest`
- ✅ `talentcapital/comparatio-frontend:latest`

---

## ✅ **After Fixing:**

```bash
cd /path/to/deploy-package

# Pull images (should work now!)
docker compose pull

# Start services
docker compose up -d

# Check status
docker ps
```

---

## 📝 **Optional: Create .env File**

If you want to customize settings, create a `.env` file:

```bash
cat > .env << 'EOF'
# Ports
BACKEND_PORT=8080
FRONTEND_PORT=3000

# MongoDB
MONGO_URI=mongodb://mongodb:27017
MONGO_DB=compa_demo

# JWT Secret (CHANGE THIS!)
JWT_SECRET=$(openssl rand -hex 32)

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF

# Then use:
docker compose --env-file .env pull
docker compose --env-file .env up -d
```

---

**That's it! Your deployment should work now.** ✅

