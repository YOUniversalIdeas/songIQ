#!/bin/bash

# songIQ Production Readiness Check Script
# This script checks if your staging server is ready for production conversion

set -e

echo "🔍 Checking songIQ Production Readiness..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Configuration
SERVER_IP="64.202.184.174"
STAGING_FRONTEND_PORT="4173"
STAGING_API_PORT="5000"

print_section "1. Server Connectivity Check"
echo "Checking if server is accessible..."

if ping -c 1 $SERVER_IP > /dev/null 2>&1; then
    print_status "Server $SERVER_IP is reachable"
else
    print_error "Cannot reach server $SERVER_IP"
    exit 1
fi

print_section "2. Service Status Check"
echo "Checking if services are running on staging server..."

# Check if we can SSH to the server (you'll need to run this on the server)
echo "Note: Run these commands on your staging server to check service status:"
echo ""
echo "ssh root@$SERVER_IP"
echo "pm2 status"
echo "systemctl status nginx"
echo "systemctl status mongod"
echo ""

print_section "3. Port Availability Check"
echo "Checking if production ports (80, 443) are available..."

# Check if ports 80 and 443 are open on the server
if nc -z $SERVER_IP 80 2>/dev/null; then
    print_warning "Port 80 is already in use on the server"
else
    print_status "Port 80 is available for HTTP"
fi

if nc -z $SERVER_IP 443 2>/dev/null; then
    print_warning "Port 443 is already in use on the server"
else
    print_status "Port 443 is available for HTTPS"
fi

print_section "4. Current Staging Service Check"
echo "Checking current staging services..."

# Check staging frontend
if curl -s "http://$SERVER_IP:$STAGING_FRONTEND_PORT/" > /dev/null; then
    print_status "Staging frontend is accessible on port $STAGING_FRONTEND_PORT"
else
    print_error "Staging frontend is not accessible on port $STAGING_FRONTEND_PORT"
fi

# Check staging API
if curl -s "http://$SERVER_IP:$STAGING_API_PORT/api/health" > /dev/null; then
    print_status "Staging API is accessible on port $STAGING_API_PORT"
else
    print_error "Staging API is not accessible on port $STAGING_API_PORT"
fi

print_section "5. Domain DNS Check"
echo "Checking if songiq.com is configured..."

# Check if domain resolves to the server
if nslookup songiq.com > /dev/null 2>&1; then
    DOMAIN_IP=$(nslookup songiq.com | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
        print_status "Domain songiq.com points to $SERVER_IP"
    else
        print_warning "Domain songiq.com points to $DOMAIN_IP (not $SERVER_IP)"
        echo "You'll need to update DNS to point to $SERVER_IP"
    fi
else
    print_warning "Could not resolve songiq.com - check DNS configuration"
fi

print_section "6. SSL Certificate Check"
echo "Checking SSL certificate status..."

# Check if HTTPS is working
if curl -s -k "https://$SERVER_IP:443/" > /dev/null 2>&1; then
    print_warning "Port 443 is responding (may have existing SSL)"
else
    print_status "Port 443 is available for SSL setup"
fi

print_section "7. Production Environment Files Check"
echo "Checking production environment configuration..."

# Check if production env files exist
if [ -f "songiq/client/env.production" ]; then
    print_status "Client production env file exists"
else
    print_error "Client production env file missing: songiq/client/env.production"
fi

if [ -f "songiq/server/env.production" ]; then
    print_status "Server production env file exists"
else
    print_error "Server production env file missing: songiq/server/env.production"
fi

print_section "8. Build Status Check"
echo "Checking if production builds are ready..."

# Check if dist directories exist
if [ -d "songiq/client/dist" ]; then
    print_status "Client production build exists"
else
    print_warning "Client production build missing - run 'npm run build:client'"
fi

if [ -d "songiq/server/dist" ]; then
    print_status "Server production build exists"
else
    print_warning "Server production build missing - run 'npm run build:server'"
fi

print_section "9. Production Conversion Checklist"
echo "Before converting to production, ensure:"
echo ""
echo "□ Update DNS to point songiq.com to $SERVER_IP"
echo "□ Install SSL certificates (Let's Encrypt)"
echo "□ Configure Nginx as reverse proxy"
echo "□ Update PM2 to use production environment"
echo "□ Configure firewall rules"
echo "□ Set up monitoring and backups"
echo "□ Update environment variables for production"
echo ""

print_section "10. Next Steps Recommendation"
echo "Based on the current status, here's what we need to do:"
echo ""
echo "1. SSH to your staging server: ssh root@$SERVER_IP"
echo "2. Install Nginx: sudo apt install nginx -y"
echo "3. Configure Nginx as reverse proxy for ports 80/443"
echo "4. Install Let's Encrypt SSL: sudo apt install certbot python3-certbot-nginx -y"
echo "5. Update PM2 configuration for production"
echo "6. Configure firewall: sudo ufw allow 'Nginx Full'"
echo ""

print_section "11. Risk Assessment"
echo "Current risks and considerations:"
echo ""
echo "⚠️  Converting staging to production will affect the same server"
echo "⚠️  Need to ensure no data loss during conversion"
echo "⚠️  DNS changes may take time to propagate"
echo "⚠️  SSL certificate setup requires domain to point to server"
echo ""

echo "=========================================="
echo "🔍 Production Readiness Check Complete!"
echo ""
echo "If all checks pass, your server is ready for production conversion."
echo "Run this script again after making changes to verify readiness."
