# 🔐 Login and Push to Private Docker Hub Repositories

## ✅ Repository Information Confirmed

- **Backend**: `talentcapital/comparatio-backend` (Private ✓)
- **Frontend**: `talentcapital/comparatio-frontend` (Private ✓)

These repositories **exist** on Docker Hub but are **private**, so you need proper authentication.

---

## 🔑 **STEP 1: Login to Docker Hub**

Run this command and enter the **talentcapital** credentials:

```bash
docker login -u talentcapital
```

**You'll be prompted:**
```
Password:
```

**Enter the password for the `talentcapital` Docker Hub account**
- This should be the password or access token for the talentcapital organization
- Characters won't show when typing (normal security behavior)

**Expected success:**
```
Login Succeeded
```

---

## ✅ **STEP 2: Verify Login**

Check you're logged in correctly:

```bash
docker info | grep Username
```

**Should show:**
```
Username: talentcapital
```

---

## 🚀 **STEP 3: Push Images**

```bash
./push_optimized_m3.sh
```

**This will now work** because you have proper authentication to the private repositories.

---

## 🔐 **Using Access Token (Recommended for Private Repos)**

For better security with private repositories, use an access token:

### **Create Access Token:**

1. Go to: https://hub.docker.com/settings/security
2. Login with `talentcapital` account
3. Click **"New Access Token"**
4. **Name**: `comparatio-m3-deploy`
5. **Access permissions**: Read, Write
6. **Click "Generate"**
7. **COPY THE TOKEN** (you can only see it once!)

### **Login with Token:**

```bash
docker login -u talentcapital
```

When prompted for password, **paste the access token** instead.

**Success:**
```
Login Succeeded
```

### **Then Push:**

```bash
./push_optimized_m3.sh
```

---

## ⚠️ **Common Authentication Issues**

### Issue: "Login Succeeded" but push still fails

**Cause**: Wrong account or insufficient permissions

**Solution**:
```bash
# Verify exact username
docker info | grep Username

# Should be: talentcapital
# If different, logout and login again
docker logout
docker login -u talentcapital
```

### Issue: "insufficient_scope: authorization failed"

**Cause**: Account doesn't have write permission to the organization

**Solutions**:
1. **Use organization owner credentials**
2. **Ask organization owner to grant you push access**
3. **Use an access token with Write permissions**

### Issue: Password keeps being rejected

**Cause**: Wrong password or 2FA enabled

**Solutions**:
1. **Use access token instead of password** (see above)
2. **Check if 2FA is enabled** → Must use access token
3. **Verify password** on Docker Hub website first

---

## 🎯 **Complete Workflow**

```bash
# 1. Logout (clean state)
docker logout

# 2. Login with talentcapital credentials
docker login -u talentcapital
# Enter password or access token when prompted

# 3. Verify login
docker info | grep Username
# Should show: Username: talentcapital

# 4. Push to private repositories
./push_optimized_m3.sh
```

---

## 📊 **What Happens After Successful Push**

Your private repositories will have:

```
talentcapital/comparatio-backend (Private)
├── latest (multi-arch)
│   ├── linux/arm64
│   └── linux/amd64
└── sha-b2eca4a (multi-arch)
    ├── linux/arm64
    └── linux/amd64

talentcapital/comparatio-frontend (Private)
├── latest (multi-arch)
│   ├── linux/arm64
│   └── linux/amd64
└── sha-b2eca4a (multi-arch)
    ├── linux/arm64
    └── linux/amd64
```

---

## 🔒 **Deploying Private Images**

When deploying from private repositories, you need to login on the server too:

```bash
# On production server
docker login -u talentcapital

# Then pull
docker compose -f infra/docker-compose.prod.yml pull
docker compose -f infra/docker-compose.prod.yml up -d
```

---

## ✅ **Ready to Push!**

**Run these commands:**

```bash
# Login
docker login -u talentcapital

# Verify
docker info | grep Username

# Push
./push_optimized_m3.sh
```

---

**The repositories exist and are ready - you just need proper authentication!** 🔐

