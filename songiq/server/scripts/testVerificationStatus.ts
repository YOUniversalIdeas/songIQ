import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE = 'http://localhost:5001/api';
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PHONE = '+12149576425';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

async function testVerificationStatus() {
  console.log('🧪 Testing Verification Status Logic');
  console.log('====================================\n');

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
      const userId = registerResponse.data.user.id;
      console.log(`   User ID: ${userId}`);
      console.log(`   Token: ${authToken.substring(0, 30)}...`);

      // Step 2: Check verification status immediately after registration
      console.log('\n📊 Step 2: Checking verification status after registration...');
      const statusResponse = await axios.get(`${API_BASE}/verification/status`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      console.log('📋 Verification Status:');
      console.log(`   Overall Verified: ${statusResponse.data.isVerified}`);
      console.log(`   Email Verified: ${statusResponse.data.emailVerified}`);
      console.log(`   SMS Verified: ${statusResponse.data.smsVerified}`);
      console.log(`   Has Email Verification: ${statusResponse.data.hasEmailVerification}`);
      console.log(`   Has SMS Verification: ${statusResponse.data.hasSMSVerification}`);

      // Expected results:
      console.log('\n🎯 Expected Results:');
      console.log('   Overall Verified: false (should be false until both are verified)');
      console.log('   Email Verified: false (should be false until code is entered)');
      console.log('   SMS Verified: false (should be false until code is entered)');
      console.log('   Has Email Verification: true (should have email token)');
      console.log('   Has SMS Verification: true (should have SMS initiated)');

      // Check if results match expectations
      const isCorrect = 
        !statusResponse.data.isVerified &&
        !statusResponse.data.emailVerified &&
        !statusResponse.data.smsVerified &&
        statusResponse.data.hasEmailVerification &&
        statusResponse.data.hasSMSVerification;

      if (isCorrect) {
        console.log('\n✅ Verification status logic is working correctly!');
      } else {
        console.log('\n❌ Verification status logic has issues:');
        if (statusResponse.data.isVerified) {
          console.log('   - User should not be verified until both email and SMS are verified');
        }
        if (statusResponse.data.emailVerified) {
          console.log('   - Email should not be verified until code is entered');
        }
        if (statusResponse.data.smsVerified) {
          console.log('   - SMS should not be verified until code is entered');
        }
        if (!statusResponse.data.hasEmailVerification) {
          console.log('   - Should have email verification token');
        }
        if (!statusResponse.data.hasSMSVerification) {
          console.log('   - Should have SMS verification initiated');
        }
      }

    } else {
      console.log('❌ Registration failed:', registerResponse.data.message);
    }

  } catch (error: any) {
    console.error('❌ Error in verification status test:', error.response?.data || error.message);
  }
}

// Run the test
testVerificationStatus().catch(console.error);
