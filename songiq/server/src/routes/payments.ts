import express from 'express';
import { SUBSCRIPTION_PLANS } from '../config/stripe';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import jwt from 'jsonwebtoken';

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
    res.json({
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
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.'
    });
  }
});

export default router;
