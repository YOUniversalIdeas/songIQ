# 🚀 songIQ Production Deployment - Step by Step Guide

## 📋 **Current Status Summary**

### ✅ **What's Working (Staging)**
- **Server**: 64.202.184.174 (fully operational)
- **Frontend**: http://64.202.184.174:4173/ (accessible)
- **API**: http://64.202.184.174:5000/api/health (working)
- **Builds**: Production builds ready
- **Database**: MongoDB connected

### ⚠️ **What Needs to be Fixed for Production**
- **DNS**: songiq.com points to 99.83.161.153 (needs to point to 64.202.184.174)
- **SSL**: No HTTPS certificate configured
- **Nginx**: Not configured as reverse proxy
- **Environment**: Production env files created but need real API keys
- **Ports**: 80/443 already in use (need to configure properly)

---

## 🎯 **Step 1: Test Staging Application Thoroughly**

### **1.1 Frontend Testing**
```bash
# Test frontend accessibility
curl -I http://64.202.184.174:4173/
# Should return: HTTP/1.1 200 OK

# Test in browser
open http://64.202.184.174:4173/
```

**Manual Tests to Perform:**
- [ ] Page loads completely
- [ ] All CSS and JavaScript assets load
- [ ] React app initializes without errors
- [ ] Navigation works
- [ ] Forms are functional
- [ ] No console errors

### **1.2 API Testing**
```bash
# Test health endpoint
curl http://64.202.184.174:5000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test songs endpoint
curl http://64.202.184.174:5000/api/songs
# Expected: [] (empty array)

# Test market trends
curl http://64.202.184.174:5000/api/market/trends/pop
# Expected: Market data or error (expected without real API keys)

# Test success calculation
curl -X POST http://64.202.184.174:5000/api/success/calculate \
  -H "Content-Type: application/json" \
  -d '{"audioFeatures": {"danceability": 0.8, "energy": 0.7}}'
# Expected: Success calculation response
```

### **1.3 Run Automated Tests**
```bash
# Run production readiness check
./check-production-readiness.sh

# Run API integration tests
cd songiq && node test-api-integrations.js

# Run production monitoring (if available)
./production-monitor.sh
```

---

## 🔧 **Step 2: Configure Production Environment**

### **2.1 Update Environment Files**
The production environment files have been created:
- `songiq/client/env.production`
- `songiq/server/env.production`

**You need to update these with your real production API keys:**

```bash
# Edit client production environment
nano songiq/client/env.production

# Edit server production environment  
nano songiq/server/env.production
```

**Required API Keys to Configure:**
- [ ] Stripe production keys (pk_live_... and sk_live_...)
- [ ] SendGrid API key for emails
- [ ] Spotify API credentials
- [ ] Other music industry API keys
- [ ] Social media API tokens

### **2.2 Build Production Applications**
```bash
# Build client
cd songiq/client
npm run build

# Build server
cd ../server
npm run build
```

---

## 🌐 **Step 3: Configure DNS and SSL**

### **3.1 Update DNS Records**
**Current Issue**: songiq.com points to 99.83.161.153
**Required**: Point to 64.202.184.174

**DNS Records to Update:**
```
A Record: songiq.com → 64.202.184.174
A Record: www.songiq.com → 64.202.184.174
```

**Wait for DNS propagation** (can take up to 48 hours, usually 1-2 hours)

### **3.2 Install SSL Certificate**
```bash
# SSH into production server
ssh root@64.202.184.174

# Install Nginx (if not already installed)
sudo apt update
sudo apt install nginx -y

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (only after DNS is updated)
sudo certbot --nginx -d songiq.com -d www.songiq.com
```

---

## ⚙️ **Step 4: Configure Nginx Reverse Proxy**

### **4.1 Create Nginx Configuration**
```bash
# SSH into server
ssh root@64.202.184.174

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/songiq.com
```

