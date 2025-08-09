# songIQ Environment Setup Guide

This guide provides step-by-step instructions for setting up staging and production environments for the songIQ application.

## 🏗️ Project Structure

```
songIQ/
├── .github/workflows/          # CI/CD pipelines
├── songiq/
│   ├── client/                 # React frontend
│   │   ├── .env.staging        # Staging environment variables
│   │   ├── .env.production     # Production environment variables
│   │   └── ...
│   ├── server/                 # Express.js backend
│   │   ├── .env.staging        # Staging environment variables
│   │   ├── .env.production     # Production environment variables
│   │   └── ...
│   └── ...
├── deploy-staging.sh           # Staging deployment script
├── deploy-production.sh        # Production deployment script
├── ecosystem.config.js         # PM2 configuration
└── ENVIRONMENT_SETUP.md        # This file
```

## 🌿 Git Branching Strategy

We follow the **Git Flow** branching strategy:

- **`main`** - Production-ready code
- **`staging`** - Pre-production testing
- **`develop`** - Development integration
- **`feature/*`** - Feature development
- **`hotfix/*`** - Production bug fixes

### Branch Protection Rules

Set up the following branch protection rules in GitHub:

1. **`main` branch**:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date
   - Restrict pushes

2. **`staging` branch**:
   - Require pull request reviews
   - Require status checks to pass
   - Allow force pushes (for deployment)

## 🚀 Environment Setup

### Prerequisites

- Node.js 18+ installed
- Git configured with SSH keys
- Access to staging and production servers
- Domain names configured (staging.songiq.com, songiq.com)

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUniversalIdeas/songIQ.git
cd songIQ

# Install dependencies
npm run install:all

# Set up environment variables
cp songiq/client/env-template.txt songiq/client/.env
cp songiq/server/env-template.txt songiq/server/.env

# Start development servers
npm run dev
```

### 2. Staging Environment Setup

#### Server Provisioning

1. **Provision a VPS** (DigitalOcean, AWS EC2, etc.)
   - Ubuntu 22.04 LTS
   - 2GB RAM minimum
   - 20GB storage

2. **Domain Configuration**
   - Point `staging.songiq.com` to your staging server IP
   - Set up DNS records

3. **Server Setup**
   ```bash
   # Connect to staging server
   ssh root@your-staging-server-ip
   
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
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   
   # Create deployment user
   sudo adduser deploy
   sudo usermod -aG sudo deploy
   ```

4. **SSH Key Setup**
   ```bash
   # On your local machine
   ssh-copy-id deploy@staging.songiq.com
   ```

5. **Environment Variables**
   ```bash
   # On staging server
   sudo mkdir -p /var/www/songiq-staging
   sudo chown deploy:deploy /var/www/songiq-staging
   
   # Copy environment files
   scp songiq/client/.env.staging deploy@staging.songiq.com:/var/www/songiq-staging/client/.env
   scp songiq/server/.env.staging deploy@staging.songiq.com:/var/www/songiq-staging/server/.env
   ```

6. **Nginx Configuration**
   ```bash
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/songiq-staging
   
   # Add the configuration from DEPLOYMENT.md
   
   # Enable the site
   sudo ln -s /etc/nginx/sites-available/songiq-staging /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 3. Production Environment Setup

#### Server Provisioning

1. **Provision a VPS** (DigitalOcean, AWS EC2, etc.)
   - Ubuntu 22.04 LTS
   - 4GB RAM minimum
   - 40GB storage
   - SSD storage recommended

2. **Domain Configuration**
   - Point `songiq.com` and `www.songiq.com` to your production server IP
   - Set up DNS records

3. **Server Setup** (similar to staging but with production settings)
   ```bash
   # Follow the same steps as staging, but use production paths
   sudo mkdir -p /var/www/songiq
   sudo chown deploy:deploy /var/www/songiq
   ```

4. **SSL Certificate Setup**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Obtain SSL certificate
   sudo certbot --nginx -d songiq.com -d www.songiq.com
   
   # Set up auto-renewal
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🔧 Deployment Process

### Manual Deployment

1. **Deploy to Staging**
   ```bash
   # Make sure you're on staging branch
   git checkout staging
   
   # Run staging deployment
   ./deploy-staging.sh
   ```

2. **Deploy to Production**
   ```bash
   # Merge staging to main first
   git checkout main
   git merge staging
   git push origin main
   
   # Run production deployment
   ./deploy-production.sh
   ```

### Automated Deployment (GitHub Actions)

1. **Set up GitHub Secrets**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   Add the following secrets:
   - `STAGING_HOST`: staging.songiq.com
   - `STAGING_USER`: deploy
   - `STAGING_SSH_KEY`: Your private SSH key
   - `PRODUCTION_HOST`: songiq.com
   - `PRODUCTION_USER`: deploy
   - `PRODUCTION_SSH_KEY`: Your private SSH key

2. **Enable Environments**
   - Go to Settings → Environments
   - Create `staging` environment
   - Create `production` environment
   - Add protection rules as needed

3. **Deploy via Git**
   ```bash
   # Deploy to staging
   git push origin staging
   
   # Deploy to production
   git push origin main
   ```

## 📊 Monitoring and Maintenance

### PM2 Monitoring

```bash
# Check process status
pm2 status

# View logs
pm2 logs songiq-api-staging
pm2 logs songiq-api

# Monitor resources
pm2 monit

# Restart processes
pm2 restart songiq-api-staging
pm2 restart songiq-api
```

### System Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check system load
htop

# Check Nginx status
sudo systemctl status nginx
```

### Backup Strategy

```bash
# Database backup
mongodump --db songiq --out /var/backups/mongodb/$(date +%Y%m%d)

# Application backup
tar -czf /var/backups/app/$(date +%Y%m%d).tar.gz /var/www/songiq

# Set up automated backups
sudo crontab -e
# Add: 0 2 * * * /var/www/songiq/backup.sh
```

## 🔒 Security Considerations

1. **Firewall Configuration**
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **Regular Updates**
   ```bash
   # System updates
   sudo apt update && sudo apt upgrade -y
   
   # Node.js updates
   npm update -g pm2
   ```

3. **Security Headers**
   - Already configured in Nginx
   - Rate limiting enabled
   - CORS properly configured

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission issues**
   ```bash
   sudo chown -R deploy:deploy /var/www/songiq
   sudo chmod -R 755 /var/www/songiq
   ```

3. **MongoDB connection issues**
   ```bash
   sudo systemctl status mongodb
   sudo systemctl restart mongodb
   ```

4. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### Log Locations

- **Application logs**: `/var/www/songiq/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **MongoDB logs**: `/var/log/mongodb/`
- **System logs**: `/var/log/syslog`

## 📞 Support

For additional support:
1. Check the main `README.md`
2. Review `DEPLOYMENT.md` for detailed deployment instructions
3. Check GitHub Issues for known problems
4. Contact the development team

---

**Remember**: Always test changes in staging before deploying to production! 