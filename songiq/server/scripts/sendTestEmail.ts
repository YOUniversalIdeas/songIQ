import dotenv from 'dotenv';
import { sendVerificationEmail } from '../src/services/emailService';

// Load environment variables
dotenv.config();

async function sendTestEmail() {
  console.log('📧 Sending test email to allangrestrepo@gmail.com...\n');

  try {
    const result = await sendVerificationEmail(
      'allangrestrepo@gmail.com',
      'Allan',
      'test_token_123'
    );

    console.log(`Email result: ${result}`);
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check your Gmail inbox (and spam folder)');
    } else {
      console.log('❌ Email failed to send');
    }

  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

// Run the test
sendTestEmail();
