import { EmailTemplateData } from '../types/email';

// Create base email template with songIQ branding
export function createBaseTemplate(content: string, data: Partial<EmailTemplateData> = {}): string {
  const defaultData = {
    userName: data.userName || 'User',
    baseUrl: data.baseUrl || 'http://localhost:3001',
    ...data
  };

  return `
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
        .song-details { background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b35; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
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
        ${content}
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-logo">song<span style="color: #ffcc02;">IQ</span></div>
        <div class="footer-links">
          <a href="${defaultData.baseUrl}/dashboard">Dashboard</a>
          <a href="${defaultData.baseUrl}/support">Support</a>
          <a href="${defaultData.baseUrl}/settings">Settings</a>
        </div>
        <div class="footer-text">Powered by AI • Transforming Music Analysis</div>
        <div class="footer-copyright">© 2024 songIQ. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
}

// Email verification template
export const createVerificationEmail = (userName: string, code: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>songIQ - Verify Your Account</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      
      <!-- Header with Orange Background -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ff6b35;">
        <tr>
          <td style="padding: 40px 20px; text-align: center;">
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
            
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px; text-align: center;">
              🔐 Verify Your Account
            </h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px; font-size: 16px;">
              Hi <strong>${userName}</strong>, welcome to songIQ! To complete your account setup, please verify your email address using the verification code below.
            </p>
            
            <!-- Verification Code Box -->
            <div style="background-color: #fff3e0; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; border: 3px solid #ff6b35;">
              <h3 style="color: #e65100; margin-top: 0; font-size: 18px; margin-bottom: 20px;">
                Your Verification Code
              </h3>
              <div style="font-size: 48px; font-weight: bold; color: #ff6b35; letter-spacing: 8px; font-family: 'Courier New', monospace; background-color: white; padding: 20px; border-radius: 10px; border: 2px solid #ff8c42; display: inline-block;">
                ${code}
              </div>
              <p style="color: #e65100; margin: 20px 0 0 0; font-size: 14px; font-weight: bold;">
                ⏰ This code expires in 10 minutes
              </p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #4caf50;">
              <h4 style="color: #2e7d32; margin-top: 0; font-size: 16px;">📱 SMS Verification Also Sent</h4>
              <p style="color: #666; margin: 0; line-height: 1.5; font-size: 14px;">
                We've also sent a verification code to your phone number. You can use either code to verify your account.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px; margin: 30px 0;">
              <strong>Security Note:</strong> Never share this verification code with anyone. songIQ staff will never ask for your verification code.
            </p>
            
            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
              <tr>
                <td style="text-align: center;">
                  <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                    <tr>
                      <td style="background-color: #ff6b35; padding: 15px 30px; border-radius: 25px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify" 
                           style="color: white; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                          ✅ Complete Verification
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If you didn't create an account with songIQ, please ignore this email. Your email address will not be added to any mailing lists.
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
  `;
};

// Welcome email template
export const createWelcomeEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ, ${data.userName}! 🎉</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Your email has been successfully verified! Your songIQ account is now active and ready to use.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}" class="btn">
        Start Analyzing Music
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Your Free Plan Includes:</h3>
      <ul>
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
      <a href="${data.baseUrl}/pricing" class="btn">
        View Plans & Upgrade
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Password reset request template
export const createPasswordResetEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Reset Your songIQ Password</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, we received a request to reset your password. 
      Click the button below to create a new password.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.resetUrl}" class="btn">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
      If the button doesn't work, you can copy and paste this link into your browser:
    </p>
    
    <div class="highlight-box">
      <h3>Reset Password Link:</h3>
      <p>${data.resetUrl}</p>
    </div>
    
    <div class="highlight-box">
      <h3>Security Notice:</h3>
      <ul>
        <li>This link will expire in 1 hour</li>
        <li>If you didn't request this reset, please ignore this email</li>
        <li>Your current password will remain unchanged</li>
      </ul>
    </div>
    
    <div class="footer">
      If you have any questions, please contact our support team.
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Password reset confirmation template
export const createPasswordResetConfirmationEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Password Successfully Reset</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, your songIQ password has been successfully reset. 
      You can now log in with your new password.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/login" class="btn">
        Log In to songIQ
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Security Tips:</h3>
      <ul>
        <li>Use a strong, unique password</li>
        <li>Enable two-factor authentication if available</li>
        <li>Never share your password with anyone</li>
        <li>Log out when using shared devices</li>
      </ul>
    </div>
    
    <div class="footer">
      If you didn't reset your password, please contact our support team immediately.
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Plain text versions for email clients that don't support HTML
export const createPlainTextEmail = (subject: string, content: string): string => {
  return `${subject}\n\n${content}\n\nBest regards,\nThe songIQ Team`;
};

