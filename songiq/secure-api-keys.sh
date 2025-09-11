#!/bin/bash

# songIQ API Key Security Script
# This script helps you secure your API keys and rotate them if needed

echo "🔒 songIQ API Key Security Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the songiq project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking current security status...${NC}"
echo ""

# Check if .env.production is tracked by git
if git ls-files | grep -q "\.env\.production"; then
    echo -e "${RED}🚨 CRITICAL: .env.production is tracked by git!${NC}"
    echo "   This means your API keys are exposed in the repository!"
    echo ""
    echo -e "${YELLOW}Immediate action required:${NC}"
    echo "1. Remove from git tracking: git rm --cached songiq/server/.env.production"
    echo "2. Commit the removal: git commit -m 'Remove production env file'"
    echo "3. Rotate your API keys (see instructions below)"
    echo ""
else
    echo -e "${GREEN}✅ .env.production is NOT tracked by git${NC}"
fi

# Check .gitignore
if grep -q "\.env\.production" .gitignore; then
    echo -e "${GREEN}✅ .env.production is in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production is NOT in .gitignore${NC}"
    echo "   Adding it now..."
    echo ".env.production" >> .gitignore
    echo ".env.staging" >> .gitignore
    echo ".env.development" >> .gitignore
    echo -e "${GREEN}✅ Added environment files to .gitignore${NC}"
fi

echo ""
echo -e "${BLUE}🔑 API Key Rotation Instructions:${NC}"
echo "=========================================="
echo ""

echo -e "${YELLOW}Spotify API Keys:${NC}"
echo "1. Go to: https://developer.spotify.com/dashboard"
echo "2. Select your songIQ app"
echo "3. Click 'Settings'"
echo "4. Click 'Regenerate' next to Client Secret"
echo "5. Copy the new Client ID and Client Secret"
echo ""

echo -e "${YELLOW}YouTube API Key:${NC}"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Find your songIQ API key"
echo "3. Click the pencil icon to edit"
echo "4. Click 'Regenerate Key'"
echo "5. Copy the new API key"
echo ""

echo -e "${YELLOW}Last.fm API Key:${NC}"
echo "1. Go to: https://www.last.fm/api/account/create"
echo "2. Log in to your account"
echo "3. Delete the old songIQ app"
echo "4. Create a new app with the same details"
echo "5. Copy the new API key"
echo ""

echo -e "${BLUE}📝 After rotating keys:${NC}"
echo "1. Update your .env.production file with new keys"
echo "2. Test the endpoints to ensure they work"
echo "3. Never commit the .env.production file"
echo ""

echo -e "${GREEN}✅ Security check complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Rotate your API keys using the instructions above"
echo "2. Update your .env.production file"
echo "3. Test the API endpoints"
echo "4. Consider using a secrets management service for production"
echo ""

echo -e "${BLUE}🔐 For production deployment:${NC}"
echo "- Use environment variables in your hosting platform"
echo "- Never store API keys in files that get deployed"
echo "- Consider using AWS Secrets Manager, Azure Key Vault, or similar"
echo ""

echo -e "${GREEN}✨ Your songIQ application is now more secure!${NC}"
