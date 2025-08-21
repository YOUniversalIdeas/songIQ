import dotenv from 'dotenv';
import { 
  sendVerificationEmail, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendPasswordResetConfirmationEmail 
} from '../src/services/emailService';
import { emailQueue } from '../src/services/emailQueue';

// Load environment variables
dotenv.config();

const testEmail = process.env.TEST_EMAIL || 'test@example.com';

async function testEmailSystem() {
  console.log('🧪 Testing songIQ Email System...\n');

  try {
    // Test 1: Email Queue Status
    console.log('📧 Test 1: Email Queue Status');
    const queueStatus = emailQueue.getStatus();
    console.log(`Queue length: ${queueStatus.queueLength}`);
    console.log(`Processing: ${queueStatus.processing}\n`);

    // Test 2: Verification Email
    console.log('📧 Test 2: Verification Email');
    const verificationResult = await sendVerificationEmail(
      testEmail,
      'Test User',
      'test_verification_token_123'
    );
    console.log(`Verification email result: ${verificationResult}\n`);

    // Test 3: Welcome Email
    console.log('📧 Test 3: Welcome Email');
    const welcomeResult = await sendWelcomeEmail(
      testEmail,
      'Test User'
    );
    console.log(`Welcome email result: ${welcomeResult}\n`);

    // Test 4: Password Reset Email
    console.log('📧 Test 4: Password Reset Email');
    const resetResult = await sendPasswordResetEmail(
      testEmail,
      'Test User',
      'test_reset_token_123'
    );
    console.log(`Password reset email result: ${resetResult}\n`);

    // Test 5: Password Reset Confirmation Email
    console.log('📧 Test 5: Password Reset Confirmation Email');
    const confirmationResult = await sendPasswordResetConfirmationEmail(
      testEmail,
      'Test User'
    );
    console.log(`Confirmation email result: ${confirmationResult}\n`);

    // Test 6: Final Queue Status
    console.log('📧 Test 6: Final Queue Status');
    const finalQueueStatus = emailQueue.getStatus();
    console.log(`Final queue length: ${finalQueueStatus.queueLength}`);
    console.log(`Still processing: ${finalQueueStatus.processing}\n`);

    console.log('✅ Email system test completed!');
    console.log('📧 Check your email inbox for test emails.');
    console.log('⚠️  Note: Emails are queued and sent in the background.');

  } catch (error) {
    console.error('❌ Email system test failed:', error);
  }
}

// Run the test
testEmailSystem();
