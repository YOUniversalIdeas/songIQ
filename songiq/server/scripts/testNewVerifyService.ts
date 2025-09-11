import dotenv from 'dotenv';
import { 
  sendVerificationCodes, 
  verifySMSCode, 
  getVerificationStatus 
} from '../src/services/verifyService';

// Load environment variables
dotenv.config();

const TEST_EMAIL = 'test@example.com';
const TEST_PHONE = '+12149576425';
const TEST_NAME = 'Test User';

async function testNewVerifyService() {
  console.log('🧪 Testing New Verify Service (Twilio Verify API)');
  console.log('=================================================\n');

  try {
    // Step 1: Send verification codes
    console.log('📱 Step 1: Sending verification codes...');
    const result = await sendVerificationCodes(TEST_EMAIL, TEST_PHONE, TEST_NAME);
    
    console.log('📊 Results:');
    console.log(`   Email: ${result.email.success ? '✅ Sent' : '❌ Failed'}`);
    if (result.email.success) {
      console.log(`   Email Code: ${result.email.code}`);
      console.log(`   Email Message ID: ${result.email.messageId}`);
    } else {
      console.log(`   Email Error: ${result.email.error}`);
    }
    
    console.log(`   SMS: ${result.sms.success ? '✅ Sent' : '❌ Failed'}`);
    if (result.sms.success) {
      console.log(`   SMS Service SID: ${result.sms.serviceSid}`);
    } else {
      console.log(`   SMS Error: ${result.sms.error}`);
    }

    if (result.sms.success) {
      // Step 2: Check verification status
      console.log('\n📊 Step 2: Checking verification status...');
      const status = await getVerificationStatus(TEST_PHONE);
      console.log(`   Status: ${status.status}`);
      
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }

      // Step 3: Test verification with dummy code
      console.log('\n🔐 Step 3: Testing verification with dummy code...');
      const verifyResult = await verifySMSCode(TEST_PHONE, '123456');
      console.log(`   Verification Result: ${verifyResult.success ? '✅ Success' : '❌ Failed'}`);
      if (!verifyResult.success) {
        console.log(`   Error: ${verifyResult.error}`);
      }

      // Wait and check status again
      console.log('\n⏳ Waiting 30 seconds and checking status again...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      const status2 = await getVerificationStatus(TEST_PHONE);
      console.log(`   Updated Status: ${status2.status}`);
    }

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

// Run the test
testNewVerifyService().catch(console.error);
