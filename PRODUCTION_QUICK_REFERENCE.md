# 🚀 songIQ Production Quick Reference

## 📋 Essential Commands

### **Deployment**
```bash
# Deploy to production
./deploy-production.sh

# Rollback to previous version
./rollback-production.sh

# Monitor production systems
./production-monitor.sh
```

### **Quick Health Checks**
```bash
# Check PM2 status
ssh rthadmin@songiq.com 'pm2 status'

# View recent logs
ssh rthadmin@songiq.com 'pm2 logs songiq-api --lines 20'

# Check system resources
ssh rthadmin@songiq.com 'free -h && df -h'

# Test endpoints
curl -f https://songiq.com
curl -f https://songiq.com/api/health
```

## 🚨 Emergency Procedures

### **Stop All Services**
```bash
ssh rthadmin@songiq.com 'pm2 stop all'
```

### **Start All Services**
```bash
ssh rthadmin@songiq.com 'cd /var/www/songiq && pm2 start ecosystem.config.js --env production'
```

### **Restart Specific Service**
```bash
# Restart API only
ssh rthadmin@songiq.com 'pm2 restart songiq-api'

# Restart client only
ssh rthadmin@songiq.com 'pm2 restart songiq-client'
```

## 📊 Monitoring Commands

### **Real-time Monitoring**
```bash
# PM2 monitoring dashboard
ssh rthadmin@songiq.com 'pm2 monit'

# Watch logs in real-time
ssh rthadmin@songiq.com 'pm2 logs songiq-api --follow'
```

### **System Status**
```bash
# Nginx status
ssh rthadmin@songiq.com 'sudo systemctl status nginx'

# SSL certificate info
openssl s_client -servername songiq.com -connect songiq.com:443
```

## 🔧 Troubleshooting

### **Service Issues**
```bash
# Check if service is running
ssh rthadmin@songiq.com 'pm2 list | grep songiq-api'

# View service details
ssh rthadmin@songiq.com 'pm2 show songiq-api'

# Check error logs
ssh rthadmin@songiq.com 'pm2 logs songiq-api --err --lines 50'
```

### **Permission Issues**
```bash
# Fix file permissions
ssh rthadmin@songiq.com 'sudo chown -R www-data:www-data /var/www/songiq'
ssh rthadmin@songiq.com 'sudo chmod -R 755 /var/www/songiq'
```

## 📁 File Locations

### **Production Server**
- **Application**: `/var/www/songiq/`
- **Logs**: `/var/www/songiq/logs/`
- **Backups**: `/var/backups/songiq/`
- **PM2 Logs**: `~/.pm2/logs/`

### **Local Scripts**
- **Deploy**: `./deploy-production.sh`
- **Rollback**: `./rollback-production.sh`
- **Monitor**: `./production-monitor.sh`

## 🔐 SSH Access

### **Connection**
```bash
ssh -i ~/.ssh/songiq_deploy_key rthadmin@songiq.com
```

### **Key Management**
```bash
# Check key permissions
ls -la ~/.ssh/songiq_deploy_key

# Fix key permissions if needed
chmod 600 ~/.ssh/songiq_deploy_key
```

## 📈 Performance Monitoring

### **Resource Usage**
```bash
# CPU and memory
ssh rthadmin@songiq.com 'top -bn1'

# Disk usage
ssh rthadmin@songiq.com 'df -h'

# Process count
ssh rthadmin@songiq.com 'ps aux | wc -l'
```

### **Network**
```bash
# Active connections
ssh rthadmin@songiq.com 'netstat -tlnp | grep :5000'

# Nginx access logs
ssh rthadmin@songiq.com 'sudo tail -f /var/log/nginx/access.log'
```

## 🧹 Maintenance

### **Log Cleanup**
```bash
# Clean old PM2 logs
ssh rthadmin@songiq.com 'find ~/.pm2/logs -name "*.log" -mtime +30 -delete'

# Clean application logs
ssh rthadmin@songiq.com 'find /var/www/songiq/logs -name "*.log" -mtime +30 -delete'
```

### **Backup Management**
```bash
# List available backups
ssh rthadmin@songiq.com 'ls -la /var/backups/songiq/'

# Check backup sizes
ssh rthadmin@songiq.com 'du -sh /var/backups/songiq/*'
```

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] On `main` branch
- [ ] All changes committed
- [ ] SSH key accessible
- [ ] Production server reachable

### **Post-Deployment**
- [ ] https://songiq.com loads
- [ ] API responds to health check
- [ ] PM2 processes running
- [ ] No errors in logs
- [ ] SSL certificate valid

## 📞 Emergency Contacts

- **Server**: `ssh rthadmin@songiq.com`
- **PM2**: `pm2 status`, `pm2 logs`
- **Nginx**: `sudo systemctl status nginx`
- **SSL**: `openssl s_client -servername songiq.com -connect songiq.com:443`

---

**Quick Access**: Run `./production-monitor.sh` for interactive monitoring menu
**Full Guide**: See [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md)
