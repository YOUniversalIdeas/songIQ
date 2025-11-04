# 💳 Payment Providers Setup Guide

## Overview

SongIQ supports multiple payment providers for fiat deposits and withdrawals:
- **Stripe** - Credit cards, bank transfers, ACH
- **Circle** - Direct USDC purchases
- **Coinbase Commerce** - Crypto payments

## 🎯 Quick Setup Checklist

- [ ] Stripe account created and API keys obtained
- [ ] Circle account created (optional)
- [ ] Coinbase Commerce account created (optional)
- [ ] Environment variables configured
- [ ] Webhook endpoints set up
- [ ] Test payments completed

---

## 1️⃣ Stripe Setup (Recommended First)

### Create Stripe Account

1. Go to https://stripe.com
2. Click "Sign up" (or "Sign in" if you have an account)
3. Complete business verification
4. Navigate to **Developers → API Keys**

### Get API Keys

**Test Mode** (for development):
```bash
# Publishable Key (client-side)
pk_test_51...

# Secret Key (server-side) 
sk_test_51...
```

**Live Mode** (for production):
```bash
# Publishable Key
pk_live_51...

# Secret Key
sk_live_51...
```

### Add to Environment Variables

```bash
# songiq/server/.env or env.development
STRIPE_SECRET_KEY=sk_test_51JxYourKeyHere...
STRIPE_PUBLISHABLE_KEY=pk_test_51JxYourKeyHere...
STRIPE_WEBHOOK_SECRET=whsec_yourWebhookSecretHere...
```

### Set Up Webhooks

1. In Stripe Dashboard: **Developers → Webhooks**
2. Click "Add endpoint"
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/transactions/webhooks/stripe
   
   # For local testing with Stripe CLI:
   http://localhost:5001/api/transactions/webhooks/stripe
   ```

4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`

5. Copy the **Signing secret** (starts with `whsec_`)

### Test with Stripe CLI (Local Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5001/api/transactions/webhooks/stripe

# In another terminal, trigger test event
stripe trigger payment_intent.succeeded
```

### Test Card Numbers

Use these test cards in test mode:

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Decline |
| 4000 0000 0000 9995 | Insufficient funds |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

---

## 2️⃣ Circle Setup (For USDC)

### Create Circle Account

1. Go to https://circle.com
2. Sign up for a developer account
3. Complete KYC verification
4. Navigate to **API Keys**

### Get API Keys

```bash
# Test API Key
TEST:your-api-key-here

# Production API Key
LIVE:your-api-key-here
```

### Add to Environment Variables

```bash
# songiq/server/.env
CIRCLE_API_KEY=TEST:your-api-key-here
CIRCLE_ENTITY_ID=your-entity-id
```

### Test Circle Integration

Circle provides a sandbox environment for testing:

```bash
# Sandbox API Base URL
https://api-sandbox.circle.com

# Production API Base URL
https://api.circle.com
```

---

## 3️⃣ Coinbase Commerce Setup

### Create Coinbase Commerce Account

1. Go to https://commerce.coinbase.com
2. Sign up or log in
3. Navigate to **Settings → API keys**

### Get API Keys

```bash
# API Key
your-api-key-here

# Webhook Shared Secret
your-webhook-secret-here
```

### Add to Environment Variables

```bash
# songiq/server/.env
COINBASE_API_KEY=your-api-key-here
COINBASE_WEBHOOK_SECRET=your-webhook-secret-here
```

### Set Up Webhooks

1. In Coinbase Commerce: **Settings → Webhook subscriptions**
2. Add endpoint URL:
   ```
   https://yourdomain.com/api/transactions/webhooks/coinbase
   ```
3. Select events:
   - ✅ `charge:created`
   - ✅ `charge:confirmed`
   - ✅ `charge:failed`

---

## 🔧 Complete Environment Configuration

Create or update `songiq/server/.env`:

```bash
# ==========================================
# PAYMENT PROVIDERS
# ==========================================

# Stripe (Primary Fiat Provider)
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Circle (USDC Provider)
CIRCLE_API_KEY=TEST:your-circle-api-key
CIRCLE_ENTITY_ID=your-entity-id

