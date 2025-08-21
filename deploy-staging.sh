#!/bin/bash

# songIQ Staging Deployment Script
# This script deploys the application to the staging environment

set -e

echo "🚀 Starting songIQ Staging Deployment..."

# Configuration
STAGING_SERVER="64.202.184.174"
STAGING_USER="root"
STAGING_PATH="/var/www/songiq-staging"
BRANCH="staging"

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

# Check if we're on the staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    print_error "You must be on the $BRANCH branch to deploy to staging"
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

print_status "Pulling latest changes from $BRANCH branch..."
git pull origin $BRANCH

print_status "Installing dependencies..."
npm run install:all

print_status "Building application for staging..."
npm run build

print_status "Deploying to staging server: $STAGING_SERVER"

# Create deployment package
DEPLOY_DIR="deploy-staging-$(date +%Y%m%d-%H%M%S)"
mkdir -p $DEPLOY_DIR

# Copy built files
cp -r songiq/client/dist $DEPLOY_DIR/client-dist
cp -r songiq/server/dist $DEPLOY_DIR/server-dist
cp -r songiq/server/uploads $DEPLOY_DIR/uploads 2>/dev/null || mkdir -p $DEPLOY_DIR/uploads

# Copy configuration files
cp songiq/client/.env.staging $DEPLOY_DIR/client.env
cp songiq/server/.env.staging $DEPLOY_DIR/server.env

# Create deployment script for remote server
cat > $DEPLOY_DIR/deploy-remote.sh << 'EOF'
#!/bin/bash
set -e

echo "Deploying songIQ to staging..."

# Stop current processes
pm2 stop songiq-api-staging 2>/dev/null || true
pm2 stop songiq-client-staging 2>/dev/null || true

# Backup current deployment
if [ -d "/var/www/songiq-staging" ]; then
    mv /var/www/songiq-staging /var/www/songiq-staging-backup-$(date +%Y%m%d-%H%M%S)
fi

# Create new deployment directory
mkdir -p /var/www/songiq-staging

# Copy new files
cp -r client-dist/* /var/www/songiq-staging/client/
cp -r server-dist/* /var/www/songiq-staging/server/
cp -r uploads/* /var/www/songiq-staging/server/uploads/ 2>/dev/null || true

# Set up environment files
cp client.env /var/www/songiq-staging/client/.env
cp server.env /var/www/songiq-staging/server/.env

# Set permissions
chown -R www-data:www-data /var/www/songiq-staging
chmod -R 755 /var/www/songiq-staging

# Start processes
cd /var/www/songiq-staging
pm2 start server/index.js --name "songiq-api-staging" --env staging
pm2 start "npm run preview" --name "songiq-client-staging" --cwd client

# Save PM2 configuration
pm2 save

echo "Staging deployment completed successfully!"
EOF

chmod +x $DEPLOY_DIR/deploy-remote.sh

# Create tarball
tar -czf $DEPLOY_DIR.tar.gz $DEPLOY_DIR

print_status "Uploading deployment package to staging server..."

# Upload to staging server (you'll need to configure SSH keys)
scp $DEPLOY_DIR.tar.gz $STAGING_USER@$STAGING_SERVER:/tmp/

# Execute deployment on remote server
ssh $STAGING_USER@$STAGING_SERVER << EOF
    cd /tmp
    tar -xzf $DEPLOY_DIR.tar.gz
    cd $DEPLOY_DIR
    ./deploy-remote.sh
    rm -rf /tmp/$DEPLOY_DIR*
EOF

# Clean up local files
rm -rf $DEPLOY_DIR $DEPLOY_DIR.tar.gz

print_status "✅ Staging deployment completed successfully!"
print_status "🌐 Staging URL: http://64.202.184.174:3001"
print_status "📊 PM2 Status: ssh $STAGING_USER@$STAGING_SERVER 'pm2 status'" 