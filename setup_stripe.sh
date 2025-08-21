#!/bin/bash

echo "🚀 Setting up Stripe configuration for songIQ..."
echo ""

# Check if we're in the right directory
if [ ! -d "songiq" ]; then
    echo "❌ Error: Please run this script from the songIQ root directory"
    exit 1
fi

echo "✅ Found songiq directory"
echo ""

# Update server environment file
echo "📝 Updating server environment file..."
if [ -f "songiq/server/.env.production" ]; then
    # Backup existing file
    cp "songiq/server/.env.production" "songiq/server/.env.production.backup"
    echo "✅ Backed up existing .env.production"
    
    # Update Stripe keys
    sed -i '' 's|STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=pk_live_51RtagdATFS0jz5Fa8lnYsfyCDGAV5jMpv1vzuvkFvZPhFXNSvGYE44EULdbZmKcCOsqiFfYN6xksqyQOUBsM4rUR0084A9H0b2|' "songiq/server/.env.production"
    sed -i '' 's|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=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|' "songiq/server/.env.production"
    sed -i '' 's|STRIPE_BASIC_PLAN_PRICE_ID=.*|STRIPE_BASIC_PLAN_PRICE_ID=price_1RtbAQATFS0jz5Fa20k0nTxU|' "songiq/server/.env.production"
    sed -i '' 's|STRIPE_PRO_PLAN_PRICE_ID=.*|STRIPE_PRO_PLAN_PRICE_ID=price_1RtbB7ATFS0jz5Fa8Gu0gG2F|' "songiq/server/.env.production"
    sed -i '' 's|STRIPE_ENTERPRISE_PLAN_PRICE_ID=.*|STRIPE_ENTERPRISE_PLAN_PRICE_ID=price_1RtbBWATFS0jz5Fapzng2XO0|' "songiq/server/.env.production"
    echo "✅ Updated Stripe keys and price IDs in server .env.production"
else
    echo "⚠️  Server .env.production not found. Please create it manually using STRIPE_KEYS_CONFIG.txt"
fi

echo ""

# Update client environment file
echo "📝 Updating client environment file..."
if [ -f "songiq/client/.env.production" ]; then
    # Backup existing file
    cp "songiq/client/.env.production" "songiq/client/.env.production.backup"
    echo "✅ Backed up existing client .env.production"
    
    # Update Stripe key
    sed -i '' 's|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RtagdATFS0jz5Fa8lnYsfyCDGAV5jMpv1vzuvkFvZPhFXNSvGYE44EULdbZmKcCOsqiFfYN6xksqyQOUBsM4rUR0084A9H0b2|' "songiq/client/.env.production"
    echo "✅ Updated Stripe publishable key in client .env.production"
else
    echo "⚠️  Client .env.production not found. Please create it manually using STRIPE_KEYS_CONFIG.txt"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Get your webhook secret from Stripe Dashboard → Developers → Webhooks"
echo "2. Update STRIPE_WEBHOOK_SECRET in songiq/server/.env.production"
echo "3. Set up webhook endpoint: https://yourdomain.com/api/webhooks/stripe"
echo "4. Test your payment flow!"
echo ""
echo "📋 Configuration details are saved in STRIPE_KEYS_CONFIG.txt"
echo "✅ Stripe setup complete!"
