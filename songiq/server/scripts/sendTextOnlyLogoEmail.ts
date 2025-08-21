import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function sendTextOnlyLogoEmail() {
  console.log('📧 Sending text-only logo email with Nunito Extra Bold...\n');

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
      subject: '🎨 songIQ - Text-Only Logo with Nunito Extra Bold',
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
            .btn { display: inline-block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; text-decoration: none; padding: 18px 35px; border-radius: 30px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3); transition: transform 0.3s, box-shadow 0.3s; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4); }
            .highlight-box { background-color: #fff8e1; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #ff6b35; }
            .text-center { text-align: center; }
            .mb-4 { margin-bottom: 20px; }
            .mt-4 { margin-top: 20px; }
            .p-4 { padding: 20px; }
            .rounded { border-radius: 8px; }
            .shadow { box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <!-- Header with Text-Only Logo -->
          <div class="header">
            <div class="logo-text">song<span style="color: #ffcc02;">IQ</span></div>
            <div class="logo-subtitle">Music Analysis Platform</div>
          </div>

          <!-- Main Content -->
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 26px; text-align: center;">
              🎯 Clean Text-Only Logo Design
            </h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px; text-align: center;">
              This design uses <strong>only text</strong> with the beautiful Nunito Extra Bold font.
            </p>

            <!-- Solution Explanation -->
            <div class="highlight-box">
              <h3 style="color: #e65100; margin-top: 0; font-size: 18px;">💡 Why Text-Only Logos Are Perfect:</h3>
              <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
                <li><strong>100% Email Client Compatibility:</strong> Text renders everywhere</li>
                <li><strong>Beautiful Typography:</strong> Nunito Extra Bold looks professional</li>
                <li><strong>Fast Loading:</strong> No external resources needed</li>
                <li><strong>Brand Consistency:</strong> Always displays correctly</li>
                <li><strong>Future-Proof:</strong> Works with any email client</li>
              </ul>
            </div>

            <!-- Font Showcase -->
            <div style="margin: 30px 0;">
              <h3 style="color: #333; margin-bottom: 20px; font-size: 18px; text-align: center;">🎨 Nunito Font Showcase:</h3>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #fff3e0; border: 2px solid #ff6b35; border-radius: 8px; text-align: center; width: 50%;">
                    <div style="font-family: 'Nunito', Arial, sans-serif; font-weight: 800; font-size: 24px; color: #ff6b35; margin-bottom: 10px;">
                      song<span style="color: #ff8c42;">IQ</span>
                    </div>
                    <span style="color: #666; font-size: 14px;">Extra Bold (800)</span>
                  </td>
                  <td style="width: 20px;"></td>
                  <td style="padding: 20px; background-color: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; text-align: center; width: 50%;">
                    <div style="font-family: 'Nunito', Arial, sans-serif; font-weight: 600; font-size: 24px; color: #2e7d32; margin-bottom: 10px;">
                      song<span style="color: #4caf50;">IQ</span>
                    </div>
                    <span style="color: #666; font-size: 14px;">Semi-Bold (600)</span>
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
                      <td class="btn">
                        <a href="http://localhost:3000" style="color: white; text-decoration: none; font-weight: 600; font-size: 18px; display: inline-block; letter-spacing: 1px;">
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
                This text-only approach ensures your brand is visible across all platforms:<br>
                <strong>Gmail • Outlook • Apple Mail • Yahoo • Mobile Apps • Enterprise Clients</strong>
              </p>
            </div>

          </div>

          <!-- Footer with Orange Background -->
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
      `,
      text: `
        songIQ - Music Analysis Platform

        Clean Text-Only Logo Design

        This design uses only text with the beautiful Nunito Extra Bold font.

        Why Text-Only Logos Are Perfect:
        • 100% Email Client Compatibility: Text renders everywhere
        • Beautiful Typography: Nunito Extra Bold looks professional
        • Fast Loading: No external resources needed
        • Brand Consistency: Always displays correctly
        • Future-Proof: Works with any email client

        Nunito Font Showcase:
        - Extra Bold (800): songIQ - Primary branding
        - Semi-Bold (600): songIQ - Secondary text

        Launch songIQ: http://localhost:3000

        This text-only approach ensures your brand is visible across all platforms:
        Gmail • Outlook • Apple Mail • Yahoo • Mobile Apps • Enterprise Clients

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
    console.log('\n📧 Check your email inbox for the text-only logo design!');
    console.log('🎨 This version uses only text with Nunito Extra Bold font.');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
  }
}

// Run the test
sendTextOnlyLogoEmail();
