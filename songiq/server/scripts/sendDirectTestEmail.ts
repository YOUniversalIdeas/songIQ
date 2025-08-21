import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function sendDirectTestEmail() {
  console.log('📧 Sending direct test email...\n');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.TEST_EMAIL || 'allangrestrepo@gmail.com',
      subject: '🧪 Direct Test Email from songIQ Server',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff6b35;">🧪 Direct Test Email</h1>
          <p>This is a direct test email sent from the songIQ server to verify the email system is working.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Server:</strong> songIQ Backend</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you receive this email, the email system is working correctly!
          </p>
        </div>
      `,
      text: `
        Direct Test Email from songIQ Server
        
        This is a direct test email sent from the songIQ server to verify the email system is working.
        
        Timestamp: ${new Date().toISOString()}
        Server: songIQ Backend
        Environment: ${process.env.NODE_ENV || 'development'}
        
        If you receive this email, the email system is working correctly!
      `
    };

    // Send email
    console.log('📤 Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📨 Response:', info.response);
    console.log('\n📧 Check your email inbox for the test email.');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication failed. Please check:');
      console.error('   - EMAIL_USER is correct');
      console.error('   - EMAIL_PASSWORD is correct (use App Password, not regular password)');
      console.error('   - 2FA is enabled on your Gmail account');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection failed. Please check:');
      console.error('   - Internet connection');
      console.error('   - Gmail SMTP server accessibility');
    }
  }
}

// Run the test
sendDirectTestEmail();
