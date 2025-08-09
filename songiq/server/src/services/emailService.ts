import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // For development, use Gmail or a service like Mailtrap
  // In production, you'd use a service like SendGrid, AWS SES, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production email service (SendGrid, AWS SES, etc.)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development - use Gmail or Mailtrap
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }
};

// Email verification template
const createVerificationEmail = (userName: string, verificationUrl: string) => {
  return {
    subject: 'Verify Your songIQ Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, ${userName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! To complete your registration and start analyzing your music, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
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
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; font-size: 14px; color: #495057;">
            ${verificationUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
              <strong>What's next?</strong>
            </p>
            <ul style="color: #666; font-size: 14px; line-height: 1.6;">
              <li>Verify your email to activate your account</li>
              <li>Start analyzing up to 3 songs with your free plan</li>
              <li>Explore advanced features and upgrade when ready</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              This link will expire in 24 hours. If you didn't create an account with songIQ, 
              you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Welcome to songIQ, ${userName}!

Thank you for signing up! To complete your registration and start analyzing your music, 
please verify your email address by visiting this link:

${verificationUrl}

What's next?
- Verify your email to activate your account
- Start analyzing up to 3 songs with your free plan
- Explore advanced features and upgrade when ready

This link will expire in 24 hours. If you didn't create an account with songIQ, 
you can safely ignore this email.

Best regards,
The songIQ Team
    `
  };
};

// Send email verification
export const sendVerificationEmail = async (email: string, userName: string, token: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    // Create verification URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    // Create email content
    const emailContent = createVerificationEmail(userName, verificationUrl);
    
    // Send email
    await transporter.sendMail({
      from: `"songIQ" <${process.env.EMAIL_USER || 'noreply@songiq.com'}>`,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    await transporter.sendMail({
      from: `"songIQ" <${process.env.EMAIL_USER || 'noreply@songiq.com'}>`,
      to: email,
      subject: 'Welcome to songIQ - Your Account is Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">songIQ</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Music Analysis Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, ${userName}! 🎉</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Your email has been successfully verified! Your songIQ account is now active and ready to use.
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
                Start Analyzing Music
              </a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2d5a2d; margin-top: 0;">Your Free Plan Includes:</h3>
              <ul style="color: #2d5a2d; line-height: 1.6;">
                <li>✅ Up to 3 song analyses</li>
                <li>✅ Basic music insights</li>
                <li>✅ Standard reports</li>
                <li>✅ Perfect for trying songIQ</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              Ready for more? Upgrade to our Pro or Enterprise plans for unlimited analyses, 
              advanced features, and priority support.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/pricing" 
                 style="background: #28a745; 
                        color: white; 
                        padding: 12px 25px; 
                        text-decoration: none; 
                        border-radius: 20px; 
                        display: inline-block; 
                        font-weight: bold;">
                View Plans & Upgrade
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
Welcome to songIQ, ${userName}! 🎉

Your email has been successfully verified! Your songIQ account is now active and ready to use.

Start analyzing music: ${baseUrl}/dashboard

Your Free Plan Includes:
✅ Up to 3 song analyses
✅ Basic music insights
✅ Standard reports
✅ Perfect for trying songIQ

Ready for more? Upgrade to our Pro or Enterprise plans for unlimited analyses, 
advanced features, and priority support.

View plans: ${baseUrl}/pricing

Best regards,
The songIQ Team
      `
    });
    
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}; 