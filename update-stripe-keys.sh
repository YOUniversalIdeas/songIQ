#!/bin/bash

echo "🔑 Updating Stripe Keys"
echo "======================"
echo ""

# Get Stripe keys from user
echo "Enter your Stripe Publishable Key (pk_live_...):"
read STRIPE_PUBLISHABLE_KEY

echo "Enter your Stripe Secret Key (sk_live_...):"
read STRIPE_SECRET_KEY

echo "Enter your Stripe Webhook Secret (whsec_...):"
read STRIPE_WEBHOOK_SECRET

echo "Enter your Basic Plan Price ID (price_...):"
read STRIPE_BASIC_PLAN_PRICE_ID

echo "Enter your Pro Plan Price ID (price_...):"
read STRIPE_PRO_PLAN_PRICE_ID

echo "Enter your Enterprise Plan Price ID (price_...):"
read STRIPE_ENTERPRISE_PLAN_PRICE_ID

echo ""
echo "Updating server environment file..."

# Update server environment file
sed -i.bak "s|STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key_here|STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|g" songiq/server/env.production
sed -i.bak "s|STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key_here|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|g" songiq/server/env.production
sed -i.bak "s|STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret_here|STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET|g" songiq/server/env.production
sed -i.bak "s|STRIPE_BASIC_PLAN_PRICE_ID=price_your_basic_plan_id_here|STRIPE_BASIC_PLAN_PRICE_ID=$STRIPE_BASIC_PLAN_PRICE_ID|g" songiq/server/env.production
sed -i.bak "s|STRIPE_PRO_PLAN_PRICE_ID=price_your_pro_plan_id_here|STRIPE_PRO_PLAN_PRICE_ID=$STRIPE_PRO_PLAN_PRICE_ID|g" songiq/server/env.production
sed -i.bak "s|STRIPE_ENTERPRISE_PLAN_PRICE_ID=price_your_enterprise_plan_id_here|STRIPE_ENTERPRISE_PLAN_PRICE_ID=$STRIPE_ENTERPRISE_PLAN_PRICE_ID|g" songiq/server/env.production

echo "Updating client environment file..."
sed -i.bak "s|VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_key_here|VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|g" songiq/client/env.production

# Clean up backup files
rm -f songiq/server/env.production.bak songiq/client/env.production.bak

echo ""
echo "✅ Stripe keys updated successfully!"
echo ""
echo "Verifying updates..."
echo "Server Stripe Key:"
grep "STRIPE_PUBLISHABLE_KEY" songiq/server/env.production
echo "Client Stripe Key:"
grep "VITE_STRIPE_PUBLISHABLE_KEY" songiq/client/env.production
