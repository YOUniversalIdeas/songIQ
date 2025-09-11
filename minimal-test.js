// Minimal test to check environment loading
const dotenv = require('dotenv');
const path = require('path');

console.log('Testing environment loading...');

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'songiq/server/env.development') });

console.log('Environment variables:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'NOT LOADED');
console.log('STRIPE_BASIC_PLAN_PRICE_ID:', process.env.STRIPE_BASIC_PLAN_PRICE_ID ? 'Loaded' : 'NOT LOADED');

// Test if we can require Stripe
try {
  const Stripe = require('stripe');
  console.log('✅ Stripe package loaded successfully');
} catch (error) {
  console.log('❌ Failed to load Stripe package:', error.message);
}