# Coinbase Commerce (Crypto Payments)
COINBASE_API_KEY=your-coinbase-api-key
COINBASE_WEBHOOK_SECRET=your-webhook-secret

# ==========================================
# BLOCKCHAIN (Already configured)
# ==========================================
ETH_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
WALLET_ENCRYPTION_KEY=your-32-byte-hex-key

# ==========================================
# DATABASE & SERVER (Already configured)
# ==========================================
MONGODB_URI=mongodb://localhost:27017/songiq
JWT_SECRET=your-jwt-secret
PORT=5001
NODE_ENV=development
```

---

## 🧪 Testing Payment Providers

### Test Script

Create `songiq/server/scripts/test-payments.ts`:

```typescript
import dotenv from 'dotenv';
dotenv.config();

import fiatIntegrationService from '../src/services/fiatIntegrationService';

async function testPayments() {
  console.log('🧪 Testing Payment Providers\n');

  // Test which providers are available
  const providers = fiatIntegrationService.getSupportedPaymentMethods();
  console.log('Available providers:', providers);
  console.log('');

  // Test Stripe
  if (providers.includes('stripe')) {
    console.log('Testing Stripe...');
    try {
      const result = await fiatIntegrationService.createStripeDeposit(
        'test-user-id',
        100,
        'USD'
      );
      console.log('✅ Stripe test successful:', result);
    } catch (error: any) {
      console.log('❌ Stripe test failed:', error.message);
    }
    console.log('');
  }

  // Test Circle
  if (providers.includes('circle')) {
    console.log('Testing Circle...');
    try {
      const result = await fiatIntegrationService.createCircleDeposit(
        'test-user-id',
        100
      );
      console.log('✅ Circle test successful:', result);
    } catch (error: any) {
      console.log('❌ Circle test failed:', error.message);
    }
    console.log('');
  }

  // Test Coinbase
  if (providers.includes('coinbase')) {
    console.log('Testing Coinbase...');
    try {
      const result = await fiatIntegrationService.createCoinbaseDeposit(
        'test-user-id',
        100,
        'USDC'
      );
      console.log('✅ Coinbase test successful:', result);
    } catch (error: any) {
      console.log('❌ Coinbase test failed:', error.message);
    }
    console.log('');
  }

  console.log('Testing complete!');
  process.exit(0);
}

testPayments();
```

### Run Tests

```bash
cd songiq/server
npx ts-node scripts/test-payments.ts
```

---

## 📝 API Usage Examples

### Deposit via Stripe

```bash
curl -X POST http://localhost:5001/api/transactions/deposit/fiat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USD",
    "provider": "stripe"
  }'
```

Response:
```json
{
  "transactionId": "...",
  "status": "pending",
  "amount": 100,
  "currency": "USD",
  "paymentUrl": "pi_xxxxx_secret_xxxxx"
}
```

### Deposit via Circle (USDC)

```bash
curl -X POST http://localhost:5001/api/transactions/deposit/fiat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USDC",
    "provider": "circle"
  }'
```

### Deposit via Coinbase

```bash
curl -X POST http://localhost:5001/api/transactions/deposit/fiat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "USDC",
    "provider": "coinbase"
  }'
```

### Withdraw via Stripe

```bash
curl -X POST http://localhost:5001/api/transactions/withdrawal/fiat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "currency": "USD",
    "bankAccountId": "ba_xxxxx",
    "provider": "stripe"
  }'
