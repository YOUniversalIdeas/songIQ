import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Test with a different phone number - you can change this to any number you have access to
const TEST_PHONE = '+19037143740'; // Testing with the new number provided

async function testSMSWithDifferentNumber() {
  console.log('🧪 Testing SMS with Different Phone Number');
  console.log('==========================================\n');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('❌ Missing Twilio environment variables');
    return;
  }

  console.log('✅ Environment variables loaded successfully');
  console.log(`   From: ${TWILIO_PHONE_NUMBER}`);
  console.log(`   To: ${TEST_PHONE}\n`);

  try {
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('🔌 Twilio client initialized');

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 Generated verification code: ${verificationCode}`);

    // Send SMS
    console.log('\n📱 Sending SMS...');
    const message = await twilioClient.messages.create({
      body: `Your songIQ verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
      from: TWILIO_PHONE_NUMBER,
      to: TEST_PHONE
    });

    console.log('✅ SMS sent successfully!');
    console.log(`   Message SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   To: ${message.to}`);
    console.log(`   From: ${message.from}`);

    // Wait and check status
    console.log('\n⏳ Waiting 5 seconds to check message status...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const updatedMessage = await twilioClient.messages(message.sid).fetch();
      console.log('\n📊 Updated Message Status:');
      console.log(`   Status: ${updatedMessage.status}`);
      console.log(`   Error Code: ${updatedMessage.errorCode || 'None'}`);
      console.log(`   Error Message: ${updatedMessage.errorMessage || 'None'}`);
      
      if (updatedMessage.status === 'delivered') {
        console.log('🎉 Message delivered successfully!');
        console.log('\n💡 This suggests the issue was specific to +12149576425');
        console.log('   Possible causes:');
        console.log('   - Number type (landline/VoIP)');
        console.log('   - Carrier restrictions');
        console.log('   - Geographic limitations');
      } else if (updatedMessage.status === 'undelivered') {
        console.log('❌ Message delivery failed');
        console.log(`   Error Code: ${updatedMessage.errorCode}`);
        if (updatedMessage.errorCode === 30034) {
          console.log('\n💡 Error 30034: Phone number not verified in Twilio account');
          console.log('   Solution: Add this number to verified caller IDs in Twilio console');
        }
      } else {
        console.log(`⏳ Message status: ${updatedMessage.status}`);
      }
    } catch (statusError) {
      console.error('❌ Error checking message status:', statusError);
    }

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('30034')) {
        console.error('\n💡 Error 30034: Phone number not verified in Twilio account');
        console.error('   Solution: Add this number to verified caller IDs in Twilio console');
        console.error('   Or use a different phone number that is already verified');
      }
    }
  }
}

// Run the test
testSMSWithDifferentNumber().catch(console.error);
