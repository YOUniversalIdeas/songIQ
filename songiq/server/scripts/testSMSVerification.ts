import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TEST_PHONE = process.env.TEST_PHONE || '+12149576425'; // Allow override via environment variable

async function testSMSVerification() {
  console.log('🧪 Testing SMS Verification System');
  console.log('=====================================\n');

  // Validate environment variables
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error('❌ Missing Twilio environment variables:');
    console.error(`   TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
    console.error(`   TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
    console.error(`   TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing'}`);
    return;
  }

  console.log('✅ Environment variables loaded successfully');
  console.log(`   From: ${TWILIO_PHONE_NUMBER}`);
  console.log(`   To: ${TEST_PHONE}\n`);

  try {
    // Initialize Twilio client
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('🔌 Twilio client initialized');

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 Generated verification code: ${verificationCode}`);

    // Send SMS
    console.log('\n📱 Sending SMS...');
    const message = await twilioClient.messages.create({
      body: `Test message from songIQ: ${verificationCode}`,
      from: TWILIO_PHONE_NUMBER,
      to: TEST_PHONE
    });

    console.log('✅ SMS sent successfully!');
    console.log(`   Message SID: ${message.sid}`);
    console.log(`   Status: ${message.status}`);
    console.log(`   To: ${message.to}`);
    console.log(`   From: ${message.from}`);
    console.log(`   Body: ${message.body}`);
    console.log(`   Date Created: ${message.dateCreated}`);
    console.log(`   Price: ${message.price}`);
    console.log(`   Price Unit: ${message.priceUnit}`);

    // Wait a moment and check message status
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
      } else if (updatedMessage.status === 'undelivered') {
        console.log('❌ Message delivery failed');
        console.log(`   Error: ${updatedMessage.errorMessage}`);
      } else {
        console.log(`⏳ Message status: ${updatedMessage.status}`);
      }
    } catch (statusError) {
      console.error('❌ Error checking message status:', statusError);
    }

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('To and From number cannot be the same')) {
        console.error('\n💡 Solution: The "To" and "From" phone numbers cannot be the same.');
        console.error('   Please use a different phone number for testing.');
      } else if (error.message.includes('Invalid \'To\' Phone Number')) {
        console.error('\n💡 Solution: The phone number format is invalid.');
        console.error('   Please use a valid phone number format (e.g., +12149576425).');
      } else if (error.message.includes('not verified')) {
        console.error('\n💡 Solution: This phone number is not verified in your Twilio trial account.');
        console.error('   You need to verify the destination number in your Twilio console.');
      }
    }
  }
}

// Run the test
testSMSVerification().catch(console.error);