```

---

## 🔒 Security Best Practices

### 1. API Keys

- ✅ Never commit API keys to Git
- ✅ Use `.env` files (added to `.gitignore`)
- ✅ Rotate keys regularly
- ✅ Use test keys in development
- ✅ Use live keys only in production

### 2. Webhooks

- ✅ Verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement idempotency
- ✅ Log all webhook events
- ✅ Handle retries gracefully

### 3. PCI Compliance

For Stripe credit cards:
- ✅ Never store card details on your server
- ✅ Use Stripe Elements or Checkout
- ✅ Let Stripe handle PCI compliance
- ✅ Use tokenization

---

## 🎯 Production Checklist

### Before Going Live

- [ ] Switch to live API keys
- [ ] Enable webhook signature verification
- [ ] Set up SSL/HTTPS
- [ ] Configure production URLs
- [ ] Test with real cards (small amounts)
- [ ] Set up monitoring and alerts
- [ ] Review fee structures
- [ ] Complete KYC/AML requirements
- [ ] Set up reconciliation process
- [ ] Configure tax reporting

### Stripe Production

1. Complete business verification
2. Activate live mode
3. Update API keys to live keys
4. Configure live webhook endpoint
5. Test with real payment methods
6. Enable 3D Secure for card payments
7. Set up fraud detection rules

### Circle Production

1. Complete KYC verification
2. Get production API access
3. Set up bank accounts
4. Configure USDC settlement
5. Test production transfers

### Coinbase Production

1. Verify business account
2. Set up production webhooks
3. Configure crypto settlement
4. Test with real transactions

---

## 📊 Monitoring & Analytics

### Track These Metrics

1. **Deposit Success Rate**
   - Total deposits attempted
   - Successful deposits
   - Failed deposits (with reasons)

2. **Withdrawal Success Rate**
   - Total withdrawals requested
   - Successful withdrawals
   - Failed withdrawals (with reasons)

3. **Processing Times**
   - Average deposit time
   - Average withdrawal time
   - Peak processing times

4. **Fees**
   - Total fees paid to providers
   - Average fee per transaction
   - Monthly fee trends

5. **User Behavior**
   - Preferred payment method
   - Average deposit amount
   - Average withdrawal amount

### Set Up Alerts

```javascript
// Alert on failed payments
if (failureRate > 5%) {
  sendAlert('High payment failure rate');
}

// Alert on large transactions
if (amount > 10000) {
  sendAlert('Large transaction detected');
}

// Alert on suspicious activity
if (multipleFailedAttempts) {
  sendAlert('Possible fraud attempt');
}
```

---

## 🐛 Troubleshooting

### Stripe Issues

**"Invalid API key"**
- Check key format (starts with `sk_test_` or `sk_live_`)
- Verify key is from correct account
- Try regenerating key

**"Webhook signature verification failed"**
- Check webhook secret is correct
- Ensure raw body is used for verification
- Verify endpoint URL matches

**"Card declined"**
- Use test card numbers in test mode
- Check card expiry and CVC
- Verify sufficient funds

### Circle Issues

**"Unauthorized"**
- Check API key format
- Verify account is approved
- Check API permissions

**"USDC transfer failed"**
- Verify USDC balance
- Check wallet address
- Confirm network (Ethereum/Polygon)

### Coinbase Issues

**"Charge expired"**
- Payment window expired (usually 1 hour)
- Create new charge

**"Webhook not received"**
- Check webhook URL is accessible
- Verify webhook secret
- Check firewall settings

---

## 💡 Tips & Best Practices

### User Experience

1. **Clear Communication**
   - Show processing times
   - Display fees upfront
   - Provide transaction receipts

2. **Error Handling**
   - User-friendly error messages
   - Retry mechanisms
   - Support contact info

3. **Payment Options**
   - Offer multiple providers
   - Show recommended option
   - Remember user preferences

### Cost Optimization

1. **Fee Comparison**
   - Stripe: ~2.9% + $0.30
   - Circle: Lower for USDC
   - Coinbase: Crypto network fees

2. **Batch Processing**
   - Group small withdrawals
   - Schedule during low-fee periods
   - Use optimal networks

3. **Provider Selection**
   - Route based on amount
   - Consider user location
   - Factor in conversion rates

---

## 📚 Additional Resources

### Documentation

- **Stripe**: https://stripe.com/docs
- **Circle**: https://developers.circle.com/
- **Coinbase Commerce**: https://commerce.coinbase.com/docs/

### Testing Tools

- **Stripe CLI**: For webhook testing
- **Postman Collections**: API testing
- **Request.bin**: Webhook debugging

### Support

- **Stripe Support**: https://support.stripe.com
- **Circle Support**: support@circle.com
- **Coinbase Support**: commerce@coinbase.com

---

## ✅ Summary

After setup, you'll have:
- ✅ Multiple payment options for users
- ✅ Automated deposit processing
- ✅ Secure withdrawal handling
- ✅ Webhook-based confirmations
- ✅ Production-ready infrastructure

**Start with Stripe in test mode, then expand to other providers as needed!**

