#!/bin/bash

# Quick Fix for Directory Listing Issue
# Run these commands on your server

echo "🔧 Quick Fix for Directory Listing"
echo "================================="
echo ""

echo "Run these commands on your server:"
echo ""

echo "1. Stop Nginx:"
echo "   sudo systemctl stop nginx"
echo ""

echo "2. Remove ALL Nginx configurations:"
echo "   sudo rm -f /etc/nginx/conf.d/*.conf"
echo "   sudo rm -f /etc/nginx/sites-enabled/*"
echo "   sudo rm -f /etc/nginx/sites-available/*"
echo ""

echo "3. Create a simple configuration:"
echo "   sudo nano /etc/nginx/nginx.conf"
echo ""

echo "4. Replace the entire contents with:"
cat << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name songiq.ai www.songiq.ai;
        
        root /var/www/songiq-staging/client;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        location /api {
            proxy_pass http://localhost:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        autoindex off;
    }
}
EOF

echo ""
echo "5. Start Nginx:"
echo "   sudo systemctl start nginx"
echo "   sudo systemctl enable nginx"
echo ""

echo "6. Test:"
echo "   sudo nginx -t"
echo "   curl http://localhost/"
echo ""

echo "This will completely reset Nginx with a simple, working configuration."
echo "Your songIQ app should then be accessible at http://songiq.ai/"


