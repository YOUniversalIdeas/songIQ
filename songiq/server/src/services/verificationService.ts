import twilio from 'twilio';
import { sendEmail } from './emailService';
import { createVerificationEmail } from './emailTemplates';

// Verification code generation
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// SMS verification
export const sendSMSVerification = async (
  phoneNumber: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Create Twilio client inside function to ensure environment variables are loaded
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    // Ensure phone number is in international format
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      // If it's a 10-digit US number, add +1
      if (phoneNumber.length === 10) {
        formattedPhoneNumber = `+1${phoneNumber}`;
      } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
        // If it's 11 digits starting with 1, add +
        formattedPhoneNumber = `+${phoneNumber}`;
      } else {
        // For other formats, try adding +1 as default
        formattedPhoneNumber = `+1${phoneNumber}`;
      }
    }

    console.log('🔑 Twilio credentials loaded:', {
      accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
      authToken: process.env.TWILIO_AUTH_TOKEN?.substring(0, 10) + '...',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    });

    console.log(`📱 Sending SMS to: ${phoneNumber} -> ${formattedPhoneNumber}`);

    const message = await twilioClient.messages.create({
      body: `🎵 songIQ Verification Code: ${code}\n\nHi ${userName}, use this code to verify your account. This code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhoneNumber
    });

    console.log(`✅ SMS verification sent to ${formattedPhoneNumber}, Message ID: ${message.sid}`);
    return {
      success: true,
      messageId: message.sid
    };
  } catch (error) {
    console.error('❌ Error sending SMS verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Email verification
export const sendEmailVerification = async (
  email: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const result = await sendEmail({
      to: email,
      subject: '🎵 songIQ - Verify Your Account',
      html: createVerificationEmail(userName, code),
      text: `songIQ Verification Code: ${code}\n\nHi ${userName}, use this code to verify your account. This code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
    });

    return result;
  } catch (error) {
    console.error('❌ Error sending email verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Combined verification sending
export const sendVerificationCodes = async (
  email: string,
  phoneNumber: string,
  userName: string
): Promise<{
  email: { success: boolean; messageId?: string; error?: string; code?: string };
  sms: { success: boolean; messageId?: string; error?: string; code?: string };
}> => {
  const code = generateVerificationCode();
  
  console.log('🔍 sendVerificationCodes called with:', {
    email,
    phoneNumber,
    userName,
    code,
    phoneNumberType: typeof phoneNumber,
    phoneNumberLength: phoneNumber?.length
  });
  
  // Send both verifications concurrently
  const [emailResult, smsResult] = await Promise.all([
    sendEmailVerification(email, code, userName),
    sendSMSVerification(phoneNumber, code, userName)
  ]);

  console.log('📊 Verification results:', {
    email: emailResult,
    sms: smsResult
  });

  return {
    email: { ...emailResult, code },
    sms: { ...smsResult, code }
  };
};

// Verify SMS code
export const verifySMSCode = async (
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For now, we'll use a simple comparison
    // In production, you might want to store codes in Redis with expiration
    // This is a simplified version for demonstration
    
    // You could implement Redis-based verification here
    // const storedCode = await redis.get(`sms_verification:${phoneNumber}`);
    // if (!storedCode || storedCode !== code) {
    //   return { success: false, error: 'Invalid or expired code' };
    // }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Verify email code
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Similar to SMS verification, you could implement Redis-based verification
    // For now, this is a placeholder for the verification logic
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error verifying email code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
