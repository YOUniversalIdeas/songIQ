#!/bin/bash

# Stripe Setup Template Script
# Copy this file to setup_stripe.sh and fill in your actual values

echo "Setting up Stripe configuration..."

# Replace these with your actual Stripe API keys
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"

# Update environment files
echo "Updating environment files..."

# Update server environment
if [ -f "songiq/server/env.development" ]; then
    sed -i '' "s/STRIPE_PUBLISHABLE_KEY=.*/STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY/" songiq/server/env.development
    sed -i '' "s/STRIPE_SECRET_KEY=.*/STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY/" songiq/server/env.development
    sed -i '' "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET/" songiq/server/env.development
    echo "✅ Updated server environment file"
else
    echo "⚠️  Server environment file not found. Please create it first."
fi

# Update client environment
if [ -f "songiq/client/env.local" ]; then
    sed -i '' "s/VITE_STRIPE_PUBLISHABLE_KEY=.*/VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY/" songiq/client/env.local
    echo "✅ Updated client environment file"
else
    echo "⚠️  Client environment file not found. Please create it first."
fi

echo "🎉 Stripe configuration setup complete!"
echo "Remember to:"
echo "1. Create products and price IDs in your Stripe dashboard"
echo "2. Update the price IDs in your environment files"
echo "3. Test the integration before going live"
