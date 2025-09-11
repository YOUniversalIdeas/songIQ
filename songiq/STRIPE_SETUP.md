# Stripe Payment System Setup Guide

This guide will help you set up the Stripe payment system for your songIQ application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. MongoDB database running

## Step 1: Stripe Dashboard Setup

### 1.1 Get Your API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** > **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Make sure you're using **Test keys** for development

### 1.2 Create Products and Prices

1. Go to **Products** in your Stripe Dashboard
2. Create three products for your subscription plans:

#### Basic Plan
- **Name**: Basic Plan
- **Price**: $9.99/month
- **Billing**: Recurring
- **Billing period**: Monthly
- Copy the **Price ID** (starts with `price_`)

#### Pro Plan
- **Name**: Pro Plan
- **Price**: $29.99/month
- **Billing**: Recurring
- **Billing period**: Monthly
- Copy the **Price ID** (starts with `price_`)

#### Enterprise Plan
- **Name**: Enterprise Plan
- **Price**: $99.99/month
- **Billing**: Recurring
- **Billing period**: Monthly
- Copy the **Price ID** (starts with `price_`)

### 1.3 Set Up Webhooks

1. Go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe` (for production)
   - For development, use a tool like ngrok: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

## Step 2: Environment Variables

### 2.1 Backend (.env file in server directory)

Create a `.env` file in the `songiq/server/` directory:

```env
# Existing variables...

# Stripe Configuration
# STRIPE_PUBLISHABLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=

# Stripe Price IDs
# STRIPE_BASIC_PLAN_PRICE_ID=
# STRIPE_PRO_PLAN_PRICE_ID=
# STRIPE_ENTERPRISE_PLAN_PRICE_ID=
```

### 2.2 Frontend (.env file in client directory)

Create a `.env` file in the `songiq/client/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5001

# Stripe Configuration
# VITE_STRIPE_PUBLISHABLE_KEY=
```

## Step 3: Install Dependencies

The Stripe dependencies have already been installed:

### Backend
```bash
cd songiq/server
npm install stripe @types/stripe
```

### Frontend
```bash
cd songiq/client
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Step 4: Database Schema Update

The User model has been updated to include Stripe fields:
- `subscription.stripeCustomerId`
- `subscription.stripeSubscriptionId`
- `subscription.stripePriceId`
- `subscription.status`

## Step 5: Testing the Setup

### 5.1 Test Cards

Use these test card numbers in Stripe:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient funds**: 4000 0000 0000 9995

### 5.2 Test the Integration

1. Start your server: `cd songiq/server && npm run dev`
2. Start your client: `cd songiq/client && npm run dev`
3. Navigate to `/pricing` page
4. Try subscribing with a test card

## Step 6: Production Deployment

### 6.1 Update Environment Variables

1. Switch to **Live keys** in Stripe Dashboard
2. Update all environment variables with live keys
3. Update webhook endpoint URL to your production domain

### 6.2 Security Considerations

1. Never commit `.env` files to version control
2. Use environment variables in production
3. Enable webhook signature verification
4. Use HTTPS in production

## API Endpoints

The following payment endpoints are available:

### GET /api/payments/plans
Get available subscription plans

### POST /api/payments/create-subscription
Create a new subscription

### GET /api/payments/subscription
Get current user's subscription

### POST /api/payments/cancel-subscription
Cancel current subscription

### POST /api/payments/reactivate-subscription
Reactivate canceled subscription

### POST /api/payments/update-payment-method
Update payment method

### GET /api/payments/payment-methods
Get user's payment methods

### POST /api/payments/create-payment-intent
Create one-time payment intent

### POST /api/webhooks/stripe
Stripe webhook handler

## Components

### Frontend Components

1. **StripeProvider**: Wraps the app with Stripe context
2. **SubscriptionPlans**: Displays plans and handles subscriptions
3. **SubscriptionManagement**: Manages existing subscriptions
4. **PricingPage**: Main pricing page

### Usage

```tsx
// Wrap your app with StripeProvider
import StripeProvider from './components/StripeProvider';

function App() {
  return (
    <StripeProvider>
      {/* Your app components */}
    </StripeProvider>
  );
}

// Use subscription components
import SubscriptionPlans from './components/SubscriptionPlans';
import SubscriptionManagement from './components/SubscriptionManagement';
```

## Troubleshooting

### Common Issues

1. **"Stripe has not loaded yet"**
   - Check that `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure the key starts with `pk_test_` or `pk_live_`

2. **"Webhook signature verification failed"**
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint URL is accessible

3. **"Price ID not found"**
   - Check that price IDs in environment variables match Stripe dashboard
   - Verify price IDs start with `price_`

4. **Payment fails**
   - Use test card numbers for development
   - Check Stripe Dashboard for error details

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application-specific issues:
- Check the server logs for detailed error messages
- Verify all environment variables are set correctly 