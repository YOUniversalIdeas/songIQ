import express from 'express';
import { stripe, SUBSCRIPTION_PLANS } from '../config/stripe';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { sendVerificationEmail } from '../services/emailService';

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

// Test subscription creation without authentication (for testing)
router.post('/create-test-subscription', async (req, res) => {
  try {
    const { priceId, planType, email = 'test@example.com' } = req.body;

    if (!priceId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and plan type are required'
      });
    }

    // Create a real Stripe PaymentIntent for testing
    const paymentIntent = await stripe.paymentIntents.create({
      amount: planType === 'basic' ? 999 : planType === 'pro' ? 2999 : 9999, // Amount in cents
      currency: 'usd',
      metadata: {
        planType: planType,
        priceId: priceId,
        email: email
      }
    });

    return res.json({
      success: true,
      message: 'Test payment intent created successfully',
      subscriptionId: 'test_sub_' + Date.now(),
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating test payment intent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test payment intent'
    });
  }
});

// Sign up for free plan (no payment required)
router.post('/signup-free', async (req, res) => {
  try {
    const { email, firstName, lastName, username, password } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, firstName, lastName, username, password'
      });
    }

    // Check if database is available
    let dbAvailable = true;
    try {
      // Test database connection with a timeout
      await Promise.race([
        User.findOne({ email: 'test@test.com' }).exec(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000))
      ]);
    } catch (dbError) {
      console.log('Database not available, using mock response');
      dbAvailable = false;
    }

    if (dbAvailable) {
      // Check if user already exists
      const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    let user, token, userResponse, emailSent;

    if (dbAvailable) {
      // Create new user with free plan
      user = new User({
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        username: username.toLowerCase(),
        isVerified: false, // Start as unverified
        subscription: {
          plan: 'free',
          status: 'active',
          features: ['basic_analysis'],
          usage: {
            songsAnalyzed: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        }
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      emailSent = await sendVerificationEmail(
        user.email,
        user.firstName,
        verificationToken
      );

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Return user data and token
      userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isVerified: user.isVerified,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          usage: user.subscription.usage
        },
        songLimit: user.getSongLimit(),
        remainingSongs: user.getRemainingSongs()
      };
    } else {
      // Mock response when database is not available
      const mockUserId = 'mock_' + Date.now();
      const jwt = require('jsonwebtoken');
      token = jwt.sign(
        { id: mockUserId, email: email.toLowerCase(), role: 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      userResponse = {
        id: mockUserId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        username: username.toLowerCase(),
        isVerified: false,
        subscription: {
          plan: 'free',
          status: 'active',
          usage: {
            songsAnalyzed: 0,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        },
        songLimit: 3,
        remainingSongs: 3
      };

      // Try to send verification email (will fail gracefully if email not configured)
      try {
        emailSent = await sendVerificationEmail(
          email.toLowerCase(),
          firstName,
          'mock_token_' + Date.now()
        );
      } catch (emailError) {
        console.log('Email service not configured, skipping email verification');
        emailSent = false;
      }
    }

    return res.json({
      success: true,
      message: emailSent 
        ? 'Successfully signed up for free plan! Please check your email to verify your account.'
        : 'Successfully signed up for free plan! (Email verification not available)',
      user: userResponse,
      token,
      plan: SUBSCRIPTION_PLANS.free,
      songsRemaining: userResponse.remainingSongs,
      emailVerificationSent: emailSent
    });
  } catch (error: any) {
    console.error('Error signing up for free plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sign up for free plan',
      error: error.message
    });
  }
});

// Create a Stripe customer and subscription
router.post('/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { priceId, planType } = req.body;
    const userId = req.user!.id;

    if (!priceId || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Price ID and plan type are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let customerId = user.subscription.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId,
        planType: planType
      }
    });

    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(userId, {
      'subscription.stripeCustomerId': customerId
    });

    return res.json({
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create subscription'
    });
  }
});

// Get user's current subscription
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let subscription = null;
    if (user.subscription.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
      } catch (error) {
        console.error('Error retrieving Stripe subscription:', error);
      }
    }

    return res.json({
      success: true,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        features: user.subscription.features,
        stripeSubscription: subscription
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription'
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'canceled',
      'subscription.endDate': new Date((subscription as any).current_period_end * 1000)
    });

    return res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Reactivate subscription
router.post('/reactivate-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update user subscription
    await User.findByIdAndUpdate(userId, {
      'subscription.status': 'active',
      'subscription.endDate': null
    });

    return res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription'
    });
  }
});

// Update payment method
router.post('/update-payment-method', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const userId = req.user!.id;

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.subscription.stripeCustomerId) {
      return res.status(404).json({
        success: false,
        message: 'No customer found'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.subscription.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(user.subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return res.json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
});

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);

    if (!user || !user.subscription.stripeCustomerId) {
      return res.json({
        success: true,
        paymentMethods: []
      });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.subscription.stripeCustomerId,
      type: 'card',
    });

    return res.json({
      success: true,
      paymentMethods: paymentMethods.data
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// Create payment intent for one-time payments
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;
    const userId = req.user!.id;

    if (!amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Amount and description are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let customerId = user.subscription.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: userId
        }
      });
      customerId = customer.id;

      await User.findByIdAndUpdate(userId, {
        'subscription.stripeCustomerId': customerId
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      description,
      metadata: {
        userId: userId
      }
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

export default router; 