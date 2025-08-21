import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function sendLogoTestEmail() {
  console.log('📧 Sending logo test email with base64 image...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options with embedded base64 logo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEST_EMAIL || 'allangrestrepo@gmail.com',
      subject: '🎨 songIQ Logo Test - Base64 Embedded Image',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>songIQ</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          
          <!-- Header with Orange Background and Logo -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff6b35;">
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                
                <!-- Logo Image (Base64 encoded) -->
                <div style="margin-bottom: 20px;">
                  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmY2YjM1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXdlaWdodD0iYm9sZCI+c29uZ0lRPC90ZXh0Pgo8L3N2Zz4K" 
                       alt="songIQ Logo" 
                       style="width: 80px; height: 80px; border-radius: 10px; background-color: white; padding: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                </div>
                
                <!-- Logo Text as Fallback -->
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
                  🎯 Logo Display Test
                </h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
                  This email tests different logo display methods for email compatibility.
                </p>
                
                <!-- Logo Comparison Section -->
                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
                  <h3 style="color: #333; margin-top: 0; font-size: 18px;">🔍 Logo Display Methods:</h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                      <td style="padding: 15px; background-color: white; border: 1px solid #e0e0e0; border-radius: 5px; text-align: center; width: 33%;">
                        <strong>Base64 Logo</strong><br>
                        <span style="color: #666; font-size: 12px;">Should display in most clients</span>
                      </td>
                      <td style="width: 20px;"></td>
                      <td style="padding: 15px; background-color: white; border: 1px solid #e0e0e0; border-radius: 5px; text-align: center; width: 33%;">
                        <strong>Text Logo</strong><br>
                        <span style="color: #666; font-size: 12px;">Always displays</span>
                      </td>
                      <td style="width: 20px;"></td>
                      <td style="padding: 15px; background-color: white; border: 1px solid #e0e0e0; border-radius: 5px; text-align: center; width: 33%;">
                        <strong>External Image</strong><br>
                        <span style="color: #666; font-size: 12px;">Often blocked</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- Feature Highlights -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">✨ Why This Approach Works:</h3>
                  <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
                    <li><strong>Base64 Encoding:</strong> Logo is embedded directly in the email</li>
                    <li><strong>No External Dependencies:</strong> Works even when images are blocked</li>
                    <li><strong>Universal Compatibility:</strong> Displays in Gmail, Outlook, Apple Mail, etc.</li>
                    <li><strong>Fast Loading:</strong> No external requests needed</li>
                  </ul>
                </div>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td style="text-align: center;">
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background-color: #ff6b35; padding: 15px 30px; border-radius: 25px;">
                            <a href="http://localhost:3000" 
                               style="color: white; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                              🎵 Experience songIQ
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="color: #666; line-height: 1.6; font-size: 14px;">
                  This logo implementation ensures your brand is visible across all email platforms and devices.
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
        
        Logo Display Test
        
        This email tests different logo display methods for email compatibility.
        
        Logo Display Methods:
        - Base64 Logo: Should display in most clients
        - Text Logo: Always displays  
        - External Image: Often blocked
        
        Why This Approach Works:
        • Base64 Encoding: Logo is embedded directly in the email
        • No External Dependencies: Works even when images are blocked
        • Universal Compatibility: Displays in Gmail, Outlook, Apple Mail, etc.
        • Fast Loading: No external requests needed
        
        Experience songIQ: http://localhost:3000
        
        This logo implementation ensures your brand is visible across all email platforms.
        
        ---
        songIQ
        Powered by AI • Transforming Music Analysis
        © 2024 songIQ. All rights reserved.
      `
    };

    // Send email
    console.log('📤 Sending logo test email with base64 image...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('\n📧 Check your email inbox for the logo test!');
    console.log('🎨 This version includes a base64-encoded logo that should display properly.');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

// Run the test
sendLogoTestEmail();
