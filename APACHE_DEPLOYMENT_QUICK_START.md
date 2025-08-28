# 🚀 songIQ Apache Deployment - Quick Start Guide

## 📋 **What We've Created**

1. **`apache-songiq.conf`** - Apache configuration file
2. **`deploy-apache-songiq.sh`** - Automated deployment script
3. **This guide** - Step-by-step instructions

## 🎯 **What This Will Do**

- **Port 80**: Serve songIQ frontend (redirect to HTTPS)
- **Port 443**: Serve songIQ frontend with SSL
- **API Proxy**: Forward `/api/*` requests to your Node.js backend (port 5000)
- **React Router**: Handle client-side routing properly
- **Security Headers**: Add security best practices

## 🚀 **Deployment Steps**

### **Step 1: Copy Files to Server**
```bash
# From your local machine, copy the files to the server
scp apache-songiq.conf rthadmin@64.202.184.174:~/
scp deploy-apache-songiq.sh rthadmin@64.202.184.174:~/
```

### **Step 2: SSH to Server**
```bash
ssh rthadmin@64.202.184.174
```

### **Step 3: Run Deployment Script**
```bash
# Make script executable
chmod +x deploy-apache-songiq.sh

# Run the deployment
./deploy-apache-songiq.sh
```

## 🔧 **What the Script Does Automatically**

1. ✅ **Checks server compatibility**
2. ✅ **Backs up current Apache config**
3. ✅ **Installs songIQ configuration**
4. ✅ **Tests configuration syntax**
5. ✅ **Restarts Apache service**
6. ✅ **Verifies everything is working**

## 🌐 **After Deployment**

### **Test Locally on Server**
```bash
# Test frontend
curl http://localhost/

# Test API proxy
curl http://localhost/api/health
```

### **Update DNS (Required)**
In your GoDaddy DNS management:
```
Type: A
Name: @
Value: 64.202.184.174
TTL: 600

Type: A
Name: www
Value: 64.202.184.174
TTL: 600
```

### **Install SSL Certificates**
```bash
# Install certbot
sudo apt install certbot python3-certbot-apache -y

# Generate SSL certificate (after DNS is updated)
sudo certbot --apache -d songiq.com -d www.songiq.com
```

## 📁 **File Locations After Deployment**

- **Apache Config**: `/etc/httpd/conf.d/songiq.conf` (CentOS/RHEL)
- **Backup**: `/var/backups/apache/`
- **Logs**: `/var/log/httpd/songiq-*.log`

## 🔍 **Troubleshooting**

### **Apache Won't Start**
```bash
# Check configuration syntax
sudo httpd -t

# Check error logs
sudo journalctl -u httpd -f
```

### **API Proxy Not Working**
```bash
# Check if Node.js backend is running
pm2 status

# Test backend directly
curl http://localhost:5000/api/health
```

### **Frontend Not Loading**
```bash
# Check file permissions
ls -la /var/www/songiq-staging/client/

# Check Apache error logs
sudo tail -f /var/log/httpd/songiq-error.log
```

## 🎉 **Expected Result**

After successful deployment:
- **http://64.202.184.174/** → songIQ frontend
- **http://64.202.184.174/api/health** → API health check
- **https://songiq.com/** → songIQ with SSL (after DNS + SSL setup)

## ⚠️ **Important Notes**

1. **DNS must point to 64.202.184.174** before SSL setup
2. **Node.js backend must be running** on port 5000
3. **Backup is created** in `/var/backups/apache/`
4. **Script must run on the server** (not locally)

## 🆘 **Need Help?**

If something goes wrong:
1. Check the backup in `/var/backups/apache/`
2. Review Apache error logs
3. Verify Node.js backend is running
4. Check DNS propagation

---

**Ready to deploy? Run the script on your server and let's get songIQ running on standard HTTP/HTTPS ports!** 🚀
