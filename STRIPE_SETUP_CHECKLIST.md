# 🚀 Stripe Setup Checklist for songIQ

## ✅ Step 1: Stripe Dashboard Setup

### 1.1 Create Products & Prices
- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com/)
- [ ] Navigate to **Products → Add Product**
- [ ] Create **Basic Plan** ($9.99/month)
  - [ ] Copy Price ID (starts with `price_`)
- [ ] Create **Pro Plan** ($29.99/month)
  - [ ] Copy Price ID (starts with `price_`)
- [ ] Create **Enterprise Plan** ($99.99/month)
  - [ ] Copy Price ID (starts with `price_`)

### 1.2 Get API Keys
- [ ] Go to **Developers → API keys**
- [ ] Copy **Publishable key** (starts with `pk_live_`)
- [ ] Copy **Secret key** (starts with `sk_live_`)

### 1.3 Set Up Webhooks
- [ ] Go to **Developers → Webhooks**
- [ ] Click **Add endpoint**
- [ ] Set **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
- [ ] Select **Events to send:**
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
  - [ ] `customer.subscription.trial_will_end`
- [ ] Copy **Webhook secret** (starts with `whsec_`)

## ✅ Step 2: Update Environment Files

### 2.1 Server Environment
- [ ] Copy `env-template.txt` to `.env.production`
- [ ] Add real Stripe keys to environment files:
  ```
  # STRIPE_PUBLISHABLE_KEY=
  # STRIPE_SECRET_KEY=
  # STRIPE_WEBHOOK_SECRET=
  # STRIPE_BASIC_PLAN_PRICE_ID=
  # STRIPE_PRO_PLAN_PRICE_ID=
  # STRIPE_ENTERPRISE_PLAN_PRICE_ID=
  ```

### 2.2 Client Environment
- [ ] Copy `env-template.txt` to `.env.production` in client directory
- [ ] Add real Stripe key:
  ```
  # VITE_STRIPE_PUBLISHABLE_KEY=
  ```

## ✅ Step 3: Test Your Setup

### 3.1 Test Mode First (Recommended)
- [ ] Use test keys first (`pk_test_` and `sk_test_`)
- [ ] Create test products with test price IDs
- [ ] Test complete payment flow
- [ ] Verify webhook processing

### 3.2 Switch to Live Mode
- [ ] Replace test keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with small amount first
- [ ] Monitor webhook events

## ✅ Step 4: Security & Best Practices

### 4.1 Environment Security
- [ ] Never commit `.env` files to git
- [ ] Use different keys for staging/production
- [ ] Rotate keys regularly
- [ ] Monitor Stripe dashboard for suspicious activity

### 4.2 Webhook Security
- [ ] Verify webhook signatures (already implemented)
- [ ] Use HTTPS for webhook endpoints
- [ ] Monitor webhook failures
- [ ] Set up webhook retry logic

## ✅ Step 5: Monitoring & Maintenance

### 5.1 Stripe Dashboard
- [ ] Monitor payment success/failure rates
- [ ] Check webhook delivery status
- [ ] Review customer subscriptions
- [ ] Monitor revenue analytics

### 5.2 Application Monitoring
- [ ] Log Stripe API calls
- [ ] Monitor webhook processing
- [ ] Track subscription lifecycle events
- [ ] Set up error alerts

## 🔧 Troubleshooting

### Common Issues:
- **Webhook failures:** Check endpoint URL and secret
- **Payment failures:** Verify price IDs and plan configuration
- **API errors:** Check key permissions and account status
- **Subscription sync:** Verify webhook event handling

### Support Resources:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Community](https://community.stripe.com/)

## 📝 Notes

- Keep your secret keys secure and never expose them in client-side code
- Test thoroughly in test mode before going live
- Monitor your Stripe dashboard regularly for any issues
- Consider implementing Stripe Radar for fraud detection
- Set up proper error handling and logging for production use

---

**Next Steps:** Complete each checkbox above, then test your payment flow. Once everything works in test mode, switch to live mode for real payments!
