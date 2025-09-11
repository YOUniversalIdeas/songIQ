#!/bin/bash

# Reset Development Environment Script
# This script resets your development environment to use safe placeholder values

echo "🔄 Resetting development environment to safe placeholder values..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the songIQ root directory"
    exit 1
fi

# Backup existing .env files if they exist
echo "📦 Creating backups of existing .env files..."

if [ -f "songiq/server/.env" ]; then
    cp "songiq/server/.env" "songiq/server/.env.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up songiq/server/.env"
fi

if [ -f "songiq/client/.env" ]; then
    cp "songiq/client/.env" "songiq/client/.env.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up songiq/client/.env"
fi

# Copy template files to create new .env files
echo "📝 Creating new .env files with placeholder values..."

cp "songiq/server/env.development" "songiq/server/.env"
cp "songiq/client/env.local" "songiq/client/.env"

echo "✅ Created songiq/server/.env with placeholder values"
echo "✅ Created songiq/client/.env with placeholder values"

# Set proper permissions
chmod 600 "songiq/server/.env"
chmod 600 "songiq/client/.env"

echo ""
echo "🎉 Development environment reset complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit songiq/server/.env and replace placeholder values with your development API keys"
echo "2. Edit songiq/client/.env and replace placeholder values with your development API keys"
echo "3. Restart your development servers"
echo ""
echo "🔒 Your .env files are now safe to use and won't be committed to git"
echo "📚 See SECRETS_MANAGEMENT_GUIDE.md for detailed instructions"
echo ""
echo "⚠️  Note: Your backup files are saved with .backup.YYYYMMDD_HHMMSS extension"
