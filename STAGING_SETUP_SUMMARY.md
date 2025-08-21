# 🚀 songIQ Staging Environment Setup

## 📋 **Quick Reference**

### **Server Details**
- **IP Address**: 64.202.184.174
- **Domain**: staging.songiq.com
- **Path**: `/var/www/songiq-staging`
- **Branch**: `staging`

### **Required Software**
- ✅ Node.js 18.x LTS
- ✅ MongoDB 5.0+
- ✅ Nginx
- ✅ PM2
- ✅ SSL Certificate

## 🚀 **Deployment Commands**

### **Deploy to Staging**
```bash
# Ensure you're on staging branch
git checkout staging

# Deploy
./deploy-staging.sh
```

### **Check Staging Status**
```bash
# SSH into staging server
ssh root@64.202.184.174

# Check PM2 processes
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check MongoDB
sudo systemctl status mongod
```

## 🌐 **Access URLs**

- **Frontend**: https://staging.songiq.com
- **API**: https://staging.songiq.com/api
- **Health Check**: https://staging.songiq.com/health

## 📊 **Monitoring**

### **PM2 Processes**
- `songiq-api-staging` - Backend API
- `songiq-client-staging` - Frontend

### **Logs Location**
- **API Logs**: `/var/www/songiq-staging/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **MongoDB Logs**: `/var/log/mongodb/`

## 🔧 **Environment Variables**

### **Client (.env.staging)**
```
VITE_API_URL=https://staging.songiq.com/api
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

### **Server (.env.staging)**
```
NODE_ENV=staging
PORT=5000
MONGODB_URI=mongodb://localhost:27017/songiq-staging
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Port conflicts**: Check if port 5000 is available
2. **Permission issues**: Fix file ownership
3. **MongoDB connection**: Verify MongoDB is running
4. **SSL issues**: Check certificate validity

### **Quick Fixes**
```bash
# Restart all services
pm2 restart all
sudo systemctl reload nginx

# Check logs
pm2 logs songiq-api-staging
sudo tail -f /var/log/nginx/error.log
```

---

**Last Updated**: $(date)
**Status**: Ready for Deployment
