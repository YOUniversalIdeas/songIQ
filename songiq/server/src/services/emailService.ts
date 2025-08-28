import nodemailer from 'nodemailer';
import { 
  createVerificationEmail, 
  createWelcomeEmail, 
  createPasswordResetEmail, 
  createPasswordResetConfirmationEmail,
  createSubscriptionUpgradeEmail,
  createSubscriptionDowngradeEmail,
  createPaymentSuccessEmail,
  createPaymentFailedEmail,
  createAnalysisCompleteEmail,
  createAnalysisFailedEmail,
  createWelcomeSeriesDay1Email,
  createWelcomeSeriesDay3Email,
  createWelcomeSeriesDay7Email,
  createFeatureAnnouncementEmail,
  createUsageTipsEmail,
  createReEngagementEmail,
  createPlainTextEmail 
} from './emailTemplates';
import { EmailTemplateData, EmailOptions, EmailResult } from '../types/email';
import { queueEmail } from './emailQueue';

// Email transporter configuration
const createTransporter = () => {
  // Check if SendGrid is configured
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    // SendGrid configuration - use SMTP with SendGrid's SMTP server
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'apikey',
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else if (process.env.EMAIL_SERVICE === 'gmail') {
    // Gmail configuration
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  } else {
    // Default to Gmail for backward compatibility
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });
  }
};

