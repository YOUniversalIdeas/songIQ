import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function sendTextLogoEmail() {
  console.log('📧 Sending text-only logo email...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options with text-only logo design
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEST_EMAIL || 'allangrestrepo@gmail.com',
      subject: '🎨 songIQ Final Design - Text Logo Solution',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>songIQ</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          
          <!-- Header with Orange Background and Text Logo -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff6b35;">
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                
                <!-- Text Logo Design -->
                <div style="margin-bottom: 25px;">
                  <div style="display: inline-block; background-color: white; padding: 20px; border-radius: 15px; box-shadow: 0 6px 20px rgba(0,0,0,0.3);">
                    <div style="font-size: 32px; font-weight: bold; color: #ff6b35; letter-spacing: 2px; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                      song<span style="color: #ff8c42;">IQ</span>
                    </div>
                  </div>
                </div>
                
                <!-- Main Logo Text -->
                <h1 style="color: white; margin: 0; font-size: 42px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); letter-spacing: 1px;">
                  songIQ
                </h1>
                <p style="color: white; margin: 15px 0 0 0; font-size: 20px; opacity: 0.95; font-weight: 300;">
                  Music Analysis Platform
                </p>
              </td>
            </tr>
          </table>
          
          <!-- Main Content -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; max-width: 600px; margin: 0 auto;">
            <tr>
              <td style="padding: 40px 30px;">
                
                <h2 style="color: #333; margin-bottom: 20px; font-size: 26px; text-align: center;">
                  🎯 The Perfect Email Logo Solution
                </h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px; text-align: center;">
                  This design ensures your brand is visible in <strong>100% of email clients</strong>.
                </p>
                
                <!-- Solution Explanation -->
                <div style="background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35;">
                  <h3 style="color: #e65100; margin-top: 0; font-size: 18px;">💡 Why This Text Logo Works:</h3>
                  <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
                    <li><strong>Universal Display:</strong> Text renders in every email client</li>
                    <li><strong>No Image Blocking:</strong> Works even when images are disabled</li>
                    <li><strong>Fast Loading:</strong> No external resources needed</li>
                    <li><strong>Brand Consistency:</strong> Maintains your visual identity</li>
                    <li><strong>Professional Look:</strong> Clean, modern design</li>
                  </ul>
                </div>
                
                <!-- Brand Elements -->
                <div style="margin: 30px 0;">
                  <h3 style="color: #333; margin-bottom: 20px; font-size: 18px; text-align: center;">🎨 Brand Elements That Always Work:</h3>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                    <tr>
                      <td style="padding: 20px; background-color: #fff3e0; border: 2px solid #ff6b35; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 24px; font-weight: bold; color: #ff6b35; margin-bottom: 10px;">
                          song<span style="color: #ff8c42;">IQ</span>
                        </div>
                        <span style="color: #666; font-size: 14px;">Primary Logo</span>
                      </td>
                      <td style="width: 20px;"></td>
                      <td style="padding: 20px; background-color: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; text-align: center; width: 50%;">
                        <div style="font-size: 24px; font-weight: bold; color: #2e7d32; margin-bottom: 10px;">
                          🎵 AI Analysis
                        </div>
                        <span style="color: #666; font-size: 14px;">Core Service</span>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                  <tr>
                    <td style="text-align: center;">
                      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background-color: #ff6b35; padding: 18px 35px; border-radius: 30px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
                            <a href="http://localhost:3000" 
                               style="color: white; text-decoration: none; font-weight: bold; font-size: 18px; display: inline-block; letter-spacing: 1px;">
                              🚀 Launch songIQ
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #666; line-height: 1.6; font-size: 14px; margin: 0;">
                    This text-based logo design ensures your brand is visible across all platforms:<br>
                    <strong>Gmail • Outlook • Apple Mail • Yahoo • Mobile Apps</strong>
                  </p>
                </div>
                
              </td>
            </tr>
          </table>
          
          <!-- Footer with Orange Background -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff8c42;">
            <tr>
              <td style="padding: 30px 20px; text-align: center;">
                <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 10px;">
                  song<span style="color: #ffcc02;">IQ</span>
                </div>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
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
        
        The Perfect Email Logo Solution
        
        This design ensures your brand is visible in 100% of email clients.
        
        Why This Text Logo Works:
        • Universal Display: Text renders in every email client
        • No Image Blocking: Works even when images are disabled
        • Fast Loading: No external resources needed
        • Brand Consistency: Maintains your visual identity
        • Professional Look: Clean, modern design
        
        Brand Elements That Always Work:
        - Primary Logo: songIQ (styled text)
        - Core Service: 🎵 AI Analysis
        
        Launch songIQ: http://localhost:3000
        
        This text-based logo design ensures your brand is visible across all platforms:
        Gmail • Outlook • Apple Mail • Yahoo • Mobile Apps
        
        ---
        songIQ
        Powered by AI • Transforming Music Analysis
        © 2024 songIQ. All rights reserved.
      `
    };

    // Send email
    console.log('📤 Sending text-only logo email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('\n📧 Check your email inbox for the final design!');
    console.log('🎨 This version uses a text-only logo that will display perfectly everywhere.');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

// Run the test
sendTextLogoEmail();
