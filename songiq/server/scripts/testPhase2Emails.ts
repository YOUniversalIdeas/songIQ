import dotenv from 'dotenv';
import { 
  sendSubscriptionUpgradeEmail,
  sendSubscriptionDowngradeEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendAnalysisCompleteEmail,
  sendAnalysisFailedEmail
} from '../src/services/emailService';
import { emailQueue } from '../src/services/emailQueue';

// Load environment variables
dotenv.config();

const testEmail = process.env.TEST_EMAIL || 'test@example.com';

async function testPhase2Emails() {
  console.log('🧪 Testing songIQ Email System - Phase 2...\n');

  try {
    // Test 1: Queue Status
    console.log('📧 Test 1: Email Queue Status');
    const queueStatus = emailQueue.getStatus();
    console.log(`Queue length: ${queueStatus.queueLength}`);
    console.log(`Processing: ${queueStatus.processing}\n`);

    // Test 2: Subscription Upgrade Email
    console.log('📧 Test 2: Subscription Upgrade Email');
    const upgradeResult = await sendSubscriptionUpgradeEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      newPlan: 'Pro',
      amount: '29.99',
      nextBillingDate: '2024-02-15',
      invoiceUrl: 'http://localhost:3000/invoice/123',
      features: [
        'Unlimited song analyses',
        'Advanced AI insights',
        'Market trend analysis',
        'Priority support',
        'Custom reports'
      ]
    });
    console.log(`Subscription upgrade email result: ${upgradeResult}\n`);

    // Test 3: Subscription Downgrade Email
    console.log('📧 Test 3: Subscription Downgrade Email');
    const downgradeResult = await sendSubscriptionDowngradeEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      oldPlan: 'Pro',
      newPlan: 'Basic',
      effectiveDate: '2024-02-15',
      newAmount: '9.99',
      features: [
        'Up to 50 song analyses',
        'Basic AI insights',
        'Standard reports',
        'Email support'
      ]
    });
    console.log(`Subscription downgrade email result: ${downgradeResult}\n`);

    // Test 4: Payment Success Email
    console.log('📧 Test 4: Payment Success Email');
    const paymentSuccessResult = await sendPaymentSuccessEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      amount: '29.99',
      paymentDate: '2024-01-15',
      transactionId: 'txn_123456789',
      plan: 'Pro',
      invoiceUrl: 'http://localhost:3000/invoice/123'
    });
    console.log(`Payment success email result: ${paymentSuccessResult}\n`);

    // Test 5: Payment Failed Email
    console.log('📧 Test 5: Payment Failed Email');
    const paymentFailedResult = await sendPaymentFailedEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      amount: '29.99',
      paymentDate: '2024-01-15',
      plan: 'Pro',
      failureReason: 'Insufficient funds'
    });
    console.log(`Payment failed email result: ${paymentFailedResult}\n`);

    // Test 6: Analysis Complete Email
    console.log('📧 Test 6: Analysis Complete Email');
    const analysisCompleteResult = await sendAnalysisCompleteEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      songTitle: 'Midnight Dreams',
      artistName: 'Test Artist',
      duration: '3:45',
      analysisType: 'Comprehensive Analysis',
      analysisUrl: 'http://localhost:3000/analysis/123'
    });
    console.log(`Analysis complete email result: ${analysisCompleteResult}\n`);

    // Test 7: Analysis Failed Email
    console.log('📧 Test 7: Analysis Failed Email');
    const analysisFailedResult = await sendAnalysisFailedEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3000',
      email: testEmail,
      songTitle: 'Midnight Dreams',
      artistName: 'Test Artist',
      uploadDate: '2024-01-15',
      errorMessage: 'Audio file format not supported'
    });
    console.log(`Analysis failed email result: ${analysisFailedResult}\n`);

    // Test 8: Final Queue Status
    console.log('📧 Test 8: Final Queue Status');
    const finalQueueStatus = emailQueue.getStatus();
    console.log(`Final queue length: ${finalQueueStatus.queueLength}`);
    console.log(`Still processing: ${finalQueueStatus.processing}\n`);

    console.log('✅ Phase 2 email system test completed!');
    console.log('📧 Check your email inbox for test emails.');
    console.log('⚠️  Note: Emails are queued and sent in the background.');
    console.log('🎯 Phase 2 includes: Subscription, Billing, and Analysis emails.');

  } catch (error) {
    console.error('❌ Phase 2 email system test failed:', error);
  }
}

// Run the test
testPhase2Emails();