// Generic email sending function
export const sendEmail = async (options: EmailOptions): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: options.from || `"songIQ" <admin@songiq.ai>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${options.to}, Message ID: ${result.messageId}`);
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Send email verification
export const sendVerificationEmail = async (email: string, userName: string, token: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const templateData: EmailTemplateData = {
      userName,
      baseUrl,
      verificationUrl
    };
    
    const html = createVerificationEmail(templateData.userName, templateData.verificationToken);
    const text = createPlainTextEmail(
      'Verify Your songIQ Account',
      `Welcome to songIQ, ${userName}!\n\nThank you for signing up! To complete your registration and start analyzing your music, please verify your email address by visiting this link:\n\n${verificationUrl}\n\nWhat's next?\n- Verify your email to activate your account\n- Start analyzing up to 3 songs with your free plan\n- Explore advanced features and upgrade when ready\n\nThis link will expire in 24 hours. If you didn't create an account with songIQ, you can safely ignore this email.`
    );
    
    // Queue the email for better performance
    await queueEmail({
      to: email,
      subject: 'Verify Your songIQ Account',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const templateData: EmailTemplateData = {
      userName,
      baseUrl
    };
    
    const html = createWelcomeEmail(templateData);
    const text = createPlainTextEmail(
      'Welcome to songIQ - Your Account is Verified!',
      `Welcome to songIQ, ${userName}! 🎉\n\nYour email has been successfully verified! Your songIQ account is now active and ready to use.\n\nStart analyzing music: ${baseUrl}/dashboard\n\nYour Free Plan Includes:\n✅ Up to 3 song analyses\n✅ Basic music insights\n✅ Standard reports\n✅ Perfect for trying songIQ\n\nReady for more? Upgrade to our Pro or Enterprise plans for unlimited analyses, advanced features, and priority support.\n\nView plans: ${baseUrl}/pricing`
    );
    
    // Queue the email for better performance
    await queueEmail({
      to: email,
      subject: 'Welcome to songIQ - Your Account is Verified!',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, userName: string, token: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    
    const templateData: EmailTemplateData = {
      userName,
      baseUrl,
      resetUrl
    };
    
    const html = createPasswordResetEmail(templateData);
    const text = createPlainTextEmail(
      'Reset Your songIQ Password',
      `Hi ${userName}, we received a request to reset your password.\n\nClick the link below to create a new password:\n\n${resetUrl}\n\nSecurity Notice:\n- This link will expire in 1 hour\n- If you didn't request this reset, please ignore this email\n- Your current password will remain unchanged\n\nIf you have any questions, please contact our support team.`
    );
    
    // Queue the email for better performance
    await queueEmail({
      to: email,
      subject: 'Reset Your songIQ Password',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (email: string, userName: string): Promise<boolean> => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const templateData: EmailTemplateData = {
      userName,
      baseUrl
    };
    
    const html = createPasswordResetConfirmationEmail(templateData);
    const text = createPlainTextEmail(
      'Password Reset Confirmation - songIQ',
      `Hi ${userName}, your songIQ password has been successfully reset.\n\nYou can now log in with your new password.\n\nLog in: ${baseUrl}/login\n\nSecurity Tips:\n- Use a strong, unique password\n- Enable two-factor authentication if available\n- Never share your password with anyone\n- Log out when using shared devices\n\nIf you didn't reset your password, please contact our support team immediately.`
    );
    
    // Queue the email for better performance
    await queueEmail({
      to: email,
      subject: 'Password Reset Confirmation - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    return false;
  }
};

// ===== PHASE 2: SUBSCRIPTION & BILLING EMAILS =====

// Send subscription upgrade email
export const sendSubscriptionUpgradeEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createSubscriptionUpgradeEmail(data);
    const text = createPlainTextEmail(
      `Welcome to ${data.newPlan} Plan - songIQ`,
      `Congratulations! Your songIQ subscription has been successfully upgraded to our ${data.newPlan} plan.\n\nYou now have access to even more powerful music analysis features.\n\nYour New ${data.newPlan} Plan Includes:\n${data.features?.map(feature => `✅ ${feature}`).join('\n') || ''}\n\nBilling Information:\nPlan: ${data.newPlan}\nAmount: $${data.amount}\nNext Billing: ${data.nextBillingDate}\n\nThank you for choosing songIQ! If you have any questions about your new plan or need assistance, our support team is here to help.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: `Welcome to ${data.newPlan} Plan - songIQ`,
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending subscription upgrade email:', error);
    return false;
  }
};

// Send subscription downgrade email
export const sendSubscriptionDowngradeEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createSubscriptionDowngradeEmail(data);
    const text = createPlainTextEmail(
      'Subscription Plan Changed - songIQ',
      `Hi ${data.userName}, your songIQ subscription has been changed to our ${data.newPlan} plan.\n\nThis change will take effect at the end of your current billing period.\n\nPlan Change Details:\nCurrent Plan: ${data.oldPlan}\nNew Plan: ${data.newPlan}\nEffective Date: ${data.effectiveDate}\nNew Amount: $${data.newAmount}\n\nYour ${data.newPlan} Plan Features:\n${data.features?.map(feature => `✅ ${feature}`).join('\n') || ''}\n\nIf you'd like to upgrade back to a higher plan or have any questions, please don't hesitate to contact us.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Subscription Plan Changed - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending subscription downgrade email:', error);
    return false;
  }
};

// Send payment success email
export const sendPaymentSuccessEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createPaymentSuccessEmail(data);
    const text = createPlainTextEmail(
      'Payment Successful - songIQ',
      `Hi ${data.userName}, your payment has been processed successfully.\n\nPayment Details:\nAmount: $${data.amount}\nDate: ${data.paymentDate}\nTransaction ID: ${data.transactionId}\nPlan: ${data.plan}\n\nYour subscription is now active and you have full access to all ${data.plan} plan features. Start analyzing your music and discovering new insights!`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Payment Successful - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return false;
  }
};

// Send payment failed email
export const sendPaymentFailedEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createPaymentFailedEmail(data);
    const text = createPlainTextEmail(
      'Payment Failed - songIQ',
      `Hi ${data.userName}, we were unable to process your payment for your songIQ subscription.\n\nPayment Details:\nAmount: $${data.amount}\nDate: ${data.paymentDate}\nPlan: ${data.plan}\nReason: ${data.failureReason || 'Payment method declined'}\n\nWhat This Means:\n- Your subscription may be temporarily suspended\n- You'll still have access to basic features\n- We'll retry the payment in a few days\n\nTo restore full access, please update your payment method or contact us for assistance.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Payment Failed - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    return false;
  }
};

// ===== PHASE 2: ANALYSIS EMAILS =====

// Send analysis completion email
export const sendAnalysisCompleteEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createAnalysisCompleteEmail(data);
    const text = createPlainTextEmail(
      'Song Analysis Complete - songIQ',
      `Hi ${data.userName}, your analysis of "${data.songTitle}" is complete and ready for review!\n\nAnalysis Summary:\nSong: ${data.songTitle}\nArtist: ${data.artistName}\nDuration: ${data.duration}\nAnalysis Type: ${data.analysisType}\n\nWhat You'll Discover:\n🎯 Musical structure and composition insights\n🎵 Harmonic and melodic analysis\n🎼 Production quality assessment\n📊 Market potential indicators\n💡 Actionable improvement suggestions\n\nReady for more insights? Analyze another song or explore our advanced features to take your music to the next level.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Song Analysis Complete - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending analysis complete email:', error);
    return false;
  }
};

// Send analysis failed email
export const sendAnalysisFailedEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createAnalysisFailedEmail(data);
    const text = createPlainTextEmail(
      'Song Analysis Failed - songIQ',
      `Hi ${data.userName}, we encountered an issue while analyzing "${data.songTitle}".\n\nSong Details:\nSong: ${data.songTitle}\nArtist: ${data.artistName}\nUpload Date: ${data.uploadDate}\nError: ${data.errorMessage || 'Processing failed'}\n\nWhat Happened:\n- The analysis process encountered an unexpected error\n- Your song file remains safe and unchanged\n- We've been notified and are investigating\n\nWe've automatically refunded your analysis credit. You can try uploading the song again, or contact our support team for assistance.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Song Analysis Failed - songIQ',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending analysis failed email:', error);
    return false;
  }
};

// ===== PHASE 3: ENGAGEMENT & MARKETING EMAILS =====

// Send welcome series - Day 1
export const sendWelcomeSeriesDay1Email = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createWelcomeSeriesDay1Email(data);
    const text = createPlainTextEmail(
      'Welcome to songIQ - Day 1: Getting Started',
      `Welcome to songIQ! Let's Get Started 🎵\n\nHi ${data.userName}, welcome to songIQ! We're excited to help you unlock the full potential of your music.\n\nToday's Quick Start Guide:\n🎯 Upload your first song (any audio format)\n🎵 Choose your analysis type\n📊 Get instant insights and recommendations\n💡 Discover what makes your music special\n\nPro Tip: Start with your strongest song to see songIQ's full capabilities. The AI will analyze everything from melody and harmony to market potential!\n\nTomorrow, we'll show you how to interpret your analysis results and use them to improve your music.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Welcome to songIQ - Day 1: Getting Started',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome series day 1 email:', error);
    return false;
  }
};

// Send welcome series - Day 3
export const sendWelcomeSeriesDay3Email = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createWelcomeSeriesDay3Email(data);
    const text = createPlainTextEmail(
      'Welcome to songIQ - Day 3: Understanding Your Results',
      `Understanding Your Analysis Results 📊\n\nHi ${data.userName}! By now you've probably analyzed your first song. Let's dive deeper into what those results mean and how to use them.\n\nKey Metrics Explained:\n🎼 Musical Structure: Verse, chorus, bridge analysis\n🎵 Harmonic Complexity: Chord progressions and key changes\n🎯 Market Potential: Genre trends and audience fit\n💡 Improvement Areas: Specific suggestions for enhancement\n\nAction Items:\n- Compare multiple songs to see patterns\n- Use insights to refine your sound\n- Track improvements over time\n- Share results with your team\n\nReady to analyze more songs? Your free plan includes up to 3 analyses. Upgrade to unlock unlimited insights!`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Welcome to songIQ - Day 3: Understanding Your Results',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome series day 3 email:', error);
    return false;
  }
};

