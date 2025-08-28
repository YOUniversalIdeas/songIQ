# 🚀 songIQ Apache Deployment Guide for AlmaLinux 8.10

## 📋 **System Information**
- **OS**: AlmaLinux 8.10 (RHEL-based)
- **Apache**: httpd (not apache2)
- **Config Path**: `/etc/httpd/conf.d/`
- **Service**: `httpd`

## 🎯 **What We'll Do**
1. **Install required Apache modules** for proxy functionality
2. **Configure Apache** to serve songIQ on ports 80/443
3. **Handle SELinux permissions** properly
4. **Test the configuration** step by step

## 🚀 **Step-by-Step Deployment**

### **Step 1: Install Required Apache Modules**
```bash
# Install proxy modules
sudo dnf install mod_proxy mod_proxy_http mod_rewrite mod_headers -y

# Verify modules are installed
sudo httpd -M | grep -E "(proxy|rewrite|headers)"
```

### **Step 2: Backup Current Apache Configuration**
```bash
# Create backup directory
sudo mkdir -p /var/backups/apache
sudo cp -r /etc/httpd/conf.d/* /var/backups/apache/
sudo cp /etc/httpd/conf/httpd.conf /var/backups/apache/httpd.conf.backup

echo "✅ Backup created in /var/backups/apache/"
```

### **Step 3: Install songIQ Configuration**
```bash
# Copy the configuration file
sudo cp apache-songiq-almalinux.conf /etc/httpd/conf.d/songiq.conf

# Set proper permissions
sudo chown root:root /etc/httpd/conf.d/songiq.conf
sudo chmod 644 /etc/httpd/conf.d/songiq.conf

echo "✅ Configuration file installed"
```

### **Step 4: Test Apache Configuration**
```bash
# Test configuration syntax
sudo httpd -t

# If successful, you'll see: "Syntax OK"
# If there are errors, check the configuration file
```

### **Step 5: Handle SELinux Permissions**
```bash
# Check SELinux status
getenforce

# If SELinux is "Enforcing", we need to set proper contexts
if [ "$(getenforce)" = "Enforcing" ]; then
    echo "🔒 SELinux is enforcing - setting proper contexts..."
    
    # Set SELinux context for web content
    sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/songiq-staging/client(/.*)?"
    sudo restorecon -Rv /var/www/songiq-staging/client/
    
    # Allow Apache to connect to network (for proxy)
    sudo setsebool -P httpd_can_network_connect 1
    
    echo "✅ SELinux contexts configured"
else
    echo "ℹ️  SELinux is not enforcing"
fi
```

### **Step 6: Restart Apache**
```bash
# Restart Apache service
sudo systemctl restart httpd

# Check status
sudo systemctl status httpd

# If successful, you should see "active (running)"
```

### **Step 7: Test Configuration**
```bash
# Test HTTP access locally
curl -I http://localhost/

# Test API proxy
curl http://localhost/api/health

# Check Apache error logs if there are issues
sudo tail -f /var/log/httpd/songiq-error.log
```

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Apache Won't Start**
```bash
# Check configuration syntax
sudo httpd -t

# Check error logs
sudo journalctl -u httpd -f

# Check if port 80 is already in use
sudo netstat -tlnp | grep :80
```

### **Issue 2: Permission Denied**
```bash
# Check file permissions
ls -la /etc/httpd/conf.d/songiq.conf

# Check SELinux contexts
ls -Z /etc/httpd/conf.d/songiq.conf
ls -Z /var/www/songiq-staging/client/

# Fix SELinux contexts if needed
sudo restorecon -Rv /var/www/songiq-staging/client/
```

### **Issue 3: Proxy Not Working**
```bash
# Check if Node.js backend is running
pm2 status

# Test backend directly
curl http://localhost:5000/api/health

# Check Apache proxy modules
sudo httpd -M | grep proxy
```

### **Issue 4: Frontend Not Loading**
```bash
# Check file permissions
ls -la /var/www/songiq-staging/client/

# Check Apache error logs
sudo tail -f /var/log/httpd/songiq-error.log

# Check if files exist
ls -la /var/www/songiq-staging/client/index.html
```

## 🌐 **After Successful Deployment**

### **Test External Access**
```bash
# Test from your local machine
curl http://64.202.184.174/
curl http://64.202.184.174/api/health
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
# Install certbot for AlmaLinux
sudo dnf install certbot python3-certbot-apache -y

# Generate SSL certificate (after DNS is updated)
sudo certbot --apache -d songiq.com -d www.songiq.com
```

## 📁 **File Locations**
- **Apache Config**: `/etc/httpd/conf.d/songiq.conf`
- **Backup**: `/var/backups/apache/`
- **Logs**: `/var/log/httpd/songiq-*.log`
- **Web Content**: `/var/www/songiq-staging/client/`

## 🎉 **Expected Result**
After successful deployment:
- **http://64.202.184.174/** → songIQ frontend
- **http://64.202.184.174/api/health** → API health check
- **https://songiq.com/** → songIQ with SSL (after DNS + SSL setup)

## ⚠️ **Important Notes**
1. **Run commands as root or with sudo**
2. **SELinux contexts must be set correctly**
3. **Apache modules must be installed**
4. **Backup is created before changes**
5. **Test configuration before restarting**

---

**Ready to deploy? Follow the steps above and let's get songIQ running on standard HTTP/HTTPS ports!** 🚀
