# 🍎 Apple M3 Docker Push Guide

## ✅ Great News: M3 is Perfect for Docker!

Your Apple M3 chip (ARM64) is **natively supported** and will build ARM images at full speed. AMD64 images will be emulated (slower but works perfectly).

---

## 🚀 **Quick Start - Push to Docker Hub**

### **One Command (Optimized for M3):**

```bash
./push_optimized_m3.sh
```

This script:
- ✅ Builds natively for ARM64 (fast on M3!)
- ✅ Builds via emulation for AMD64 (slower but necessary)
- ✅ Pushes both architectures
- ✅ Shows detailed progress
- ✅ Better error handling for network issues

---

## 📋 **Alternative: Use Make Command**

```bash
make push
```

Both methods do the same thing. The optimized script just has better progress output.

---

## ⏱️ **Expected Build Times on M3**

| Component | Architecture | Time | Speed |
|-----------|--------------|------|-------|
| **Backend** | ARM64 (native) | ~2-3 min | 🚀 Fast |
| **Backend** | AMD64 (emulated) | ~4-6 min | 🐌 Slower |
| **Frontend** | ARM64 (native) | ~1-2 min | 🚀 Fast |
| **Frontend** | AMD64 (emulated) | ~2-4 min | 🐌 Slower |

**Total: 10-20 minutes** (depending on internet speed)

---

## 🔍 **What's Happening During Build**

### Stage 1: Backend (Java + Maven)
```
[linux/arm64] ← Your M3 builds this natively (FAST!)
  ├─ Download Maven dependencies
  ├─ Compile Java code
  └─ Package JAR

[linux/amd64] ← Emulated build (slower)
  ├─ Download Maven dependencies
  ├─ Compile Java code
  └─ Package JAR

→ Push to talentcapital/comparatio-backend
```

### Stage 2: Frontend (Node + Next.js)
```
[linux/arm64] ← Your M3 builds this natively (FAST!)
  ├─ Install npm packages
  ├─ Build Next.js
  └─ Create standalone output

[linux/amd64] ← Emulated build (slower)
  ├─ Install npm packages
  ├─ Build Next.js
  └─ Create standalone output

→ Push to talentcapital/comparatio-frontend
```

---

## 🛠️ **Handling Network Errors**

If you see `ERROR: failed to receive status: rpc error: code = Unavailable desc = error reading from server: EOF`:

### **Solution 1: Retry (Recommended)**

Docker caches completed layers, so retrying is fast:

```bash
./push_optimized_m3.sh
```

Or:

```bash
make push
```

### **Solution 2: Build for M3 Only (Faster Testing)**

Test with ARM64 only first:

```bash
SHORT_SHA=$(git rev-parse --short HEAD)

# Backend ARM64 only
docker buildx build \
  --platform linux/arm64 \
  --file compa-ratio/BackEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-backend:latest-arm64 \
  --push \
  compa-ratio/BackEnd

# Frontend ARM64 only
docker buildx build \
  --platform linux/arm64 \
  --file FrontEnd/Dockerfile.llcompa_ratioll \
  --tag talentcapital/comparatio-frontend:latest-arm64 \
  --push \
  FrontEnd
```

### **Solution 3: Increase Docker Resources**

On M3, give Docker more resources:

1. Open **Docker Desktop**
2. Go to **Settings** → **Resources**
3. Increase:
   - **CPUs**: 6-8 (M3 has plenty!)
   - **Memory**: 8-12 GB
   - **Swap**: 2-4 GB
4. Click **Apply & Restart**

Then retry:
```bash
./push_optimized_m3.sh
```

---

## 🎯 **Complete Push Instructions for M3**

### **Step 1: Ensure You're Logged In**

```bash
docker login
```

Verify:
```bash
docker info | grep Username
```

Should show: `Username: talentcapital`

### **Step 2: Optimize Docker Desktop for M3**

**Recommended Settings:**
- **CPUs**: 6-8 cores (M3 has 8-12 cores)
- **Memory**: 8 GB
- **Swap**: 2 GB
- **Disk**: 60 GB minimum

### **Step 3: Push Images**

```bash
./push_optimized_m3.sh
```

**Or use Make:**
```bash
make push
```

### **Step 4: Monitor Progress**

The script will show detailed output. You'll see:

```
#1 [linux/arm64] building... ← Fast on M3!
#2 [linux/amd64] building... ← Emulated, slower
```

**ARM64 builds first** (native on M3) then AMD64 (emulated).

---

## 💡 **M3-Specific Optimizations**

### **Your Advantages:**

1. **✅ Native ARM64 Builds** - Blazing fast!
2. **✅ Modern Architecture** - Better performance
3. **✅ Docker Desktop Optimized** - Full M3 support
4. **✅ Rosetta 2 Emulation** - AMD64 builds work perfectly

### **Build Order on M3:**

Docker automatically prioritizes:
1. **ARM64** (native) - builds first, very fast
2. **AMD64** (emulated) - builds second, uses Rosetta

