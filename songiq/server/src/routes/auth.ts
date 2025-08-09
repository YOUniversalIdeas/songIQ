import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/emailService';

const router = express.Router();

// Generate JWT token
const generateToken = (id: string, email: string, role: string): string => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !username) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    const existingUserByUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUserByUsername) {
      res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
      return;
    }

    // Create new user with free plan
    const user = new User({
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
    const emailSent = await sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken
    );

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        usage: user.subscription.usage
      },
      songLimit: user.getSongLimit(),
      remainingSongs: user.getRemainingSongs()
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        usage: user.subscription.usage
      },
      songLimit: user.getSongLimit(),
      remainingSongs: user.getRemainingSongs()
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Reset usage if needed and save
    user.resetUsageIfNeeded();
    await user.save();

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      profilePicture: user.profilePicture,
      bio: user.bio,
      role: user.role,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        usage: user.subscription.usage
      },
      stats: user.stats,
      songLimit: user.getSongLimit(),
      remainingSongs: user.getRemainingSongs(),
      canAnalyzeSong: user.canAnalyzeSong()
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Generate new token
    const token = generateToken(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      token
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error.message
    });
  }
});

// Verify email
router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
      return;
    }

    // Find user with this verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      isVerified: false
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
      return;
    }

    // Check if token is expired
    if (user.isEmailVerificationExpired()) {
      res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
      return;
    }

    // Verify the user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to songIQ!',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: error.message
    });
  }
});

// Resend verification email
router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
      return;
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(
      user.email,
      user.firstName,
      verificationToken
    );

    if (emailSent) {
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;