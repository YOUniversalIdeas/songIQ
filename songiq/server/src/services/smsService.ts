import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

// AWS SNS client configuration
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// SMS verification using AWS SNS
export const sendSMSVerification = async (
  phoneNumber: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
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

    console.log('🔑 AWS SNS credentials loaded:', {
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...',
      phoneNumber: formattedPhoneNumber
    });

    console.log(`📱 Sending SMS via AWS SNS to: ${phoneNumber} -> ${formattedPhoneNumber}`);

    const message = `🎵 songIQ Verification Code: ${code}\n\nHi ${userName}, use this code to verify your account. This code expires in 10 minutes.\n\nIf you didn't request this, please ignore this message.`;

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: formattedPhoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    });

    const result = await snsClient.send(command);

    console.log(`✅ SMS verification sent via AWS SNS to ${formattedPhoneNumber}, Message ID: ${result.MessageId}`);
    return {
      success: true,
      messageId: result.MessageId
    };
  } catch (error) {
    console.error('❌ Error sending SMS verification via AWS SNS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Alternative: Vonage (Nexmo) SMS service
export const sendSMSVerificationVonage = async (
  phoneNumber: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // This would require installing @vonage/server-sdk
    // For now, returning a placeholder implementation
    console.log('📱 Vonage SMS service not yet implemented');
    return {
      success: false,
      error: 'Vonage service not yet implemented'
    };
  } catch (error) {
    console.error('❌ Error with Vonage SMS service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Alternative: MessageBird SMS service
export const sendSMSVerificationMessageBird = async (
  phoneNumber: string, 
  code: string, 
  userName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // This would require installing messagebird
    // For now, returning a placeholder implementation
    console.log('📱 MessageBird SMS service not yet implemented');
    return {
      success: false,
      error: 'MessageBird service not yet implemented'
    };
  } catch (error) {
    console.error('❌ Error with MessageBird SMS service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
