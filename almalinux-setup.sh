#!/bin/bash

# songIQ.ai Setup for AlmaLinux 8
# This script configures your AlmaLinux 8 server for songiq.ai domain

echo "🐧 songIQ.ai Setup for AlmaLinux 8"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header "Step 1: Connect to Your AlmaLinux 8 Server"
echo ""

echo "SSH into your server:"
echo "ssh rthadmin@64.202.184.174"
echo ""

print_header "Step 2: Install Nginx (AlmaLinux 8)"
echo ""

echo "Run these commands on your AlmaLinux 8 server:"
echo ""
echo "# Update package cache"
echo "sudo dnf update -y"
echo ""
echo "# Install Nginx"
echo "sudo dnf install -y nginx"
echo ""
echo "# Start and enable Nginx"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo ""
echo "# Check Nginx status"
echo "sudo systemctl status nginx"
echo ""

print_header "Step 3: Install Certbot (AlmaLinux 8)"
echo ""

echo "Install Certbot for SSL certificates:"
echo ""
echo "# Install EPEL repository (if not already installed)"
echo "sudo dnf install -y epel-release"
echo ""
echo "# Install Certbot"
echo "sudo dnf install -y certbot python3-certbot-nginx"
echo ""

print_header "Step 4: Create Nginx Configuration"
echo ""

echo "Create the configuration file:"
echo "sudo nano /etc/nginx/conf.d/songiq.conf"
echo ""
echo "Add this configuration:"
cat << 'EOF'
server {
    listen 80;
    server_name songiq.ai www.songiq.ai;
    
    # Client (React app)
    location / {
        root /var/www/songiq-staging/client;
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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "http://songiq.ai" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "http://songiq.ai";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/api/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo ""
print_header "Step 5: Test and Reload Nginx"
echo ""

echo "After creating the configuration:"
echo ""
echo "# Test Nginx configuration"
echo "sudo nginx -t"
echo ""
echo "# Reload Nginx"
echo "sudo systemctl reload nginx"
echo ""
echo "# Check if Nginx is running"
echo "sudo systemctl status nginx"
echo ""

print_header "Step 6: Get SSL Certificate (Optional)"
echo ""

echo "Get SSL certificate for HTTPS:"
echo ""
echo "sudo certbot --nginx -d songiq.ai -d www.songiq.ai"
echo ""

print_header "Step 7: Deploy Updated Application"
echo ""

echo "From your local machine, upload the updated files:"
echo ""
echo "# Upload frontend files"
echo "scp -r songiq/client/dist/* rthadmin@64.202.184.174:/var/www/songiq-staging/client/"
echo ""
echo "# Upload server configuration"
echo "scp songiq/server/env.production rthadmin@64.202.184.174:/var/www/songiq-staging/server/.env"
echo ""
echo "# Restart API"
echo "ssh rthadmin@64.202.184.174 'pm2 restart songiq-api'"
echo ""

print_header "Step 8: Test Your Application"
echo ""

echo "After completing all steps, test these URLs:"
echo ""
echo "✅ Frontend: http://songiq.ai/ (or https://songiq.ai/ with SSL)"
echo "✅ API Health: http://songiq.ai/api/health"
echo "✅ Success Calc: http://songiq.ai/api/success/calculate"
echo ""

print_header "AlmaLinux 8 Specific Notes"
echo ""

echo "• AlmaLinux 8 uses 'dnf' instead of 'yum'"
echo "• EPEL repository is needed for Certbot"
echo "• Nginx configuration is the same as CentOS/RHEL"
echo "• Firewall: sudo firewall-cmd --permanent --add-service=http --add-service=https"
echo "• Firewall: sudo firewall-cmd --reload"
echo ""

print_status "Your songIQ application will be live on songiq.ai!"
print_warning "Follow the steps in order for best results."
