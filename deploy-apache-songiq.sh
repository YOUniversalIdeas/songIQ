#!/bin/bash

# songIQ Apache Deployment Script
# This script configures Apache to serve songIQ on standard HTTP/HTTPS ports

set -e

echo "🚀 Starting songIQ Apache Configuration..."

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

# Configuration
SERVER_IP="64.202.184.174"
SONGIQ_PATH="/var/www/songiq-staging"
APACHE_CONF_DIR="/etc/httpd/conf.d"  # CentOS/RHEL
# APACHE_CONF_DIR="/etc/apache2/sites-available"  # Ubuntu

print_header "Phase 1: Pre-deployment Checks"
print_status "Checking if running on the correct server..."

# Check if we're on the songIQ server
if [ "$(hostname -I | grep $SERVER_IP)" = "" ]; then
    print_error "This script must be run on the songIQ server ($SERVER_IP)"
    print_status "SSH to the server first: ssh rthadmin@$SERVER_IP"
    exit 1
fi

print_status "Running on songIQ server - proceeding with configuration..."

print_header "Phase 2: Apache Module Check"
print_status "Checking required Apache modules..."

# Check if required modules are loaded
if ! httpd -M | grep -q proxy_module; then
    print_error "proxy_module not loaded - Apache may not support proxy functionality"
    exit 1
fi

if ! httpd -M | grep -q rewrite_module; then
    print_error "rewrite_module not loaded - Apache may not support URL rewriting"
    exit 1
fi

print_status "Required Apache modules are available"

print_header "Phase 3: Backup Current Configuration"
print_status "Creating backup of current Apache configuration..."

# Create backup directory
sudo mkdir -p /var/backups/apache
sudo cp -r /etc/httpd/conf.d/* /var/backups/apache/ 2>/dev/null || true
sudo cp -r /etc/apache2/sites-available/* /var/backups/apache/ 2>/dev/null || true

print_status "Backup created in /var/backups/apache/"

print_header "Phase 4: Install songIQ Apache Configuration"
print_status "Installing songIQ Apache configuration..."

# Copy the configuration file
if [ -d "/etc/httpd/conf.d" ]; then
    # CentOS/RHEL
    sudo cp apache-songiq.conf /etc/httpd/conf.d/songiq.conf
    APACHE_SERVICE="httpd"
elif [ -d "/etc/apache2/sites-available" ]; then
    # Ubuntu
    sudo cp apache-songiq.conf /etc/apache2/sites-available/songiq.conf
    sudo a2ensite songiq.conf
    APACHE_SERVICE="apache2"
else
    print_error "Could not determine Apache configuration directory"
    exit 1
fi

print_status "Apache configuration installed"

print_header "Phase 5: SSL Certificate Setup"
print_warning "SSL certificates need to be configured manually"
echo ""
echo "You have two options for SSL:"
echo "1. Use existing certificates (if you have them)"
echo "2. Generate new Let's Encrypt certificates"
echo ""

# Check for existing certificates
if [ -f "/etc/ssl/certs/songiq.crt" ] && [ -f "/etc/ssl/private/songiq.key" ]; then
    print_status "Existing SSL certificates found"
    print_status "Using: /etc/ssl/certs/songiq.crt"
else
    print_warning "No existing SSL certificates found"
    echo ""
    echo "To generate Let's Encrypt certificates:"
    echo "1. Make sure your domain points to this server"
    echo "2. Install certbot: sudo apt install certbot python3-certbot-apache -y"
    echo "3. Generate certificate: sudo certbot --apache -d songiq.com -d www.songiq.com"
    echo ""
    
    # Create a temporary HTTP-only configuration
    print_status "Creating temporary HTTP-only configuration..."
    sudo sed -i '/SSLEngine on/,/SSLCertificateChainFile/d' /etc/httpd/conf.d/songiq.conf 2>/dev/null || \
    sudo sed -i '/SSLEngine on/,/SSLCertificateChainFile/d' /etc/apache2/sites-available/songiq.conf 2>/dev/null || true
fi

print_header "Phase 6: Test Apache Configuration"
print_status "Testing Apache configuration..."

# Test configuration
if sudo $APACHE_SERVICE -t; then
    print_status "Apache configuration is valid"
else
    print_error "Apache configuration has errors"
    print_status "Check the configuration and try again"
    exit 1
fi

print_header "Phase 7: Restart Apache"
print_status "Restarting Apache to apply changes..."

sudo systemctl restart $APACHE_SERVICE

if sudo systemctl is-active --quiet $APACHE_SERVICE; then
    print_status "Apache restarted successfully"
else
    print_error "Apache failed to restart"
    print_status "Check logs: sudo journalctl -u $APACHE_SERVICE -f"
    exit 1
fi

print_header "Phase 8: Verify Configuration"
print_status "Verifying songIQ is accessible..."

# Wait a moment for Apache to fully start
sleep 3

# Test HTTP access
if curl -s "http://localhost/" > /dev/null; then
    print_status "HTTP (port 80) is working"
else
    print_warning "HTTP (port 80) may not be working"
fi

# Test API proxy
if curl -s "http://localhost/api/health" > /dev/null; then
    print_status "API proxy is working"
else
    print_warning "API proxy may not be working - check if Node.js backend is running"
fi

print_header "Phase 9: Final Steps"
echo ""
echo "🎉 songIQ Apache configuration complete!"
echo ""
echo "Next steps:"
echo "1. Update your DNS to point songiq.com to $SERVER_IP"
echo "2. Install SSL certificates (Let's Encrypt recommended)"
echo "3. Test external access: http://songiq.com"
echo "4. Monitor logs: sudo tail -f /var/log/httpd/songiq-*.log"
echo ""
echo "Current status:"
echo "- Frontend: http://$SERVER_IP (port 80)"
echo "- API: http://$SERVER_IP/api (proxied to port 5000)"
echo "- Apache service: $APACHE_SERVICE"
echo ""

print_status "Deployment complete! Your songIQ application should now be accessible on standard HTTP/HTTPS ports."
