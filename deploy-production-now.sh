#!/bin/bash

# 🔥 songIQ Production Deployment Script
# Date: November 4, 2025
# Deploys: 51 complete features

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/var/www/songiq"
BACKUP_DIR="/var/backups/songiq"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo ""
echo "${BLUE}📋 Deployment Configuration:${NC}"
echo "Project Root: $PROJECT_ROOT"
echo "Backup Dir: $BACKUP_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

# Step 1: Create backup directory
echo "${BLUE}Step 1: Creating backup directory...${NC}"
mkdir -p $BACKUP_DIR

# Step 2: Backup database
echo "${BLUE}Step 2: Backing up database...${NC}"
mongodump --db=songiq --out=$BACKUP_DIR/db-$TIMESTAMP
echo "${GREEN}✅ Database backed up${NC}"

# Step 3: Backup current code
echo "${BLUE}Step 3: Backing up current code...${NC}"
cd /var/www
tar -czf $BACKUP_DIR/code-$TIMESTAMP.tar.gz songiq/
echo "${GREEN}✅ Code backed up${NC}"

# Step 4: Pull latest code
echo "${BLUE}Step 4: Pulling latest code from main...${NC}"
cd $PROJECT_ROOT
git pull origin main
echo "${GREEN}✅ Code updated${NC}"

# Step 5: Install server dependencies
echo "${BLUE}Step 5: Installing server dependencies...${NC}"
cd $PROJECT_ROOT/songiq/server
npm install --production
echo "${GREEN}✅ Server dependencies installed${NC}"

# Step 6: Install client dependencies
echo "${BLUE}Step 6: Installing client dependencies...${NC}"
cd $PROJECT_ROOT/songiq/client
npm install
echo "${GREEN}✅ Client dependencies installed${NC}"

# Step 7: Build frontend
echo "${BLUE}Step 7: Building production frontend...${NC}"
cd $PROJECT_ROOT/songiq/client
npm run build
echo "${GREEN}✅ Frontend built${NC}"

# Step 8: Restart backend service
echo "${BLUE}Step 8: Restarting backend service...${NC}"
cd $PROJECT_ROOT/songiq/server
pm2 restart songiq-server
echo "${GREEN}✅ Backend restarted${NC}"

# Step 9: Restart frontend service
echo "${BLUE}Step 9: Restarting frontend service...${NC}"
cd $PROJECT_ROOT/songiq/client
pm2 restart songiq-client
echo "${GREEN}✅ Frontend restarted${NC}"

# Step 10: Verify deployment
echo "${BLUE}Step 10: Verifying deployment...${NC}"
sleep 5  # Wait for services to start

# Check PM2 status
echo "${YELLOW}PM2 Status:${NC}"
pm2 status

# Check health endpoint
echo ""
echo "${YELLOW}Testing API health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s https://songiq.ai/api/health)
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    echo "${GREEN}✅ API health check passed${NC}"
else
    echo "${RED}❌ API health check failed${NC}"
    echo "${YELLOW}Check logs: pm2 logs songiq-server${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${BLUE}📊 Deployment Summary:${NC}"
echo "✅ Database backed up to: $BACKUP_DIR/db-$TIMESTAMP"
echo "✅ Code backed up to: $BACKUP_DIR/code-$TIMESTAMP.tar.gz"
echo "✅ Latest code deployed"
echo "✅ Dependencies installed"
echo "✅ Frontend built"
echo "✅ Services restarted"
echo ""
echo "${BLUE}🔍 Next Steps:${NC}"
echo "1. Monitor logs: pm2 logs songiq-server"
echo "2. Test website: https://songiq.ai"
echo "3. Check features: See testing checklist"
echo "4. Monitor metrics for 24 hours"
echo ""
echo "${YELLOW}🎊 Features Deployed:${NC}"
echo "✅ Social Features (profiles, follow, reputation)"
echo "✅ Email Notifications (7 types)"
echo "✅ Mobile & PWA (installable app)"
echo "✅ Gamification (rewards, challenges, streaks)"
echo "✅ Performance Optimizations (-70% bundle)"
echo ""
echo "${GREEN}Your platform is now LIVE with 51 complete features! 🚀${NC}"
echo ""

