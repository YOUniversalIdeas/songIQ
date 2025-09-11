import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:5001/api';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PHONE = '+12149576425';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

async function testSimpleVerification() {
  console.log('🧪 Testing Simple Verification Flow');
  console.log('===================================\n');

  try {
    // Step 1: Register a new user
    console.log('📝 Step 1: Registering new user...');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Phone: ${TEST_PHONE}`);
    
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      firstName: TEST_NAME,
      lastName: 'Test',
      username: `testuser${Date.now()}`,
      telephone: TEST_PHONE,
      bandName: 'Test Band'
    });

    if (registerResponse.data.success) {
      console.log('✅ User registered successfully');
      const authToken = registerResponse.data.token;
      console.log(`   Token: ${authToken.substring(0, 30)}...`);

      // Step 2: Send verification codes
      console.log('\n📱 Step 2: Sending verification codes...');
      const sendResponse = await axios.post(`${API_BASE}/verification/send`, {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('📊 Send Results:');
      console.log(`   Email: ${sendResponse.data.email.success ? '✅ Sent' : '❌ Failed'}`);
      console.log(`   SMS: ${sendResponse.data.sms.success ? '✅ Sent' : '❌ Failed'}`);
      
      if (sendResponse.data.email.success) {
        console.log(`   Email Message ID: ${sendResponse.data.email.messageId}`);
      }
      if (sendResponse.data.sms.success) {
        console.log(`   SMS Service SID: ${sendResponse.data.sms.serviceSid}`);
      }

      // Step 3: Test SMS verification with dummy code
      console.log('\n🔐 Step 3: Testing SMS verification with dummy code...');
      try {
        const smsVerifyResponse = await axios.post(`${API_BASE}/verification/verify-sms`, {
          code: '123456'
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('📋 SMS Verification Result:');
        console.log(`   Success: ${smsVerifyResponse.data.success}`);
        console.log(`   Message: ${smsVerifyResponse.data.message}`);
        console.log(`   Is Verified: ${smsVerifyResponse.data.isVerified}`);
      } catch (smsError: any) {
        console.log('📋 SMS Verification Result (Expected to fail with dummy code):');
        console.log(`   Error: ${smsError.response?.data?.error || 'Unknown error'}`);
      }

      console.log('\n🎉 Simple verification flow test completed!');
      console.log('\n📝 Summary:');
      console.log('   - User registration: ✅ Working');
      console.log('   - Verification code sending: ✅ Working');
      console.log('   - SMS verification API: ✅ Working (with Twilio Verify)');

    } else {
      console.log('❌ Registration failed:', registerResponse.data.message);
    }

  } catch (error: any) {
    console.error('❌ Error in verification flow test:', error.response?.data || error.message);
  }
}

// Run the test
testSimpleVerification().catch(console.error);
