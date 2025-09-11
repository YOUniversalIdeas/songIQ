#!/bin/bash

# songIQ API Setup Script
# This script helps you set up your environment files for API integration

echo "🚀 songIQ API Setup Script"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the songiq project root directory"
    exit 1
fi

# Create development environment file
if [ ! -f "server/.env.development" ]; then
    echo "📝 Creating development environment file..."
    cp server/env.development.template server/.env.development
    echo "✅ Created server/.env.development"
else
    echo "ℹ️  server/.env.development already exists"
fi

# Create production environment file
if [ ! -f "server/.env.production" ]; then
    echo "📝 Creating production environment file..."
    cp server/env.production.template server/.env.production
    echo "✅ Created server/.env.production"
else
    echo "ℹ️  server/.env.production already exists"
fi

# Create .env file for current environment
if [ ! -f "server/.env" ]; then
    echo "📝 Creating .env file..."
    cp server/env.example server/.env
    echo "✅ Created server/.env"
else
    echo "ℹ️  server/.env already exists"
fi

echo ""
echo "🔑 Next Steps:"
echo "=============="
echo ""
echo "1. Edit server/.env.development with your development API keys"
echo "2. Edit server/.env.production with your production API keys"
echo "3. Edit server/.env with your current environment API keys"
echo ""
echo "📚 For detailed setup instructions, see: API_SETUP_GUIDE.md"
echo ""
echo "🧪 To test your setup, run:"
echo "   npm run dev"
echo ""
echo "🎯 Required API Keys:"
echo "   - SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET"
echo "   - LASTFM_API_KEY"
echo "   - YOUTUBE_API_KEY"
echo "   - TWITTER_BEARER_TOKEN"
echo "   - INSTAGRAM_ACCESS_TOKEN"
echo "   - TIKTOK_ACCESS_TOKEN"
echo ""
echo "✨ Setup complete! Happy coding!"
