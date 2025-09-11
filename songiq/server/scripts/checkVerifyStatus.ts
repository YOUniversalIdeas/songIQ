import dotenv from 'dotenv';
import twilio from 'twilio';

// Load environment variables
dotenv.config();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TEST_PHONE = process.env.TEST_PHONE || '+12149576425';
const SERVICE_SID = 'VAecfb41878223f649b7548b72886f006a'; // From the previous test

async function checkVerifyStatus() {
  console.log('🔍 Checking Twilio Verify Status');
  console.log('=================================\n');

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio environment variables');
    return;
  }

  try {
    const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    
    // Check verification status
    console.log(`📱 Checking verification status for ${TEST_PHONE}...`);
    const verification = await twilioClient.verify.v2.services(SERVICE_SID)
      .verifications(TEST_PHONE)
      .fetch();

    console.log('📋 Current Verification Status:');
    console.log(`   Status: ${verification.status}`);
    console.log(`   To: ${verification.to}`);
    console.log(`   Channel: ${verification.channel}`);
    console.log(`   Valid: ${verification.valid}`);
    console.log(`   Date Created: ${verification.dateCreated}`);
    console.log(`   Date Updated: ${verification.dateUpdated}`);

    if (verification.status === 'pending') {
      console.log('   ⏳ SMS is still being delivered...');
    } else if (verification.status === 'approved') {
      console.log('   🎉 Verification was successful!');
    } else if (verification.status === 'canceled') {
      console.log('   ❌ Verification was canceled');
    } else {
      console.log(`   📋 Status: ${verification.status}`);
    }

    // Check recent verification attempts
    console.log('\n📈 Recent verification attempts:');
    try {
      const attempts = await twilioClient.verify.v2.verificationAttempts
        .list({ limit: 3 });

      console.log(`   Found ${attempts.length} recent attempts:`);
      attempts.forEach((attempt: any, index: number) => {
        console.log(`   ${index + 1}. To: ${attempt.to}, Status: ${attempt.conversionStatus}, Channel: ${attempt.channel}, Date: ${attempt.dateCreated}`);
      });
    } catch (attemptsError) {
      console.error('❌ Error fetching verification attempts:', attemptsError);
    }

  } catch (error) {
    console.error('❌ Error checking verification status:', error);
  }
}

// Run the check
checkVerifyStatus().catch(console.error);
