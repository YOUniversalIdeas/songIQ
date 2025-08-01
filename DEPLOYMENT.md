# songIQ Deployment Guide

This guide provides instructions for deploying the songIQ application to staging and production environments.

## Overview

songIQ is a full-stack application with:
- **Frontend**: React application built with Vite
- **Backend**: Express.js API server
- **Database**: MongoDB
- **File Storage**: Local storage (can be upgraded to cloud storage)

## Environment Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Git
- PM2 (for production process management)
- Nginx (for production reverse proxy)

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=songIQ
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/songiq

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Staging Deployment

### 1. Server Setup

```bash
# Connect to staging server
ssh user@staging-server

# Clone the repository
git clone https://github.com/YOUniversalIdeas/songIQ.git
cd songIQ

# Checkout staging branch
git checkout staging

# Install dependencies
npm run install:all
```

### 2. Environment Configuration

```bash
# Set up environment files
cp songiq/server/env.example songiq/server/.env
cp songiq/client/env.example songiq/client/.env

# Edit environment variables
nano songiq/server/.env
nano songiq/client/.env
```

### 3. Database Setup

```bash
# Install MongoDB (if not already installed)
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
use songiq
db.createUser({
  user: "songiq_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
exit
```

### 4. Build and Start

```bash
# Build the application
npm run build

# Start the application
npm start

# Or use PM2 for process management
pm2 start songiq/server/dist/index.js --name "songiq-api"
pm2 start "npm run preview" --name "songiq-client" --cwd songiq/client
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/songiq-staging
server {
    listen 80;
    server_name staging.yourdomain.com;

    # Frontend
    location / {
        root /path/to/songIQ/songiq/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
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
    }

    # File uploads
    location /uploads {
        alias /path/to/songIQ/songiq/server/uploads;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/songiq-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Production Deployment

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install MongoDB
sudo apt install mongodb
```

### 2. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/songiq
sudo chown $USER:$USER /var/www/songiq

# Clone repository
cd /var/www/songiq
git clone https://github.com/YOUniversalIdeas/songIQ.git .
git checkout main

# Install dependencies
npm run install:all

# Set up environment
cp songiq/server/env.example songiq/server/.env
cp songiq/client/env.example songiq/client/.env

# Edit environment variables for production
nano songiq/server/.env
nano songiq/client/.env
```

### 3. Build Application

```bash
# Build for production
npm run build

# Create uploads directory
mkdir -p songiq/server/uploads
chmod 755 songiq/server/uploads
```

### 4. Process Management with PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'songiq-api',
      script: 'songiq/server/dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    }
  ]
};
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration

```nginx
# /etc/nginx/sites-available/songiq
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        root /var/www/songiq/songiq/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
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
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }

    # File uploads
    location /uploads {
        alias /var/www/songiq/songiq/server/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/api/health;
        access_log off;
    }
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/songiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Monitoring and Logging

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/songiq

# Add:
/var/www/songiq/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## Deployment Scripts

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm run install:all

# Build application
npm run build

# Restart PM2 processes
pm2 restart songiq-api

echo "Deployment completed successfully!"
```

### Make it executable:
```bash
chmod +x deploy.sh
```

## Monitoring

### PM2 Monitoring
```bash
# View application status
pm2 status

# View logs
pm2 logs songiq-api

# Monitor resources
pm2 monit
```

### System Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check process status
ps aux | grep node
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/songiq"

mkdir -p $BACKUP_DIR

# Backup MongoDB
mongodump --db songiq --out $BACKUP_DIR/mongodb_$DATE

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/songiq/songiq/server/uploads

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "mongodb_*" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Set up automated backups:
```bash
# Add to crontab
0 2 * * * /var/www/songiq/backup.sh
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission issues:**
   ```bash
   sudo chown -R $USER:$USER /var/www/songiq
   sudo chmod -R 755 /var/www/songiq
   ```

3. **MongoDB connection issues:**
   ```bash
   sudo systemctl status mongodb
   sudo systemctl restart mongodb
   ```

4. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Log Locations
- **Application logs**: `/var/www/songiq/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **MongoDB logs**: `/var/log/mongodb/`
- **System logs**: `/var/log/syslog`

## Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   npm update -g pm2
   ```

3. **Security Headers**: Already configured in Nginx

4. **Rate Limiting**: Configured in Nginx and Express

5. **File Upload Security**: Implemented in the application

## Performance Optimization

1. **Enable Gzip Compression** (in Nginx)
2. **Use CDN** for static assets
3. **Implement Caching** strategies
4. **Database Indexing** (already configured)
5. **Load Balancing** (PM2 cluster mode)

---

For additional support, refer to the main README.md and SETUP.md files. 