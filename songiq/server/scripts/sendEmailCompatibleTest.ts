import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function sendEmailCompatibleTest() {
  console.log('📧 Sending email-client-compatible test email...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options with email-client-compatible design
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEST_EMAIL || 'allangrestrepo@gmail.com',
      subject: '🎨 songIQ Branded Email - Email Client Compatible',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>songIQ</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          
          <!-- Header with Orange Background (email-client compatible) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff6b35;">
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <!-- Logo Text (since SVG might not work) -->
                <h1 style="color: white; margin: 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                  songIQ
                </h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">
                  Music Analysis Platform
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Main Content -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; max-width: 600px; margin: 0 auto;">
            <tr>
              <td style="padding: 40px 30px;">
                
                <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">
                  🎉 Welcome to songIQ!
                </h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                  This is a test email showcasing the new songIQ email design that's compatible with all email clients.
                </p>
                
                <!-- Feature Boxes -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td style="padding: 20px; background-color: #fff3e0; border-left: 4px solid #ff6b35; margin-bottom: 20px;">
                      <h3 style="color: #e65100; margin-top: 0; font-size: 18px;">🎵 AI-Powered Analysis</h3>
                      <p style="color: #666; margin: 0; line-height: 1.5;">
                        Get deep insights into your music with our advanced AI algorithms.
                      </p>
                    </td>
                  </tr>
                  <tr><td style="height: 20px;"></td></tr>
                  <tr>
                    <td style="padding: 20px; background-color: #e8f5e8; border-left: 4px solid #4caf50; margin-bottom: 20px;">
                      <h3 style="color: #2e7d32; margin-top: 0; font-size: 18px;">📊 Detailed Reports</h3>
                      <p style="color: #666; margin: 0; line-height: 1.5;">
                        Comprehensive analysis reports with actionable insights.
                      </p>
                    </td>
                  </tr>
                  <tr><td style="height: 20px;"></td></tr>
                  <tr>
                    <td style="padding: 20px; background-color: #e3f2fd; border-left: 4px solid #2196f3; margin-bottom: 20px;">
                      <h3 style="color: #1565c0; margin-top: 0; font-size: 18px;">🚀 Professional Tools</h3>
                      <p style="color: #666; margin: 0; line-height: 1.5;">
                        Industry-standard tools for music professionals and artists.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td style="text-align: center;">
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background-color: #ff6b35; padding: 15px 30px; border-radius: 25px;">
                            <a href="http://localhost:3000" 
                               style="color: white; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                              🎵 Get Started with songIQ
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                  This email demonstrates our new email template system that works across all email clients including Gmail, Outlook, Apple Mail, and more.
                </p>
                
              </td>
            </tr>
          </table>
          
          <!-- Footer with Orange Background -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff8c42;">
            <tr>
              <td style="padding: 30px 20px; text-align: center;">
                <p style="color: white; margin: 0; font-size: 16px; font-weight: bold;">
                  songIQ
                </p>
                <p style="color: white; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                  Powered by AI • Transforming Music Analysis
                </p>
                <p style="color: white; margin: 15px 0 0 0; font-size: 12px; opacity: 0.7;">
                  © 2024 songIQ. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
          
        </body>
        </html>
      `,
      text: `
        songIQ - Music Analysis Platform
        
        Welcome to songIQ!
        
        This is a test email showcasing the new songIQ email design that's compatible with all email clients.
        
        Features:
        🎵 AI-Powered Analysis - Get deep insights into your music with our advanced AI algorithms.
        📊 Detailed Reports - Comprehensive analysis reports with actionable insights.
        🚀 Professional Tools - Industry-standard tools for music professionals and artists.
        
        Get Started: http://localhost:3000
        
        This email demonstrates our new email template system that works across all email clients.
        
        ---
        songIQ
        Powered by AI • Transforming Music Analysis
        © 2024 songIQ. All rights reserved.
      `
    };

    // Send email
    console.log('📤 Sending email-client-compatible test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('\n📧 Check your email inbox for the new design!');
    console.log('🎨 This version should display properly in all email clients.');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

// Run the test
sendEmailCompatibleTest();
