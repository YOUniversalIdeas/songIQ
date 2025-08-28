// Debug script to test Last.fm service
import { getTopTracks, getTopTags, getCurrentTrends } from './src/services/lastfmService.js';

async function debugLastfmService() {
  console.log('🔍 Debugging Last.fm Service...\n');
  
  try {
    console.log('📊 Testing getTopTracks...');
    const tracks = await getTopTracks(5);
    console.log('Tracks result:', tracks);
    console.log('Tracks length:', tracks.length);
    
    console.log('\n🏷️  Testing getTopTags...');
    const tags = await getTopTags(10);
    console.log('Tags result:', tags);
    console.log('Tags length:', tags.length);
    
    console.log('\n🌍 Testing getCurrentTrends...');
    const trends = await getCurrentTrends();
    console.log('Trends result:', trends);
    console.log('Trending genres length:', trends.trendingGenres?.length || 0);
    console.log('Top tracks length:', trends.topTracks?.length || 0);
    console.log('Top tags length:', trends.topTags?.length || 0);
    
  } catch (error) {
    console.error('❌ Error in Last.fm service:', error);
  }
}

debugLastfmService();
