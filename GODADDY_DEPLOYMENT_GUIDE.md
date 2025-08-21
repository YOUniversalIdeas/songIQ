# 🚀 songIQ GoDaddy Production Deployment Guide

## 🚨 **Quick Troubleshooting - If Commands Don't Work**

### **Common Issues & Solutions:**
1. **"Command not found" errors**: Your VPS might have a different Linux distribution
2. **Permission denied**: Make sure you're using `sudo` for system commands
3. **Firewall commands fail**: See the detailed troubleshooting section below
4. **Package installation fails**: Update your package manager first

### **First Steps if You're Stuck:**
```bash
# Check your system
cat /etc/os-release
uname -a

# Update package manager
sudo apt update && sudo apt upgrade -y
# OR for CentOS/RHEL:
# sudo yum update -y
```

## 📋 **GoDaddy Hosting Options for songIQ**

### **Recommended GoDaddy Solutions:**

#### **1. VPS Hosting (Recommended)**
- **Best for**: Full control, scalability, performance
- **Plans**: Linux VPS starting from $4.99/month
- **Benefits**: Root access, custom software installation, dedicated resources
- **Perfect for**: songIQ's Node.js + MongoDB requirements

#### **2. Dedicated Server**
- **Best for**: High traffic, maximum performance
- **Plans**: Starting from $89.99/month
- **Benefits**: Complete server control, maximum resources
- **Overkill for**: Most songIQ deployments initially

#### **3. Web Hosting Plus (Not Recommended)**
- **Why not**: Limited Node.js support, no MongoDB, restricted access
- **Better for**: WordPress/PHP sites only

---

## 🏗️ **Step 1: GoDaddy VPS Setup**

