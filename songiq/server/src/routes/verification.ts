import express from 'express';
import { sendVerificationCodes, verifySMSCode, verifyEmailCode } from '../services/verificationService';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Send verification codes (email + SMS)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const userId = (req as any).user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate and store verification codes
    const emailCode = user.generateEmailVerificationToken();
    const smsCode = user.generateSMSVerificationCode();
    
    // Save user with verification codes
    await user.save();

    // Send verification codes
    const results = await sendVerificationCodes(
      email || user.email,
      phoneNumber || user.telephone,
      user.firstName || user.username
    );

    // Check if both were sent successfully
    if (results.email.success && results.sms.success) {
      return res.json({
        success: true,
        message: 'Verification codes sent successfully',
        email: { success: true, messageId: results.email.messageId },
        sms: { success: true, messageId: results.sms.messageId }
      });
    } else {
      // Partial success - some codes were sent
      return res.json({
        success: true,
        message: 'Verification codes sent with some issues',
        email: results.email,
        sms: results.sms
      });
    }

  } catch (error) {
    console.error('❌ Error sending verification codes:', error);
    return res.status(500).json({
      error: 'Failed to send verification codes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify SMS code
router.post('/verify-sms', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 SMS verification attempt:');
    console.log('  Request body:', req.body);
    console.log('  User from token:', (req as any).user);
    
    const { code } = req.body;
    const userId = (req as any).user.id;

    console.log('  User ID from token:', userId);
    console.log('  Code to verify:', code);

    // Get user
    const user = await User.findById(userId);
    console.log('  User found in DB:', !!user);
    if (user) {
      console.log('  User SMS verification code:', user.smsVerificationCode);
      console.log('  User SMS verification expires:', user.smsVerificationExpires);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if code matches and is not expired
    if (!user.smsVerificationCode || user.smsVerificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.isSMSVerificationExpired()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark SMS as verified and clear the code
    user.smsVerificationCode = null;
    user.smsVerificationExpires = null;
    
    // Check if both verifications are complete (both tokens are null)
    if (!user.emailVerificationToken && !user.smsVerificationCode) {
      user.isVerified = true;
      console.log('🎉 Both verifications complete! Marking user as verified.');
    } else {
      console.log('⏳ SMS verified, but still waiting for email verification.');
    }

    await user.save();

    console.log('💾 User saved. Final verification status:', {
      isVerified: user.isVerified,
      emailToken: user.emailVerificationToken,
      smsCode: user.smsVerificationCode
    });

    return res.json({
      success: true,
      message: 'SMS verification successful',
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return res.status(500).json({
      error: 'Failed to verify SMS code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify email code
router.post('/verify-email', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Email verification attempt:');
    console.log('  Request body:', req.body);
    console.log('  User from token:', (req as any).user);
    
    const { code } = req.body;
    const userId = (req as any).user.id;

    console.log('  User ID from token:', userId);
    console.log('  Code to verify:', code);

    // Get user
    const user = await User.findById(userId);
    console.log('  User found in DB:', !!user);
    if (user) {
      console.log('  User email verification token:', user.emailVerificationToken);
      console.log('  User email verification expires:', user.emailVerificationExpires);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if code matches and is not expired
    if (!user.emailVerificationToken || user.emailVerificationToken !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.isEmailVerificationExpired()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Mark email as verified and clear the token
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    
    // Check if both verifications are complete (both tokens are null)
    if (!user.emailVerificationToken && !user.smsVerificationCode) {
      user.isVerified = true;
      console.log('🎉 Both verifications complete! Marking user as verified.');
    } else {
      console.log('⏳ Email verified, but still waiting for SMS verification.');
    }

    await user.save();

    console.log('💾 User saved. Final verification status:', {
      isVerified: user.isVerified,
      emailToken: user.emailVerificationToken,
      smsCode: user.smsVerificationCode
    });

    return res.json({
      success: true,
      message: 'Email verification successful',
      isVerified: user.isVerified
    });

  } catch (error) {
    console.error('❌ Error verifying email code:', error);
    return res.status(500).json({
      error: 'Failed to verify email code',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resend verification codes
router.post('/resend', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new verification codes
    const emailCode = user.generateEmailVerificationToken();
    const smsCode = user.generateSMSVerificationCode();
    
    // Save user with new verification codes
    await user.save();

    // Send new verification codes
    const results = await sendVerificationCodes(
      user.email,
      user.telephone,
      user.firstName || user.username
    );

    return res.json({
      success: true,
      message: 'Verification codes resent successfully',
      email: results.email,
      sms: results.sms
    });

  } catch (error) {
    console.error('❌ Error resending verification codes:', error);
    return res.status(500).json({
      error: 'Failed to resend verification codes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get verification status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine verification status based on whether tokens exist and are not expired
    const emailVerified = !user.emailVerificationToken; // If token is null, email is verified
    const smsVerified = !user.smsVerificationCode; // If code is null, SMS is verified
    
    console.log('📊 Verification status check:', {
      userId: user._id,
      isVerified: user.isVerified,
      emailVerified,
      smsVerified,
      emailToken: user.emailVerificationToken,
      smsCode: user.smsVerificationCode,
      emailExpires: user.emailVerificationExpires,
      smsExpires: user.smsVerificationExpires
    });

    return res.json({
      success: true,
      isVerified: user.isVerified,
      emailVerified,
      smsVerified,
      hasEmailVerification: !!user.emailVerificationToken,
      hasSMSVerification: !!user.smsVerificationCode
    });

  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    return res.status(500).json({
      error: 'Failed to get verification status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
