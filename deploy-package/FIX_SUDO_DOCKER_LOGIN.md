# 🔧 Fix: Docker Login with Sudo Issue

## Problem

You logged in as user `cleavr`, but when using `sudo docker`, it uses **root's Docker credentials** (not yours), so authentication fails.

---

## ✅ **Solution 1: Add User to Docker Group (Recommended)**

This lets you use Docker **without sudo**, so your login credentials work:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Apply the change
newgrp docker

# Or log out and back in
exit
# Then SSH back in

# Verify you're in docker group
groups
# Should show: cleavr docker ...

# Now test (without sudo)
docker ps
docker pull talentcapital/comparatio-frontend:latest
```

**Now you can use your Docker Hub login!**

```bash
# Your login as cleavr will work
docker compose pull
docker compose up -d
```

---

## ✅ **Solution 2: Login as Root (Quick Fix)**

If you must use `sudo`, login as root:

```bash
# Login as root
sudo docker login -u talentcapital

# Enter password/token when prompted

# Now sudo docker commands will work
sudo docker compose pull
sudo docker compose up -d
```

**But you'll need sudo for every docker command**, which is annoying.

---

## 🎯 **Recommended: Use Solution 1**

Add user to docker group once, then never need sudo again:

```bash
# One-time setup
sudo usermod -aG docker cleavr
newgrp docker

# Now use docker normally (no sudo needed)
docker compose pull
docker compose up -d
docker ps
docker logs comparatio-backend-prod
```

---

## ✅ **Full Deployment (After Fixing)**

```bash
# 1. Make sure you're logged in (as cleavr, not root)
docker login -u talentcapital

# 2. Navigate to deploy directory
cd ~/qv9lmhft3up2x01y14885.cleavr.one/current

# 3. Pull images (no sudo needed if you used Solution 1)
docker compose pull

# 4. Start services
docker compose up -d

# 5. Check status
docker compose ps
docker logs comparatio-backend-prod --tail=50
docker logs comparatio-frontend-prod --tail=50
```

---

## 🔍 **Verify It Works**

```bash
# Test pull without sudo (after Solution 1)
docker pull talentcapital/comparatio-backend:latest
docker pull talentcapital/comparatio-frontend:latest

# Should pull successfully!
```

---

**Use Solution 1 (add to docker group) for the best experience!** ✅

