# 🚀 songIQ Production Deployment Checklist

## ✅ **Pre-Deployment Checklist**

### **1. Environment Configuration** ✅ COMPLETED
- [x] **Client Production Environment** (`songiq/client/.env.production`)
  - [x] `VITE_API_URL=https://songiq.com/api`
  - [x] `VITE_STRIPE_PUBLISHABLE_KEY` configured
  - [x] `VITE_ENABLE_ANALYTICS=true`
  - [x] `VITE_ENABLE_DEBUG_MODE=false`

- [x] **Server Production Environment** (`songiq/server/.env.production`)
  - [x] `NODE_ENV=production`
  - [x] `PORT=5000`
  - [x] **Email System**: SendGrid configured and tested ✅
  - [x] **Stripe**: All keys and price IDs configured
  - [x] **Security**: JWT_SECRET, SESSION_SECRET configured
  - [x] **CORS**: Production origins configured
  - [x] **Production Features**: Compression, metrics, health checks enabled

### **2. Application Status** ✅ COMPLETED
- [x] **Superadmin Access**: Working login credentials
- [x] **Email System**: Fully functional with SendGrid
- [x] **Debug Code**: Removed from all components
- [x] **Build System**: TypeScript compilation working
- [x] **Dependencies**: All packages installed

### **3. Database & Services** ⚠️ NEEDS VERIFICATION
- [ ] **MongoDB**: Verify production database connection
- [ ] **Redis**: Verify production Redis instance (optional, for sessions)
- [ ] **File Storage**: Verify uploads directory permissions

---

## 🏗️ **Build & Test Phase**

### **4. Build Applications**
```bash
# Build client (React app)
cd songiq/client
npm run build

# Build server (Node.js API)
cd ../server
npm run build
```

### **5. Test Production Builds**
```bash
# Test client build
cd songiq/client
npm run preview

# Test server build
cd ../server
npm start
```

---

## 🌐 **Server Infrastructure Requirements**

### **6. Production Server Setup**
- [ ] **Domain**: `songiq.com` DNS configured
- [ ] **SSL Certificate**: HTTPS enabled
- [ ] **Nginx**: Reverse proxy configured
- [ ] **PM2**: Process manager installed
- [ ] **Firewall**: Ports 80, 443, 5000 open

### **7. Required Server Software**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm nginx redis-server
sudo npm install -g pm2

# Or CentOS/RHEL
sudo yum install -y nodejs npm nginx redis
sudo npm install -g pm2
```

---

## 📁 **Deployment Structure**

### **8. Target Directory Structure**
```
/var/www/songiq/
├── client/           # Built React app
├── server/           # Built Node.js API
├── uploads/          # File uploads
├── logs/             # Application logs
└── ecosystem.config.js
```

### **9. Nginx Configuration**
```nginx
server {
    listen 80;
    server_name songiq.com www.songiq.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name songiq.com www.songiq.com;
    
    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Client (React app)
    location / {
        root /var/www/songiq/client;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🚀 **Deployment Commands**

### **10. Automated Deployment**
```bash
# Run the deployment script
./deploy-production.sh
```

### **11. Manual Deployment Steps**
```bash
# 1. Build applications
npm run build:all

# 2. Create deployment package
mkdir deploy-package
cp -r songiq/client/dist deploy-package/client/
cp -r songiq/server/dist deploy-package/server/
cp songiq/server/.env.production deploy-package/server.env
cp songiq/client/.env.production deploy-package/client.env

# 3. Upload to server
scp -r deploy-package deploy@songiq.com:/tmp/

# 4. Deploy on server
ssh deploy@songiq.com
cd /tmp/deploy-package
# ... deployment steps
```

---

## 🔧 **Post-Deployment Verification**

### **12. Health Checks**
- [ ] **Frontend**: https://songiq.com loads correctly
- [ ] **API**: https://songiq.com/api/health responds
- [ ] **Email**: SendGrid test emails working
- [ ] **Database**: MongoDB connection successful
- [ ] **File Uploads**: Upload functionality working
- [ ] **Authentication**: Login/logout working

### **13. Performance Monitoring**
- [ ] **PM2 Status**: `pm2 status`
- [ ] **Logs**: Check for errors in `/var/www/songiq/logs/`
- [ ] **Nginx**: `sudo systemctl status nginx`
- [ ] **SSL**: https://www.ssllabs.com/ssltest/

---

## 🚨 **Critical Security Checklist**

### **14. Security Verification**
- [ ] **Environment Files**: Not committed to git
- [ ] **API Keys**: All production keys configured
- [ ] **CORS**: Only production domains allowed
- [ ] **Rate Limiting**: Enabled and configured
- [ ] **HTTPS**: SSL certificate valid and enforced
- [ ] **Firewall**: Unnecessary ports closed

---

## 📞 **Emergency Procedures**

### **15. Rollback Plan**
```bash
# Quick rollback to previous version
ssh deploy@songiq.com
cd /var/www/songiq
pm2 stop songiq-api songiq-client
# Restore from backup
pm2 start ecosystem.config.js --env production
```

### **16. Contact Information**
- **Server Access**: deploy@songiq.com
- **Domain**: songiq.com
- **SSL Provider**: [Your SSL provider]
- **Hosting**: [Your hosting provider]

---

## 🎯 **Next Steps**

1. **Verify all checkboxes above** ✅
2. **Set up production server infrastructure**
3. **Configure DNS and SSL**
4. **Run deployment script**
5. **Verify all functionality**
6. **Monitor performance and logs**

---

## 📚 **Useful Commands**

```bash
# Check deployment status
pm2 status
pm2 logs songiq-api
pm2 logs songiq-client

# Monitor system resources
pm2 monit
htop

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# View application logs
tail -f /var/www/songiq/logs/production-api-error.log
tail -f /var/www/songiq/logs/production-client-error.log
```

---

**Last Updated**: $(date)
**Status**: Ready for Production Deployment 🚀
