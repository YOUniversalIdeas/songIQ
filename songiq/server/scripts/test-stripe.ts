import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../env.development' });

import Stripe from 'stripe';

async function testStripe() {
  console.log('🧪 Testing Stripe Configuration\n');
  console.log('='.repeat(50));
  console.log('');

  // Check if API key is configured
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    console.log('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('');
    console.log('To set up Stripe:');
    console.log('1. Go to https://stripe.com');
    console.log('2. Sign up or log in');
    console.log('3. Navigate to Developers → API Keys');
    console.log('4. Copy your Secret Key (starts with sk_test_ or sk_live_)');
    console.log('5. Add to songiq/server/.env:');
    console.log('   STRIPE_SECRET_KEY=sk_test_your_key_here');
    console.log('');
    process.exit(1);
  }

  console.log('✅ Stripe API key found');
  console.log(`   Key type: ${apiKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
  console.log(`   Key preview: ${apiKey.substring(0, 20)}...`);
  console.log('');

  try {
    // Initialize Stripe
    const stripe = new Stripe(apiKey, {
      apiVersion: '2025-07-30.basil'
    });

    console.log('📡 Testing Stripe API Connection...');
    console.log('');

    // Test 1: Retrieve account info
    console.log('Test 1: Retrieving Account Information');
    console.log('-'.repeat(50));
    const account = await stripe.accounts.retrieve();
    console.log('✅ Account retrieved successfully!');
    console.log(`   Business Name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`   Country: ${account.country}`);
    console.log(`   Email: ${account.email || 'Not set'}`);
    console.log(`   Charges Enabled: ${account.charges_enabled ? 'Yes' : 'No'}`);
    console.log(`   Payouts Enabled: ${account.payouts_enabled ? 'Yes' : 'No'}`);
    console.log('');

    // Test 2: Create a test payment intent
    console.log('Test 2: Creating Test Payment Intent');
    console.log('-'.repeat(50));
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'true',
        purpose: 'SongIQ payment provider test'
      }
    });
    console.log('✅ Payment Intent created successfully!');
    console.log(`   ID: ${paymentIntent.id}`);
    console.log(`   Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${paymentIntent.status}`);
    console.log(`   Client Secret: ${paymentIntent.client_secret?.substring(0, 30)}...`);
    console.log('');

    // Test 3: List recent payment intents
    console.log('Test 3: Listing Recent Payment Intents');
    console.log('-'.repeat(50));
    const paymentIntents = await stripe.paymentIntents.list({ limit: 5 });
    console.log(`✅ Found ${paymentIntents.data.length} recent payment intents`);
    paymentIntents.data.forEach((pi, index) => {
      console.log(`   ${index + 1}. ${pi.id} - $${(pi.amount / 100).toFixed(2)} - ${pi.status}`);
    });
    console.log('');

    // Test 4: List products (if any)
    console.log('Test 4: Checking Products');
    console.log('-'.repeat(50));
    const products = await stripe.products.list({ limit: 5 });
    if (products.data.length > 0) {
      console.log(`✅ Found ${products.data.length} products`);
      products.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.id})`);
      });
    } else {
      console.log('ℹ️  No products found (this is normal for a new account)');
    }
    console.log('');

    // Test 5: Check webhook endpoints
    console.log('Test 5: Checking Webhook Endpoints');
    console.log('-'.repeat(50));
    const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 10 });
    if (webhookEndpoints.data.length > 0) {
      console.log(`✅ Found ${webhookEndpoints.data.length} webhook endpoint(s)`);
      webhookEndpoints.data.forEach((endpoint, index) => {
        console.log(`   ${index + 1}. ${endpoint.url}`);
        console.log(`      Status: ${endpoint.status}`);
        console.log(`      Events: ${endpoint.enabled_events.slice(0, 3).join(', ')}...`);
      });
    } else {
      console.log('⚠️  No webhook endpoints configured');
      console.log('   To set up webhooks:');
      console.log('   1. Go to Stripe Dashboard → Developers → Webhooks');
      console.log('   2. Add endpoint: http://localhost:5001/api/transactions/webhooks/stripe');
      console.log('   3. Select events: payment_intent.succeeded, payment_intent.failed');
      console.log('   4. Copy webhook secret to .env as STRIPE_WEBHOOK_SECRET');
    }
    console.log('');

    // Summary
    console.log('='.repeat(50));
    console.log('');
    console.log('🎉 Stripe Configuration Test Complete!');
    console.log('');
    console.log('✅ All tests passed!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('   1. Set up webhook endpoint in Stripe Dashboard');
    console.log('   2. Add STRIPE_WEBHOOK_SECRET to .env');
    console.log('   3. Test deposits via API: POST /api/transactions/deposit/fiat');
    console.log('   4. Use test card: 4242 4242 4242 4242');
    console.log('');
    console.log('📚 Test Cards:');
    console.log('   Success: 4242 4242 4242 4242');
    console.log('   Decline: 4000 0000 0000 0002');
    console.log('   Insufficient: 4000 0000 0000 9995');
    console.log('   Exp: Any future date (e.g., 12/34)');
    console.log('   CVC: Any 3 digits (e.g., 123)');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('❌ Stripe Test Failed!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('This looks like an authentication error.');
      console.log('Please check that your API key is correct and valid.');
    }
    
    console.log('');
    process.exit(1);
  }
}

// Run tests
testStripe()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

