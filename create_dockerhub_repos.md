# Create Docker Hub Repositories

## 🎯 You Need to Create These Repositories First

Before pushing, create these on Docker Hub:

1. **`comparatio-backend`**
2. **`comparatio-frontend`**

---

## 📝 **Method 1: Via Docker Hub Website (Easiest)**

### Step-by-Step:

1. **Login to Docker Hub**
   - Go to: https://hub.docker.com
   - Login with username: `talentcapital`

2. **Create Backend Repository**
   - Click **"Repositories"** → **"Create Repository"**
   - **Name**: `comparatio-backend`
   - **Visibility**: Public ✅ (or Private)
   - **Description**: "Comparatio Backend - Java Spring Boot API"
   - Click **"Create"**

3. **Create Frontend Repository**
   - Click **"Create Repository"** again
   - **Name**: `comparatio-frontend`
   - **Visibility**: Public ✅ (or Private)
   - **Description**: "Comparatio Frontend - Next.js Application"
   - Click **"Create"**

4. **Verify**
   - You should see:
     - `talentcapital/comparatio-backend`
     - `talentcapital/comparatio-frontend`

5. **Now Push**
   ```bash
   ./push_optimized_m3.sh
   ```

---

## 📝 **Method 2: Use Your Own Account**

If you don't have access to `talentcapital`:

1. **Use YOUR Docker Hub username instead**

2. **Update configuration:**
   ```bash
   nano infra/.env
   ```

   Change to:
   ```bash
   DOCKERHUB_USERNAME=your_username
   BACKEND_IMAGE=your_username/comparatio-backend
   FRONTEND_IMAGE=your_username/comparatio-frontend
   ```

3. **Login with your account:**
   ```bash
   docker logout
   docker login
   # Enter YOUR username and password
   ```

4. **Push (repos will auto-create):**
   ```bash
   ./push_optimized_m3.sh
   ```

---

## 🔑 **Method 3: Verify Your Credentials**

Make sure you're logged in with the right account:

```bash
# Check current login
docker info | grep Username

# Should show: Username: talentcapital
```

If not showing `talentcapital`, login again:

```bash
docker logout
docker login -u talentcapital
# Enter the correct password/token
```

---

## ✅ **After Creating Repos**

Once the repositories exist on Docker Hub:

```bash
./push_optimized_m3.sh
```

This will successfully push both images with multi-architecture support!

---

## 🆘 **Still Getting "Access Denied"?**

### Possible Reasons:

1. **Repository doesn't exist** → Create it on Docker Hub
2. **Wrong credentials** → Login with correct password
3. **No permission** → You need admin/write access to `talentcapital` org
4. **Organization restriction** → Contact organization owner

### **Quick Check:**

Can you see these repositories?
- https://hub.docker.com/r/talentcapital/comparatio-backend
- https://hub.docker.com/r/talentcapital/comparatio-frontend

- **If YES** → You're logged in wrong, try `docker logout && docker login`
- **If NO (404)** → Create them first (see Method 1 above)

---

## 🎯 **Summary**

**Either:**

**A) Create repos on Docker Hub →** Then `./push_optimized_m3.sh`

**OR**

**B) Use your own account →** Update `infra/.env` → Then `./push_optimized_m3.sh`

---

**Choose one method and proceed!** 🚀

