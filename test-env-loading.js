// Test environment loading
const dotenv = require('dotenv');
const path = require('path');

console.log('Testing environment loading...');

// Test 1: Load from the same path the server uses
const result = dotenv.config({ 
  path: path.join(__dirname, 'songiq/server/env.development') 
});

console.log('Dotenv result:', result);

// Test 2: Check if the file exists
const fs = require('fs');
const envPath = path.join(__dirname, 'songiq/server/env.development');
console.log('Env file exists:', fs.existsSync(envPath));
console.log('Env file path:', envPath);

// Test 3: Read the file directly
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('File content preview:');
  console.log(content.substring(0, 200) + '...');
  
  // Check for Stripe keys
  const hasStripeKey = content.includes('STRIPE_SECRET_KEY=') && 
    (content.includes('sk_test_') || content.includes('sk_live_'));
  console.log('Has Stripe key:', hasStripeKey);
  
  const hasPriceId = content.includes('STRIPE_BASIC_PLAN_PRICE_ID=') && 
    content.includes('price_');
  console.log('Has price ID:', hasPriceId);
}

// Test 4: Check environment variables
console.log('Environment variables:');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');
console.log('STRIPE_BASIC_PLAN_PRICE_ID:', process.env.STRIPE_BASIC_PLAN_PRICE_ID || 'Not loaded');
