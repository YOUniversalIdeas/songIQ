import sgMail from '@sendgrid/mail';

// SendGrid SMS service
export const sendSMSVerificationSendGrid = async (
  phoneNumber: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Set SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

    // Ensure phone number is in international format
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.length === 10) {
        formattedPhoneNumber = `+1${phoneNumber}`;
      } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
        formattedPhoneNumber = `+${phoneNumber}`;
      } else {
        formattedPhoneNumber = `+1${phoneNumber}`;
      }
    }

    console.log('🔑 SendGrid SMS credentials loaded:', {
      apiKey: process.env.SENDGRID_API_KEY?.substring(0, 10) + '...',
      phoneNumber: formattedPhoneNumber
    });

    console.log(`📱 Sending SMS via SendGrid to: ${phoneNumber} -> ${formattedPhoneNumber}`);

    // SendGrid SMS message
    const message = {
      to: formattedPhoneNumber,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@songiq.ai',
      subject: 'songIQ Verification Code',
      text: `🎵 songIQ Verification Code: ${code}\n\nHi ${userName}, use this code to verify your account. This code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ff6b35;">🎵 songIQ Verification Code</h2>
          <p><strong>Code: ${code}</strong></p>
          <p>Hi ${userName}, use this code to verify your account. This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this message.</p>
        </div>
      `,
      // SendGrid SMS specific options
      sendAt: Math.floor(Date.now() / 1000),
      dynamicTemplateData: {
        code: code,
        userName: userName
      }
    };

    const result = await sgMail.send(message);

    console.log(`✅ SMS verification sent via SendGrid to ${formattedPhoneNumber}`);
    console.log('📊 SendGrid Response:', result);
    
    return {
      success: true,
      messageId: result[0]?.headers['x-message-id'] || 'unknown'
    };
  } catch (error) {
    console.error('❌ Error sending SMS verification via SendGrid:', error);
    
    // Check for specific SendGrid error types
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return {
          success: false,
          error: 'SendGrid API key is invalid or expired'
        };
      } else if (error.message.includes('Forbidden')) {
        return {
          success: false,
          error: 'SendGrid SMS service not enabled or approved'
        };
      } else if (error.message.includes('Bad Request')) {
        return {
          success: false,
          error: 'Invalid phone number format or SendGrid SMS not configured'
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Check SendGrid SMS service status
export const checkSendGridSMSStatus = async (): Promise<{
  emailEnabled: boolean;
  smsEnabled: boolean | 'unknown';
  status: string;
}> => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    
    // Try to get account information
    // Note: This is a simplified check - SendGrid doesn't have a direct SMS status endpoint
    const testMessage = {
      to: 'test@example.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@songiq.ai',
      subject: 'Test',
      text: 'Test message'
    };
    
    await sgMail.send(testMessage);
    
    return {
      emailEnabled: true,
      smsEnabled: 'unknown', // Can't determine without trying SMS
      status: 'Email service working, SMS status unknown'
    };
  } catch (error) {
    return {
      emailEnabled: false,
      smsEnabled: false,
      status: 'SendGrid service not working'
    };
  }
};
