import express from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import User from '../models/User';

const router = express.Router();

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!STRIPE_CONFIG.webhookSecret) {
    console.error('Stripe webhook secret not configured');
    res.status(400).send('Webhook secret not configured');
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, STRIPE_CONFIG.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    case 'customer.subscription.trial_will_end':
      await handleTrialWillEnd(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleSubscriptionCreated(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    // Determine plan type from price ID
    let planType = 'basic';
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      if (priceId.includes('pro')) planType = 'pro';
      else if (priceId.includes('enterprise')) planType = 'enterprise';
    }

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': planType,
      'subscription.stripeSubscriptionId': subscription.id,
      'subscription.stripePriceId': subscription.items.data[0]?.price.id,
      'subscription.status': subscription.status,
      'subscription.startDate': new Date(subscription.current_period_start * 1000),
      'subscription.endDate': new Date(subscription.current_period_end * 1000),
      'subscription.features': getFeaturesForPlan(planType)
    });

    console.log(`Subscription created for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for subscription:', subscription.id);
      return;
    }

    // Determine plan type from price ID
    let planType = 'basic';
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      if (priceId.includes('pro')) planType = 'pro';
      else if (priceId.includes('enterprise')) planType = 'enterprise';
    }

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': planType,
      'subscription.status': subscription.status,
      'subscription.endDate': new Date(subscription.current_period_end * 1000),
      'subscription.features': getFeaturesForPlan(planType)
    });

    console.log(`Subscription updated for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update user subscription to free plan
    await User.findByIdAndUpdate(userId, {
      'subscription.plan': 'free',
      'subscription.status': 'canceled',
      'subscription.endDate': new Date(),
      'subscription.features': getFeaturesForPlan('free')
    });

    console.log(`Subscription deleted for user ${userId}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription status
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'active'
    });

    console.log(`Payment succeeded for user ${userId}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const userId = subscription.metadata?.userId;
    
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    // Update subscription status
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'past_due'
    });

    console.log(`Payment failed for user ${userId}: ${invoice.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleTrialWillEnd(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    console.log(`Trial will end for user ${userId}: ${subscription.id}`);
    // You could send an email notification here
  } catch (error) {
    console.error('Error handling trial will end:', error);
  }
}

function getFeaturesForPlan(planType: string): string[] {
  switch (planType) {
    case 'basic':
      return ['basic_analysis'];
    case 'pro':
      return ['basic_analysis', 'advanced_analysis', 'market_insights', 'priority_support'];
    case 'enterprise':
      return ['basic_analysis', 'advanced_analysis', 'market_insights', 'priority_support', 'bulk_upload', 'api_access', 'white_label', 'custom_integrations'];
    default:
      return [];
  }
}

export default router; 