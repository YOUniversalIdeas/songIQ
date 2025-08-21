#!/bin/bash

# songIQ Production Rollback Script
# This script rolls back the production deployment to the previous version

set -e

echo "🔄 Starting songIQ Production Rollback..."

# Configuration
PRODUCTION_SERVER="songiq.com"
PRODUCTION_USER="rthadmin"
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

# Production rollback confirmation
print_warning "⚠️  You are about to ROLLBACK the PRODUCTION deployment!"
print_warning "This will restore the previous version and may cause downtime."
read -p "Type 'ROLLBACK' to confirm: " -r
if [[ ! $REPLY == "ROLLBACK" ]]; then
    print_error "Rollback cancelled"
    exit 1
fi

print_header "Phase 1: Checking Available Backups"
print_status "Connecting to production server to check available backups..."

# Get list of available backups
BACKUP_LIST=$(ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER "ls -t $BACKUP_PATH 2>/dev/null | head -10" || echo "")

if [ -z "$BACKUP_LIST" ]; then
    print_error "No backups found on production server!"
    print_status "Backup path: $BACKUP_PATH"
    exit 1
fi

print_status "Available backups:"
echo "$BACKUP_LIST" | nl

# Ask user which backup to restore
read -p "Enter backup number to restore (1-$(echo "$BACKUP_LIST" | wc -l)): " -r
BACKUP_NUMBER=$REPLY

# Validate input
if ! [[ "$BACKUP_NUMBER" =~ ^[0-9]+$ ]] || [ "$BACKUP_NUMBER" -lt 1 ] || [ "$BACKUP_NUMBER" -gt "$(echo "$BACKUP_LIST" | wc -l)" ]; then
    print_error "Invalid backup number!"
    exit 1
fi

# Get the selected backup directory
SELECTED_BACKUP=$(echo "$BACKUP_LIST" | sed -n "${BACKUP_NUMBER}p")
print_status "Selected backup: $SELECTED_BUP"

print_header "Phase 2: Executing Rollback"
print_status "Rolling back to backup: $SELECTED_BACKUP"

# Execute rollback on remote server
ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << EOF
    set -e
    
    echo "Starting rollback process..."
    
    # Stop current processes
    echo "Stopping current processes..."
    pm2 stop songiq-api 2>/dev/null || true
    pm2 stop songiq-client 2>/dev/null || true
    
    # Wait for processes to stop
    sleep 5
    
    # Verify backup exists
    if [ ! -d "$BACKUP_PATH/$SELECTED_BACKUP" ]; then
        echo "ERROR: Backup directory $BACKUP_PATH/$SELECTED_BACKUP not found!"
        exit 1
    fi
    
    # Create rollback backup of current state
    CURRENT_BACKUP="$BACKUP_PATH/rollback-backup-\$(date +%Y%m%d-%H%M%S)"
    if [ -d "/var/www/songiq" ]; then
        echo "Creating backup of current state at: \$CURRENT_BACKUP"
        cp -r /var/www/songiq/* \$CURRENT_BACKUP/
    fi
    
    # Remove current deployment
    echo "Removing current deployment..."
    rm -rf /var/www/songiq
    
    # Restore from backup
    echo "Restoring from backup: $SELECTED_BACKUP"
    cp -r $BACKUP_PATH/$SELECTED_BACKUP /var/www/songiq
    
    # Set proper permissions
    echo "Setting permissions..."
    chown -R www-data:www-data /var/www/songiq
    chmod -R 755 /var/www/songiq
    chmod 644 /var/www/songiq/client/.env 2>/dev/null || true
    chmod 644 /var/www/songiq/server/.env 2>/dev/null || true
    
    # Start processes
    echo "Starting processes..."
    cd /var/www/songiq
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Reload Nginx
    echo "Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "Rollback completed successfully!"
EOF

print_header "Phase 3: Post-Rollback Verification"
print_status "Verifying rollback was successful..."

# Run health checks
ssh -i ~/.ssh/songiq_deploy_key $PRODUCTION_USER@$PRODUCTION_SERVER << 'EOF'
    echo "=== Post-Rollback Status ==="
    pm2 status
    
    echo ""
    echo "=== Testing Application ==="
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
    
    echo ""
    echo "=== System Resources ==="
    free -h
    df -h /var/www/songiq
EOF

print_status "🎉 Production rollback completed successfully!"
print_status "📋 Rollback Summary:"
print_status "   - Previous version: $SELECTED_BACKUP"
print_status "   - Current backup: $BACKUP_PATH/$SELECTED_BACKUP"
print_status "   - Rollback backup: $BACKUP_PATH/rollback-backup-$(date +%Y%m%d-%H%M%S)"
print_status ""
print_status "📊 Next steps:"
print_status "   1. Verify https://songiq.com loads correctly"
print_status "   2. Test critical functionality"
print_status "   3. Monitor logs for any errors"
print_status "   4. Check PM2 status: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 status'"
print_status "   5. View logs: ssh $PRODUCTION_USER@$PRODUCTION_SERVER 'pm2 logs songiq-api --lines 20'"
