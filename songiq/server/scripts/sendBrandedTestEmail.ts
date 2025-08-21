import dotenv from 'dotenv';
import { sendEmail } from '../src/services/emailService';

// Load environment variables
dotenv.config();

async function sendBrandedTestEmail() {
  console.log('🎨 Sending branded test email with new songIQ design...\n');

  try {
    const result = await sendEmail({
      to: 'allangrestrepo@gmail.com',
      subject: '🎨 New songIQ Email Design - Check Out Our Branding!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header with songIQ Branding -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 75%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 0 0 20px 20px; position: relative; overflow: hidden;">
            <div style="position: relative; z-index: 2;">
              <div style="font-size: 48px; font-weight: 900; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); margin-bottom: 10px; letter-spacing: -2px;">IQ</div>
              <div style="font-size: 24px; font-weight: 600; color: white; text-transform: lowercase; letter-spacing: 1px;">songIQ</div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px; background: #f8f9fa; min-height: 300px; line-height: 1.6; color: #333;">
            <h2 style="color: #333; margin-bottom: 20px;">🎨 New songIQ Email Design!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi Allan! This email showcases our brand new songIQ email design featuring your beautiful logo and gradient colors. 
              We've completely redesigned the header and footer to match your brand identity!
            </p>
            
            <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #28a745;">
              <h3 style="color: #155724; margin-top: 0; margin-bottom: 15px;">✨ What's New:</h3>
              <ul style="color: #155724; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Vibrant gradient header matching your logo colors</li>
                <li>Large "IQ" branding with your signature typography</li>
                <li>Professional footer with navigation links</li>
                <li>Consistent button styling throughout</li>
                <li>Mobile-responsive design</li>
              </ul>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 5px solid #667eea;">
              <h3 style="color: #495057; margin-top: 0; margin-bottom: 15px;">🎨 Design Features:</h3>
              <ul style="color: #495057; line-height: 1.6; margin: 0; padding-left: 20px; list-style: none;">
                <li style="margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong style="color: #667eea;">Header:</strong> Blue → Purple → Magenta → Orange → Yellow gradient</li>
                <li style="margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong style="color: #667eea;">Logo:</strong> Large "IQ" with your signature font styling</li>
                <li style="margin-bottom: 8px; padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong style="color: #667eea;">Footer:</strong> Dark theme with golden "songIQ" branding</li>
                <li style="margin-bottom: 8px; padding: 8px 0;"><strong style="color: #667eea;">Buttons:</strong> Consistent gradient styling with hover effects</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This design will now be used across all songIQ emails, creating a consistent and professional brand experience 
              for your users. The gradient colors perfectly match your logo's vibrant aesthetic!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" 
                 style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                Visit songIQ
              </a>
            </div>
          </div>
          
          <!-- Footer with songIQ Branding -->
          <div style="background: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; border-radius: 20px 20px 0 0;">
            <div style="font-size: 20px; font-weight: 600; color: #fbb03b; margin-bottom: 15px; text-transform: lowercase;">songIQ</div>
            <div style="margin: 20px 0;">
              <a href="http://localhost:3000" style="color: #cccccc; text-decoration: none; margin: 0 15px; font-size: 14px;">Home</a>
              <a href="http://localhost:3000/upload" style="color: #cccccc; text-decoration: none; margin: 0 15px; font-size: 14px;">Upload</a>
              <a href="http://localhost:3000/dashboard" style="color: #cccccc; text-decoration: none; margin: 0 15px; font-size: 14px;">Dashboard</a>
              <a href="http://localhost:3000/pricing" style="color: #cccccc; text-decoration: none; margin: 0 15px; font-size: 14px;">Pricing</a>
            </div>
            <div style="color: #999999; font-size: 12px; margin-top: 20px;">
              © 2024 songIQ. All rights reserved.<br>
              Music Analysis Platform powered by AI
            </div>
          </div>
        </div>
      `,
      text: `🎨 New songIQ Email Design!\n\nHi Allan! This email showcases our brand new songIQ email design featuring your beautiful logo and gradient colors. We've completely redesigned the header and footer to match your brand identity!\n\nWhat's New:\n• Vibrant gradient header matching your logo colors\n• Large "IQ" branding with your signature typography\n• Professional footer with navigation links\n• Consistent button styling throughout\n• Mobile-responsive design\n\nDesign Features:\n• Header: Blue → Purple → Magenta → Orange → Yellow gradient\n• Logo: Large "IQ" with your signature font styling\n• Footer: Dark theme with golden "songIQ" branding\n• Buttons: Consistent gradient styling with hover effects\n\nThis design will now be used across all songIQ emails, creating a consistent and professional brand experience for your users. The gradient colors perfectly match your logo's vibrant aesthetic!\n\nVisit songIQ: http://localhost:3000`
    });

    console.log(`Email result: ${result.success}`);
    
    if (result.success) {
      console.log('✅ Branded email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log('📧 Check your Gmail inbox for the new design');
      console.log('🎨 This showcases the updated header and footer with your songIQ branding!');
    } else {
      console.log('❌ Email failed to send');
      console.log(`Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error sending branded email:', error);
  }
}

// Run the test
sendBrandedTestEmail();
