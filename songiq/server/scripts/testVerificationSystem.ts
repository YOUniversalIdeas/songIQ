import dotenv from 'dotenv';
import { sendVerificationCodes } from '../src/services/verificationService';

// Load environment variables
dotenv.config();

async function testVerificationSystem() {
  console.log('🧪 Testing songIQ Verification System...\n');

  // Check environment variables
  console.log('🔑 Environment Check:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Loaded' : '❌ Not loaded');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Loaded' : '❌ Not loaded');
  console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER ? '✅ Loaded' : '❌ Not loaded');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE ? '✅ Loaded' : '❌ Not loaded');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Loaded' : '❌ Not loaded');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Loaded' : '❌ Not loaded');
  console.log('');

  // Test data
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  const testPhone = process.env.TEST_PHONE || '+1234567890';
  const testName = 'Test User';

  console.log('📧 Test Data:');
  console.log('Email:', testEmail);
  console.log('Phone:', testPhone);
  console.log('Name:', testName);
  console.log('');

  try {
    console.log('🚀 Testing verification code sending...');
    
    const results = await sendVerificationCodes(testEmail, testPhone, testName);
    
    console.log('✅ Results:');
    console.log('Email:', results.email.success ? '✅ Sent' : '❌ Failed');
    if (results.email.error) console.log('  Error:', results.email.error);
    if (results.email.messageId) console.log('  Message ID:', results.email.messageId);
    
    console.log('SMS:', results.sms.success ? '✅ Sent' : '❌ Failed');
    if (results.sms.error) console.log('  Error:', results.sms.error);
    if (results.sms.messageId) console.log('  Message ID:', results.sms.messageId);
    
    console.log('');
    
    if (results.email.success && results.sms.success) {
      console.log('🎉 SUCCESS: Both email and SMS verification codes sent successfully!');
      console.log('📱 Check your phone for the SMS code');
      console.log('📧 Check your email for the verification email');
    } else if (results.email.success || results.sms.success) {
      console.log('⚠️  PARTIAL SUCCESS: Some verification codes were sent');
    } else {
      console.log('❌ FAILED: No verification codes were sent');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  console.log('');
  console.log('📚 Next Steps:');
  console.log('1. Check your email inbox for the verification email');
  console.log('2. Check your phone for the SMS verification code');
  console.log('3. Test the verification endpoints in your API');
  console.log('4. Test the frontend verification page');
}

// Run the test
testVerificationSystem().catch(console.error);