### **Purchase & Configure VPS**
1. **Go to**: [GoDaddy VPS Hosting](https://www.godaddy.com/hosting/vps-hosting)
2. **Choose**: Linux VPS (Ubuntu 20.04/22.04 LTS recommended)
3. **Minimum specs for songIQ**:
   - **RAM**: 2GB+ (4GB recommended)
   - **Storage**: 40GB+ SSD
   - **CPU**: 2+ cores
   - **Bandwidth**: Unmetered

### **Initial VPS Access**
```bash
# Connect to your VPS via SSH
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Create deploy user (security best practice)
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

---

## 🌐 **Step 2: Domain & SSL Configuration**

### **Domain Setup**
1. **In GoDaddy DNS Management**:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 600

   Type: A  
   Name: www
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 600
   ```

2. **Verify DNS propagation**:
   ```bash
   # Check if domain points to your server
   nslookup songiq.com
   ping songiq.com
   ```

### **SSL Certificate (Free with Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate (after Nginx setup)
sudo certbot --nginx -d songiq.com -d www.songiq.com
```

---

## 🛠️ **Step 3: Server Software Installation**

### **Install Node.js 18.x LTS (Recommended for Production)**
```bash
# Install Node.js 18.x LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v18.19.1 or similar LTS version
npm --version   # Should be v9.x.x or v10.x.x

# Expected output:
# node --version: v18.19.1 (or similar 18.x.x LTS)
# npm --version: v9.8.1 (or similar compatible version)
```

### **Install MongoDB**
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### **Install Nginx**
```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### **Install PM2 (Process Manager)**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```

### **Install Additional Tools**
```bash
# Install Git, build tools, and other dependencies
sudo apt install -y git build-essential python3-pip ufw fail2ban

# Install Redis (optional, for sessions)
sudo apt install redis-server -y
sudo systemctl enable redis-server
```

---

## 🔒 **Step 4: Security Configuration**

### **Firewall Setup**
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Check firewall status
sudo ufw status
```

### **Firewall Troubleshooting (If UFW Commands Don't Work)**
If you get errors with UFW commands, your GoDaddy VPS might have a different setup:

#### **Step 1: Check Your System**
```bash
# Check Linux distribution
cat /etc/os-release

# Check if UFW is available
which ufw
which iptables
which firewalld

# Check SSH port
sudo netstat -tlnp | grep ssh
```

#### **Step 2: Install UFW if Missing**
```bash
# Install UFW
sudo apt update
sudo apt install ufw -y

# Then try the firewall commands again
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### **Step 3: Alternative - Use iptables (if UFW still doesn't work)**
```bash
# Basic iptables rules (be careful!)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # SSH
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT    # HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT   # HTTPS
sudo iptables -A INPUT -j DROP                         # Drop everything else

# Save rules (Ubuntu/Debian)
sudo iptables-save > /etc/iptables/rules.v4

# Or for CentOS/RHEL
sudo service iptables save
```

#### **Step 4: Skip Firewall for Now (if all else fails)**
```bash
# Continue with other steps and come back to firewall later
echo "Firewall setup skipped - will configure later"
```

### **SSH Security**
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Change these settings:
# Port 2222  # Change from default 22
# PasswordAuthentication no
# PermitRootLogin no

# Restart SSH
sudo systemctl restart ssh

# Update firewall for new SSH port
sudo ufw allow 2222
sudo ufw delete allow ssh
```

---

## 📁 **Step 5: Application Directory Setup**

### **Create Application Structure**
```bash
# Switch to deploy user
su - deploy

# Create application directories
sudo mkdir -p /var/www/songiq
sudo chown -R deploy:deploy /var/www/songiq
mkdir -p /var/www/songiq/{client,server,uploads,logs,backups}

# Create environment files
touch /var/www/songiq/server/.env
touch /var/www/songiq/client/.env
```

---

## ⚙️ **Step 6: Nginx Configuration**

### **Create songIQ Nginx Config**
```bash
sudo nano /etc/nginx/sites-available/songiq
```

**Nginx Configuration Content:**
```nginx
server {
    listen 80;
    server_name songiq.com www.songiq.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name songiq.com www.songiq.com;
    
    # SSL configuration (will be set by Certbot)
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Client (React app)
    location / {
        root /var/www/songiq/client;
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
        
        # Increase timeout for file uploads
        proxy_connect_timeout       300;
        proxy_send_timeout          300;
        proxy_read_timeout          300;
        send_timeout                300;
    }
    
    # Handle file uploads
    client_max_body_size 100M;
    
    # Security
    location ~ /\. {
        deny all;
    }
}
```

### **Enable Site**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/songiq /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔍 **Step 6.5: Version Compatibility Check**

### **Verify Your Setup Before Deployment**
```bash
# Check Node.js version (should be 18.x.x LTS)
node --version
# Expected: v18.19.1 or similar 18.x.x

# Check npm version
npm --version
# Expected: v9.x.x or v10.x.x

# Check MongoDB version
mongod --version
# Expected: MongoDB 6.0.x or 7.0.x

# Check Nginx version
nginx -v
# Expected: nginx/1.18.x or 1.20.x

# Check PM2 version
pm2 --version
# Expected: 5.x.x or higher
```

### **Version Compatibility Matrix**
| Component | Required Version | Recommended Version | Status |
|-----------|------------------|---------------------|---------|
| **Node.js** | 18.x+ | 18.19.1 LTS | ✅ Compatible |
| **npm** | 9.x+ | 9.8.1+ | ✅ Compatible |
| **MongoDB** | 5.0+ | 6.0+ | ✅ Compatible |
| **Nginx** | 1.18+ | 1.20+ | ✅ Compatible |
| **PM2** | 5.x+ | 5.3.0+ | ✅ Compatible |

## 🚀 **Step 7: Deployment Script Adaptation**

### **Update Deployment Script for GoDaddy**
```bash
# Create GoDaddy-specific deployment script
nano deploy-godaddy.sh
```

**GoDaddy Deployment Script:**
```bash
#!/bin/bash

# songIQ GoDaddy Production Deployment Script

set -e

echo "🚀 Starting songIQ GoDaddy Deployment..."

# Configuration
PRODUCTION_SERVER="songiq.com"
PRODUCTION_USER="deploy"
PRODUCTION_PATH="/var/www/songiq"
BRANCH="main"
SSH_PORT="2222"  # If you changed SSH port

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    print_error "You must be on the $BRANCH branch to deploy to production"
    print_status "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Production deployment confirmation
print_warning "⚠️  You are about to deploy to PRODUCTION!"
print_warning "This will affect live users. Are you sure?"
read -p "Type 'PRODUCTION' to confirm: " -r
if [[ ! $REPLY == "PRODUCTION" ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

print_status "Building applications..."
npm run build

print_status "Creating deployment package..."
DEPLOY_DIR="deploy-godaddy-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy built files
cp -r songiq/client/dist/* $DEPLOY_DIR/client/
cp -r songiq/server/dist/* $DEPLOY_DIR/server/
cp -r songiq/server/uploads $DEPLOY_DIR/ 2>/dev/null || mkdir -p $DEPLOY_DIR/uploads

# Copy configuration files
cp songiq/client/.env.production $DEPLOY_DIR/client.env
cp songiq/server/.env.production $DEPLOY_DIR/server.env
cp songiq/server/package.json $DEPLOY_DIR/package.json
cp ecosystem.config.js $DEPLOY_DIR/

# Create deployment script for remote server
cat > $DEPLOY_DIR/deploy-remote.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying songIQ to GoDaddy production..."

# Stop current processes
pm2 stop songiq-api 2>/dev/null || true
pm2 stop songiq-client 2>/dev/null || true

# Create backup
if [ -d "/var/www/songiq/server" ]; then
    BACKUP_DIR="/var/www/songiq/backups/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r /var/www/songiq/server/* $BACKUP_DIR/ 2>/dev/null || true
    cp -r /var/www/songiq/client/* $BACKUP_DIR/ 2>/dev/null || true
    echo "Backup created at: $BACKUP_DIR"
fi

# Deploy new files
mkdir -p /var/www/songiq/{client,server,uploads,logs}
cp -r client/* /var/www/songiq/client/
cp -r server/* /var/www/songiq/server/
cp -r uploads/* /var/www/songiq/server/uploads/ 2>/dev/null || true

# Set up environment files
cp client.env /var/www/songiq/client/.env
cp server.env /var/www/songiq/server/.env

# Install/update dependencies
cd /var/www/songiq/server
npm install --production

# Set permissions
sudo chown -R deploy:deploy /var/www/songiq
chmod -R 755 /var/www/songiq

# Start processes with PM2
cd /var/www/songiq
pm2 start ecosystem.config.js --env production
pm2 save

# Reload Nginx
sudo systemctl reload nginx

echo "✅ GoDaddy deployment completed successfully!"
EOF

chmod +x $DEPLOY_DIR/deploy-remote.sh

# Create tarball
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR

print_status "Uploading to GoDaddy server..."

# Upload to production server (adjust SSH port if needed)
scp -P $SSH_PORT $DEPLOY_DIR.tar.gz $PRODUCTION_USER@$PRODUCTION_SERVER:/tmp/

# Execute deployment on remote server
ssh -p $SSH_PORT $PRODUCTION_USER@$PRODUCTION_SERVER << EOF
    cd /tmp
    tar -xzf $DEPLOY_DIR.tar.gz
    cd $DEPLOY_DIR
    ./deploy-remote.sh
    rm -rf /tmp/$DEPLOY_DIR*
EOF

# Clean up local files
rm -rf $DEPLOY_DIR $DEPLOY_DIR.tar.gz

print_status "✅ GoDaddy deployment completed successfully!"
print_status "🌐 Production URL: https://songiq.com"
print_status "📊 PM2 Status: ssh -p $SSH_PORT $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 status'"
```

### **Make Script Executable**
```bash
chmod +x deploy-godaddy.sh
```

---

## 🧪 **Step 8: Pre-Deployment Testing**

### **Test Server Setup**
```bash
# SSH into your GoDaddy VPS
ssh -p 2222 deploy@songiq.com

# Test MongoDB
mongosh --eval "db.runCommand('ping')"

# Test Node.js
node --version

# Test PM2
pm2 list

# Test Nginx
sudo nginx -t
curl -I http://localhost
```

---

## ✅ **Step 9: Environment Files Setup**

### **Upload Environment Files**
```bash
# Copy your production environment files to the server
scp -P 2222 songiq/server/.env.production deploy@songiq.com:/var/www/songiq/server/.env
scp -P 2222 songiq/client/.env.production deploy@songiq.com:/var/www/songiq/client/.env
```

---

## 🚀 **Step 10: Deploy songIQ**

### **Run Deployment**
```bash
# From your local machine, run the deployment
./deploy-godaddy.sh
```

### **Post-Deployment Verification**
```bash
# Check PM2 processes
ssh -p 2222 deploy@songiq.com 'pm2 status'

# Check application logs
ssh -p 2222 deploy@songiq.com 'pm2 logs songiq-api'

# Test the application
curl -I https://songiq.com
curl https://songiq.com/api/health
```

---

## 🔧 **Troubleshooting Common GoDaddy Issues**

### **MongoDB Connection Issues**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### **Nginx Issues**
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### **PM2 Issues**
```bash
# Restart PM2 processes
pm2 restart all

# Check PM2 logs
pm2 logs

# Monitor PM2
pm2 monit
```

---

## 📞 **Support Contacts**

- **GoDaddy VPS Support**: Available 24/7 via phone/chat
- **SSH Access**: Port 2222 (if changed from default)
- **Server IP**: Your GoDaddy VPS IP address
- **Domain**: songiq.com managed through GoDaddy DNS

---

## 💰 **Estimated Monthly Costs**

- **VPS Hosting**: $4.99-$19.99/month
- **Domain**: $17.99/year (if new)
- **SSL Certificate**: Free (Let's Encrypt)
- **Total**: ~$5-20/month + domain

---

**Next Step**: Purchase your GoDaddy VPS and follow this guide step by step!