// Subscription upgrade template
export const createSubscriptionUpgradeEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Welcome to ${data.newPlan} Plan, ${data.userName}! 🎉</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Congratulations! Your songIQ subscription has been successfully upgraded to our ${data.newPlan} plan. 
      You now have access to even more powerful music analysis features.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/dashboard" class="btn">
        Access Your Dashboard
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Your New ${data.newPlan} Plan Includes:</h3>
      <ul>
        ${data.features?.map(feature => `<li>✅ ${feature}</li>`).join('') || ''}
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Billing Information:</h3>
      <p>
        <strong>Plan:</strong> ${data.newPlan}<br>
        <strong>Amount:</strong> $${data.amount}<br>
        <strong>Next Billing:</strong> ${data.nextBillingDate}<br>
        <strong>Invoice:</strong> <a href="${data.invoiceUrl}" style="color: #667eea;">View Invoice</a>
      </p>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Thank you for choosing songIQ! If you have any questions about your new plan or need assistance, 
      our support team is here to help.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/support" class="btn">
        Get Support
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Subscription downgrade template
export const createSubscriptionDowngradeEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Subscription Plan Changed</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, your songIQ subscription has been changed to our ${data.newPlan} plan. 
      This change will take effect at the end of your current billing period.
    </p>
    
    <div class="highlight-box">
      <h3>Plan Change Details:</h3>
      <p>
        <strong>Current Plan:</strong> ${data.oldPlan}<br>
        <strong>New Plan:</strong> ${data.newPlan}<br>
        <strong>Effective Date:</strong> ${data.effectiveDate}<br>
        <strong>New Amount:</strong> $${data.newAmount}
      </p>
    </div>
    
    <div class="highlight-box">
      <h3>Your ${data.newPlan} Plan Features:</h3>
      <ul>
        ${data.features?.map(feature => `<li>✅ ${feature}</li>`).join('') || ''}
      </ul>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      If you'd like to upgrade back to a higher plan or have any questions, 
      please don't hesitate to contact us.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/pricing" class="btn">
        View All Plans
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Payment success template
export const createPaymentSuccessEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Payment Successful! 🎉</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, your payment has been processed successfully. 
      Thank you for your continued support of songIQ!
    </p>
    
    <div class="highlight-box">
      <h3>Payment Details:</h3>
      <p>
        <strong>Amount:</strong> $${data.amount}<br>
        <strong>Date:</strong> ${data.paymentDate}<br>
        <strong>Transaction ID:</strong> ${data.transactionId}<br>
        <strong>Plan:</strong> ${data.plan}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.invoiceUrl}" class="btn">
        View Invoice
      </a>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Your subscription is now active and you have full access to all ${data.plan} plan features. 
      Start analyzing your music and discovering new insights!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/dashboard" class="btn">
        Go to Dashboard
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Payment failed template
export const createPaymentFailedEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Payment Failed ⚠️</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, we were unable to process your payment for your songIQ subscription. 
      This may affect your access to premium features.
    </p>
    
    <div class="highlight-box">
      <h3>Payment Details:</h3>
      <p>
        <strong>Amount:</strong> $${data.amount}<br>
        <strong>Date:</strong> ${data.paymentDate}<br>
        <strong>Plan:</strong> ${data.plan}<br>
        <strong>Reason:</strong> ${data.failureReason || 'Payment method declined'}
      </p>
    </div>
    
    <div class="highlight-box">
      <h3>What This Means:</h3>
      <ul>
        <li>Your subscription may be temporarily suspended</li>
        <li>You'll still have access to basic features</li>
        <li>We'll retry the payment in a few days</li>
      </ul>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      To restore full access, please update your payment method or contact us for assistance.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/billing" class="btn">
        Update Payment Method
      </a>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${data.baseUrl}/support" class="btn">
        Get Help
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Analysis completion template
export const createAnalysisCompleteEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Your Song Analysis is Ready! 🎵</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, your analysis of "${data.songTitle}" is complete and ready for review. 
      Discover the insights and unlock the potential of your music!
    </p>
    
    <div class="song-details">
      <h3>Analysis Summary:</h3>
      <ul>
        <li><strong>Song:</strong> ${data.songTitle}</li>
        <li><strong>Artist:</strong> ${data.artistName}</li>
        <li><strong>Duration:</strong> ${data.duration}</li>
        <li><strong>Analysis Type:</strong> ${data.analysisType}</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.analysisUrl}" class="btn">
        View Full Analysis
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>What You'll Discover:</h3>
      <ul>
        <li>🎯 Musical structure and composition insights</li>
        <li>🎵 Harmonic and melodic analysis</li>
        <li>🎼 Production quality assessment</li>
        <li>📊 Market potential indicators</li>
        <li>💡 Actionable improvement suggestions</li>
      </ul>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Ready for more insights? Analyze another song or explore our advanced features 
      to take your music to the next level.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/upload" class="btn">
        Analyze Another Song
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Analysis failed template
export const createAnalysisFailedEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Analysis Failed ⚠️</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, we encountered an issue while analyzing "${data.songTitle}". 
      Don't worry - we're here to help you get the insights you need.
    </p>
    
    <div class="song-details">
      <h3>Song Details:</h3>
      <ul>
        <li><strong>Song:</strong> ${data.songTitle}</li>
        <li><strong>Artist:</strong> ${data.artistName}</li>
        <li><strong>Upload Date:</strong> ${data.uploadDate}</li>
        <li><strong>Error:</strong> ${data.errorMessage || 'Processing failed'}</li>
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>What Happened:</h3>
      <ul>
        <li>The analysis process encountered an unexpected error</li>
        <li>Your song file remains safe and unchanged</li>
        <li>We've been notified and are investigating</li>
      </ul>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      We've automatically refunded your analysis credit. You can try uploading the song again, 
      or contact our support team for assistance.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/upload" class="btn">
        Try Again
      </a>
    </div>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${data.baseUrl}/support" class="btn">
        Contact Support
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// ===== PHASE 3: ENGAGEMENT & MARKETING EMAILS =====

