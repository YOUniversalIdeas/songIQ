import dotenv from 'dotenv';
import { sendSMSVerification } from '../src/services/smsService';

// Load environment variables
dotenv.config();

const TEST_PHONE = process.env.TEST_PHONE || '+12149576425'; // Allow override via environment variable

async function testAWSSNS() {
  console.log('🧪 Testing AWS SNS SMS Verification System');
  console.log('==========================================\n');

  // Validate environment variables
  const requiredVars = {
    'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
    'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
    'AWS_REGION': process.env.AWS_REGION || 'us-east-1'
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing AWS environment variables:');
    missingVars.forEach(key => console.error(`   ${key}: ❌ Missing`));
    console.error('\n💡 To set up AWS SNS:');
    console.error('   1. Create an AWS account at https://aws.amazon.com/');
    console.error('   2. Create an IAM user with SNS permissions');
    console.error('   3. Get Access Key ID and Secret Access Key');
    console.error('   4. Add to your .env file:');
    console.error('      AWS_ACCESS_KEY_ID=your_access_key_here');
    console.error('      AWS_SECRET_ACCESS_KEY=your_secret_key_here');
    console.error('      AWS_REGION=us-east-1');
    return;
  }

  console.log('✅ AWS environment variables loaded successfully');
  console.log(`   Region: ${requiredVars.AWS_REGION}`);
  console.log(`   Access Key: ${requiredVars.AWS_ACCESS_KEY_ID?.substring(0, 10)}...`);
  console.log(`   To: ${TEST_PHONE}\n`);

  try {
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔐 Generated verification code: ${verificationCode}`);

    // Send SMS via AWS SNS
    console.log('\n📱 Sending SMS via AWS SNS...');
    const result = await sendSMSVerification(TEST_PHONE, verificationCode, 'Test User');

    if (result.success) {
      console.log('✅ SMS sent successfully via AWS SNS!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${TEST_PHONE}`);
      console.log(`   Code: ${verificationCode}`);
      
      console.log('\n🎉 AWS SNS SMS verification is working!');
      console.log('   You can now use this service instead of Twilio.');
    } else {
      console.error('❌ SMS failed to send via AWS SNS');
      console.error(`   Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Error testing AWS SNS SMS:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('AccessDenied')) {
        console.error('\n💡 Solution: Your AWS credentials don\'t have SNS permissions.');
        console.error('   Add the following policy to your IAM user:');
        console.error('   - sns:Publish');
        console.error('   - sns:GetSMSAttributes');
        console.error('   - sns:SetSMSAttributes');
      } else if (error.message.includes('InvalidParameter')) {
        console.error('\n💡 Solution: Check your phone number format and AWS region.');
      } else if (error.message.includes('OptOut')) {
        console.error('\n💡 Solution: This phone number has opted out of SMS.');
      }
    }
  }
}

// Run the test
testAWSSNS().catch(console.error);
