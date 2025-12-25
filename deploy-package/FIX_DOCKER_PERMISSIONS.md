# 🔧 Fix Docker Permission Denied Error

## Error Message
```
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

This happens because your user doesn't have permission to access Docker.

---

## ✅ **Solution: Add User to Docker Group**

### **Step 1: Add Your User to Docker Group**

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Verify you're in the docker group
groups
# Should show: yourusername docker ...
```

### **Step 2: Apply Changes**

**Option A: Log out and back in (Recommended)**
```bash
# Log out
exit

# SSH back in
ssh user@your-server
```

**Option B: Use newgrp (Quick fix without logging out)**
```bash
newgrp docker
```

### **Step 3: Verify Docker Works**

```bash
# Test Docker command (should work without sudo)
docker ps

# Should show running containers or empty list (no errors)
```

---

## 🔍 **Alternative: Use Sudo (Temporary Fix)**

If you can't add user to docker group right now:

```bash
# Use sudo for all docker commands
sudo docker compose pull
sudo docker compose up -d
sudo docker ps
```

**But you'll need sudo for every docker command**, which is annoying.

---

## ✅ **After Fixing Permissions: Deploy**

Once permissions are fixed:

```bash
cd /path/to/deploy-package

# Pull images
docker compose pull

# Start services
docker compose up -d

# Check status
docker ps
```

---

## 🔐 **Security Note**

Adding user to docker group gives that user root-equivalent access (because Docker daemon runs as root). This is standard practice for Docker, but only do this for trusted users on the server.

---

## 📋 **Quick Checklist**

- [ ] Added user to docker group: `sudo usermod -aG docker $USER`
- [ ] Logged out and back in (or used `newgrp docker`)
- [ ] Tested: `docker ps` works without sudo
- [ ] Can run: `docker compose pull`
- [ ] Can run: `docker compose up -d`

---

## 🆘 **Still Having Issues?**

If you still get permission errors:

1. **Check Docker is running:**
   ```bash
   sudo systemctl status docker
   ```

2. **Check socket permissions:**
   ```bash
   ls -l /var/run/docker.sock
   # Should show: srw-rw---- 1 root docker
   ```

3. **Restart Docker (if needed):**
   ```bash
   sudo systemctl restart docker
   ```

4. **Verify your user is in docker group:**
   ```bash
   groups
   id
   ```

---

**Once fixed, you can proceed with deployment!**