// Welcome Series - Day 1: Getting Started
export const createWelcomeSeriesDay1Email = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Welcome to songIQ! Let's Get Started 🎵</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, welcome to songIQ! We're excited to help you unlock the full potential of your music. 
      This is the first in a series of emails to get you up and running quickly.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/upload" class="btn">
        Upload Your First Song
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Today's Quick Start Guide:</h3>
      <ul>
        <li>🎯 Upload your first song (any audio format)</li>
        <li>🎵 Choose your analysis type</li>
        <li>📊 Get instant insights and recommendations</li>
        <li>💡 Discover what makes your music special</li>
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Pro Tip:</h3>
      <p>
        Start with your strongest song to see songIQ's full capabilities. 
        The AI will analyze everything from melody and harmony to market potential!
      </p>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Tomorrow, we'll show you how to interpret your analysis results and use them to improve your music.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/dashboard" class="btn">
        Explore Your Dashboard
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Welcome Series - Day 3: Understanding Your Results
export const createWelcomeSeriesDay3Email = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Understanding Your Analysis Results 📊</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}! By now you've probably analyzed your first song. 
      Let's dive deeper into what those results mean and how to use them.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/dashboard" class="btn">
        View Your Results
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Key Metrics Explained:</h3>
      <ul>
        <li>🎼 <strong>Musical Structure:</strong> Verse, chorus, bridge analysis</li>
        <li>🎵 <strong>Harmonic Complexity:</strong> Chord progressions and key changes</li>
        <li>🎯 <strong>Market Potential:</strong> Genre trends and audience fit</li>
        <li>💡 <strong>Improvement Areas:</strong> Specific suggestions for enhancement</li>
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Action Items:</h3>
      <ul>
        <li>Compare multiple songs to see patterns</li>
        <li>Use insights to refine your sound</li>
        <li>Track improvements over time</li>
        <li>Share results with your team</li>
      </ul>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Ready to analyze more songs? Your free plan includes up to 3 analyses. 
      Upgrade to unlock unlimited insights!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/pricing" class="btn">
        View Plans & Upgrade
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Welcome Series - Day 7: Advanced Features
export const createWelcomeSeriesDay7Email = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">Discover songIQ's Advanced Features 🚀</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}! You've been using songIQ for a week now. 
      Let's explore some advanced features that can take your music to the next level.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/features" class="btn">
        Explore Features
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>Advanced Features You'll Love:</h3>
      <ul>
        <li>🎯 <strong>Market Analysis:</strong> Genre trends and audience insights</li>
        <li>📈 <strong>Performance Tracking:</strong> Monitor your progress over time</li>
        <li>🎵 <strong>Comparative Analysis:</strong> Compare your songs to hits</li>
        <li>💼 <strong>Industry Reports:</strong> Professional insights for labels</li>
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Success Story:</h3>
      <p>
        "songIQ helped me identify why my latest track wasn't connecting. 
        The market analysis showed I was targeting the wrong audience. 
        After adjusting my approach, streams increased by 300%!" - Sarah M.
      </p>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Ready to unlock these advanced features? Upgrade to Pro or Enterprise for unlimited analyses 
      and comprehensive insights.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/pricing" class="btn">
        Upgrade Now
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Feature Announcement Email
export const createFeatureAnnouncementEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">🎉 New songIQ Feature: ${data.featureName}!</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, we're excited to announce a brand new feature that will revolutionize 
      how you analyze and improve your music!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.featureUrl}" class="btn">
        Try ${data.featureName} Now
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>What's New:</h3>
      <p>
        ${data.featureDescription}
      </p>
      <ul>
        ${data.featureBenefits?.map(benefit => `<li>✅ ${benefit}</li>`).join('') || ''}
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>How to Get Started:</h3>
      <ol>
        <li>Visit the new feature page</li>
        <li>Upload a song to test it out</li>
        <li>Share your feedback with us</li>
        <li>Tell other artists about it!</li>
      </ol>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      This feature is available to all users. We'd love to hear what you think! 
      Your feedback helps us make songIQ even better.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/feedback" class="btn">
        Share Feedback
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Usage Tips Email
export const createUsageTipsEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">💡 songIQ Pro Tips: ${data.tipCategory}</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, here are some expert tips to help you get the most out of songIQ 
      and take your music analysis to the next level!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.tipsUrl}" class="btn">
        Read Full Guide
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>This Week's Tips:</h3>
      <ul>
        ${data.tips?.map(tip => `<li>💡 ${tip}</li>`).join('') || ''}
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Pro Tip of the Week:</h3>
      <p>
        <strong>${data.proTipTitle}</strong><br>
        ${data.proTipDescription}
      </p>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Want more tips like these? Check out our comprehensive guides and video tutorials 
      to become a songIQ power user!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/resources" class="btn">
        Browse Resources
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};

