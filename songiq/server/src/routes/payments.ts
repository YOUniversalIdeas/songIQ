import express from 'express';
import { SUBSCRIPTION_PLANS, STRIPE_CONFIG, stripe } from '../config/stripe';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import Stripe from 'stripe';

type PlanType = 'free' | 'basic' | 'pro' | 'enterprise';

const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

// Sign up for free plan
router.post('/signup-free', async (req, res) => {
  try {
    const { email, firstName, lastName, username, password, bandName, telephone } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !username || !password || !bandName || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, firstName, lastName, username, password, bandName, telephone'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email,
      firstName,
      lastName,
      username,
      password: hashedPassword,
      bandName,
      telephone,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: null // Free plan has no end date
      },
      role: 'user'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return success response
    return res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        role: newUser.role,
        subscription: newUser.subscription
      },
      token,
      emailVerificationSent: false // Set to true if you implement email verification
    });

  } catch (error) {
    console.error('Error creating free account:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
});

// Upgrade subscription for existing users
router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const { planType, priceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate plan type
    if (!planType || !SUBSCRIPTION_PLANS[planType as PlanType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already on this plan or higher
    const currentPlan = user.subscription.plan;
    const planHierarchy = { free: 0, basic: 1, pro: 2, enterprise: 3 };
    
    if (planHierarchy[planType as PlanType] <= planHierarchy[currentPlan as PlanType]) {
      return res.status(400).json({
        success: false,
        message: `You are already on the ${currentPlan} plan or higher. Please choose a different plan.`
      });
    }

    // For now, simulate successful upgrade (in production, integrate with Stripe)
    const newPlan = SUBSCRIPTION_PLANS[planType as PlanType];
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    // Update user subscription
    user.subscription = {
      plan: planType as PlanType,
      status: 'active',
      startDate: now,
      endDate: endDate,
      stripeCustomerId: user.subscription.stripeCustomerId || null,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId || null,
      stripePriceId: priceId,
      features: newPlan.features || [],
      usage: {
        songsAnalyzed: 0, // Reset usage for new billing period
        currentPeriodStart: now,
        currentPeriodEnd: endDate
      }
    };

    await user.save();

    // Return success response
    return res.json({
      success: true,
      message: `Successfully upgraded to ${newPlan.name}`,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription. Please try again.'
    });
  }
});

// Create Stripe checkout session for subscription upgrade
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured. Please contact support.'
      });
    }

    const { planType, priceId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate plan type
    if (!planType || !SUBSCRIPTION_PLANS[planType as PlanType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const plan = SUBSCRIPTION_PLANS[planType as PlanType];
    console.log('Creating checkout session for plan:', planType, 'with priceId:', plan.priceId);
    
    // Check if plan has a valid price ID
    if (!plan.priceId || plan.priceId === '') {
      return res.status(400).json({
        success: false,
        message: `Plan ${planType} is not available for purchase. Please contact support.`
      });
    }
    
    // Create or get Stripe customer
    let customerId = user.subscription.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with customer ID
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3001'}/pricing?upgrade=cancelled`,
      metadata: {
        userId: userId.toString(),
        planType: planType,
        priceId: plan.priceId
      }
    });

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session. Please try again.',
      error: error.message || 'Unknown error'
    });
  }
});

// Debug endpoint to test Stripe without authentication
router.post('/test-stripe', async (req, res) => {
  try {
    console.log('Testing Stripe configuration...');
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');
    console.log('STRIPE_BASIC_PLAN_PRICE_ID:', process.env.STRIPE_BASIC_PLAN_PRICE_ID);
    
    // Test Stripe initialization
    const testStripe = process.env.STRIPE_SECRET_KEY && 
      process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
      process.env.STRIPE_SECRET_KEY.length > 20
      ? new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2025-07-30.basil',
        })
      : null;
    
    if (!testStripe) {
      return res.status(500).json({ error: 'Stripe not properly configured' });
    }
    
    if (!process.env.STRIPE_BASIC_PLAN_PRICE_ID) {
      return res.status(500).json({ error: 'STRIPE_BASIC_PLAN_PRICE_ID not configured' });
    }
    
    // Test retrieving the price
    const price = await testStripe.prices.retrieve(process.env.STRIPE_BASIC_PLAN_PRICE_ID);
    console.log('Price retrieved:', price.id);
    
    res.json({
      success: true,
      message: 'Stripe test successful',
      priceId: price.id,
      priceAmount: price.unit_amount
    });
    
  } catch (error) {
    console.error('Stripe test error:', error);
    res.status(500).json({
      success: false,
      message: 'Stripe test failed',
      error: error.message
    });
    return;
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  // Check if Stripe is configured
  if (!stripe) {
    console.log('Stripe webhook received but Stripe is not configured');
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment succeeded:', session.id);
      
      // Update user subscription
      try {
        const user = await User.findOne({ email: session.customer_email });
        if (user) {
          // Get the subscription plan from metadata
          const planType = session.metadata?.planType || 'basic';
          
          // Update user subscription
          user.subscription = {
            plan: planType as PlanType,
            startDate: new Date(),
            status: 'active',
            stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
            stripePriceId: session.metadata?.priceId,
            features: [],
            usage: {
              songsAnalyzed: 0,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
          };
          
          await user.save();
          console.log(`Updated subscription for user ${user.email} to ${planType}`);
        }
      } catch (error) {
        console.error('Error updating user subscription:', error);
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Endpoint to update subscription after successful payment (fallback for development)
router.post('/update-subscription', async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured. Please contact support.'
      });
    }

    const { sessionId, userId } = req.body;
    console.log('Received update-subscription request:', { sessionId, userId });

    if (!sessionId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and User ID are required'
      });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the subscription plan from metadata
    const planType = session.metadata?.planType || 'basic';
    
    // Update user subscription
    user.subscription = {
      plan: planType as PlanType,
      startDate: new Date(),
      status: 'active',
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
      stripePriceId: session.metadata?.priceId,
      features: [],
      usage: {
        songsAnalyzed: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    };
    
    await user.save();
    console.log(`Updated subscription for user ${user.email} to ${planType}`);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      user: {
        id: user._id,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
    return;
  }
});

export default router;
