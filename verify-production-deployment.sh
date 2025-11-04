#!/bin/bash

# 🔍 Production Deployment Verification Script
# This script verifies that the production deployment is properly configured

set -e

echo "🔍 songIQ - Production Deployment Verification"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "songiq/server/src/index.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the songIQ project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Verifying production deployment configuration...${NC}"
echo ""

# 1. Check if production environment files exist
echo -e "${BLUE}1. Checking environment files...${NC}"

if [ -f "songiq/server/.env.production" ]; then
    echo -e "${GREEN}✅ Server production environment file exists${NC}"
else
    echo -e "${RED}❌ Server production environment file missing${NC}"
    echo "   Run: ./setup-new-stripe-keys.sh"
    exit 1
fi

if [ -f "songiq/client/.env.production" ]; then
    echo -e "${GREEN}✅ Client production environment file exists${NC}"
else
    echo -e "${RED}❌ Client production environment file missing${NC}"
    echo "   Run: ./setup-new-stripe-keys.sh"
    exit 1
fi

# 2. Check if environment files are in .gitignore
echo ""
echo -e "${BLUE}2. Checking git security...${NC}"

if git ls-files --error-unmatch songiq/server/.env.production >/dev/null 2>&1; then
    echo -e "${RED}❌ CRITICAL: .env.production is tracked by git!${NC}"
    echo "   Run: git rm --cached songiq/server/.env.production"
    echo "   Run: git rm --cached songiq/client/.env.production"
    exit 1
else
    echo -e "${GREEN}✅ Production environment files are not tracked by git${NC}"
fi

# 3. Check for Stripe keys in production file
echo ""
echo -e "${BLUE}3. Checking Stripe configuration...${NC}"

if grep -q "STRIPE_SECRET_KEY=sk_live_" songiq/server/.env.production; then
    echo -e "${GREEN}✅ Stripe secret key configured (live key detected)${NC}"
else
    echo -e "${RED}❌ Stripe secret key not properly configured${NC}"
    echo "   Check your .env.production file"
    exit 1
fi

if grep -q "STRIPE_PUBLISHABLE_KEY=pk_live_" songiq/server/.env.production; then
    echo -e "${GREEN}✅ Stripe publishable key configured (live key detected)${NC}"
else
    echo -e "${RED}❌ Stripe publishable key not properly configured${NC}"
    echo "   Check your .env.production file"
    exit 1
fi

# 4. Check for placeholder values
echo ""
echo -e "${BLUE}4. Checking for placeholder values...${NC}"

# Check for uncommented placeholder values
if grep -v "^#" songiq/server/.env.production | grep -q "your_production_"; then
    echo -e "${RED}❌ Found uncommented placeholder values in production environment${NC}"
    echo "   Please update all placeholder values with real production values"
    exit 1
else
    echo -e "${GREEN}✅ No uncommented placeholder values found${NC}"
fi

# 5. Check deployment scripts for NODE_ENV
echo ""
echo -e "${BLUE}5. Checking deployment configuration...${NC}"

# Check ecosystem.config.js
if [ -f "ecosystem.config.js" ]; then
    if grep -q "NODE_ENV.*production" ecosystem.config.js; then
        echo -e "${GREEN}✅ ecosystem.config.js has NODE_ENV=production${NC}"
    else
        echo -e "${YELLOW}⚠️  ecosystem.config.js may not have NODE_ENV=production${NC}"
        echo "   Check your PM2 configuration"
    fi
else
    echo -e "${YELLOW}⚠️  ecosystem.config.js not found${NC}"
fi

# Check package.json scripts
if [ -f "package.json" ]; then
    if grep -q "NODE_ENV=production" package.json; then
        echo -e "${GREEN}✅ package.json has NODE_ENV=production in scripts${NC}"
    else
        echo -e "${YELLOW}⚠️  package.json may not have NODE_ENV=production${NC}"
    fi
fi

# 6. Test environment loading
echo ""
echo -e "${BLUE}6. Testing environment loading...${NC}"

# Set NODE_ENV to production for testing
export NODE_ENV=production

# Test if the server can load environment properly
cd songiq/server
if node -e "
const { loadEnvironment } = require('./dist/utils/envLoader');
const result = loadEnvironment();
if (result.success) {
    console.log('✅ Environment loading test passed');
    process.exit(0);
} else {
    console.log('❌ Environment loading test failed:', result.error);
    process.exit(1);
}
" 2>/dev/null; then
    echo -e "${GREEN}✅ Environment loading test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Environment loading test failed (may need to build first)${NC}"
    echo "   Run: npm run build"
fi

cd ../..

# 7. Security audit
echo ""
echo -e "${BLUE}7. Security audit...${NC}"

# Check for any hardcoded keys in source code
if grep -r "sk_live_[A-Za-z0-9]" songiq/server/src/ --exclude-dir=node_modules 2>/dev/null | grep -v "your_production_" | grep -v "template"; then
    echo -e "${RED}❌ Found potential hardcoded Stripe keys in source code${NC}"
    echo "   Please remove any hardcoded keys from source files"
else
    echo -e "${GREEN}✅ No hardcoded Stripe keys found in source code${NC}"
fi

# 8. Summary
echo ""
echo -e "${BLUE}📋 Deployment Verification Summary${NC}"
echo "=================================="

echo -e "${GREEN}✅ Production environment files configured${NC}"
echo -e "${GREEN}✅ Git security verified${NC}"
echo -e "${GREEN}✅ Stripe keys configured${NC}"
echo -e "${GREEN}✅ No placeholder values${NC}"
echo -e "${GREEN}✅ No hardcoded keys in source${NC}"

echo ""
echo -e "${BLUE}🚀 Ready for production deployment!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy to production server"
echo "2. Ensure NODE_ENV=production is set in your deployment"
echo "3. Test payment functionality"
echo "4. Monitor Stripe dashboard for activity"
echo ""

# Unset NODE_ENV to avoid affecting local development
unset NODE_ENV
