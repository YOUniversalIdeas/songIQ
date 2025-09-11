import dotenv from 'dotenv';
import { 
  sendWelcomeSeriesDay1Email,
  sendWelcomeSeriesDay3Email,
  sendWelcomeSeriesDay7Email,
  sendFeatureAnnouncementEmail,
  sendUsageTipsEmail,
  sendReEngagementEmail
} from '../src/services/emailService';
import { emailQueue } from '../src/services/emailQueue';

// Load environment variables
dotenv.config();

const testEmail = process.env.TEST_EMAIL || 'test@example.com';

async function testPhase3Emails() {
  console.log('🧪 Testing songIQ Email System - Phase 3...\n');

  try {
    // Test 1: Queue Status
    console.log('📧 Test 1: Email Queue Status');
    const queueStatus = emailQueue.getStatus();
    console.log(`Queue length: ${queueStatus.queueLength}`);
    console.log(`Processing: ${queueStatus.processing}\n`);

    // Test 2: Welcome Series - Day 1
    console.log('📧 Test 2: Welcome Series - Day 1');
    const welcomeDay1Result = await sendWelcomeSeriesDay1Email({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail
    });
    console.log(`Welcome Day 1 email result: ${welcomeDay1Result}\n`);

    // Test 3: Welcome Series - Day 3
    console.log('📧 Test 3: Welcome Series - Day 3');
    const welcomeDay3Result = await sendWelcomeSeriesDay3Email({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail
    });
    console.log(`Welcome Day 3 email result: ${welcomeDay3Result}\n`);

    // Test 4: Welcome Series - Day 7
    console.log('📧 Test 4: Welcome Series - Day 7');
    const welcomeDay7Result = await sendWelcomeSeriesDay7Email({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail
    });
    console.log(`Welcome Day 7 email result: ${welcomeDay7Result}\n`);

    // Test 5: Feature Announcement
    console.log('📧 Test 5: Feature Announcement');
    const featureAnnouncementResult = await sendFeatureAnnouncementEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail,
      featureName: 'AI Genre Fusion',
      featureDescription: 'Our new AI-powered feature that analyzes how well your song blends different genres and suggests optimal genre combinations for maximum market appeal.',
      featureUrl: 'http://localhost:3001/features/ai-genre-fusion',
      featureBenefits: [
        'Identify genre crossover potential',
        'Optimize genre blending for target audiences',
        'Get genre-specific market insights',
        'Compare your sound to genre leaders'
      ]
    });
    console.log(`Feature announcement email result: ${featureAnnouncementResult}\n`);

    // Test 6: Usage Tips
    console.log('📧 Test 6: Usage Tips');
    const usageTipsResult = await sendUsageTipsEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail,
      tipCategory: 'Advanced Analysis',
      tips: [
        'Use comparative analysis to benchmark against hit songs',
        'Export your analysis reports for team collaboration',
        'Set up automated analysis for new uploads',
        'Leverage market insights for release timing'
      ],
      tipsUrl: 'http://localhost:3001/resources/advanced-analysis',
      proTipTitle: 'Batch Analysis Strategy',
      proTipDescription: 'Upload multiple songs at once to identify patterns across your catalog. This helps you understand your unique sound signature and areas for improvement.'
    });
    console.log(`Usage tips email result: ${usageTipsResult}\n`);

    // Test 7: Re-engagement Campaign
    console.log('📧 Test 7: Re-engagement Campaign');
    const reEngagementResult = await sendReEngagementEmail({
      userName: 'Test User',
      baseUrl: 'http://localhost:3001',
      email: testEmail
    });
    console.log(`Re-engagement email result: ${reEngagementResult}\n`);

    // Test 8: Final Queue Status
    console.log('📧 Test 8: Final Queue Status');
    const finalQueueStatus = emailQueue.getStatus();
    console.log(`Final queue length: ${finalQueueStatus.queueLength}`);
    console.log(`Still processing: ${finalQueueStatus.processing}\n`);

    console.log('✅ Phase 3 email system test completed!');
    console.log('📧 Check your email inbox for test emails.');
    console.log('⚠️  Note: Emails are queued and sent in the background.');
    console.log('🎯 Phase 3 includes: Welcome Series, Feature Announcements, Usage Tips, and Re-engagement campaigns.');
    console.log('🎉 All 3 phases of the songIQ email system are now complete!');

  } catch (error) {
    console.error('❌ Phase 3 email system test failed:', error);
  }
}

// Run the test
testPhase3Emails();
