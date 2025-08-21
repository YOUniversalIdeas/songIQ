# 🚀 songIQ Complete Deployment Guide

## 📋 **Overview**
This guide covers the complete deployment process for songIQ, including staging and production environments on GoDaddy VPS.

## 🌍 **Environment Architecture**

### **Staging Environment**
- **Server**: staging.songiq.com
- **Path**: `/var/www/songiq-staging`
- **Branch**: `staging`
- **Ports**: 3001 (frontend), 5000 (backend)
- **Purpose**: Testing and validation before production

### **Production Environment**
- **Server**: songiq.com
- **Path**: `/var/www/songiq`
- **Branch**: `main`
- **Ports**: 3001 (frontend), 5000 (backend)
- **Purpose**: Live application for end users

## 🛠️ **Prerequisites**

### **Server Requirements**
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **Node.js**: 18.x LTS
- **MongoDB**: 5.0+
- **Nginx**: Latest stable
- **PM2**: Process manager
- **SSL**: Let's Encrypt certificates

### **Domain Setup**
- **Staging**: staging.songiq.com → Staging server IP
- **Production**: songiq.com → Production server IP
- **DNS**: A records pointing to respective servers

## 🚀 **Deployment Process**

### **1. Staging Deployment**
```bash
# Ensure you're on staging branch
git checkout staging

# Deploy to staging
./deploy-staging.sh
```

### **2. Production Deployment**
```bash
# Ensure you're on main branch
git checkout main

# Deploy to production
./deploy-production.sh
```

## 📁 **File Structure**

```
songIQ/
├── deploy-staging.sh          # Staging deployment script
├── deploy-production.sh       # Production deployment script
├── ecosystem.config.js        # PM2 configuration
├── songiq/
│   ├── client/                # Frontend application
│   │   ├── .env.staging      # Staging environment
│   │   ├── .env.production   # Production environment
│   │   └── src/              # Source code
│   └── server/                # Backend application
│       ├── .env.staging      # Staging environment
│       ├── .env.production   # Production environment
│       └── src/              # Source code
└── DEPLOYMENT_COMPLETE_GUIDE.md
```

## 🔧 **Environment Configuration**

### **Staging Environment Variables**
- **API_URL**: https://staging.songiq.com/api
- **MONGODB_URI**: mongodb://localhost:27017/songiq-staging
- **NODE_ENV**: staging
- **PORT**: 5000

### **Production Environment Variables**
- **API_URL**: https://songiq.com/api
- **MONGODB_URI**: mongodb://localhost:27017/songiq
- **NODE_ENV**: production
- **PORT**: 5000

## 📊 **Monitoring & Maintenance**

### **PM2 Process Management**
```bash
# Check status
pm2 status

# View logs
pm2 logs songiq-api-staging
pm2 logs songiq-client-staging
pm2 logs songiq-api
pm2 logs songiq-client

# Monitor resources
pm2 monit
```

### **Nginx Configuration**
```bash
# Check Nginx status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **MongoDB Management**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Connect to database
mongosh songiq-staging    # Staging
mongosh songiq            # Production

# Backup database
mongodump --db songiq --out /backup/$(date +%Y%m%d)
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using the port
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>
```

#### **2. Permission Issues**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/songiq*
sudo chmod -R 755 /var/www/songiq*
```

#### **3. MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### **4. PM2 Process Issues**
```bash
# Restart all processes
pm2 restart all

# Delete and recreate processes
pm2 delete all
pm2 start ecosystem.config.js --env staging
pm2 start ecosystem.config.js --env production
```

## 🔒 **Security Considerations**

### **Firewall Configuration**
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **SSL Certificate Renewal**
```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

### **Regular Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update Node.js dependencies
npm update
```

## 📈 **Performance Optimization**

### **Nginx Configuration**
- Enable gzip compression
- Configure caching headers
- Optimize static file serving

### **PM2 Configuration**
- Use cluster mode for production
- Configure memory limits
- Enable automatic restarts

### **MongoDB Optimization**
- Enable indexing on frequently queried fields
- Configure connection pooling
- Monitor query performance

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code reviewed and tested
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] Server resources available

### **During Deployment**
- [ ] Backup current version
- [ ] Deploy new code
- [ ] Update environment variables
- [ ] Restart services
- [ ] Verify functionality

### **Post-Deployment**
- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify all features work
- [ ] Monitor performance metrics
- [ ] Update documentation

## 📞 **Support & Contact**

### **Emergency Contacts**
- **Server Issues**: GoDaddy VPS Support
- **Domain Issues**: GoDaddy Domain Support
- **Application Issues**: Development Team

### **Useful Commands**
```bash
# Quick health check
curl -I https://staging.songiq.com
curl -I https://songiq.com

# Check server resources
htop
df -h
free -h

# View recent logs
tail -100 /var/log/syslog
```

---

**Last Updated**: $(date)
**Version**: 1.0
**Maintained By**: songIQ Development Team
