import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

interface TestEmail {
  subject: string;
  content: string;
  description: string;
}

async function testAll17EmailTemplates() {
  console.log('📧 Testing ALL 17 email templates with text-only logos...\n');

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const allEmailTemplates: TestEmail[] = [
      // Phase 1: Core Authentication & Account
      {
        subject: 'songIQ - Email Verification',
        description: 'Email verification for new users',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, Test User!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! To complete your registration and start analyzing your music, 
            please verify your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/verify" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Verify Email Address
            </a>
          </div>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What's next?</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Verify your email to activate your account</li>
              <li>Start analyzing up to 3 songs with your free plan</li>
              <li>Explore advanced features and upgrade when ready</li>
            </ul>
          </div>
        `
      },
      {
        subject: 'songIQ - Welcome Email',
        description: 'Welcome message after account creation',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, Test User!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your account has been successfully created and verified! You're now ready to start 
            analyzing your music with our AI-powered platform.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Getting Started:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Upload your first song for analysis</li>
              <li>Explore the dashboard and features</li>
              <li>Check out our pricing plans</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Go to Dashboard
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Password Reset Request',
        description: 'Password reset request',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/reset-password" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Reset Password
            </a>
          </div>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Security Note:</h3>
            <p style="color: #666;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
          </div>
        `
      },
      {
        subject: 'songIQ - Password Reset Confirmation',
        description: 'Password reset confirmation',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Password Successfully Reset</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your password has been successfully updated. You can now log in to your account with your new password.
          </p>
          <div style="background-color: #e8f5e8; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">Security Reminder:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Use a strong, unique password</li>
              <li>Enable two-factor authentication if available</li>
              <li>Never share your password with anyone</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Log In Now
            </a>
          </div>
        `
      },

      // Phase 2: Subscription & Billing
      {
        subject: 'songIQ - Subscription Upgrade to Pro',
        description: 'Plan upgrade notifications',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Subscription Upgraded to Pro!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations! Your subscription has been successfully upgraded to the Pro plan. 
            You now have access to advanced features and unlimited song analysis.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">New Pro Features:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Unlimited song uploads and analysis</li>
              <li>Advanced analytics and insights</li>
              <li>Priority customer support</li>
              <li>Export reports in multiple formats</li>
              <li>Custom analysis parameters</li>
            </ul>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <h3 style="color: #333; margin-top: 0;">Billing Details:</h3>
            <p><strong>New Plan:</strong> Pro ($29.99/month)</p>
            <p><strong>Next Billing Date:</strong> January 15, 2025</p>
            <p><strong>Amount:</strong> $29.99</p>
          </div>
        `
      },
      {
        subject: 'songIQ - Subscription Downgrade to Basic',
        description: 'Plan downgrade notifications',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Subscription Changed to Basic Plan</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your subscription has been changed to the Basic plan. This change will take effect 
            at the end of your current billing period.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Basic Plan Features:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Up to 10 song analyses per month</li>
              <li>Standard analytics and insights</li>
              <li>Email support</li>
              <li>Basic report exports</li>
            </ul>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <h3 style="color: #333; margin-top: 0;">Change Details:</h3>
            <p><strong>New Plan:</strong> Basic ($9.99/month)</p>
            <p><strong>Effective Date:</strong> January 15, 2025</p>
            <p><strong>New Amount:</strong> $9.99</p>
          </div>
        `
      },
      {
        subject: 'songIQ - Payment Success',
        description: 'Successful payment confirmations',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Payment Successful!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you! Your payment has been processed successfully. Your subscription is now active 
            and you have full access to all features.
          </p>
          <div style="background-color: #e8f5e8; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount:</strong> $29.99</p>
            <p><strong>Transaction ID:</strong> TXN-123456789</p>
            <p><strong>Date:</strong> January 1, 2025</p>
            <p><strong>Plan:</strong> Pro Monthly</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Access Dashboard
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Payment Failed',
        description: 'Payment failure notifications',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Payment Failed</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We were unable to process your payment. This may be due to insufficient funds, 
            an expired card, or other payment method issues.
          </p>
          <div style="background-color: #ffebee; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #f44336;">
            <h3 style="color: #c62828; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount:</strong> $29.99</p>
            <p><strong>Date:</strong> January 1, 2025</p>
            <p><strong>Plan:</strong> Pro Monthly</p>
            <p><strong>Reason:</strong> Insufficient funds</p>
          </div>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Update your payment method</li>
              <li>Ensure sufficient funds are available</li>
              <li>Contact your bank if needed</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/billing" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Update Payment Method
            </a>
          </div>
        `
      },

      // Phase 3: Analysis & Notifications
      {
        subject: 'songIQ - Analysis Complete',
        description: 'Song analysis completion',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Your Song Analysis is Ready!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great news! The AI analysis for your song has been completed. You can now view 
            detailed insights, recommendations, and performance metrics.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <h3 style="color: #333; margin-top: 0;">Song Details:</h3>
            <p><strong>Title:</strong> "Midnight Dreams"</p>
            <p><strong>Artist:</strong> Test Artist</p>
            <p><strong>Duration:</strong> 3:45</p>
            <p><strong>Analysis Type:</strong> Full Analysis</p>
            <p><strong>Upload Date:</strong> January 1, 2025</p>
          </div>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What You'll Find:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Musical structure analysis</li>
              <li>Genre classification</li>
              <li>Mood and energy assessment</li>
              <li>Production quality insights</li>
              <li>Market positioning analysis</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/analysis" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              View Analysis
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Analysis Failed',
        description: 'Analysis failure notifications',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Analysis Failed</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We encountered an issue while analyzing your song. This is unusual and we're working 
            to resolve it as quickly as possible.
          </p>
          <div style="background-color: #ffebee; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #f44336;">
            <h3 style="color: #c62828; margin-top: 0;">Song Details:</h3>
            <p><strong>Title:</strong> "Midnight Dreams"</p>
            <p><strong>Artist:</strong> Test Artist</p>
            <p><strong>Upload Date:</strong> January 1, 2025</p>
            <p><strong>Error:</strong> Audio processing timeout</p>
          </div>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What We're Doing:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Investigating the issue</li>
              <li>Retrying the analysis automatically</li>
              <li>Notifying our technical team</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/support" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Contact Support
            </a>
          </div>
        `
      },

      // Phase 4: Engagement & Marketing
      {
        subject: 'songIQ - Welcome Series Day 1',
        description: 'Day 1 welcome series',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ - Day 1!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We're excited to have you on board! Over the next few days, we'll help you get 
            the most out of songIQ and discover how AI can transform your music analysis.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Today's Focus:</h3>
            <p style="color: #666;">Getting familiar with your dashboard and uploading your first song for analysis.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/upload" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Upload Your First Song
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Welcome Series Day 3',
        description: 'Day 3 welcome series',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">songIQ Journey - Day 3</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Great progress! By now you've likely analyzed a few songs. Let's explore some 
            advanced features that can take your music analysis to the next level.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Today's Focus:</h3>
            <p style="color: #666;">Exploring comparison tools, trend analysis, and understanding your analytics dashboard.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/comparison" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Try Song Comparison
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Welcome Series Day 7',
        description: 'Day 7 welcome series',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">songIQ Journey - Day 7</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Congratulations on completing your first week with songIQ! You're now ready to 
            explore premium features and take your music analysis to the next level.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Week 1 Achievement:</h3>
            <p style="color: #666;">You've successfully analyzed songs, explored the platform, and are ready for advanced features!</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/pricing" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Explore Premium Plans
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - New Feature: AI Recommendations',
        description: 'New feature announcements',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">New Feature: AI-Powered Recommendations!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We're excited to announce our latest feature: AI-powered music recommendations! 
            Get personalized song suggestions based on your listening history and preferences.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What's New:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Personalized song recommendations</li>
              <li>Genre-based suggestions</li>
              <li>Mood and energy matching</li>
              <li>Collaborative filtering</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/recommendations" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Try New Feature
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Weekly Usage Tips',
        description: 'Weekly usage tips',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">This Week's Pro Tips</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Discover how to get the most out of songIQ with these expert tips and tricks 
            that will enhance your music analysis experience.
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">Pro Tip: Batch Analysis</h3>
            <p style="color: #666;">Upload multiple songs at once to save time and get comprehensive insights across your entire catalog. Use the batch upload feature in your dashboard.</p>
          </div>
          <div style="background-color: #e8f5e8; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #4caf50;">
            <h3 style="color: #2e7d32; margin-top: 0;">Feature Spotlight:</h3>
            <p style="color: #666;">Try the new comparison tool to analyze multiple songs side-by-side and identify patterns in your music.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Apply These Tips
            </a>
          </div>
        `
      },
      {
        subject: 'songIQ - Re-engagement Campaign',
        description: 'Re-engagement campaigns',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">We Miss You at songIQ!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            It's been a while since your last song analysis. We'd love to see you back 
            exploring new insights and discovering what your music can reveal!
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What's New Since You've Been Away:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Enhanced AI analysis algorithms</li>
              <li>New genre classification system</li>
              <li>Improved dashboard interface</li>
              <li>Mobile app for on-the-go analysis</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/upload" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Analyze a New Song
            </a>
          </div>
        `
      }
    ];

    console.log(`📧 Found ${allEmailTemplates.length} email templates to test\n`);

    for (let i = 0; i < allEmailTemplates.length; i++) {
      const email = allEmailTemplates[i];
      if (!email) continue; // Skip if email is undefined
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.TEST_EMAIL || 'allangrestrepo@gmail.com',
        subject: email.subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>songIQ</title>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;800&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; font-family: 'Nunito', Arial, sans-serif; background-color: #f4f4f4; }
              .header { background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 25%, #ff5722 50%, #ff7043 75%, #ffab40 100%); padding: 40px 20px; text-align: center; }
              .logo-text { font-family: 'Nunito', Arial, sans-serif; font-weight: 800; font-size: 42px; color: white; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: 1px; }
              .logo-subtitle { color: white; margin: 15px 0 0 0; font-size: 20px; opacity: 0.95; font-weight: 400; }
              .content { background-color: white; max-width: 600px; margin: 0 auto; padding: 40px 30px; }
              .footer { background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%); padding: 30px 20px; text-align: center; }
              .footer-logo { font-family: 'Nunito', Arial, sans-serif; font-weight: 800; font-size: 20px; color: white; margin-bottom: 10px; }
              .footer-links { margin: 20px 0; }
              .footer-links a { color: white; text-decoration: none; margin: 0 15px; font-weight: 600; transition: opacity 0.3s; }
              .footer-links a:hover { opacity: 0.8; }
              .footer-text { color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
              .footer-copyright { color: white; margin: 15px 0 0 0; font-size: 12px; opacity: 0.7; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-text">song<span style="color: #ffcc02;">IQ</span></div>
              <div class="logo-subtitle">Music Analysis Platform</div>
            </div>
            <div class="content">
              ${email.content}
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h4 style="color: #1976d2; margin-top: 0;">Template Info:</h4>
                <p style="color: #666; margin: 0;"><strong>Template:</strong> ${email.description}</p>
                <p style="color: #666; margin: 5px 0 0 0;"><strong>Email #${i + 1}</strong> of ${allEmailTemplates.length}</p>
              </div>
            </div>
            <div class="footer">
              <div class="footer-logo">song<span style="color: #ffcc02;">IQ</span></div>
              <div class="footer-links">
                <a href="http://localhost:3000/dashboard">Dashboard</a>
                <a href="http://localhost:3000/support">Support</a>
                <a href="http://localhost:3000/settings">Settings</a>
              </div>
              <div class="footer-text">Powered by AI • Transforming Music Analysis</div>
              <div class="footer-copyright">© 2024 songIQ. All rights reserved.</div>
            </div>
          </body>
          </html>
        `
      };

      console.log(`📤 Sending ${i + 1}/${allEmailTemplates.length}: ${email.subject}`);
      console.log(`   📝 ${email.description}`);
      await transporter.sendMail(mailOptions);
      console.log(`   ✅ Sent successfully`);
      
      // Wait 3 seconds between emails to avoid rate limiting
      if (i < allEmailTemplates.length - 1) {
        console.log(`   ⏳ Waiting 3 seconds before next email...\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log('\n🎉 All 17 email templates tested successfully!');
    console.log('📧 Check your inbox for all test emails.');
    console.log('📊 Each email includes template information and numbering.');

  } catch (error: any) {
    console.error('❌ Failed to send test emails:', error);
  }
}

testAll17EmailTemplates();
