# 🔐 Docker Hub Authentication for Private Images

## Issue: Images are Private on Docker Hub

If you see:
- `talentcapital/comparatio-backend: Private`
- `talentcapital/comparatio-frontend: Private`

You need to authenticate with Docker Hub first!

---

## ✅ **Solution: Login to Docker Hub**

### **Step 1: Login to Docker Hub**

```bash
# Login to Docker Hub
docker login -u talentcapital

# Enter your Docker Hub password when prompted
# Password: [enter your Docker Hub password/token]
```

**Or use an access token (more secure):**

```bash
# If you have an access token
docker login -u talentcapital
# Password: [paste your access token]
```

### **Step 2: Verify Login**

```bash
# Check if you're logged in
docker info | grep Username
# Should show: Username: talentcapital
```

### **Step 3: Pull Images**

```bash
cd /path/to/deploy-package

# Now pull should work
docker compose pull

# Or pull specific images to test
docker pull talentcapital/comparatio-backend:latest
docker pull talentcapital/comparatio-frontend:latest
```

---

## 🔑 **Creating Docker Hub Access Token**

If you don't have a password/token:

1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Give it a name (e.g., "production-server")
4. Set permissions: **Read** (to pull images)
5. Copy the token (you'll only see it once!)

Then use it:
```bash
docker login -u talentcapital
# Password: [paste the token]
```

---

## 🔄 **Persistent Login (Optional)**

Docker credentials are stored in `~/.docker/config.json`. You only need to login once per server (unless you logout or credentials expire).

---

## 🚀 **Full Deployment Sequence**

```bash
# 1. Login to Docker Hub
docker login -u talentcapital

# 2. Navigate to deploy directory
cd /path/to/deploy-package

# 3. Pull images
docker compose pull

# 4. Create .env file (optional, for custom settings)
cat > .env << 'EOF'
JWT_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF

# 5. Start services
docker compose up -d

# 6. Check status
docker compose ps
docker logs comparatio-backend-prod
docker logs comparatio-frontend-prod
```

---

## ❌ **Still Getting Errors?**

### Error: "unauthorized: authentication required"

```bash
# Make sure you're logged in
docker login -u talentcapital

# Verify
cat ~/.docker/config.json | grep talentcapital
```

### Error: "pull access denied"

- Check you're using the correct username
- Verify you have access to the `talentcapital` organization
- Make sure images exist: https://hub.docker.com/u/talentcapital

### Error: "permission denied" (Docker socket)

See `FIX_DOCKER_PERMISSIONS.md` - add user to docker group:
```bash
sudo usermod -aG docker $USER
# Then log out and back in
```

---

## ✅ **Quick Checklist**

- [ ] Docker Hub account has access to `talentcapital` organization
- [ ] Logged in: `docker login -u talentcapital`
- [ ] User in docker group: `groups` shows `docker`
- [ ] Can pull: `docker pull talentcapital/comparatio-backend:latest`
- [ ] Can compose: `docker compose pull`

---

**Once authenticated, `docker compose pull` should work!** ✅

