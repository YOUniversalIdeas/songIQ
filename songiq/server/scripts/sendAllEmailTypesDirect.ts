import dotenv from 'dotenv';
import { sendEmail } from '../src/services/emailService';
import { EmailResult } from '../src/types/email';

// Load environment variables
dotenv.config();

const testEmail = 'allangrestrepo@gmail.com';
const testUserName = 'Allan';
const baseUrl = 'http://localhost:3000';

async function sendAllEmailTypesDirect() {
  console.log('🎵 Sending ALL email types DIRECTLY (bypassing queue) to allangrestrepo@gmail.com...\n');

  const results: { [key: string]: EmailResult } = {};

  try {
    // Phase 1: Core Security & User Experience
    console.log('📧 Phase 1: Core Security & User Experience');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('1. Sending Verification Email...');
    results.verification = await sendEmail({
      to: testEmail,
      subject: '🔐 Verify Your songIQ Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, ${testUserName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for signing up! To complete your registration and start analyzing your music, 
              please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/verify-email?token=test_verification_token_123" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 24 hours. If you didn't create an account with songIQ, 
              you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Welcome to songIQ, ${testUserName}!\n\nThank you for signing up! To complete your registration, please verify your email address by visiting:\n\n${baseUrl}/verify-email?token=test_verification_token_123\n\nThis link will expire in 24 hours.`
    });
    console.log(`   ✅ Verification: ${results.verification.success ? 'Sent' : 'Failed'}`);
    
    console.log('2. Sending Welcome Email...');
    results.welcome = await sendEmail({
      to: testEmail,
      subject: '🎉 Welcome to songIQ - Your Music Analysis Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, ${testUserName}! 🎵</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Congratulations on joining songIQ! You're now part of a community of musicians, 
              producers, and music enthusiasts who are taking their music to the next level.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">🚀 What's Next?</h3>
              <ul style="color: #2d5a2d; line-height: 1.6;">
                <li>Upload your first song for analysis</li>
                <li>Explore our comprehensive analysis tools</li>
                <li>Compare your music with industry standards</li>
                <li>Get insights to improve your sound</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/upload" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Start Analyzing
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Welcome to songIQ, ${testUserName}! 🎵\n\nCongratulations on joining songIQ! You're now part of a community of musicians, producers, and music enthusiasts who are taking their music to the next level.\n\nWhat's Next?\n• Upload your first song for analysis\n• Explore our comprehensive analysis tools\n• Compare your music with industry standards\n• Get insights to improve your sound\n\nStart Analyzing: ${baseUrl}/upload`
    });
    console.log(`   ✅ Welcome: ${results.welcome.success ? 'Sent' : 'Failed'}`);
    
    console.log('3. Sending Password Reset Email...');
    results.passwordReset = await sendEmail({
      to: testEmail,
      subject: '🔑 Reset Your songIQ Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}, we received a request to reset your songIQ password. 
              Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/reset-password?token=test_reset_token_456" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, 
              you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `Password Reset Request\n\nHi ${testUserName}, we received a request to reset your songIQ password. Click the link below to create a new password:\n\n${baseUrl}/reset-password?token=test_reset_token_456\n\nThis link will expire in 1 hour.`
    });
    console.log(`   ✅ Password Reset: ${results.passwordReset.success ? 'Sent' : 'Failed'}`);
    
    console.log('4. Sending Password Reset Confirmation...');
    results.passwordResetConfirm = await sendEmail({
      to: testEmail,
      subject: '✅ Password Successfully Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Confirmed</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}, your songIQ password has been successfully reset. 
              You can now log in with your new password.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">🔒 Security Reminder</h3>
              <p style="color: #2d5a2d; line-height: 1.6; margin: 0;">
                If you didn't reset your password, please contact our support team immediately 
                as your account may have been compromised.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Log In Now
              </a>
            </div>
          </div>
        </div>
      `,
      text: `Password Reset Confirmed\n\nHi ${testUserName}, your songIQ password has been successfully reset. You can now log in with your new password.\n\nSecurity Reminder: If you didn't reset your password, please contact our support team immediately.\n\nLog In Now: ${baseUrl}/login`
    });
    console.log(`   ✅ Password Reset Confirm: ${results.passwordResetConfirm.success ? 'Sent' : 'Failed'}`);
    
    console.log('\n📧 Phase 2: Business-Critical Emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('5. Sending Subscription Upgrade Email...');
    results.subscriptionUpgrade = await sendEmail({
      to: testEmail,
      subject: '🚀 Welcome to songIQ Pro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">🎉 Welcome to songIQ Pro!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Congratulations ${testUserName}! You've successfully upgraded from Basic to Pro. 
              Get ready to unlock unlimited music analysis potential.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">✨ New Pro Features Unlocked:</h3>
              <ul style="color: #2d5a2d; line-height: 1.6;">
                <li>Advanced Analytics</li>
                <li>Unlimited Songs</li>
                <li>Priority Support</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              <strong>Next billing date:</strong> January 15, 2024<br>
              <strong>Amount:</strong> $29.99
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Explore Pro Features
              </a>
            </div>
          </div>
        </div>
      `,
      text: `🎉 Welcome to songIQ Pro!\n\nCongratulations ${testUserName}! You've successfully upgraded from Basic to Pro. Get ready to unlock unlimited music analysis potential.\n\nNew Pro Features Unlocked:\n• Advanced Analytics\n• Unlimited Songs\n• Priority Support\n\nNext billing date: January 15, 2024\nAmount: $29.99\n\nExplore Pro Features: ${baseUrl}/dashboard`
    });
    console.log(`   ✅ Subscription Upgrade: ${results.subscriptionUpgrade.success ? 'Sent' : 'Failed'}`);
    
    console.log('6. Sending Payment Success Email...');
    results.paymentSuccess = await sendEmail({
      to: testEmail,
      subject: '💳 Payment Successful - songIQ Pro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">💳 Payment Successful!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}, your payment for songIQ Pro has been processed successfully. 
              Thank you for your subscription!
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">📋 Payment Details:</h3>
              <ul style="color: #2d5a2d; line-height: 1.6; list-style: none; padding: 0;">
                <li><strong>Plan:</strong> Pro</li>
                <li><strong>Amount:</strong> $29.99</li>
                <li><strong>Date:</strong> January 1, 2024</li>
                <li><strong>Transaction ID:</strong> TXN_123456789</li>
                <li><strong>Next Billing:</strong> February 1, 2024</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Access Your Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
      text: `💳 Payment Successful!\n\nHi ${testUserName}, your payment for songIQ Pro has been processed successfully. Thank you for your subscription!\n\nPayment Details:\n• Plan: Pro\n• Amount: $29.99\n• Date: January 1, 2024\n• Transaction ID: TXN_123456789\n• Next Billing: February 1, 2024\n\nAccess Your Dashboard: ${baseUrl}/dashboard`
    });
    console.log(`   ✅ Payment Success: ${results.paymentSuccess.success ? 'Sent' : 'Failed'}`);
    
    console.log('7. Sending Analysis Complete Email...');
    results.analysisComplete = await sendEmail({
      to: testEmail,
      subject: '🎵 Your Song Analysis is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">🎵 Analysis Complete!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}, your song "Midnight Dreams" has been analyzed and the results are ready!
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">📊 Song Details:</h3>
              <ul style="color: #2d5a2d; line-height: 1.6; list-style: none; padding: 0;">
                <li><strong>Title:</strong> Midnight Dreams</li>
                <li><strong>Artist:</strong> Allan Restrepo</li>
                <li><strong>Duration:</strong> 3:45</li>
                <li><strong>Analysis Type:</strong> Comprehensive</li>
                <li><strong>Upload Date:</strong> January 1, 2024</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/analysis/123" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                View Analysis Results
              </a>
            </div>
          </div>
        </div>
      `,
      text: `🎵 Analysis Complete!\n\nHi ${testUserName}, your song "Midnight Dreams" has been analyzed and the results are ready!\n\nSong Details:\n• Title: Midnight Dreams\n• Artist: Allan Restrepo\n• Duration: 3:45\n• Analysis Type: Comprehensive\n• Upload Date: January 1, 2024\n\nView Analysis Results: ${baseUrl}/analysis/123`
    });
    console.log(`   ✅ Analysis Complete: ${results.analysisComplete.success ? 'Sent' : 'Failed'}`);
    
    console.log('\n📧 Phase 3: Engagement & Marketing Emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('8. Sending Welcome Series Day 1...');
    results.welcomeDay1 = await sendEmail({
      to: testEmail,
      subject: '🎵 Day 1: Let\'s Get Started with songIQ!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">🎵 Day 1: Let's Get Started!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}! Welcome to Day 1 of your songIQ journey. 
              We're excited to help you unlock your music's full potential.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">🚀 Today's Goal:</h3>
              <p style="color: #2d5a2d; line-height: 1.6; margin: 0;">
                Upload your first song and experience the power of AI-powered music analysis!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/upload" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Upload Your First Song
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
              Stay tuned for Day 3 when we'll show you how to interpret your analysis results!
            </p>
          </div>
        </div>
      `,
      text: `🎵 Day 1: Let's Get Started!\n\nHi ${testUserName}! Welcome to Day 1 of your songIQ journey. We're excited to help you unlock your music's full potential.\n\nToday's Goal: Upload your first song and experience the power of AI-powered music analysis!\n\nUpload Your First Song: ${baseUrl}/upload\n\nStay tuned for Day 3 when we'll show you how to interpret your analysis results!`
    });
    console.log(`   ✅ Welcome Day 1: ${results.welcomeDay1.success ? 'Sent' : 'Failed'}`);
    
    console.log('9. Sending Feature Announcement...');
    results.featureAnnouncement = await sendEmail({
      to: testEmail,
      subject: '🚀 New Feature: AI-Powered Song Recommendations!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">🚀 New Feature Alert!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}! We're excited to announce our latest feature: 
              <strong>AI-Powered Song Recommendations</strong>.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">✨ What's New:</h3>
              <p style="color: #2d5a2d; line-height: 1.6; margin-bottom: 15px;">
                Get personalized song suggestions based on your musical taste and analysis results.
              </p>
              <ul style="color: #2d5a2d; line-height: 1.6;">
                <li>Discover new music</li>
                <li>Improve your sound</li>
                <li>Stay ahead of trends</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/features/recommendations" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Try It Now
              </a>
            </div>
          </div>
        </div>
      `,
      text: `🚀 New Feature Alert!\n\nHi ${testUserName}! We're excited to announce our latest feature: AI-Powered Song Recommendations.\n\nWhat's New:\nGet personalized song suggestions based on your musical taste and analysis results.\n\n• Discover new music\n• Improve your sound\n• Stay ahead of trends\n\nTry It Now: ${baseUrl}/features/recommendations`
    });
    console.log(`   ✅ Feature Announcement: ${results.featureAnnouncement.success ? 'Sent' : 'Failed'}`);
    
    console.log('10. Sending Usage Tips...');
    results.usageTips = await sendEmail({
      to: testEmail,
      subject: '💡 Pro Tips: Get the Most Out of songIQ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">💡 Pro Tips: Analysis Edition</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}! Here are some expert tips to help you get the most 
              accurate and insightful analysis results.
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">🎯 This Week's Tips:</h3>
              <ul style="color: #2d5a2d; line-height: 1.6;">
                <li>Use high-quality audio files for better results</li>
                <li>Try different analysis types for comprehensive insights</li>
                <li>Compare multiple songs to identify patterns</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/tips" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                View All Tips
              </a>
            </div>
          </div>
        </div>
      `,
      text: `💡 Pro Tips: Analysis Edition\n\nHi ${testUserName}! Here are some expert tips to help you get the most accurate and insightful analysis results.\n\nThis Week's Tips:\n• Use high-quality audio files for better results\n• Try different analysis types for comprehensive insights\n• Compare multiple songs to identify patterns\n\nView All Tips: ${baseUrl}/tips`
    });
    console.log(`   ✅ Usage Tips: ${results.usageTips.success ? 'Sent' : 'Failed'}`);
    
    console.log('11. Sending Re-engagement Email...');
    results.reEngagement = await sendEmail({
      to: testEmail,
      subject: '🎵 We Miss You at songIQ!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">🎵 We Miss You!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${testUserName}! It's been a while since we've seen you at songIQ. 
              We hope you're doing well and creating amazing music!
            </p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">💎 Pro Tip: Advanced Analysis Features</h3>
              <p style="color: #2d5a2d; line-height: 1.6; margin: 0;">
                Upgrade to Pro to unlock advanced analysis features like harmonic analysis, 
                tempo mapping, and genre classification.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Ready to take your music to the next level? Come back and analyze your latest tracks!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/upload" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold;
                        font-size: 16px;">
                Analyze New Music
              </a>
            </div>
          </div>
        </div>
      `,
      text: `🎵 We Miss You!\n\nHi ${testUserName}! It's been a while since we've seen you at songIQ. We hope you're doing well and creating amazing music!\n\nPro Tip: Advanced Analysis Features\nUpgrade to Pro to unlock advanced analysis features like harmonic analysis, tempo mapping, and genre classification.\n\nReady to take your music to the next level? Come back and analyze your latest tracks!\n\nAnalyze New Music: ${baseUrl}/upload`
    });
    console.log(`   ✅ Re-engagement: ${results.reEngagement.success ? 'Sent' : 'Failed'}`);

    // Summary
    console.log('\n📊 Email Sending Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalEmails = Object.keys(results).length;
    const successfulEmails = Object.values(results).filter(result => result.success).length;
    
    console.log(`Total emails sent: ${totalEmails}`);
    console.log(`Successful: ${successfulEmails}`);
    console.log(`Failed: ${totalEmails - successfulEmails}`);
    
    if (successfulEmails === totalEmails) {
      console.log('\n🎉 SUCCESS! All email types sent directly!');
      console.log('📧 Check your Gmail inbox for all 11 email examples');
      console.log('📱 Each email showcases different templates and content types');
      console.log('⚡ These emails were sent immediately (no queue delays)');
    } else {
      console.log('\n⚠️  Some emails failed to send. Check the logs above.');
    }

  } catch (error) {
    console.error('❌ Error in email test:', error);
  }
}

// Run the comprehensive test
sendAllEmailTypesDirect();
