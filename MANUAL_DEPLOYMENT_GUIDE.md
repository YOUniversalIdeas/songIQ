# 🚀 songIQ Manual Deployment Guide

## 📦 **Deployment Package Ready!**

Your deployment package has been created successfully: `deploy-package-20250911-150803`

## 🎯 **Manual Deployment Steps**

Since we need SSH access to your staging server, here's how to deploy manually:

### **Step 1: Upload Files to Server**

**Option A: Using SCP (if you have SSH access)**
```bash
# Upload the deployment package
scp -r deploy-package-20250911-150803 root@64.202.184.174:/tmp/

# SSH into the server
ssh root@64.202.184.174
```

**Option B: Using File Manager (if you have web access)**
1. Upload the `deploy-package-20250911-150803` folder to your server
2. Extract it to `/tmp/` directory

### **Step 2: Deploy on Server**

Once you have access to the server, run these commands:

```bash
# Navigate to deployment directory
cd /tmp/deploy-package-20250911-150803

# Stop existing services
pm2 stop all 2>/dev/null || true

# Backup current deployment
if [ -d "/var/www/songiq-staging" ]; then
    echo "Backing up current deployment..."
    tar -czf /var/backups/songiq-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /var/www songiq-staging
fi

# Create application directory
mkdir -p /var/www/songiq-staging

# Copy new files
cp -r client /var/www/songiq-staging/
cp -r server /var/www/songiq-staging/
cp ecosystem.config.js /var/www/songiq-staging/

# Copy environment files
cp server.env /var/www/songiq-staging/server/.env
cp client.env /var/www/songiq-staging/client/.env

# Set permissions
chown -R root:root /var/www/songiq-staging
chmod -R 755 /var/www/songiq-staging

# Create logs directory
mkdir -p /var/www/songiq-staging/logs

echo "Deployment files copied successfully"
```

### **Step 3: Set Up Database**

```bash
# Run database setup
chmod +x setup-database.sh
./setup-database.sh
```

### **Step 4: Start Services**

```bash
# Start services
cd /var/www/songiq-staging
pm2 start ecosystem.config.js --env production
pm2 save

# Check status
pm2 status
```

### **Step 5: Test Deployment**

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test songs endpoint
curl http://localhost:5000/api/songs

# Test frontend
curl http://localhost:4173/
```

---

## 🔧 **Alternative: Use Your Existing Staging Setup**

Since your staging server is already working perfectly, you can also:

### **Option 1: Update Existing Staging**
```bash
# SSH into your server
ssh root@64.202.184.174

# Navigate to current staging directory
cd /var/www/songiq-staging

# Update with new files (upload the deploy package first)
# Copy new client files
cp -r /tmp/deploy-package-20250911-150803/client/* client/

# Copy new server files
cp -r /tmp/deploy-package-20250911-150803/server/* server/

# Update environment files
cp /tmp/deploy-package-20250911-150803/server.env server/.env
cp /tmp/deploy-package-20250911-150803/client.env client/.env

# Restart services
pm2 restart all
```

### **Option 2: Convert Staging to Production**

Since your staging server is working perfectly, you can convert it to production by:

1. **Update DNS** to point songiq.com to 64.202.184.174
2. **Install SSL certificate** after DNS update
3. **Configure Nginx** as reverse proxy
4. **Update environment variables** for production

---

## 📋 **What's in the Deployment Package**

```
deploy-package-20250911-150803/
├── client/                    # Built React application
│   ├── index.html
│   └── assets/
├── server/                    # Built Node.js API
│   ├── dist/
│   └── src/
├── ecosystem.config.js        # PM2 configuration
├── server.env                 # Server environment variables
├── client.env                 # Client environment variables
├── setup-database.sh          # Database setup script
└── setup-api-keys.sh          # API keys setup script
```

---

## 🎯 **Quick Deployment Commands**

If you have SSH access, you can run this single command:

```bash
# Upload and deploy in one go
scp -r deploy-package-20250911-150803 root@64.202.184.174:/tmp/ && \
ssh root@64.202.184.174 "cd /tmp/deploy-package-20250911-150803 && \
  pm2 stop all 2>/dev/null || true && \
  mkdir -p /var/www/songiq-staging && \
  cp -r client server ecosystem.config.js /var/www/songiq-staging/ && \
  cp server.env /var/www/songiq-staging/server/.env && \
  cp client.env /var/www/songiq-staging/client/.env && \
  chmod +x setup-database.sh && ./setup-database.sh && \
  cd /var/www/songiq-staging && \
  pm2 start ecosystem.config.js --env production && \
  pm2 save && \
  echo 'Deployment completed successfully!'"
```

---

## ✅ **Verification Steps**

After deployment, verify everything is working:

```bash
# Check PM2 status
pm2 status

# Test API endpoints
curl http://64.202.184.174:5000/api/health
curl http://64.202.184.174:5000/api/songs

# Test frontend
curl http://64.202.184.174:4173/

# Check logs
pm2 logs songiq-api
```

---

## 🚀 **Next Steps After Deployment**

1. **Update DNS** to point songiq.com to 64.202.184.174
2. **Install SSL certificate** (after DNS update)
3. **Configure Nginx** reverse proxy
4. **Set up monitoring** and backups
5. **Configure API keys** for full functionality

---

## 📞 **Need Help?**

If you encounter any issues:

1. **Check the logs**: `pm2 logs songiq-api`
2. **Verify services**: `pm2 status`
3. **Test endpoints**: Use the curl commands above
4. **Check permissions**: Ensure files are owned by root

Your songIQ application is ready to deploy! 🎵✨
