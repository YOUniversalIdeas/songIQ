#!/bin/bash

# Complete songIQ.ai Setup Script
# Run this script on your server to complete the production setup

echo "🚀 Complete songIQ.ai Production Setup"
echo "====================================="
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

print_header "Step 1: Install Nginx and Certbot"
echo ""

echo "Run these commands on your server:"
echo ""
echo "sudo yum install -y nginx"
echo "sudo yum install -y certbot python3-certbot-nginx"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo ""

print_header "Step 2: Create Nginx Configuration"
echo ""

echo "Create the configuration file:"
echo "sudo nano /etc/nginx/conf.d/songiq.ai.conf"
echo ""
echo "Add this configuration:"
cat << 'EOF'
server {
    listen 80;
    server_name songiq.ai www.songiq.ai;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name songiq.ai www.songiq.ai;
    
    # SSL configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/songiq.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/songiq.ai/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
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
        add_header Access-Control-Allow-Origin "https://songiq.ai" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
        add_header Access-Control-Expose-Headers "Content-Length,Content-Range" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "https://songiq.ai";
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
print_header "Step 3: Test and Reload Nginx"
echo ""

echo "After creating the configuration:"
echo ""
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""

print_header "Step 4: Get SSL Certificate"
echo ""

echo "Get SSL certificate:"
echo "sudo certbot --nginx -d songiq.ai -d www.songiq.ai"
echo ""

print_header "Step 5: Deploy Updated Application"
echo ""

echo "From your local machine, run these commands:"
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

print_header "Step 6: Test Your Application"
echo ""

echo "After completing all steps, test these URLs:"
echo ""
echo "✅ Frontend: https://songiq.ai/"
echo "✅ API Health: https://songiq.ai/api/health"
echo "✅ Success Calc: https://songiq.ai/api/success/calculate"
echo ""

print_header "Alternative: Quick Setup"
echo ""

echo "If you want to test immediately without SSL:"
echo ""
echo "1. Create a simple Nginx config for HTTP only:"
echo "sudo nano /etc/nginx/conf.d/songiq-http.conf"
echo ""
echo "2. Add this simple configuration:"
cat << 'EOF'
server {
    listen 80;
    server_name songiq.ai www.songiq.ai;
    
    # Client (React app)
    location / {
        root /var/www/songiq-staging/client;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo ""
echo "3. Test and reload:"
echo "sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "4. Your app will be available at: http://songiq.ai/"
echo ""

print_status "Your songIQ application is ready to go live!"
print_warning "Choose the setup method that works best for you."
