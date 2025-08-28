# songIQ Deployment Workflow Guide

This document outlines the complete workflow for making changes to the songIQ application and redeploying those changes to staging and production environments.

## Table of Contents

- [Overview](#overview)
- [Development Workflow](#development-workflow)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Quick Reference Commands](#quick-reference-commands)
- [Deployment Process Details](#deployment-process-details)
- [Monitoring and Verification](#monitoring-and-verification)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

songIQ is a full-stack application with:
- **Frontend**: React application built with Vite
- **Backend**: Express.js API server
- **Database**: MongoDB
- **Process Management**: PM2
- **Web Server**: Nginx (production)

The deployment workflow follows a **staging → production** approach to ensure changes are thoroughly tested before reaching live users.

## Development Workflow

### 1. Create/Checkout Feature Branch

```bash
# For new features
git checkout -b feature/your-feature-name

# For staging work
git checkout staging

# For production work
git checkout main
```

### 2. Make Your Changes

- **Frontend Changes**: Edit files in `songiq/client/src/`
- **Backend Changes**: Edit files in `songiq/server/src/`
- **Configuration**: Update environment files if needed
- **Dependencies**: Add new packages as required

### 3. Test Locally

```bash
# Install all dependencies
npm run install:all

# Run development servers (frontend + backend)
npm run dev

# Or run individually
npm run dev:client    # Frontend only
npm run dev:server    # Backend only
```

### 4. Commit and Push Changes

```bash
git add .
git commit -m "Description of your changes"
git push origin your-branch-name
```

## Staging Deployment

### Purpose
Staging serves as a pre-production environment where changes can be tested in a production-like setting before being deployed to live users.

### Deployment Steps

1. **Switch to Staging Branch**
   ```bash
   git checkout staging
   git pull origin staging
   git merge feature/your-feature-name
   ```

2. **Deploy to Staging**
   ```bash
   ./deploy-staging.sh
   ```

3. **Verify Deployment**
   - **URL**: `http://64.202.184.174:3001`
   - **PM2 Status**: `ssh rthadmin@64.202.184.174 'pm2 status'`
   - **Logs**: `ssh rthadmin@64.202.184.174 'pm2 logs songiq-api-staging'`

### Staging Environment Details
- **Server**: `64.202.184.174`
- **User**: `rthadmin`
- **Path**: `/var/www/songiq-staging`
- **Branch**: `staging`

## Production Deployment

### Purpose
Production is the live environment serving real users. Changes should only be deployed here after thorough testing in staging.

### Deployment Steps

1. **Merge to Main Branch**
   ```bash
   git checkout main
   git pull origin main
   git merge staging  # or merge your feature branch directly
   ```

2. **Deploy to Production**
   ```bash
   ./deploy-production.sh
   ```

3. **Verify Production**
   - **URL**: `https://songiq.com`
   - **PM2 Status**: `ssh rthadmin@songiq.com 'pm2 status'`
   - **Logs**: `ssh rthadmin@songiq.com 'pm2 logs songiq-api'`

### Production Environment Details
- **Server**: `songiq.com`
- **User**: `rthadmin`
- **Path**: `/var/www/songiq`
- **Branch**: `main`

## Quick Reference Commands

### Staging Deployment
```bash
git checkout staging
git pull origin staging
./deploy-staging.sh
```

### Production Deployment
```bash
git checkout main
git pull origin main
./deploy-production.sh
```

### Local Development
```bash
npm run install:all    # Install dependencies
npm run dev            # Run both servers
npm run build          # Build for deployment
npm run deploy:check   # Verify deployment readiness
```

## Deployment Process Details

### What Happens During Deployment

#### 1. Pre-deployment Checks
- Verifies correct branch is checked out
- Checks for uncommitted changes
- Confirms deployment target (staging vs production)
- Requests confirmation for production deployments

#### 2. Build Process
```bash
npm run install:all      # Install all dependencies
npm run build:client     # Build frontend (Vite)
npm run build:server     # Build backend (TypeScript)
```

#### 3. Deployment Package Creation
- Creates timestamped deployment directory
- Packages built frontend (`dist/` folder)
- Packages built backend (`dist/` folder)
- Includes environment configurations
- Includes PM2 ecosystem configuration
- Creates remote deployment scripts

#### 4. Remote Deployment
- Uploads deployment package via SSH
- Stops existing processes gracefully
- Creates backup of current deployment
- Deploys new files to server
- Sets proper file permissions
- Restarts services with PM2
- Reloads Nginx configuration (production)

#### 5. Health Checks
- Verifies PM2 processes are running
- Tests application endpoints
- Checks system resources
- Validates SSL certificates (production)

### Deployment Scripts

- **`deploy-staging.sh`**: Automated staging deployment
- **`deploy-production.sh`**: Automated production deployment
- **`ecosystem.config.js`**: PM2 process management
- **`package.json`**: Build and deployment scripts

## Monitoring and Verification

### Post-Deployment Checks

#### Staging
```bash
# Check PM2 status
ssh rthadmin@64.202.184.174 'pm2 status'

# View logs
ssh rthadmin@64.202.184.174 'pm2 logs songiq-api-staging'

# Monitor resources
ssh rthadmin@64.202.184.174 'pm2 monit'
```

#### Production
```bash
# Check PM2 status
ssh rthadmin@songiq.com 'pm2 status'

# View logs
ssh rthadmin@songiq.com 'pm2 logs songiq-api'

# Monitor resources
ssh rthadmin@songiq.com 'pm2 monit'

# Check Nginx status
ssh rthadmin@songiq.com 'sudo systemctl status nginx'
```

### Health Endpoints
- **Frontend**: `https://songiq.com` (production) or `http://64.202.184.174:3001` (staging)
- **API Health**: `https://songiq.com/api/health` (production) or `http://64.202.184.174:3001/api/health` (staging)

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules songiq/client/node_modules songiq/server/node_modules
npm run install:all
```

#### 2. Deployment Failures
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/songiq_deploy_key

# Verify server connectivity
ssh -i ~/.ssh/songiq_deploy_key rthadmin@server-ip
```

#### 3. Process Issues
```bash
# Restart PM2 processes
pm2 restart all

# Clear PM2 logs
pm2 flush

# Reset PM2
pm2 kill && pm2 resurrect
```

#### 4. Rollback
```bash
# Navigate to backup directory
cd /var/backups/songiq/backup-YYYYMMDD-HHMMSS

# Execute rollback script
./rollback.sh
```

### Log Locations
- **Application Logs**: `/var/www/songiq/logs/` (production) or `/var/www/songiq-staging/logs/` (staging)
- **PM2 Logs**: `pm2 logs [process-name]`
- **Nginx Logs**: `/var/log/nginx/` (production)
- **System Logs**: `/var/log/syslog`

## Best Practices

### 1. Development Workflow
- **Always test locally** before committing
- **Use descriptive commit messages**
- **Test on staging** before production
- **Keep branches up to date** with main/staging

### 2. Deployment Safety
- **Never deploy directly to production** without staging testing
- **Verify deployments** with health checks
- **Monitor logs** after deployment
- **Keep backups** (automatically created)

### 3. Code Quality
- **Run tests** before deployment
- **Check for linting errors**
- **Verify environment variables** are correct
- **Test critical functionality** after deployment

### 4. Monitoring
- **Set up alerts** for critical failures
- **Monitor resource usage** regularly
- **Check SSL certificates** expiration
- **Review logs** for errors or warnings

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=songIQ
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/songiq

# Security
JWT_SECRET=your-super-secret-jwt-key

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Security Considerations

### SSH Keys
- Deploy keys are stored in `~/.ssh/songiq_deploy_key`
- Keys should have restricted permissions (`chmod 600`)
- Keys should be rotated regularly

### File Permissions
- Application files: `755` for directories, `644` for files
- Environment files: `644` (readable by application)
- Uploads directory: `755` (writable by application)

### Firewall
- **SSH**: Port 22
- **HTTP**: Port 80 (redirects to HTTPS)
- **HTTPS**: Port 443
- **Application**: Port 5000 (internal only)

## Support and Resources

### Documentation
- **Main README**: `README.md`
- **Setup Guide**: `SETUP.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Environment Setup**: `ENVIRONMENT_SETUP.md`

### Scripts
- **Deployment**: `deploy-staging.sh`, `deploy-production.sh`
- **Monitoring**: `production-monitor.sh`
- **Backup**: `backup.sh`
- **Rollback**: `rollback-production.sh`

### Contact
For deployment issues or questions, refer to the project documentation or contact the development team.

---

**Last Updated**: $(date)
**Version**: 1.0
**Maintainer**: songIQ Development Team
