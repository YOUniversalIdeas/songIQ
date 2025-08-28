import dotenv from 'dotenv';
import { sendEmail } from '../src/services/emailService';

// Load environment variables
dotenv.config();

async function testVerificationSystemMock() {
  console.log('🧪 Testing songIQ Verification System (Mock Mode)...\n');

  // Check environment variables
  console.log('🔑 Environment Check:');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE ? '✅ Loaded' : '❌ Not loaded');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Not loaded');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Loaded' : '❌ Not loaded');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Not loaded');
  console.log('');

  // Test data
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testName = 'Test User';

  console.log('📧 Test Data:');
  console.log('Email:', testEmail);
  console.log('Name:', testName);
  console.log('');

  try {
    console.log('🚀 Testing email verification (SendGrid)...');
    
    // Test just the email service
    const emailResult = await sendEmail({
      to: testEmail,
      subject: '🧪 songIQ Verification Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff6b35;">🧪 songIQ Verification Test</h1>
          <p>This is a test email to verify the SendGrid integration is working.</p>
          <p><strong>Test Code:</strong> 123456</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            If you receive this email, the email verification system is working correctly!
          </p>
        </div>
      `,
      text: `
        songIQ Verification Test
        
        This is a test email to verify the SendGrid integration is working.
        
        Test Code: 123456
        Timestamp: ${new Date().toISOString()}
        
        If you receive this email, the email verification system is working correctly!
      `
    });

    console.log('✅ Email Test Results:');
    console.log('Success:', emailResult.success ? '✅ Yes' : '❌ No');
    if (emailResult.messageId) console.log('Message ID:', emailResult.messageId);
    if (emailResult.error) console.log('Error:', emailResult.error);
    
    console.log('');
    
    if (emailResult.success) {
      console.log('🎉 SUCCESS: Email verification system is working!');
      console.log('📧 Check your email inbox for the test email');
    } else {
      console.log('❌ FAILED: Email verification system has issues');
      console.log('Check your SendGrid configuration and API key');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('');
  console.log('📚 Next Steps:');
  console.log('1. Check your email inbox for the test email');
  console.log('2. If email works, get Twilio credentials for SMS testing');
  console.log('3. Test the verification endpoints in your API');
  console.log('4. Test the frontend verification page');
  console.log('');
  console.log('🔑 To test SMS verification:');
  console.log('1. Sign up at https://console.twilio.com/');
  console.log('2. Get your Account SID and Auth Token');
  console.log('3. Get a phone number for sending SMS');
  console.log('4. Update your .env file with real credentials');
}

// Run the test
testVerificationSystemMock().catch(console.error);
