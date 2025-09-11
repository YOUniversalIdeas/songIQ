import twilio from 'twilio';
import { sendEmail } from './emailService';
import { createVerificationEmail } from './emailTemplates';

// Twilio Verify API service - initialize inside functions to ensure env vars are loaded
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not found in environment variables');
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Verify service SID - we'll create this if it doesn't exist
let VERIFY_SERVICE_SID: string | null = null;

// Get or create Verify service
const getVerifyServiceSid = async (): Promise<string> => {
  if (VERIFY_SERVICE_SID) {
    return VERIFY_SERVICE_SID;
  }

  try {
    const twilioClient = getTwilioClient();
    
    // Check if we have a service SID in environment
    if (process.env.TWILIO_VERIFY_SERVICE_SID) {
      VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;
      return VERIFY_SERVICE_SID;
    }

    // List existing services
    const services = await twilioClient.verify.v2.services.list();
    
    if (services.length > 0) {
      // Use the first existing service
      VERIFY_SERVICE_SID = services[0].sid;
      console.log(`✅ Using existing Verify service: ${VERIFY_SERVICE_SID}`);
      return VERIFY_SERVICE_SID;
    }

    // Create a new service
    const newService = await twilioClient.verify.v2.services.create({
      friendlyName: 'songIQ Verification Service'
    });
    
    VERIFY_SERVICE_SID = newService.sid;
    console.log(`✅ Created new Verify service: ${VERIFY_SERVICE_SID}`);
    
    return VERIFY_SERVICE_SID;
  } catch (error) {
    console.error('❌ Error getting Verify service:', error);
    throw error;
  }
};

// Email verification code generation
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS verification using Twilio Verify API
export const sendSMSVerification = async (
  phoneNumber: string, 
  userName: string
): Promise<{ success: boolean; serviceSid?: string; error?: string }> => {
  try {
    const twilioClient = getTwilioClient();
    const serviceSid = await getVerifyServiceSid();
    
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

    console.log(`📱 Sending SMS verification to: ${phoneNumber} -> ${formattedPhoneNumber}`);

    // Start verification using Verify API
    const verification = await twilioClient.verify.v2.services(serviceSid)
      .verifications
      .create({
        to: formattedPhoneNumber,
        channel: 'sms'
      });

    console.log(`✅ SMS verification started for ${formattedPhoneNumber}, Status: ${verification.status}`);
    
    return {
      success: true,
      serviceSid: serviceSid
    };
  } catch (error) {
    console.error('❌ Error sending SMS verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Send email verification
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
  sms: { success: boolean; serviceSid?: string; error?: string };
}> => {
  const emailCode = generateVerificationCode();
  
  console.log('🔍 sendVerificationCodes called with:', {
    email,
    phoneNumber,
    userName,
    emailCode,
    phoneNumberType: typeof phoneNumber,
    phoneNumberLength: phoneNumber?.length
  });
  
  // Send both verifications concurrently
  const [emailResult, smsResult] = await Promise.all([
    sendEmailVerification(email, emailCode, userName),
    sendSMSVerification(phoneNumber, userName)
  ]);

  console.log('📊 Verification results:', {
    email: emailResult,
    sms: smsResult
  });

  return {
    email: { ...emailResult, code: emailCode },
    sms: smsResult
  };
};

// Verify SMS code using Twilio Verify API
export const verifySMSCode = async (
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const twilioClient = getTwilioClient();
    const serviceSid = await getVerifyServiceSid();
    
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

    console.log(`🔐 Verifying SMS code for: ${formattedPhoneNumber}`);

    // Check verification using Verify API
    const verificationCheck = await twilioClient.verify.v2.services(serviceSid)
      .verificationChecks
      .create({
        to: formattedPhoneNumber,
        code: code
      });

    console.log(`📋 Verification check result: ${verificationCheck.status}`);

    if (verificationCheck.status === 'approved') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid or expired verification code' 
      };
    }
  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Verify email code (same as before)
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would typically check against a stored code in your database
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

// Get verification status
export const getVerificationStatus = async (
  phoneNumber: string
): Promise<{ status: string; error?: string }> => {
  try {
    const twilioClient = getTwilioClient();
    const serviceSid = await getVerifyServiceSid();
    
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

    const verification = await twilioClient.verify.v2.services(serviceSid)
      .verifications(formattedPhoneNumber)
      .fetch();

    return { status: verification.status };
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
