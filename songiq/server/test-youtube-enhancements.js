#!/usr/bin/env node

/**
 * Test Script for YouTube Music Phase 1 Enhancements
 * 
 * This script demonstrates the new features:
 * 1. AI Genre Classification
 * 2. Enhanced Recommendations
 * 3. Trend Prediction
 */

const youtubeMusicService = require('./dist/services/youtubeMusicService').default;

async function testPhase1Enhancements() {
  console.log('🎵 Testing YouTube Music Phase 1 Enhancements\n');
  
  try {
    // Test 1: Search with Genre Classification
    console.log('🔍 Test 1: Search with AI Genre Classification');
    console.log('=' .repeat(50));
    
    const searchResults = await youtubeMusicService.searchTracks('pop music', 3, 0);
    console.log(`Found ${searchResults.tracks.length} tracks`);
    
    searchResults.tracks.forEach((track, index) => {
      console.log(`\n${index + 1}. ${track.title}`);
      console.log(`   Artist: ${track.artist}`);
      console.log(`   Genre: ${track.genre} (Confidence: ${Math.round(track.confidence * 100)}%)`);
      console.log(`   Views: ${track.views.toLocaleString()}`);
      console.log(`   Engagement: ${track.likes + track.comments} interactions`);
    });
    
    // Test 2: Detailed Analysis with All Enhancements
    if (searchResults.tracks.length > 0) {
      console.log('\n\n🔬 Test 2: Detailed Analysis with Phase 1 Features');
      console.log('=' .repeat(50));
      
      const firstTrack = searchResults.tracks[0];
      const analysis = await youtubeMusicService.analyzeTrack(firstTrack.id);
      
      if (analysis) {
        console.log(`\n📊 Analysis for: ${analysis.track.title}`);
        console.log(`🎭 Detected Genre: ${analysis.track.genre} (${Math.round(analysis.track.confidence * 100)}% confidence)`);
        
        // Performance Metrics
        console.log('\n📈 Enhanced Performance Metrics:');
        console.log(`   View Velocity: ${analysis.performanceMetrics.viewVelocity} views/day`);
        console.log(`   Engagement Rate: ${analysis.performanceMetrics.engagementRate}%`);
        console.log(`   Trend Score: ${analysis.performanceMetrics.trendScore}/100`);
        console.log(`   Growth Potential: ${analysis.performanceMetrics.growthPotential}/100`);
        
        // Trend Prediction
        console.log('\n🔮 Trend Prediction:');
        console.log(`   Next Week Views: ${analysis.trendPrediction.nextWeekViews.toLocaleString()}`);
        console.log(`   Next Month Views: ${analysis.trendPrediction.nextMonthViews.toLocaleString()}`);
        console.log(`   Viral Probability: ${Math.round(analysis.trendPrediction.viralProbability * 100)}%`);
        console.log(`   Peak Timing: ${analysis.trendPrediction.peakTiming}`);
        console.log(`   Decline Rate: ${analysis.trendPrediction.declineRate}%`);
        
        // Content Analysis
        console.log('\n📝 Enhanced Content Analysis:');
        console.log(`   SEO Score: ${analysis.contentAnalysis.seoScore}/100`);
        console.log(`   Genre Alignment: ${analysis.contentAnalysis.genreAlignment}/100`);
        console.log(`   Title Optimization: ${analysis.contentAnalysis.titleOptimization}/100`);
        console.log(`   Tag Relevance: ${analysis.contentAnalysis.tagRelevance}/100`);
        
        // Market Data
        console.log('\n📊 Enhanced Market Data:');
        console.log(`   Market Trend: ${analysis.marketData.marketTrend}`);
        console.log(`   Seasonality Score: ${analysis.marketData.seasonalityScore}/100`);
        console.log(`   Competitive Position: ${analysis.marketData.competitivePosition}/100`);
        
        // Enhanced Recommendations
        console.log('\n💡 Enhanced Recommendations:');
        
        if (analysis.recommendations.genreStrategy.length > 0) {
          console.log('   🎯 Genre Strategy:');
          analysis.recommendations.genreStrategy.forEach(tip => {
            console.log(`      • ${tip}`);
          });
        }
        
        if (analysis.recommendations.trendOptimization.length > 0) {
          console.log('   📈 Trend Optimization:');
          analysis.recommendations.trendOptimization.forEach(tip => {
            console.log(`      • ${tip}`);
          });
        }
        
        if (analysis.recommendations.contentOptimization.length > 0) {
          console.log('   ✨ Content Optimization:');
          analysis.recommendations.contentOptimization.forEach(tip => {
            console.log(`      • ${tip}`);
          });
        }
        
        // Audience Insights with Genre Affinity
        console.log('\n👥 Enhanced Audience Insights:');
        console.log('   📍 Geographic Distribution:');
        Object.entries(analysis.audienceInsights.geographicDistribution).forEach(([country, percentage]) => {
          console.log(`      ${country}: ${percentage}%`);
        });
        
        if (analysis.audienceInsights.genreAffinity) {
          console.log('   🎭 Genre-Based Age Preferences:');
          Object.entries(analysis.audienceInsights.genreAffinity).forEach(([ageGroup, percentage]) => {
            console.log(`      ${ageGroup}: ${percentage}%`);
          });
        }
      }
    }
    
    // Test 3: Similar Tracks with Genre Classification
    if (searchResults.tracks.length > 0) {
      console.log('\n\n🔄 Test 3: Similar Tracks with Genre Classification');
      console.log('=' .repeat(50));
      
      const firstTrack = searchResults.tracks[0];
      const similarTracks = await youtubeMusicService.getSimilarTracks(firstTrack.id, 3);
      
      console.log(`\nSimilar tracks to "${firstTrack.title}":`);
      similarTracks.forEach((track, index) => {
        console.log(`\n${index + 1}. ${track.title}`);
        console.log(`   Artist: ${track.artist}`);
        console.log(`   Genre: ${track.genre} (Confidence: ${Math.round(track.confidence * 100)}%)`);
        console.log(`   Views: ${track.views.toLocaleString()}`);
      });
    }
    
    console.log('\n\n✅ All Phase 1 enhancements tested successfully!');
    console.log('\n🎯 What you just saw:');
    console.log('   • AI-powered genre classification with confidence scores');
    console.log('   • Trend prediction algorithms for future performance');
    console.log('   • Enhanced recommendations based on genre and trends');
    console.log('   • SEO scoring and content optimization tips');
    console.log('   • Genre-specific audience insights and strategies');
    console.log('   • Market trend analysis and seasonality scoring');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('   1. Set YOUTUBE_API_KEY in your environment');
    console.log('   2. Built the project with: npm run build');
    console.log('   3. Have internet connection for YouTube API calls');
  }
}

// Run the test
testPhase1Enhancements();
