# 🚨 SECURITY INCIDENT RESPONSE GUIDE

## Critical: Your Server Has Been Compromised

Your DigitalOcean droplet (`ubuntu-s-2vcpu-4gb-fra1-01` at `167.172.186.0`) has been compromised and is being used for DDoS attacks. The server has been disconnected by DigitalOcean.

---

## ⚠️ IMMEDIATE ACTIONS REQUIRED

### 1. **DO NOT Reconnect the Compromised Server**
   - The server is compromised and should be considered untrustworthy
   - Any data on it may have been accessed or modified

### 2. **Assess What Was Running on That Server**
   - Check if this was your production server
   - Identify what services/data were on it
   - Determine if you need to recover data

### 3. **Choose Your Recovery Path**

---

## 🔍 ASSESSMENT: What Was on That Server?

**Check your deployment documentation to see:**
- Is `167.172.186.0` your production server?
- What was the last known IP/domain?
- What data/databases were stored there?

---

## 🛡️ RECOMMENDED RECOVERY PATHS

### **Path 1: Destroy and Rebuild (RECOMMENDED for most cases)**

**If you don't need data from the compromised server:**

1. **Create New Droplet** (fresh, secure)
2. **Deploy your application from scratch** using your Docker images
3. **Use your Docker Hub images** (they're safe - built from your code)
4. **Restore database** from backups (if you have them)

**Advantages:**
- ✅ Clean slate - no malware/backdoors
- ✅ Latest security patches
- ✅ Faster than troubleshooting

---

### **Path 2: Recover Data First (If needed)**

**If you have important data on the compromised server:**

1. **Follow DigitalOcean Recovery Guide:**
   - https://www.digitalocean.com/docs/droplets/resources/recovery-iso/

2. **Steps:**
   - Boot from recovery ISO
   - Mount the disk
   - Copy only essential data (database backups, config files)
   - **DO NOT copy binaries, system files, or anything executable**
   - Destroy the droplet after data recovery

3. **Validate all recovered data** for tampering

---

### **Path 3: Secure and Investigate (Advanced)**

**Only if you're confident and need to investigate:**

1. **Follow DigitalOcean DDoS Guide:**
   - https://www.digitalocean.com/docs/droplets/resources/ddos/

2. **Key steps:**
   - Boot from recovery ISO
   - Check logs: `/var/log/auth.log`, `/var/log/syslog`
   - Look for suspicious processes/users
   - Check crontabs: `crontab -l`, `/etc/crontab`
   - Review network connections: `netstat -antp`
   - Check for rootkits: `rkhunter`, `chkrootkit`

3. **Still recommended:** Rebuild fresh after investigation

---

## 🔒 SECURITY HARDENING FOR NEW DEPLOYMENT

### **1. Firewall Configuration (UFW)**

```bash
# On new server, set up firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port from 22 for security)
sudo ufw allow 22/tcp
# Or use custom port: sudo ufw allow 2222/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow backend (only if needed externally)
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### **2. SSH Security**

```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# Use key-based authentication only
# Set: PasswordAuthentication no

# Change default SSH port (optional)
# Set: Port 2222

# Restart SSH
sudo systemctl restart sshd
```

### **3. Keep System Updated**

```bash
# Regular updates
sudo apt update
sudo apt upgrade -y

# Auto-update security patches
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **4. Docker Security**

```bash
# Run containers as non-root
# (Your Dockerfiles should already do this)

# Limit container resources
# Add to docker-compose.yml:
#   deploy:
#     resources:
#       limits:
#         cpus: '1.0'
#         memory: 1G

# Use Docker secrets for sensitive data
# Never hardcode passwords/tokens
```

### **5. Application Security**

- ✅ **Use strong passwords** (change default admin password!)
- ✅ **Enable HTTPS** with Let's Encrypt
- ✅ **Rotate JWT secrets** after incident
- ✅ **Monitor logs** regularly
- ✅ **Set up fail2ban** for brute-force protection

```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for SSH
sudo nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 3
bantime = 3600
```

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🚀 DEPLOYING TO NEW SECURE SERVER

### **Step 1: Create New Droplet**

1. Go to DigitalOcean dashboard
2. Create new droplet (Ubuntu 22.04 or 24.04)
3. **Choose location different from compromised one**
4. Use SSH keys for authentication
5. Select same size: 2 vCPU, 4GB RAM

### **Step 2: Initial Server Setup**

```bash
# SSH into new server
ssh root@NEW_SERVER_IP

# Create non-root user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Setup firewall (see above)
# Setup SSH security (see above)
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Log out and back in for docker group to take effect
```

### **Step 3: Deploy Application**

```bash
# Clone repository (or copy files)
cd ~
git clone git@github.com:tcdigitaltools/comparatiotool.git
cd comparatiotool

# Copy environment configuration
cp infra/.env.example infra/.env
nano infra/.env

# IMPORTANT: Generate NEW JWT_SECRET
# Use: openssl rand -hex 32

# Pull images from Docker Hub
docker compose -f infra/docker-compose.prod.yml pull

# Start services
docker compose -f infra/docker-compose.prod.yml up -d

# Verify
docker compose -f infra/docker-compose.prod.yml ps
docker logs comparatio-backend-prod --tail=50
```

### **Step 4: Setup Nginx + SSL**

```bash
# Install Nginx and Certbot
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx (see your existing config)
# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 POST-DEPLOYMENT SECURITY CHECKLIST

- [ ] Firewall configured and enabled
- [ ] SSH secured (key-only, no root login)
- [ ] System updated (`apt update && apt upgrade`)
- [ ] Fail2ban installed and configured
- [ ] All default passwords changed
- [ ] JWT secret rotated (NEW secret generated)
- [ ] HTTPS/SSL enabled
- [ ] Docker containers running as non-root
- [ ] Regular backups configured
- [ ] Monitoring/logging enabled
- [ ] Database backups tested

---

## 📊 MONITORING & ALERTS

### **Setup Basic Monitoring**

```bash
# Monitor disk usage
df -h

# Monitor memory
free -h

# Monitor Docker containers
docker stats

# Setup log rotation
sudo nano /etc/logrotate.d/docker
```

```conf
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
```

### **Check for Unusual Activity**

```bash
# Check active connections
sudo netstat -tulpn

# Check running processes
ps aux | grep -v "\["

# Check login attempts
sudo last
sudo grep "Failed password" /var/log/auth.log

# Check Docker containers
docker ps -a
docker images
```

---

## 🗄️ DATABASE RECOVERY

### **If You Have MongoDB Backups:**

```bash
# On new server, restore from backup
mongorestore --host localhost:27017 --db compa_demo /path/to/backup

# Or if using Docker
docker exec -i comparatio-mongodb-prod mongorestore \
  --archive < /path/to/backup.archive
```

### **If You DON'T Have Backups:**

- Your data is likely lost from the compromised server
- **Start fresh** with new admin user
- This is why regular backups are critical!

---

## ⚡ QUICK ACTION SUMMARY

1. **DO NOT reconnect compromised server**
2. **Create new secure droplet**
3. **Deploy fresh from Docker Hub images**
4. **Rotate ALL secrets (JWT, passwords)**
5. **Secure the new server (firewall, SSH, updates)**
6. **Restore database from backups** (if available)
7. **Monitor and maintain security**

---

## 📞 NEXT STEPS

1. **Contact DigitalOcean** once you've chosen your path
2. **Inform your team** about the incident
3. **Review security practices** to prevent future incidents
4. **Set up regular backups** (if not already done)
5. **Implement monitoring** for unusual activity

---

## 🆘 NEED HELP?

If you need assistance with:
- Setting up the new server
- Configuring security
- Recovering data
- Deployment

Please let me know and I can help guide you through the process.

---

**Remember:** The compromised server should be destroyed after you've recovered any necessary data. Never reuse it or try to "clean" it - always start fresh.

