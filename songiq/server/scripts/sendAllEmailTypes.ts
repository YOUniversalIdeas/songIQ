import dotenv from 'dotenv';
import { 
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendSubscriptionUpgradeEmail,
  sendSubscriptionDowngradeEmail,
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendAnalysisCompleteEmail,
  sendAnalysisFailedEmail,
  sendWelcomeSeriesDay1Email,
  sendFeatureAnnouncementEmail,
  sendUsageTipsEmail,
  sendReEngagementEmail
} from '../src/services/emailService';

// Load environment variables
dotenv.config();

const testEmail = 'allangrestrepo@gmail.com';
const testUserName = 'Allan';
const baseUrl = 'http://localhost:3000';

async function sendAllEmailTypes() {
  console.log('🎵 Sending examples of ALL email types to allangrestrepo@gmail.com...\n');

  const results: { [key: string]: boolean } = {};

  try {
    // Phase 1: Core Security & User Experience
    console.log('📧 Phase 1: Core Security & User Experience');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('1. Sending Verification Email...');
    results.verification = await sendVerificationEmail(testEmail, testUserName, 'test_verification_token_123');
    console.log(`   ✅ Verification: ${results.verification ? 'Sent' : 'Failed'}`);
    
    console.log('2. Sending Welcome Email...');
    results.welcome = await sendWelcomeEmail(testEmail, testUserName);
    console.log(`   ✅ Welcome: ${results.welcome ? 'Sent' : 'Failed'}`);
    
    console.log('3. Sending Password Reset Email...');
    results.passwordReset = await sendPasswordResetEmail(testEmail, testUserName, 'test_reset_token_456');
    console.log(`   ✅ Password Reset: ${results.passwordReset ? 'Sent' : 'Failed'}`);
    
    console.log('4. Sending Password Reset Confirmation...');
    results.passwordResetConfirm = await sendPasswordResetConfirmationEmail(testEmail, testUserName);
    console.log(`   ✅ Password Reset Confirm: ${results.passwordResetConfirm ? 'Sent' : 'Failed'}`);
    
    console.log('\n📧 Phase 2: Business-Critical Emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('5. Sending Subscription Upgrade Email...');
    results.subscriptionUpgrade = await sendSubscriptionUpgradeEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      newPlan: 'Pro',
      oldPlan: 'Basic',
      amount: '29.99',
      nextBillingDate: '2024-01-15',
      features: ['Advanced Analytics', 'Unlimited Songs', 'Priority Support']
    });
    console.log(`   ✅ Subscription Upgrade: ${results.subscriptionUpgrade ? 'Sent' : 'Failed'}`);
    
    console.log('6. Sending Payment Success Email...');
    results.paymentSuccess = await sendPaymentSuccessEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      plan: 'Pro',
      amount: '29.99',
      paymentDate: '2024-01-01',
      transactionId: 'TXN_123456789',
      nextBillingDate: '2024-02-01'
    });
    console.log(`   ✅ Payment Success: ${results.paymentSuccess ? 'Sent' : 'Failed'}`);
    
    console.log('7. Sending Analysis Complete Email...');
    results.analysisComplete = await sendAnalysisCompleteEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      songTitle: 'Midnight Dreams',
      artistName: 'Allan Restrepo',
      duration: '3:45',
      analysisType: 'Comprehensive',
      analysisUrl: 'http://localhost:3000/analysis/123',
      uploadDate: '2024-01-01'
    });
    console.log(`   ✅ Analysis Complete: ${results.analysisComplete ? 'Sent' : 'Failed'}`);
    
    console.log('\n📧 Phase 3: Engagement & Marketing Emails');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('8. Sending Welcome Series Day 1...');
    results.welcomeDay1 = await sendWelcomeSeriesDay1Email({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl
    });
    console.log(`   ✅ Welcome Day 1: ${results.welcomeDay1 ? 'Sent' : 'Failed'}`);
    
    console.log('9. Sending Feature Announcement...');
    results.featureAnnouncement = await sendFeatureAnnouncementEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      featureName: 'AI-Powered Song Recommendations',
      featureDescription: 'Get personalized song suggestions based on your musical taste and analysis results',
      featureUrl: 'http://localhost:3000/features/recommendations',
      featureBenefits: ['Discover new music', 'Improve your sound', 'Stay ahead of trends']
    });
    console.log(`   ✅ Feature Announcement: ${results.featureAnnouncement ? 'Sent' : 'Failed'}`);
    
    console.log('10. Sending Usage Tips...');
    results.usageTips = await sendUsageTipsEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      tipCategory: 'Analysis',
      tips: ['Use high-quality audio files for better results', 'Try different analysis types for comprehensive insights', 'Compare multiple songs to identify patterns'],
      tipsUrl: 'http://localhost:3000/tips'
    });
    console.log(`   ✅ Usage Tips: ${results.usageTips ? 'Sent' : 'Failed'}`);
    
    console.log('11. Sending Re-engagement Email...');
    results.reEngagement = await sendReEngagementEmail({
      userName: testUserName,
      email: testEmail,
      baseUrl: baseUrl,
      proTipTitle: 'Pro Tip: Advanced Analysis Features',
      proTipDescription: 'Upgrade to Pro to unlock advanced analysis features like harmonic analysis, tempo mapping, and genre classification.'
    });
    console.log(`   ✅ Re-engagement: ${results.reEngagement ? 'Sent' : 'Failed'}`);

    // Summary
    console.log('\n📊 Email Sending Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const totalEmails = Object.keys(results).length;
    const successfulEmails = Object.values(results).filter(Boolean).length;
    
    console.log(`Total emails sent: ${totalEmails}`);
    console.log(`Successful: ${successfulEmails}`);
    console.log(`Failed: ${totalEmails - successfulEmails}`);
    
    if (successfulEmails === totalEmails) {
      console.log('\n🎉 SUCCESS! All email types sent successfully!');
      console.log('📧 Check your Gmail inbox for all 11 email examples');
      console.log('📱 Each email showcases different templates and content types');
    } else {
      console.log('\n⚠️  Some emails failed to send. Check the logs above.');
    }

  } catch (error) {
    console.error('❌ Error in email test:', error);
  }
}

// Run the comprehensive test
sendAllEmailTypes();
