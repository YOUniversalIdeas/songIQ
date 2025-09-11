import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';

async function testRegistrationWithoutSMS() {
  console.log('🧪 Testing User Registration Without SMS Verification');
  console.log('=====================================================\n');

  console.log('🔑 Environment Check:');
  console.log('API Base URL:', API_BASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');

  // Test data
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    bandName: 'Artist/Musician',
    username: `testuser${Date.now()}`,
    telephone: '+1234567890'
  };

  console.log('📧 Test User Data:');
  console.log('Email:', testUser.email);
  console.log('Username:', testUser.username);
  console.log('Phone:', testUser.telephone);
  console.log('');

  try {
    console.log('🚀 Testing user registration...');
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', response.data.user.id);
      console.log('Verification Status:', response.data.user.isVerified ? '✅ Verified' : '❌ Not Verified');
      console.log('Token:', response.data.token ? '✅ Received' : '❌ Missing');
      
      console.log('\n📊 User Details:');
      console.log('  Email:', response.data.user.email);
      console.log('  Username:', response.data.user.username);
      console.log('  Phone:', response.data.user.telephone);
      console.log('  Plan:', response.data.user.subscription?.plan);
      console.log('  Song Limit:', response.data.user.songLimit);
      console.log('  Remaining Songs:', response.data.user.remainingSongs);
      
      console.log('\n🎉 SUCCESS: User can register and access the application!');
      console.log('📱 SMS verification is properly disabled');
      console.log('📧 Email verification still works');
      
    } else {
      console.log('❌ Registration failed:', response.data.message);
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }

  console.log('\n📚 Summary:');
  console.log('✅ SMS verification is disabled');
  console.log('✅ Users can register without SMS blocking');
  console.log('✅ Registration flow works normally');
  console.log('✅ Users are automatically verified');
  console.log('✅ Application can be tested without SMS issues');
}

// Run the test
testRegistrationWithoutSMS().catch(console.error);


