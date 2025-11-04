#!/bin/bash

echo "🧪 Testing Stripe API Integration"
echo "================================="

echo "1. Testing API health..."
curl -s http://64.202.184.174:5000/api/health
echo ""

echo "2. Testing subscription plans endpoint..."
curl -s http://64.202.184.174:5000/api/subscription/plans
echo ""

echo "3. Testing if Stripe keys are loaded..."
ssh rthadmin@64.202.184.174 "cd /var/www/songiq-staging/server && node -e \"require('dotenv').config(); console.log('Stripe Key loaded:', process.env.STRIPE_PUBLISHABLE_KEY ? 'YES' : 'NO');\""

echo ""
echo "✅ Stripe API test completed!"
