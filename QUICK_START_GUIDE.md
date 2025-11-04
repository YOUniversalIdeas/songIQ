# 🚀 songIQ.ai Quick Start Guide

## Current Status ✅
- **Domain**: songiq.ai correctly points to 64.202.184.174
- **Application**: Working on staging server
- **Configuration**: Updated for songiq.ai domain

## Quick Setup (5 minutes)

### Step 1: Connect to Your Server
```bash
ssh rthadmin@64.202.184.174
```

### Step 2: Install Nginx
```bash
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 3: Create Simple Configuration
```bash
sudo nano /etc/nginx/conf.d/songiq.conf
```

Add this configuration:
```nginx
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
```

### Step 4: Test and Reload
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Test Your Application
Open in your browser: **http://songiq.ai/**

## Upload Updated Files (Optional)

If you want to upload the latest frontend files:

```bash
# From your local machine
scp -r songiq/client/dist/* rthadmin@64.202.184.174:/var/www/songiq-staging/client/
```

## Add SSL Certificate (Optional)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d songiq.ai -d www.songiq.ai
```

After SSL, your app will be available at: **https://songiq.ai/**

## Current Working URLs
- **Frontend**: http://64.202.184.174:4173/
- **API**: http://64.202.184.174:9001/api/health
- **Domain**: http://songiq.ai/ (after Nginx setup)

## Troubleshooting

If something doesn't work:
1. Check Nginx status: `sudo systemctl status nginx`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check API status: `pm2 status`
4. Test API: `curl http://localhost:5000/api/health`

## Your songIQ Application is Ready! 🎉
