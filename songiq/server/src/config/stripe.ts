import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Create a placeholder Stripe instance if keys aren't available
export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder',
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    priceId: null as string | null, // No Stripe price needed for free plan
    price: 0,
    songLimit: 3,
    features: [
      'Basic song analysis',
      'Up to 3 songs total',
      'Standard reports',
      'Perfect for trying songIQ'
    ]
  },
  basic: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PLAN_PRICE_ID || 'price_basic_placeholder',
    price: 9.99,
    songLimit: 10,
    features: [
      'Basic song analysis',
      'Up to 10 songs per month',
      'Standard reports'
    ]
  },
  pro: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PLAN_PRICE_ID || 'price_pro_placeholder',
    price: 29.99,
    songLimit: 100,
    features: [
      'Advanced song analysis',
      'Up to 100 songs per month',
      'Detailed reports',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise Plan',
    priceId: process.env.STRIPE_ENTERPRISE_PLAN_PRICE_ID || 'price_enterprise_placeholder',
    price: 99.99,
    songLimit: -1, // -1 = unlimited
    features: [
      'Full song analysis suite',
      'Unlimited songs',
      'Custom reports',
      'API access',
      'Dedicated support'
    ]
  }
}; 