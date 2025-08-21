# 🚀 songIQ Production Deployment Guide

## 📋 Overview

This guide covers the complete production deployment process for songIQ, including deployment, monitoring, maintenance, and emergency procedures.

## 🛠️ Available Scripts

### 1. **Main Deployment Script**
- **File**: `deploy-production.sh`
- **Purpose**: Deploy the application to production
- **Usage**: `./deploy-production.sh`

### 2. **Rollback Script**
- **File**: `rollback-production.sh`
- **Purpose**: Rollback to previous production version
- **Usage**: `./rollback-production.sh`

### 3. **Monitoring Script**
- **File**: `production-monitor.sh`
- **Purpose**: Monitor and maintain production systems
- **Usage**: `./production-monitor.sh`

## 🚀 Production Deployment Process

### **Step 1: Pre-Deployment Checklist**

Before running the deployment script, ensure:

- [ ] You're on the `main` branch
- [ ] All changes are committed and pushed
- [ ] Environment files are properly configured
- [ ] SSH key (`~/.ssh/songiq_deploy_key`) is set up
- [ ] Production server is accessible

### **Step 2: Run Deployment**

```bash
# Make script executable (if not already)
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh
```

The deployment script will:

1. **Verify Environment**: Check branch, uncommitted changes
2. **Build Application**: Install dependencies and build for production
3. **Create Package**: Package built files and configuration
4. **Deploy**: Upload and deploy to production server
5. **Health Checks**: Verify deployment success
6. **Cleanup**: Remove temporary files

### **Step 3: Post-Deployment Verification**

After deployment, verify:

- [ ] https://songiq.com loads correctly
- [ ] API endpoints are responding
- [ ] SSL certificate is valid
- [ ] PM2 processes are running
- [ ] No errors in logs

## 🔄 Rollback Process

### **When to Rollback**

- Critical bugs discovered in production
- Performance issues
- Security vulnerabilities
- User complaints about functionality

### **How to Rollback**

```bash
# Make script executable (if not already)
chmod +x rollback-production.sh

# Run rollback
./rollback-production.sh
```

The rollback script will:

1. **List Available Backups**: Show recent deployment backups
2. **Select Backup**: Choose which version to restore
3. **Execute Rollback**: Stop services, restore backup, restart
4. **Verify**: Run health checks to ensure rollback success

### **Rollback Considerations**

- **Downtime**: Brief downtime during rollback
- **Data Loss**: Any new data since deployment will be lost
- **Backup**: Current state is backed up before rollback

## 📊 Monitoring and Maintenance

### **Daily Monitoring**

Use the monitoring script for routine checks:

```bash
./production-monitor.sh
```

**Recommended Daily Checks:**

1. **Quick Health Check** (Option 1)
   - PM2 process status
   - Nginx status
   - Disk space and memory usage
   - Recent error logs

2. **System Resources** (Option 3)
   - CPU and memory usage
   - Disk usage
   - Load average

### **Weekly Maintenance**

1. **Log Cleanup** (Option 8)
   - Remove logs older than 30 days
   - Monitor log file sizes

2. **Full System Report** (Option 10)
   - Comprehensive system status
   - Performance metrics
   - Log analysis

### **Emergency Procedures**

#### **Emergency Stop** (Option 11)
- Stops all services immediately
- Use when critical issues are detected
- Requires typing 'STOP' to confirm

#### **Emergency Start** (Option 12)
- Restarts all services after emergency stop
- Uses ecosystem configuration
- Requires typing 'START' to confirm

## 🔧 Troubleshooting Common Issues

### **Service Won't Start**

```bash
# Check PM2 status
ssh rthadmin@songiq.com 'pm2 status'

# Check logs for errors
ssh rthadmin@songiq.com 'pm2 logs songiq-api --lines 20'

# Check system resources
ssh rthadmin@songiq.com 'free -h && df -h'
```

### **Application Not Responding**

```bash
# Test endpoints locally
curl -f https://songiq.com
curl -f https://songiq.com/api/health

# Check Nginx status
ssh rthadmin@songiq.com 'sudo systemctl status nginx'

# Check SSL certificate
openssl s_client -servername songiq.com -connect songiq.com:443
```

### **High Resource Usage**

```bash
# Monitor in real-time
ssh rthadmin@songiq.com 'pm2 monit'

# Check process details
ssh rthadmin@songiq.com 'pm2 show songiq-api'
ssh rthadmin@songiq.com 'pm2 show songiq-client'
```

## 📁 File Structure

### **Production Server Structure**
```
/var/www/songiq/
├── client/           # Built React application
├── server/           # Built Node.js API
├── uploads/          # File uploads
├── logs/             # Application logs
└── ecosystem.config.js # PM2 configuration
```

### **Backup Structure**
```
/var/backups/songiq/
├── backup-20241201-143022/  # Deployment backup
│   ├── client/
│   ├── server/
│   ├── uploads/
│   └── rollback.sh
└── rollback-backup-20241201-150000/  # Rollback backup
```

## 🔐 Security Considerations

### **SSH Key Management**
- Keep deployment SSH key secure
- Use passphrase protection
- Rotate keys periodically
- Limit key access to deployment team

### **Environment Files**
- Never commit `.env.production` files
- Use secure file permissions (644)
- Rotate secrets regularly
- Monitor for unauthorized access

### **SSL Certificate**
- Monitor certificate expiration
- Use strong cipher suites
- Enable HSTS
- Regular SSL Labs testing

## 📈 Performance Monitoring

### **Key Metrics to Track**

1. **Response Times**
   - API endpoint response times
   - Page load times
   - Database query performance

2. **Resource Usage**
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Network bandwidth

3. **Error Rates**
   - HTTP error codes
   - Application errors
   - Database connection issues

### **Monitoring Tools**

- **PM2**: Process management and monitoring
- **Nginx**: Web server metrics
- **System**: Resource monitoring
- **Custom Scripts**: Application-specific metrics

## 🚨 Emergency Contacts

### **Immediate Response**
- **Server Access**: `ssh rthadmin@songiq.com`
- **PM2 Commands**: `pm2 status`, `pm2 logs`
- **Nginx**: `sudo systemctl status nginx`

### **Escalation**
- **Development Team**: [Contact Information]
- **DevOps Team**: [Contact Information]
- **Hosting Provider**: [Contact Information]

## 📚 Additional Resources

### **Documentation**
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md)
- [STRIPE_SETUP_CHECKLIST.md](./STRIPE_SETUP_CHECKLIST.md)

### **Useful Commands**

```bash
# Check deployment status
./production-monitor.sh

# View recent logs
ssh rthadmin@songiq.com 'pm2 logs songiq-api --lines 50'

# Monitor system resources
ssh rthadmin@songiq.com 'pm2 monit'

# Generate system report
./production-monitor.sh  # Option 10

# Emergency procedures
./production-monitor.sh  # Options 11-12
```

## 🎯 Best Practices

### **Deployment**
- Always test on staging first
- Deploy during low-traffic periods
- Have rollback plan ready
- Monitor immediately after deployment

### **Monitoring**
- Set up automated alerts
- Regular health checks
- Log rotation and cleanup
- Performance baseline tracking

### **Security**
- Regular security updates
- Access control monitoring
- SSL certificate management
- Environment file security

---

**Last Updated**: $(date)
**Version**: 1.0
**Status**: Production Ready 🚀

---

*This guide should be updated whenever deployment procedures change or new features are added.*