### **Cache Benefits:**

After first build, subsequent builds are much faster:
- **First push**: 10-20 minutes
- **Updates**: 2-5 minutes (uses cache)

---

## 🔧 **Troubleshooting M3-Specific Issues**

### Issue: "No space left on device"

**Your M3 Mac Solution:**
```bash
# Clean Docker
docker system prune -a --volumes -f

# Increase Docker Desktop disk
# Settings → Resources → Virtual disk limit: 80-100 GB
```

### Issue: Build hangs or times out

**Solution 1 - Restart Docker:**
```bash
# Restart Docker Desktop
# Or command line:
killall Docker && open /Applications/Docker.app
```

**Solution 2 - Rebuild builder:**
```bash
docker buildx rm comparatio-builder -f
docker buildx create --name comparatio-builder --driver docker-container --use --bootstrap
./push_optimized_m3.sh
```

### Issue: AMD64 build is slow

**This is normal!** AMD64 is emulated on M3:
- ARM64: ~3 minutes (native)
- AMD64: ~8 minutes (emulated via Rosetta 2)

**Be patient** - emulation works perfectly, just slower.

---

## 📊 **What Your M3 is Building**

### **Multi-Architecture Manifest:**

```
talentcapital/comparatio-backend:latest
├── linux/arm64 ← Built natively on your M3 🚀
└── linux/amd64 ← Built via Rosetta emulation 🔄

talentcapital/comparatio-frontend:latest
├── linux/arm64 ← Built natively on your M3 🚀
└── linux/amd64 ← Built via Rosetta emulation 🔄
```

### **Compatible With:**
- ✅ Your M3 Mac (arm64)
- ✅ Intel Macs (amd64)
- ✅ AWS Graviton (arm64)
- ✅ AWS EC2 Intel (amd64)
- ✅ Google Cloud (any architecture)
- ✅ Azure (any architecture)
- ✅ Any Linux server

---

## 🎬 **Complete Workflow Example**

```bash
# 1. Ensure logged in
docker login -u talentcapital

# 2. Check builder
docker buildx ls | grep comparatio-builder

# 3. Push images (optimized for M3)
./push_optimized_m3.sh
```

**Expected output:**
```
🍎 Optimized build for Apple M3 (ARM64)
📦 Docker Hub: talentcapital
🔖 Git SHA: b2eca4a

========================================
📦 STEP 1/2: Building Backend
========================================
Platform: linux/amd64,linux/arm64
Image: talentcapital/comparatio-backend

#1 [linux/arm64 builder] ...  ← Fast on M3!
#2 [linux/amd64 builder] ...  ← Emulated
...
✅ Backend pushed successfully!

========================================
🎨 STEP 2/2: Building Frontend
========================================
Platform: linux/amd64,linux/arm64
Image: talentcapital/comparatio-frontend

#1 [linux/arm64 builder] ...  ← Fast on M3!
#2 [linux/amd64 builder] ...  ← Emulated
...
✅ Frontend pushed successfully!

🎉 ALL DONE!
```

---

## 🔄 **If Build Fails Mid-Way**

Docker buildx uses caching! Just run again:

```bash
./push_optimized_m3.sh
```

It will **skip completed layers** and continue from where it failed.

---

## ✨ **M3 Performance Tips**

### **Maximize Build Speed:**

1. **Close unnecessary apps** during build
2. **Use wired internet** (not WiFi) if possible
3. **Allocate more resources to Docker:**
   - Docker Desktop → Settings → Resources
   - CPUs: 6-8
   - Memory: 10 GB
   - Swap: 2 GB

### **Monitor M3 During Build:**

```bash
# Open Activity Monitor to see:
# - Docker using 6-8 cores
# - Memory usage
# - Network activity

# Or use terminal:
top -pid $(pgrep -f docker-container)
```

---

## 📝 **Quick Reference**

| Task | Command | Time on M3 |
|------|---------|------------|
| **Push both** | `./push_optimized_m3.sh` | 10-20 min |
| **Push with Make** | `make push` | 10-20 min |
| **ARM64 only** | See "Build for M3 Only" above | 3-5 min |
| **Check builder** | `docker buildx ls` | Instant |
| **Restart builder** | `docker buildx rm comparatio-builder -f && make buildx-init` | 1 min |

---

## 🎯 **Ready to Push?**

Run this command:

```bash
./push_optimized_m3.sh
```

**Sit back and let your M3 do the work!** ☕

---

## 🆘 **Need Help?**

**If network errors persist:**
1. Retry 2-3 times (Docker caches progress)
2. Check internet connection
3. Restart Docker Desktop
4. Try during off-peak hours

**For other issues:**
- Check `DOCKER_HUB_PUSH.md` - Full troubleshooting guide
- Check `infra/README.md` - Infrastructure documentation

---

**Your M3 is ready to build multi-architecture Docker images!** 🚀