// Re-engagement Campaign Email
export const createReEngagementEmail = (data: EmailTemplateData): string => {
  const content = `
    <h2 style="color: #333; margin-bottom: 20px;">We Miss You at songIQ! 🎵</h2>
    
    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
      Hi ${data.userName}, it's been a while since we've seen you analyze music on songIQ. 
      We hope everything is going well with your music!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/upload" class="btn">
        Analyze a New Song
      </a>
    </div>
    
    <div class="highlight-box">
      <h3>What You've Been Missing:</h3>
      <ul>
        <li>🎯 New AI analysis features</li>
        <li>📊 Enhanced market insights</li>
        <li>🎵 Improved genre detection</li>
        <li>💡 Better improvement suggestions</li>
      </ul>
    </div>
    
    <div class="highlight-box">
      <h3>Special Offer:</h3>
      <p>
        <strong>Welcome back bonus:</strong> Get 50% off your first month of Pro or Enterprise 
        when you upgrade today! Use code: <strong>WELCOMEBACK</strong>
      </p>
    </div>
    
    <p style="color: #666; line-height: 1.6;">
      Your music deserves the best analysis. Come back and see what's new at songIQ!
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.baseUrl}/pricing" class="btn">
        View Plans
      </a>
    </div>
  `;
  
  return createBaseTemplate(content, data);
};
