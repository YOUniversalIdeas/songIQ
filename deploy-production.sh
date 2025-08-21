#!/bin/bash

# songIQ Production Deployment Script
# This script deploys the application to the production environment

set -e

echo "🚀 Starting songIQ Production Deployment..."

# Configuration
PRODUCTION_SERVER="songiq.com"
PRODUCTION_USER="rthadmin"
PRODUCTION_PATH="/var/www/songiq"
BRANCH="main"
BACKUP_PATH="/var/backups/songiq"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    print_error "You must be on the $BRANCH branch to deploy to production"
    print_status "Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them before deploying."
    git status --short
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Production deployment confirmation
print_warning "⚠️  You are about to deploy to PRODUCTION!"
print_warning "This will affect live users. Are you sure?"
read -p "Type 'PRODUCTION' to confirm: " -r
if [[ ! $REPLY == "PRODUCTION" ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

print_header "Phase 1: Pre-deployment Setup"
print_status "Pulling latest changes from $BRANCH branch..."
git pull origin $BRANCH

print_status "Installing dependencies..."
npm run install:all

print_status "Building application for production..."
npm run build

# Verify build was successful
if [ ! -d "songiq/client/dist" ] || [ ! -d "songiq/server/dist" ]; then
    print_error "Build failed - dist directories not found"
    exit 1
fi

print_header "Phase 2: Creating Deployment Package"
print_status "Deploying to production server: $PRODUCTION_SERVER"

# Create deployment package
DEPLOY_DIR="deploy-production-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy built files
cp -r songiq/client/dist $DEPLOY_DIR/client-dist
cp -r songiq/server/dist $DEPLOY_DIR/server-dist
cp -r songiq/server/uploads $DEPLOY_DIR/uploads 2>/dev/null || mkdir -p $DEPLOY_DIR/uploads

# Copy configuration files
cp songiq/client/.env.production $DEPLOY_DIR/client.env
cp songiq/server/.env.production $DEPLOY_DIR/server.env

# Copy ecosystem config for PM2
cp ecosystem.config.js $DEPLOY_DIR/

# Create enhanced deployment script for remote server
cat > $DEPLOY_DIR/deploy-remote.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying songIQ to production..."

# Create backup directory
BACKUP_DIR="/var/backups/songiq/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Stop current processes gracefully
echo "Stopping current processes..."
pm2 stop songiq-api 2>/dev/null || true
pm2 stop songiq-client 2>/dev/null || true

# Wait for processes to stop
sleep 5

# Create backup of current deployment
if [ -d "/var/www/songiq" ]; then
    echo "Creating backup at: $BACKUP_DIR"
    cp -r /var/www/songiq/* $BACKUP_DIR/
    
    # Create rollback script
    cat > $BACKUP_DIR/rollback.sh << 'ROLLBACK_EOF'
#!/bin/bash
echo "Rolling back to previous version..."
pm2 stop songiq-api songiq-client 2>/dev/null || true
rm -rf /var/www/songiq
cp -r /var/backups/songiq/$(ls -t /var/backups/songiq | head -1) /var/www/songiq
chown -R www-data:www-data /var/www/songiq
chmod -R 755 /var/www/songiq
cd /var/www/songiq
pm2 start ecosystem.config.js --env production
echo "Rollback completed!"
ROLLBACK_EOF
    chmod +x $BACKUP_DIR/rollback.sh
    echo "Backup created at: $BACKUP_DIR"
    echo "Rollback script available at: $BACKUP_DIR/rollback.sh"
fi

# Create new deployment directory
mkdir -p /var/www/songiq

# Copy new files
echo "Copying new deployment files..."
cp -r client-dist/* /var/www/songiq/client/
cp -r server-dist/* /var/www/songiq/server/
cp -r uploads/* /var/www/songiq/server/uploads/ 2>/dev/null || true

# Set up environment files
cp client.env /var/www/songiq/client/.env
cp server.env /var/www/songiq/server/.env

# Create logs directory
mkdir -p /var/www/songiq/logs

# Set permissions
chown -R www-data:www-data /var/www/songiq
chmod -R 755 /var/www/songiq
chmod 644 /var/www/songiq/client/.env
chmod 644 /var/www/songiq/server/.env

# Start processes with PM2 using ecosystem config
echo "Starting processes with PM2..."
cd /var/www/songiq
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Reload Nginx
echo "Reloading Nginx..."
sudo systemctl reload nginx

echo "Production deployment completed successfully!"
EOF

chmod +x $DEPLOY_DIR/deploy-remote.sh

# Create health check script
cat > $DEPLOY_DIR/health-check.sh << 'EOF'
#!/bin/bash
set -e

echo "Running post-deployment health checks..."

# Check PM2 status
echo "Checking PM2 processes..."
pm2 status

# Check if processes are running
if ! pm2 list | grep -q "songiq-api.*online"; then
    echo "ERROR: songiq-api is not running!"
    exit 1
fi

if ! pm2 list | grep -q "songiq-client.*online"; then
    echo "ERROR: songiq-client is not running!"
    exit 1
fi

# Check Nginx status
echo "Checking Nginx status..."
sudo systemctl status nginx --no-pager -l

# Check SSL certificate
echo "Checking SSL certificate..."
if command -v openssl >/dev/null 2>&1; then
    echo | openssl s_client -servername songiq.com -connect songiq.com:443 2>/dev/null | openssl x509 -noout -dates
fi

# Check application health endpoints
echo "Checking application health..."
sleep 10  # Wait for processes to fully start

# Test client
if curl -f -s https://songiq.com > /dev/null; then
    echo "✅ Client is accessible"
else
    echo "❌ Client is not accessible"
fi

# Test API health endpoint
if curl -f -s https://songiq.com/api/health > /dev/null; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
fi

# Check disk space
echo "Checking disk space..."
df -h /var/www/songiq

# Check memory usage
echo "Checking memory usage..."
free -h

echo "Health checks completed!"
EOF

chmod +x $DEPLOY_DIR/health-check.sh

# Create tarball
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR

print_header "Phase 3: Uploading and Deploying"
print_status "Uploading deployment package to production server..."

# Upload to production server using SSH key
scp -i ~/.ssh/songiq_deploy_key $DEPLOY_DIR.tar.gz $PRODUCTION_USER@$PRODUCTION_SERVER:/tmp/

# Execute deployment on remote server using SSH key
print_status "Executing deployment on remote server..."
ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << EOF
    cd /tmp
    tar -xzf $DEPLOY_DIR.tar.gz
    cd $DEPLOY_DIR
    ./deploy-remote.sh
    echo "Running health checks..."
    ./health-check.sh
    rm -rf /tmp/$DEPLOY_DIR*
EOF

# Clean up local files
rm -rf $DEPLOY_DIR $DEPLOY_DIR.tar.gz

print_header "Phase 4: Post-Deployment Verification"
print_status "✅ Production deployment completed successfully!"
print_status "🌐 Production URL: https://songiq.com"
print_status "📊 PM2 Status: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 status'"
print_status "📈 Monitor: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 monit'"
print_status "🔍 Logs: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'tail -f /var/www/songiq/logs/production-api-error.log'"

# Final verification
print_status "Running final verification..."
ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
    echo "=== Final Deployment Status ==="
    pm2 status
    echo ""
    echo "=== Recent Logs ==="
    pm2 logs songiq-api --lines 5
    echo ""
    echo "=== System Resources ==="
    free -h
    df -h /var/www/songiq
EOF

print_status "🎉 Production deployment completed successfully!"
print_status "📋 Next steps:"
print_status "   1. Verify https://songiq.com loads correctly"
print_status "   2. Test login/logout functionality"
print_status "   3. Test file uploads"
print_status "   4. Monitor logs for any errors"
print_status "   5. Check SSL certificate validity" 