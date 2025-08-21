import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

interface TestEmail {
  subject: string;
  content: string;
}

async function testAllEmailTemplates() {
  console.log('📧 Testing all email templates with text-only logos...\n');

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const testEmails: TestEmail[] = [
      {
        subject: '🔐 songIQ - Email Verification',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, Test User!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! Please verify your email address.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/verify" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Verify Email Address
            </a>
          </div>
        `
      },
      {
        subject: '🎉 songIQ - Welcome Email',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, Test User!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your account has been successfully created. Start analyzing your music today!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/dashboard" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Go to Dashboard
            </a>
          </div>
        `
      },
      {
        subject: '🔑 songIQ - Password Reset',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Click the button below to reset your password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/reset-password" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Reset Password
            </a>
          </div>
        `
      },
      {
        subject: '📈 songIQ - Subscription Upgrade',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Subscription Upgraded to Pro!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Your subscription has been upgraded to Pro plan. Enjoy advanced features!
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">New Features:</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Unlimited uploads</li>
            </ul>
          </div>
        `
      },
      {
        subject: '🎵 songIQ - Analysis Complete',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">Your Song Analysis is Ready!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            The analysis for "Test Song" has been completed.
          </p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35;">
            <h3 style="color: #333; margin-top: 0;">Song Details:</h3>
            <p><strong>Title:</strong> Test Song</p>
            <p><strong>Duration:</strong> 3:45</p>
            <p><strong>Analysis Type:</strong> Full Analysis</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/analysis" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              View Analysis
            </a>
          </div>
        `
      },
      {
        subject: '🚀 songIQ - Feature Announcement',
        content: `
          <h2 style="color: #333; margin-bottom: 20px;">New Feature: AI-Powered Recommendations</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Discover our latest AI-powered music recommendation engine!
          </p>
          <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
            <h3 style="color: #e65100; margin-top: 0;">What's New:</h3>
            <p style="color: #666;">Get personalized song recommendations based on your listening history and preferences.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/recommendations" style="display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
              Try New Feature
            </a>
          </div>
        `
      }
    ];

    for (const email of testEmails) {
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

      console.log(`📤 Sending ${email.subject}...`);
      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent: ${email.subject}`);
      
      // Wait 2 seconds between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 All email templates tested successfully!');
    console.log('📧 Check your inbox for all 6 test emails.');

  } catch (error: any) {
    console.error('❌ Failed to send test emails:', error);
  }
}

testAllEmailTemplates();