// Send welcome series - Day 7
export const sendWelcomeSeriesDay7Email = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createWelcomeSeriesDay7Email(data);
    const text = createPlainTextEmail(
      'Welcome to songIQ - Day 7: Advanced Features',
      `Discover songIQ's Advanced Features 🚀\n\nHi ${data.userName}! You've been using songIQ for a week now. Let's explore some advanced features that can take your music to the next level.\n\nAdvanced Features You'll Love:\n🎯 Market Analysis: Genre trends and audience insights\n📈 Performance Tracking: Monitor your progress over time\n🎵 Comparative Analysis: Compare your songs to hits\n💼 Industry Reports: Professional insights for labels\n\nSuccess Story: "songIQ helped me identify why my latest track wasn't connecting. The market analysis showed I was targeting the wrong audience. After adjusting my approach, streams increased by 300%!" - Sarah M.\n\nReady to unlock these advanced features? Upgrade to Pro or Enterprise for unlimited analyses and comprehensive insights.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'Welcome to songIQ - Day 7: Advanced Features',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome series day 7 email:', error);
    return false;
  }
};

// Send feature announcement email
export const sendFeatureAnnouncementEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createFeatureAnnouncementEmail(data);
    const text = createPlainTextEmail(
      `New songIQ Feature: ${data.featureName}`,
      `🎉 New songIQ Feature: ${data.featureName}!\n\nHi ${data.userName}, we're excited to announce a brand new feature that will revolutionize how you analyze and improve your music!\n\nWhat's New:\n${data.featureDescription}\n\n${data.featureBenefits?.map(benefit => `✅ ${benefit}`).join('\n') || ''}\n\nHow to Get Started:\n1. Visit the new feature page\n2. Upload a song to test it out\n3. Share your feedback with us\n4. Tell other artists about it!\n\nThis feature is available to all users. We'd love to hear what you think! Your feedback helps us make songIQ even better.`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: `New songIQ Feature: ${data.featureName}`,
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending feature announcement email:', error);
    return false;
  }
};