**Nginx Configuration:**
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name songiq.com www.songiq.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name songiq.com www.songiq.com;
    
    # SSL configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/songiq.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/songiq.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Client (React app)
    location / {
        root /var/www/songiq-staging/client;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **4.2 Enable Nginx Configuration**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/songiq.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🚀 **Step 5: Deploy to Production**

### **5.1 Update PM2 Configuration**
```bash
# SSH into server
ssh root@64.202.184.174

# Update PM2 ecosystem for production
cd /var/www/songiq-staging
nano ecosystem.config.js
```

**Production PM2 Configuration:**
```javascript
module.exports = {
  apps: [
    {
      name: 'songiq-api',
      script: './server/dist/index.js',
      cwd: '/var/www/songiq-staging',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    }
  ]
};
```

### **5.2 Deploy Application Files**
```bash
# From your local machine
cd /Users/allanrestrepo/Documents/GitHub/songIQ

# Run production deployment script
./deploy-production.sh
```

**Or manual deployment:**
```bash
# Build applications
cd songiq/client && npm run build
cd ../server && npm run build

# Copy files to server
scp -r songiq/client/dist root@64.202.184.174:/var/www/songiq-staging/client/
scp -r songiq/server/dist root@64.202.184.174:/var/www/songiq-staging/server/
scp songiq/server/env.production root@64.202.184.174:/var/www/songiq-staging/server/.env
```

### **5.3 Start Production Services**
```bash
# SSH into server
ssh root@64.202.184.174

# Navigate to application directory
cd /var/www/songiq-staging

# Start PM2 processes
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

---

## ✅ **Step 6: Verify Production Deployment**

### **6.1 Test Production URLs**
```bash
# Test HTTPS frontend
curl -I https://songiq.com/
# Should return: HTTP/2 200

# Test API health
curl https://songiq.com/api/health
# Should return: {"status":"ok","timestamp":"..."}

# Test SSL certificate
openssl s_client -servername songiq.com -connect songiq.com:443
```

### **6.2 Run Production Monitoring**
```bash
# Use the production monitoring script
./production-monitor.sh

# Choose option 1: Quick Health Check
# Choose option 5: Test Application Endpoints
# Choose option 6: Check SSL Certificate
```

### **6.3 Manual Verification Checklist**
- [ ] https://songiq.com loads correctly
- [ ] https://www.songiq.com redirects properly
- [ ] API endpoints respond correctly
- [ ] SSL certificate is valid and trusted
- [ ] No mixed content warnings
- [ ] All forms and features work
- [ ] Mobile responsiveness works
- [ ] Performance is acceptable

---

## 🔧 **Step 7: Configure Monitoring and Maintenance**

### **7.1 Set Up Log Rotation**
```bash
# SSH into server
ssh root@64.202.184.174

# Configure logrotate
sudo nano /etc/logrotate.d/songiq
```

**Logrotate Configuration:**
```
/var/www/songiq-staging/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}
```

### **7.2 Set Up Automated Backups**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-songiq.sh
```

**Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/songiq"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/songiq_$DATE.tar.gz /var/www/songiq-staging

# Backup database
mongodump --db songiq-production --out $BACKUP_DIR/mongodb_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -exec rm -rf {} \;
```

### **7.3 Set Up Cron Jobs**
```bash
# Edit crontab
sudo crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-songiq.sh

# Weekly log cleanup
0 3 * * 0 find /var/www/songiq-staging/logs -name "*.log" -mtime +30 -delete
```

---

## 🚨 **Step 8: Security Hardening**

### **8.1 Configure Firewall**
```bash
# SSH into server
ssh root@64.202.184.174

# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow MongoDB (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 27017

# Check status
sudo ufw status
```

### **8.2 Secure MongoDB**
```bash
# Enable MongoDB authentication
sudo nano /etc/mongod.conf

# Add these lines:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod

# Create admin user
mongo
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})
```

### **8.3 Update System Packages**
```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 📊 **Step 9: Performance Optimization**

### **9.1 Enable Gzip Compression**
```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/songiq.com

# Add gzip configuration inside the server block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### **9.2 Configure PM2 Clustering**
```bash
# Update PM2 configuration for better performance
pm2 start ecosystem.config.js --env production -i max
```

---

## 🎯 **Step 10: Final Verification**

### **10.1 Complete Production Checklist**
- [ ] DNS updated and propagated
- [ ] SSL certificate installed and valid
- [ ] Nginx configured and running
- [ ] PM2 processes running
- [ ] Database connected and secured
- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Performance optimized

### **10.2 Run Final Tests**
```bash
# Test all endpoints
curl https://songiq.com/
curl https://songiq.com/api/health
curl https://songiq.com/api/songs

# Test SSL
curl -I https://songiq.com/

# Check performance
curl -w "@curl-format.txt" -o /dev/null -s https://songiq.com/
```

### **10.3 Monitor for 24 Hours**
- Check logs regularly
- Monitor resource usage
- Test all functionality
- Verify user experience

---

## 🆘 **Emergency Procedures**

### **Rollback Plan**
```bash
# If issues occur, rollback to staging
ssh root@64.202.184.174
cd /var/www/songiq-staging
pm2 stop all
# Restore from backup
pm2 start ecosystem.config.js --env staging
```

### **Emergency Contacts**
- **Server Access**: root@64.202.184.174
- **Domain**: songiq.com
- **Monitoring**: Use production-monitor.sh script

---

## 📚 **Useful Commands Reference**

```bash
# Check service status
pm2 status
sudo systemctl status nginx
sudo systemctl status mongod

# View logs
pm2 logs songiq-api
sudo tail -f /var/log/nginx/error.log

# Monitor resources
pm2 monit
htop

# Test endpoints
curl -I https://songiq.com/
curl https://songiq.com/api/health

# Restart services
pm2 restart all
sudo systemctl reload nginx
```

---

**🎉 Congratulations! Your songIQ application should now be running in production!**

**Next Steps:**
1. Monitor the application for 24-48 hours
2. Set up automated monitoring alerts
3. Configure regular backups
4. Plan for scaling as traffic grows
5. Implement additional security measures as needed
