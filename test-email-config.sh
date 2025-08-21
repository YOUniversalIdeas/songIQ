#!/bin/bash

# songIQ Email Configuration Test Script
# This script helps you test your email service configuration

echo "🧪 Testing songIQ Email Configuration..."
echo ""

# Check if environment file exists
if [ ! -f "songiq/server/.env.production" ]; then
    echo "❌ Production environment file not found!"
    echo "   Create it first: cp songiq/server/env.production songiq/server/.env.production"
    echo "   Then update with your email credentials"
    exit 1
fi

echo "📧 Current Email Configuration:"
echo ""

# Extract email configuration from .env.production
EMAIL_SERVICE=$(grep "EMAIL_SERVICE=" songiq/server/.env.production | cut -d'=' -f2)
EMAIL_USER=$(grep "EMAIL_USER=" songiq/server/.env.production | cut -d'=' -f2)
EMAIL_PASSWORD=$(grep "EMAIL_PASSWORD=" songiq/server/.env.production | cut -d'=' -f2)
FRONTEND_URL=$(grep "FRONTEND_URL=" songiq/server/.env.production | cut -d'=' -f2)

echo "   EMAIL_SERVICE: $EMAIL_SERVICE"
echo "   EMAIL_USER: $EMAIL_USER"
echo "   FRONTEND_URL: $FRONTEND_URL"
echo "   EMAIL_PASSWORD: ${EMAIL_PASSWORD:0:10}..." # Show first 10 chars only
echo ""

# Validate configuration
echo "🔍 Validating Configuration:"
echo ""

if [ "$EMAIL_SERVICE" = "sendgrid" ]; then
    echo "✅ SendGrid configuration detected"
    if [ "$EMAIL_USER" = "apikey" ]; then
        echo "✅ EMAIL_USER correctly set to 'apikey'"
    else
        echo "⚠️  EMAIL_USER should be 'apikey' for SendGrid"
    fi
    
    if [[ "$EMAIL_PASSWORD" == SG.* ]]; then
        echo "✅ API key format looks correct (starts with SG.)"
    else
        echo "⚠️  API key should start with 'SG.' for SendGrid"
    fi
fi

if [ "$EMAIL_SERVICE" = "gmail" ]; then
    echo "✅ Gmail configuration detected"
    if [[ "$EMAIL_USER" == *@gmail.com ]]; then
        echo "✅ Gmail address format looks correct"
    else
        echo "⚠️  EMAIL_USER should be a Gmail address"
    fi
fi

if [ "$EMAIL_SERVICE" = "ses" ]; then
    echo "✅ AWS SES configuration detected"
    echo "   Make sure you have AWS credentials configured"
fi

echo ""
echo "🧪 Ready to test email system?"
read -p "Run email test? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Running email test..."
    cd songiq/server
    npm run test-email
else
    echo "📝 To test later, run: cd songiq/server && npm run test-email"
fi

echo ""
echo "📚 Next Steps:"
echo "   1. Update your .env.production with real credentials"
echo "   2. Test the email system"
echo "   3. Deploy to production"
echo ""
echo "🔗 Helpful Links:"
echo "   - SendGrid: https://sendgrid.com"
echo "   - AWS SES: https://aws.amazon.com/ses/"
echo "   - Gmail App Passwords: https://myaccount.google.com/apppasswords"
