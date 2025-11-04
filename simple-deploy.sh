#!/bin/bash

# Simple songIQ Deployment Script
# This script helps you deploy without SSH access

echo "🚀 songIQ Simple Deployment Guide"
echo "================================="
echo ""

echo "📦 Your deployment package is ready:"
echo "   Location: deploy-package-20250911-150803/"
echo "   Size: $(du -sh deploy-package-20250911-150803/ | cut -f1)"
echo ""

echo "🎯 Next Steps:"
echo "============="
echo ""

echo "1. 🌐 UPDATE DNS (CRITICAL)"
echo "   - Log into your DNS provider"
echo "   - Point songiq.com to 64.202.184.174"
echo "   - Point www.songiq.com to 64.202.184.174"
echo "   - Wait for propagation (1-48 hours)"
echo ""

echo "2. 📁 UPLOAD FILES"
echo "   - Upload deploy-package-20250911-150803/ to your server"
echo "   - Place it in /tmp/ directory"
echo ""

echo "3. 🔧 DEPLOY ON SERVER"
echo "   - SSH into your server: ssh root@64.202.184.174"
echo "   - Run these commands:"
echo ""
echo "   cd /tmp/deploy-package-20250911-150803"
echo "   pm2 stop all 2>/dev/null || true"
echo "   mkdir -p /var/www/songiq-staging"
echo "   cp -r client server ecosystem.config.js /var/www/songiq-staging/"
echo "   cp server.env /var/www/songiq-staging/server/.env"
echo "   cp client.env /var/www/songiq-staging/client/.env"
echo "   chmod +x setup-database.sh && ./setup-database.sh"
echo "   cd /var/www/songiq-staging"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save"
echo ""

echo "4. 🔒 INSTALL SSL (After DNS Update)"
echo "   - yum install -y nginx certbot python3-certbot-nginx"
echo "   - certbot --nginx -d songiq.com -d www.songiq.com"
echo ""

echo "5. ⚙️ CONFIGURE NGINX"
echo "   - Create /etc/nginx/sites-available/songiq.com"
echo "   - Enable the site"
echo "   - Test and reload nginx"
echo ""

echo "🧪 TEST YOUR DEPLOYMENT"
echo "======================="
echo ""
echo "After deployment, test these URLs:"
echo "• http://64.202.184.174:4173/ (Frontend)"
echo "• http://64.202.184.174:5000/api/health (API)"
echo "• https://songiq.com/ (Production - after DNS/SSL)"
echo ""

echo "📚 DOCUMENTATION"
echo "==============="
echo "• Manual Deployment: MANUAL_DEPLOYMENT_GUIDE.md"
echo "• Production Guide: PRODUCTION_DEPLOYMENT_COMPLETE.md"
echo "• API Keys Setup: API_KEYS_SETUP_GUIDE.md"
echo "• Database Setup: DATABASE_SETUP_GUIDE.md"
echo ""

echo "🎉 Your songIQ application is ready to deploy!"
echo ""

# Create a simple deployment checklist
cat > deployment-checklist.txt << 'EOF'
songIQ Deployment Checklist
==========================

□ Update DNS to point songiq.com to 64.202.184.174
□ Upload deployment package to server
□ SSH into server and run deployment commands
□ Set up database (run setup-database.sh)
□ Install SSL certificate (after DNS update)
□ Configure Nginx reverse proxy
□ Test all endpoints
□ Configure API keys
□ Set up monitoring and backups

Current Status:
- ✅ Application built and packaged
- ✅ Staging server working (64.202.184.174:4173)
- ⏳ DNS update needed
- ⏳ SSL certificate needed
- ⏳ Production deployment needed
EOF

echo "📋 Created deployment-checklist.txt for you!"
echo ""
echo "Need help with any specific step? Let me know! 🚀"
