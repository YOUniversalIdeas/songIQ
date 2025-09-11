import dotenv from 'dotenv';
import { sendSMSVerificationSendGrid, checkSendGridSMSStatus } from '../src/services/sendgridSMSService';

// Load environment variables
dotenv.config();

const TEST_PHONE = process.env.TEST_PHONE || '+12149576425'; // Allow override via environment variable

async function testSendGridSMS() {
  console.log('🧪 Testing SendGrid SMS Verification System');
  console.log('===========================================\n');

  // Validate environment variables
  const requiredVars = {
    'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
    'SENDGRID_FROM_EMAIL': process.env.SENDGRID_FROM_EMAIL || 'noreply@songiq.ai'
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => key === 'SENDGRID_API_KEY' && !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing SendGrid environment variables:');
    missingVars.forEach(key => console.error(`   ${key}: ❌ Missing`));
    console.error('\n💡 To set up SendGrid SMS:');
    console.error('   1. Log into your SendGrid account');
    console.error('   2. Go to Settings → API Keys');
    console.error('   3. Create a new API key with "Mail Send" permissions');
    console.error('   4. Add to your .env file:');
    console.error('      SENDGRID_API_KEY=your_api_key_here');
    console.error('      SENDGRID_FROM_EMAIL=your_verified_sender@domain.com');
    console.error('\n⚠️  Important: SendGrid SMS requires separate approval!');
    console.error('   Even if email works, SMS might not be enabled.');
    return;
  }

  console.log('✅ SendGrid environment variables loaded successfully');
  console.log(`   API Key: ${requiredVars.SENDGRID_API_KEY?.substring(0, 10)}...`);
  console.log(`   From Email: ${requiredVars.SENDGRID_FROM_EMAIL}`);
  console.log(`   To: ${TEST_PHONE}\n`);

  try {
    // First, check SendGrid service status
    console.log('🔍 Checking SendGrid service status...');
    const status = await checkSendGridSMSStatus();
    console.log(`   Email Enabled: ${status.emailEnabled ? '✅ Yes' : '❌ No'}`);
    console.log(`   SMS Status: ${status.smsEnabled === 'unknown' ? '❓ Unknown' : status.smsEnabled ? '✅ Yes' : '❌ No'}`);
    console.log(`   Status: ${status.status}\n`);

    if (!status.emailEnabled) {
      console.error('❌ SendGrid email service is not working. Cannot test SMS.');
      return;
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 Generated verification code: ${verificationCode}`);

    // Try to send SMS via SendGrid
    console.log('\n📱 Attempting to send SMS via SendGrid...');
    console.log('⚠️  Note: This will likely fail if SMS is not enabled in your SendGrid account.');
    console.log('   The error message will tell us exactly what\'s needed to enable SMS.\n');
    
    const result = await sendSMSVerificationSendGrid(TEST_PHONE, verificationCode, 'Test User');

    if (result.success) {
      console.log('🎉 SMS sent successfully via SendGrid!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${TEST_PHONE}`);
      console.log(`   Code: ${verificationCode}`);
      
      console.log('\n🎉 SendGrid SMS verification is working!');
      console.log('   You can now use this service instead of Twilio.');
    } else {
      console.error('❌ SMS failed to send via SendGrid');
      console.error(`   Error: ${result.error}`);
      
      // Provide specific guidance based on the error
      if (result.error?.includes('SMS service not enabled')) {
        console.error('\n💡 To enable SendGrid SMS:');
        console.error('   1. Log into SendGrid dashboard');
        console.error('   2. Go to Settings → Sender Authentication');
        console.error('   3. Look for "SMS" or "Phone Number" options');
        console.error('   4. Follow the approval process');
        console.error('   5. This is separate from email approval!');
      } else if (result.error?.includes('API key is invalid')) {
        console.error('\n💡 Check your SendGrid API key:');
        console.error('   1. Verify the API key in your SendGrid dashboard');
        console.error('   2. Ensure it has "Mail Send" permissions');
        console.error('   3. Check if the key is active');
      }
    }

  } catch (error) {
    console.error('❌ Error testing SendGrid SMS:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        console.error('\n💡 Solution: Your SendGrid API key is invalid or expired.');
        console.error('   Check your API key in the SendGrid dashboard.');
      } else if (error.message.includes('Forbidden')) {
        console.error('\n💡 Solution: SendGrid SMS service is not enabled.');
        console.error('   You need to request SMS approval separately from email.');
      } else if (error.message.includes('Bad Request')) {
        console.error('\n💡 Solution: Check your phone number format and SendGrid configuration.');
      }
    }
  }
}

// Run the test
testSendGridSMS().catch(console.error);
