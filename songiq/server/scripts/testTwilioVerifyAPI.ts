import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TEST_PHONE = process.env.TEST_PHONE || '+12149576425';

async function testTwilioVerifyAPI() {
  console.log('🧪 Testing Twilio Verify API');
  console.log('=============================\n');

  // Validate environment variables
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio environment variables:');
    console.error(`   TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing'}`);
    console.error(`   TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
    return;
  }

  console.log('✅ Environment variables loaded successfully');
  console.log(`   To: ${TEST_PHONE}\n`);

  try {
    // Initialize Twilio client
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log('🔌 Twilio client initialized');

    // First, let's check if we have any existing Verify services
    console.log('\n📋 Checking existing Verify services...');
    try {
      const services = await twilioClient.verify.services.list();
      console.log(`   Found ${services.length} Verify service(s)`);
      
      if (services.length === 0) {
        console.log('   ⚠️  No Verify services found. Creating one...');
        
        // Create a new Verify service
        const newService = await twilioClient.verify.services.create({
          friendlyName: 'songIQ Verification Service'
        });
        console.log(`   ✅ Created Verify service: ${newService.sid}`);
        console.log(`   Service Name: ${newService.friendlyName}`);
        
        // Use the new service
        const serviceSid = newService.sid;
        await testVerificationFlow(twilioClient, serviceSid);
      } else {
        // Use the first existing service
        const service = services[0];
        console.log(`   ✅ Using existing service: ${service.sid}`);
        console.log(`   Service Name: ${service.friendlyName}`);
        
        await testVerificationFlow(twilioClient, service.sid);
      }
    } catch (error) {
      console.error('❌ Error with Verify services:', error);
    }

  } catch (error) {
    console.error('❌ Error initializing Twilio client:', error);
  }
}

async function testVerificationFlow(twilioClient: any, serviceSid: string) {
  console.log('\n🚀 Testing Verification Flow');
  console.log('-----------------------------');

  try {
    // Step 1: Start verification
    console.log('\n📱 Step 1: Starting verification...');
    const verification = await twilioClient.verify.services(serviceSid)
      .verifications
      .create({
        to: TEST_PHONE,
        channel: 'sms'
      });

    console.log('✅ Verification started successfully!');
    console.log(`   Status: ${verification.status}`);
    console.log(`   To: ${verification.to}`);
    console.log(`   Channel: ${verification.channel}`);
    console.log(`   Service SID: ${verification.serviceSid}`);

    // Wait a moment for the SMS to be sent
    console.log('\n⏳ Waiting 10 seconds for SMS delivery...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Step 2: Check verification status
    console.log('\n📊 Step 2: Checking verification status...');
    try {
      const verificationCheck = await twilioClient.verify.services(serviceSid)
        .verifications(TEST_PHONE)
        .fetch();

      console.log('📋 Verification Status:');
      console.log(`   Status: ${verificationCheck.status}`);
      console.log(`   To: ${verificationCheck.to}`);
      console.log(`   Channel: ${verificationCheck.channel}`);
      console.log(`   Valid: ${verificationCheck.valid}`);
      console.log(`   Date Created: ${verificationCheck.dateCreated}`);
      console.log(`   Date Updated: ${verificationCheck.dateUpdated}`);

      if (verificationCheck.status === 'pending') {
        console.log('   ⏳ SMS is still being delivered...');
      } else if (verificationCheck.status === 'approved') {
        console.log('   🎉 Verification was successful!');
      } else if (verificationCheck.status === 'canceled') {
        console.log('   ❌ Verification was canceled');
      } else {
        console.log(`   📋 Status: ${verificationCheck.status}`);
      }
    } catch (statusError) {
      console.error('❌ Error checking verification status:', statusError);
    }

    // Step 3: Test verification check (with a dummy code)
    console.log('\n🔐 Step 3: Testing verification check...');
    console.log('   Note: This will fail with a dummy code, but tests the API');
    
    try {
      const verificationCheck = await twilioClient.verify.services(serviceSid)
        .verificationChecks
        .create({
          to: TEST_PHONE,
          code: '123456' // Dummy code
        });

      console.log('📋 Verification Check Result:');
      console.log(`   Status: ${verificationCheck.status}`);
      console.log(`   Valid: ${verificationCheck.valid}`);
      console.log(`   To: ${verificationCheck.to}`);
      console.log(`   Date Created: ${verificationCheck.dateCreated}`);

      if (verificationCheck.status === 'approved') {
        console.log('   🎉 Code verification successful!');
      } else {
        console.log('   ❌ Code verification failed (expected with dummy code)');
      }
    } catch (checkError) {
      console.error('❌ Error during verification check:', checkError);
    }

    // Step 4: Get recent verification attempts
    console.log('\n📈 Step 4: Recent verification attempts...');
    try {
      const attempts = await twilioClient.verify.services(serviceSid)
        .verificationAttempts
        .list({ limit: 5 });

      console.log(`   Found ${attempts.length} recent attempts:`);
      attempts.forEach((attempt: any, index: number) => {
        console.log(`   ${index + 1}. To: ${attempt.to}, Status: ${attempt.conversionStatus}, Channel: ${attempt.channel}`);
      });
    } catch (attemptsError) {
      console.error('❌ Error fetching verification attempts:', attemptsError);
    }

  } catch (error) {
    console.error('❌ Error in verification flow:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not verified')) {
        console.error('\n💡 Solution: The phone number needs to be verified in your Twilio account');
        console.error('   Go to: Phone Numbers → Manage → Verified Caller IDs');
      } else if (error.message.includes('Invalid phone number')) {
        console.error('\n💡 Solution: Check the phone number format');
        console.error('   Use international format: +1234567890');
      }
    }
  }
}

// Run the test
testTwilioVerifyAPI().catch(console.error);
