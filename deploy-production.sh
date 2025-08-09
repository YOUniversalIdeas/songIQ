#!/bin/bash

# songIQ Production Deployment Script
# This script deploys the application to the production environment

set -e

echo "🚀 Starting songIQ Production Deployment..."

# Configuration
PRODUCTION_SERVER="songiq.com"
PRODUCTION_USER="deploy"
PRODUCTION_PATH="/var/www/songiq"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

print_status "Pulling latest changes from $BRANCH branch..."
git pull origin $BRANCH

print_status "Installing dependencies..."
npm run install:all

print_status "Building application for production..."
npm run build

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

# Create deployment script for remote server
cat > $DEPLOY_DIR/deploy-remote.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying songIQ to production..."

# Stop current processes
pm2 stop songiq-api 2>/dev/null || true
pm2 stop songiq-client 2>/dev/null || true

# Create backup
if [ -d "/var/www/songiq" ]; then
    BACKUP_DIR="/var/backups/songiq/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p $BACKUP_DIR
    cp -r /var/www/songiq/* $BACKUP_DIR/
    echo "Backup created at: $BACKUP_DIR"
fi

# Create new deployment directory
mkdir -p /var/www/songiq

# Copy new files
cp -r client-dist/* /var/www/songiq/client/
cp -r server-dist/* /var/www/songiq/server/
cp -r uploads/* /var/www/songiq/server/uploads/ 2>/dev/null || true

# Set up environment files
cp client.env /var/www/songiq/client/.env
cp server.env /var/www/songiq/server/.env

# Set permissions
chown -R www-data:www-data /var/www/songiq
chmod -R 755 /var/www/songiq

# Start processes with PM2
cd /var/www/songiq
pm2 start server/index.js --name "songiq-api" --env production
pm2 start "npm run preview" --name "songiq-client" --cwd client

# Save PM2 configuration
pm2 save

# Reload Nginx
sudo systemctl reload nginx

echo "Production deployment completed successfully!"
EOF

chmod +x $DEPLOY_DIR/deploy-remote.sh

# Create tarball
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR

print_status "Uploading deployment package to production server..."

# Upload to production server
scp $DEPLOY_DIR.tar.gz $PRODUCTION_USER@$PRODUCTION_SERVER:/tmp/

# Execute deployment on remote server
ssh $PRODUCTION_USER@$PRODUCTION_SERVER << EOF
    cd /tmp
    tar -xzf $DEPLOY_DIR.tar.gz
    cd $DEPLOY_DIR
    ./deploy-remote.sh
    rm -rf /tmp/$DEPLOY_DIR*
EOF

# Clean up local files
rm -rf $DEPLOY_DIR $DEPLOY_DIR.tar.gz

print_status "✅ Production deployment completed successfully!"
print_status "🌐 Production URL: https://songiq.com"
print_status "📊 PM2 Status: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 status'"
print_status "📈 Monitor: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 monit'" 