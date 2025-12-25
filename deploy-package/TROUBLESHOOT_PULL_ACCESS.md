# 🔍 Troubleshoot: Pull Access Denied for Private Images

## Error: "pull access denied for talentcapital/comparatio-frontend"

This means Docker can't authenticate or you don't have access to the repository.

---

## ✅ **Step 1: Verify Docker Hub Login**

```bash
# Check if you're logged in
cat ~/.docker/config.json | grep -A 2 "auths"

# Or check with docker info
docker info | grep Username
# Should show: Username: talentcapital
```

If not logged in or wrong user:
```bash
# Login again
docker login -u talentcapital
# Enter password/token when prompted
```

---

## ✅ **Step 2: Test Pull Manually**

```bash
# Try pulling each image individually
docker pull talentcapital/comparatio-backend:latest
docker pull talentcapital/comparatio-frontend:latest
```

This will show you **exactly which image** is failing.

---

## ✅ **Step 3: Verify Images Exist**

Check if images exist on Docker Hub:

1. Go to: https://hub.docker.com/u/talentcapital
2. Look for:
   - `comparatio-backend`
   - `comparatio-frontend`

**Are they there?** If not, they need to be pushed first.

---

## ✅ **Step 4: Check Organization Access**

The images are in the `talentcapital` organization. Make sure:

1. Your Docker Hub account has access to `talentcapital` organization
2. You're using the correct username (the one with access)
3. Your account is a member/collaborator of the organization

**To check:**
- Go to: https://hub.docker.com/orgs/talentcapital/members
- Verify your account is listed

---

## ✅ **Step 5: Use Access Token Instead of Password**

If password doesn't work, use an access token:

```bash
# Logout first
docker logout

# Login with token
docker login -u talentcapital
# Password: [paste your access token]
```

**Creating Access Token:**
1. Go to: https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name: "production-server"
4. Permissions: **Read** (to pull images)
5. Copy token and use it as password

---

## ✅ **Step 6: Check Image Names Match**

Verify the exact image names in Docker Hub match what's in docker-compose.yml:

```bash
# Check what docker-compose is trying to pull
docker compose config | grep image

# Should show:
# image: talentcapital/comparatio-backend:latest
# image: talentcapital/comparatio-frontend:latest
```

**Make sure names match exactly** (case-sensitive, no typos).

---

## ✅ **Step 7: If Images Don't Exist - Push Them**

If the images don't exist on Docker Hub yet, push them:

**From your local machine:**
```bash
cd /Users/wasiq/Downloads/llcompa_ratioll

# Login to Docker Hub
docker login -u talentcapital

# Make sure images are built and pushed
make push

# Or manually:
docker push talentcapital/comparatio-backend:latest
docker push talentcapital/comparatio-frontend:latest
```

---

## 🔍 **Common Issues & Solutions**

### Issue: "repository does not exist"
**Solution:** Images haven't been pushed to Docker Hub yet. Push them first.

### Issue: "pull access denied" but images exist
**Solution:** 
- Your account doesn't have access to `talentcapital` organization
- Or you're logged in with wrong account
- Or you need to use an access token

### Issue: Works for one image but not the other
**Solution:** Check if both images exist and you have access to both.

### Issue: Login works but pull doesn't
**Solution:** 
- Clear Docker credentials and login again
- Use access token instead of password
- Verify organization membership

---

## 🚀 **Quick Diagnostic Commands**

Run these to diagnose:

```bash
# 1. Check login status
docker info | grep Username

# 2. Test backend pull
docker pull talentcapital/comparatio-backend:latest

# 3. Test frontend pull
docker pull talentcapital/comparatio-frontend:latest

# 4. Check docker-compose config
docker compose config | grep image

# 5. Check credentials file
cat ~/.docker/config.json | grep -A 5 auths
```

---

## ✅ **Expected Successful Output**

When working correctly:
```bash
$ docker pull talentcapital/comparatio-backend:latest
latest: Pulling from talentcapital/comparatio-backend
...
Status: Downloaded newer image for talentcapital/comparatio-backend:latest
```

---

**Start with Step 1 and work through each step to identify the exact issue!**

