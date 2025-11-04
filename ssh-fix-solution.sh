#!/bin/bash

# SSH Fix Solution for songIQ Server
# This script provides solutions for the SSH authentication issue

echo "🔧 SSH Fix Solution for songIQ Server"
echo "===================================="
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

print_header "Problem Identified"
echo ""

echo "The SSH server is configured to only allow:"
echo "• publickey"
echo "• gssapi-keyex" 
echo "• gssapi-with-mic"
echo "• password"
echo ""
echo "But it's rejecting password authentication attempts."
echo ""

print_header "Solutions to Try"
echo ""

echo "Solution 1: Try Interactive SSH"
echo "=============================="
echo "Run this command and enter your password when prompted:"
echo ""
echo "ssh -o PreferredAuthentications=password rthadmin@64.202.184.174"
echo ""
echo "If this works, you can run commands interactively."
echo ""

echo "Solution 2: Use SSH with Different Options"
echo "=========================================="
echo "Try these commands one by one:"
echo ""
echo "# Method 1: Force password auth"
echo "ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no rthadmin@64.202.184.174"
echo ""
echo "# Method 2: With verbose output to see what's happening"
echo "ssh -v -o PreferredAuthentications=password rthadmin@64.202.184.174"
echo ""
echo "# Method 3: With timeout"
echo "ssh -o ConnectTimeout=30 -o PreferredAuthentications=password rthadmin@64.202.184.174"
echo ""

echo "Solution 3: Check Server SSH Configuration"
echo "=========================================="
echo "The server might have restrictive SSH settings."
echo "Ask your hosting provider to:"
echo "• Check /etc/ssh/sshd_config"
echo "• Ensure PasswordAuthentication=yes"
echo "• Ensure PubkeyAuthentication=yes"
echo "• Restart SSH service: sudo systemctl restart sshd"
echo ""

echo "Solution 4: Alternative Access Methods"
echo "======================================"
echo "If SSH continues to fail:"
echo ""
echo "1. Web-based Terminal:"
echo "   - Log into your hosting control panel"
echo "   - Look for 'Terminal', 'SSH', or 'Command Line'"
echo "   - Run commands from there"
echo ""
echo "2. File Manager:"
echo "   - Upload setup scripts to your server"
echo "   - Run them through web interface"
echo ""
echo "3. Contact Hosting Provider:"
echo "   - Ask them to run the setup commands"
echo "   - Request SSH troubleshooting"
echo ""

print_header "Quick Setup Commands (Once SSH Works)"
echo ""

echo "Once you can SSH in, run these commands quickly:"
echo ""
echo "# Install Nginx (AlmaLinux 8)"
echo "sudo dnf install -y nginx"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"
echo ""
echo "# Create Nginx configuration"
echo "sudo nano /etc/nginx/conf.d/songiq.conf"
echo ""
echo "# Add this configuration:"
cat << 'EOF'
server {
    listen 80;
    server_name songiq.ai www.songiq.ai;
    
    location / {
        root /var/www/songiq-staging/client;
        try_files $uri $uri/ /index.html;
    }
    
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
echo "# Test and reload Nginx"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""

print_header "Test Your Application"
echo ""

echo "After setting up Nginx:"
echo "✅ Frontend: http://songiq.ai/"
echo "✅ API: http://songiq.ai/api/health"
echo ""

print_warning "The main issue is SSH authentication configuration."
print_status "Try the interactive SSH method first - it's most likely to work."