// Send usage tips email
export const sendUsageTipsEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createUsageTipsEmail(data);
    const text = createPlainTextEmail(
      `songIQ Pro Tips: ${data.tipCategory}`,
      `💡 songIQ Pro Tips: ${data.tipCategory}\n\nHi ${data.userName}, here are some expert tips to help you get the most out of songIQ and take your music analysis to the next level!\n\nThis Week's Tips:\n${data.tips?.map(tip => `💡 ${tip}`).join('\n') || ''}\n\nPro Tip of the Week:\n${data.proTipTitle}\n${data.proTipDescription}\n\nWant more tips like these? Check out our comprehensive guides and video tutorials to become a songIQ power user!`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: `songIQ Pro Tips: ${data.tipCategory}`,
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending usage tips email:', error);
    return false;
  }
};

// Send re-engagement email
export const sendReEngagementEmail = async (data: EmailTemplateData): Promise<boolean> => {
  try {
    const html = createReEngagementEmail(data);
    const text = createPlainTextEmail(
      'We Miss You at songIQ - Come Back!',
      `We Miss You at songIQ! 🎵\n\nHi ${data.userName}, it's been a while since we've seen you analyze music on songIQ. We hope everything is going well with your music!\n\nWhat You've Been Missing:\n🎯 New AI analysis features\n📊 Enhanced market insights\n🎵 Improved genre detection\n💡 Better improvement suggestions\n\nSpecial Offer:\nWelcome back bonus: Get 50% off your first month of Pro or Enterprise when you upgrade today! Use code: WELCOMEBACK\n\nYour music deserves the best analysis. Come back and see what's new at songIQ!`
    );
    
    await queueEmail({
      to: data.email || '',
      subject: 'We Miss You at songIQ - Come Back!',
      html,
      text
    });
    
    return true;
  } catch (error) {
    console.error('Error sending re-engagement email:', error);
    return false;
  }
}; 