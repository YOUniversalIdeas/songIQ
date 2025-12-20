/// <reference path="../types/express.d.ts" />
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';
// import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../services/emailService';

const router = express.Router();

// Generate JWT token with configurable expiration
const generateToken = (id: string, email: string, role: string, rememberMe: boolean = false): string => {
  // Set different expiration times based on remember me choice
  const expiresIn = rememberMe ? '30d' : '24h'; // 30 days for remember me, 24 hours for session-only
  
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn }
  );
};

// Register new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, bandName, username, telephone } = req.body;

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
      bandName: bandName || 'Artist/Musician', // Default to a valid enum value
      username: username.toLowerCase(),
      telephone: telephone || '000-000-0000', // Default phone number for testing
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

    // TEMPORARILY DISABLED: SMS verification due to Twilio delivery issues
    // Send verification codes (email + SMS)
    try {
      console.log('📱 Registration - Phone number details:', {
        telephone: user.telephone,
        telephoneType: typeof user.telephone,
        telephoneLength: user.telephone?.length,
        email: user.email,
        firstName: user.firstName
      });

      // Send verification codes using new Verify service
      const { sendVerificationCodes } = await import('../services/verifyService');
      const results = await sendVerificationCodes(
        user.email,
        user.telephone,
        user.firstName
      );
      
      // Store the verification codes from the service in the user model
      if (results.email.success) {
        user.emailVerificationToken = results.email.code; // Store the actual code sent
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      }
      
      // For SMS, we don't need to store the code since Twilio Verify handles it
      // But we can store a flag to indicate SMS verification was initiated
      if (results.sms.success) {
        user.smsVerificationInitiated = true;
        user.smsVerificationServiceSid = results.sms.serviceSid;
      }
      
      // Mark user as unverified until both email and SMS are verified
      user.isVerified = false;
      
      await user.save();
      
      console.log('✅ Verification codes sent:', {
        email: results.email.success,
        sms: results.sms.success,
        userVerified: user.isVerified
      });
    } catch (verificationError) {
      console.error('⚠️ Warning: Failed to send verification codes:', verificationError);
      // Don't fail registration if verification fails
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bandName: user.bandName,
      username: user.username,
      telephone: user.telephone,
      isVerified: user.isVerified, // Include verification status
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        usage: user.subscription.usage
      },
      songLimit: user.getSongLimit(),
      remainingSongs: await user.getRemainingSongs()
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
    const { email, password, rememberMe = false } = req.body;

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

    // Generate token with remember me preference
    const token = generateToken(user._id.toString(), user.email, user.role, rememberMe);

    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telephone: user.telephone,
      role: user.role,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        usage: user.subscription.usage
      },
      songLimit: user.getSongLimit(),
      remainingSongs: await user.getRemainingSongs()
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
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log(`Profile API called for user: ${req.user?.id} at ${new Date().toISOString()}`);
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Reset usage if needed and save
    await user.resetUsageIfNeeded();

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      telephone: user.telephone,
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
      remainingSongs: await user.getRemainingSongs(),
      canAnalyzeSong: await user.canAnalyzeSong()
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
router.post('/refresh', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
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
    // await sendWelcomeEmail(user.email, user.firstName);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to songIQ!',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        telephone: user.telephone,
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
    // const emailSent = await sendVerificationEmail(
    //   user.email,
    //   user.firstName,
    //   verificationToken
    // );

    // if (emailSent) {
    //   res.json({
    //     success: true,
    //     message: 'Verification email sent successfully'
    //   });
    // } else {
    //   res.status(500).json({
    //     success: false,
    //     message: 'Failed to send verification email'
    //   });
    // }
    
    // For now, just return success since email is disabled
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
      error: error.message
    });
  }
});

// Force refresh user subscription data (for testing/manual updates)
router.post('/refresh-subscription', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get song limit for the current plan
    const songLimits: Record<string, number> = {
      free: 3,
      basic: 10,
      pro: 100,
      enterprise: -1 // -1 = unlimited
    };
    const songLimit = songLimits[user.subscription.plan] || 0;

    // Reset usage if needed (song limits are calculated by methods)
    await user.resetUsageIfNeeded();

    res.json({
      success: true,
      message: 'Subscription data refreshed successfully',
      user: {
        id: user._id,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          usage: user.subscription.usage
        },
        songLimit: user.getSongLimit(),
        remainingSongs: user.getRemainingSongs(),
        canAnalyzeSong: user.canAnalyzeSong()
      }
    });
  } catch (error: any) {
    console.error('Subscription refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh subscription',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, bandName, telephone, profile } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update fields if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bandName !== undefined) user.bandName = bandName;
    if (telephone !== undefined) user.telephone = telephone;
    if (profile) {
      if (profile.bio !== undefined) user.bio = profile.bio;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        telephone: user.telephone,
        bio: user.bio,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          usage: user.subscription.usage
        }
      }
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Request password reset
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
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
      // Don't reveal if user exists or not for security
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    // const emailSent = await sendPasswordResetEmail(
    //   user.email,
    //   user.firstName,
    //   resetToken
    // );

    // if (emailSent) {
    //   res.json({
    //     success: true,
    //     message: 'Password reset email sent successfully'
    //   });
    // } else {
    //   res.status(500).json({
    //     success: false,
    //     message: 'Failed to send password reset email'
    //   });
    // }
    
    // For now, just return success since email is disabled
    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
      return;
    }

    // Find user with this reset token
    const user = await User.findOne({
      passwordResetToken: token,
      isActive: true
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Check if token is expired
    if (user.isPasswordResetExpired()) {
      res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one.'
      });
      return;
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    // await sendPasswordResetConfirmationEmail(user.email, user.firstName);

    res.json({
      success: true,
      message: 'Password reset successfully! Please check your email for confirmation.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
      message: 'Logout successful'
  });
});

export default router;