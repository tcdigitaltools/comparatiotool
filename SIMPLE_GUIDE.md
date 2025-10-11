# 🎯 Simple Guide - Push & Deploy

Two questions answered simply:

---

## ❓ Question 1: How to Push to Docker Hub When Working Locally?

### **Answer: 3 Commands**

```bash
# 1. Login (enter password when prompted)
docker login -u talentcapital

# 2. Push to Docker Hub
./push_optimized_m3.sh

# 3. Done!
```

**That's it!** Your images are now on Docker Hub.

### **Full Workflow (With Code Changes):**

```bash
# Make changes to code
# ... edit files ...

# Test locally
make up           # Start locally
# Test at http://localhost:3000
make down         # Stop

# Commit
git add .
git commit -m "Your changes"

# Push to Docker Hub
docker login -u talentcapital  # Login once
./push_optimized_m3.sh         # Push images (10-20 min)

# Push to GitHub
git push origin main
```

---

## ❓ Question 2: How to Host on Server to Make it Live?

### **Answer: First Time Setup**

```bash
# SSH to your server
ssh ubuntu@your-server-ip

# Install Docker (one-time)
curl -fsSL https://get.docker.com | sudo sh
sudo apt-get install docker-compose-plugin -y

# Clone repo
git clone https://github.com/tcdigitaltools/comparatiotool.git
cd comparatiotool

# Configure
cp infra/.env.example infra/.env
nano infra/.env  # Edit settings

# Login to Docker Hub (to pull private images)
docker login -u talentcapital

# Pull and start
make prod-pull   # Pull images from Docker Hub
make prod-up     # Start services

# Access your live app
http://your-server-ip:3000
```

### **Answer: Updating Production**

```bash
# SSH to server
ssh ubuntu@your-server-ip
cd comparatiotool

# Pull latest images
make prod-pull

# Restart
make prod-up
```

---

## 📊 **Visual Flow**

```
┌──────────────────┐
│   YOUR MAC M3    │
│                  │
│ 1. Edit code     │
│ 2. Test locally  │
│ 3. Push to       │
│    Docker Hub    │ ──┐
└──────────────────┘   │
                       │
                       ↓
              ┌─────────────────┐
              │   DOCKER HUB    │
              │  (talentcapital)│
              │                 │
              │ Backend:latest  │
              │ Frontend:latest │
              └─────────────────┘
                       │
                       ↓
              ┌─────────────────┐
              │ PRODUCTION      │
              │ SERVER          │
              │                 │
              │ 1. Pull images  │
              │ 2. Start        │
              │ 3. Go LIVE!     │
              └─────────────────┘
```

---

## 🔑 **Important: Private Repository Access**

Since your repos are **private**, you MUST login on both:

**On Mac (to push):**
```bash
docker login -u talentcapital
```

**On Server (to pull):**
```bash
docker login -u talentcapital
```

---

## ⚡ **Super Quick Reference**

### **Push from Mac:**
```bash
docker login -u talentcapital
./push_optimized_m3.sh
```

### **Deploy on Server:**
```bash
docker login -u talentcapital
make prod-pull
make prod-up
```

---

## 🆘 **Current Issue: Login**

You're getting "push access denied" because you need to login with the **correct credentials**.

**Fix it:**
```bash
docker logout
docker login -u talentcapital
# Enter the CORRECT password or access token

# Then try again:
./push_optimized_m3.sh
```

---

**That's it! Two simple workflows.** 🚀

**For complete details, see:** `COMPLETE_WORKFLOW_GUIDE.md`

