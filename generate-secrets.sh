#!/bin/bash

# songIQ Production Secret Generator
# This script generates secure secrets for your production environment

echo "🔐 Generating secure secrets for songIQ production..."
echo ""

# Generate JWT Secret (64 bytes = 512 bits)
echo "JWT_SECRET:"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo ""

# Generate Session Secret (32 bytes = 256 bits)
echo "SESSION_SECRET:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""

# Generate API Key (32 bytes = 256 bits)
echo "API_KEY:"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo ""

echo "✅ Secrets generated successfully!"
echo ""
echo "📝 Copy these secrets to your production environment files:"
echo "   - songiq/server/.env.production"
echo ""
echo "⚠️  IMPORTANT: Keep these secrets secure and never commit them to git!"
echo "   Store them securely on your production server only."
