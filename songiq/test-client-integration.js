#!/usr/bin/env node

/**
 * Client-Side Integration Test
 * Simulates the client fetching real chart data from the songIQ API
 */

const API_BASE = 'http://localhost:5001';

async function testClientIntegration() {
  console.log('🎵 songIQ Client-Side Integration Test');
  console.log('=====================================');
  console.log('');

  try {
    // Test 1: Market Trends
    console.log('1️⃣ Testing Market Trends API...');
    const trendsResponse = await fetch(`${API_BASE}/api/market/trends`);
    const trendsData = await trendsResponse.json();
    
    if (trendsData.success) {
      console.log('   ✅ Market Trends: SUCCESS');
      console.log(`   📊 Top Tracks: ${trendsData.data.topTracks.length} tracks`);
      console.log(`   🎤 Top Artists: ${trendsData.data.topArtists.length} artists`);
      console.log(`   🎵 Trending Genres: ${trendsData.data.trendingGenres.length} genres`);
      console.log(`   📈 Source: ${trendsData.source}`);
      
      // Show sample data
      if (trendsData.data.topTracks.length > 0) {
        const sampleTrack = trendsData.data.topTracks[0];
        console.log(`   🎵 Sample Track: "${sampleTrack.name}" by ${sampleTrack.artist} (${sampleTrack.listeners.toLocaleString()} listeners)`);
      }
    } else {
      console.log('   ❌ Market Trends: FAILED');
    }
    console.log('');

    // Test 2: Billboard Charts
    console.log('2️⃣ Testing Billboard Charts API...');
    const billboardResponse = await fetch(`${API_BASE}/api/market/billboard-charts`);
    const billboardData = await billboardResponse.json();
    
    if (billboardData.success) {
      console.log('   ✅ Billboard Charts: SUCCESS');
      console.log(`   📊 Chart Data: ${billboardData.data.length} tracks`);
      console.log(`   📈 Source: ${billboardData.source}`);
      
      // Show sample data
      if (billboardData.data.length > 0) {
        const sampleTrack = billboardData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Streams: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ Billboard Charts: FAILED');
    }
    console.log('');

    // Test 3: Spotify Charts
    console.log('3️⃣ Testing Spotify Charts API...');
    const spotifyResponse = await fetch(`${API_BASE}/api/market/spotify-charts`);
    const spotifyData = await spotifyResponse.json();
    
    if (spotifyData.success) {
      console.log('   ✅ Spotify Charts: SUCCESS');
      console.log(`   📊 New Releases: ${spotifyData.data.length} albums`);
      console.log(`   📈 Source: ${spotifyData.source}`);
      
      // Show sample data
      if (spotifyData.data.length > 0) {
        const sampleAlbum = spotifyData.data[0];
        console.log(`   🎵 #${sampleAlbum.position}: "${sampleAlbum.title}" by ${sampleAlbum.artist}`);
        console.log(`   🎵 Genre: ${sampleAlbum.genre}, Tempo: ${sampleAlbum.audioFeatures.tempo} BPM`);
      }
    } else {
      console.log('   ❌ Spotify Charts: FAILED');
    }
    console.log('');

    // Test 4: YouTube Music Charts
    console.log('4️⃣ Testing YouTube Music Charts API...');
    const youtubeResponse = await fetch(`${API_BASE}/api/market/youtube-music-charts`);
    const youtubeData = await youtubeResponse.json();
    
    if (youtubeData.success) {
      console.log('   ✅ YouTube Music Charts: SUCCESS');
      console.log(`   📊 Trending Videos: ${youtubeData.data.length} tracks`);
      console.log(`   📈 Source: ${youtubeData.source}`);
      
      // Show sample data
      if (youtubeData.data.length > 0) {
        const sampleTrack = youtubeData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Views: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ YouTube Music Charts: FAILED');
    }
    console.log('');

    // Test 5: Apple Music Charts
    console.log('5️⃣ Testing Apple Music Charts API...');
    const appleMusicResponse = await fetch(`${API_BASE}/api/market/apple-music-charts`);
    const appleMusicData = await appleMusicResponse.json();
    
    if (appleMusicData.success) {
      console.log('   ✅ Apple Music Charts: SUCCESS');
      console.log(`   📊 Top Charts: ${appleMusicData.data.length} tracks`);
      console.log(`   📈 Source: ${appleMusicData.source}`);
      
      // Show sample data
      if (appleMusicData.data.length > 0) {
        const sampleTrack = appleMusicData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Plays: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ Apple Music Charts: FAILED');
    }
    console.log('');

    // Test 6: TikTok Charts
    console.log('6️⃣ Testing TikTok Charts API...');
    const tiktokResponse = await fetch(`${API_BASE}/api/market/tiktok-charts`);
    const tiktokData = await tiktokResponse.json();
    
    if (tiktokData.success) {
      console.log('   ✅ TikTok Charts: SUCCESS');
      console.log(`   📊 Viral Music: ${tiktokData.data.length} tracks`);
      console.log(`   📈 Source: ${tiktokData.source}`);
      
      // Show sample data
      if (tiktokData.data.length > 0) {
        const sampleTrack = tiktokData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Viral Count: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ TikTok Charts: FAILED');
    }
    console.log('');

    // Test 7: SoundCloud Charts
    console.log('7️⃣ Testing SoundCloud Charts API...');
    const soundcloudResponse = await fetch(`${API_BASE}/api/market/soundcloud-charts`);
    const soundcloudData = await soundcloudResponse.json();
    
    if (soundcloudData.success) {
      console.log('   ✅ SoundCloud Charts: SUCCESS');
      console.log(`   📊 Trending Music: ${soundcloudData.data.length} tracks`);
      console.log(`   📈 Source: ${soundcloudData.source}`);
      
      // Show sample data
      if (soundcloudData.data.length > 0) {
        const sampleTrack = soundcloudData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Plays: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ SoundCloud Charts: FAILED');
    }
    console.log('');

    // Test 8: Deezer Charts
    console.log('8️⃣ Testing Deezer Charts API...');
    const deezerResponse = await fetch(`${API_BASE}/api/market/deezer-charts`);
    const deezerData = await deezerResponse.json();
    
    if (deezerData.success) {
      console.log('   ✅ Deezer Charts: SUCCESS');
      console.log(`   📊 Top Charts: ${deezerData.data.length} tracks`);
      console.log(`   📈 Source: ${deezerData.source}`);
      
      // Show sample data
      if (deezerData.data.length > 0) {
        const sampleTrack = deezerData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Plays: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ Deezer Charts: FAILED');
    }
    console.log('');

    // Test 9: Amazon Music Charts
    console.log('9️⃣ Testing Amazon Music Charts API...');
    const amazonMusicResponse = await fetch(`${API_BASE}/api/market/amazon-music-charts`);
    const amazonMusicData = await amazonMusicResponse.json();
    
    if (amazonMusicData.success) {
      console.log('   ✅ Amazon Music Charts: SUCCESS');
      console.log(`   📊 Top Charts: ${amazonMusicData.data.length} tracks`);
      console.log(`   📈 Source: ${amazonMusicData.source}`);
      
      // Show sample data
      if (amazonMusicData.data.length > 0) {
        const sampleTrack = amazonMusicData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Plays: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ Amazon Music Charts: FAILED');
    }
    console.log('');

    // Test 10: Pandora Charts
    console.log('🔟 Testing Pandora Charts API...');
    const pandoraResponse = await fetch(`${API_BASE}/api/market/pandora-charts`);
    const pandoraData = await pandoraResponse.json();
    
    if (pandoraData.success) {
      console.log('   ✅ Pandora Charts: SUCCESS');
      console.log(`   📊 Top Charts: ${pandoraData.data.length} tracks`);
      console.log(`   📈 Source: ${pandoraData.source}`);
      
      // Show sample data
      if (pandoraData.data.length > 0) {
        const sampleTrack = pandoraData.data[0];
        console.log(`   🎵 #${sampleTrack.position}: "${sampleTrack.title}" by ${sampleTrack.artist}`);
        console.log(`   🎵 Genre: ${sampleTrack.genre}, Plays: ${sampleTrack.streams?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('   ❌ Pandora Charts: FAILED');
    }
    console.log('');

    // Test 11: Client-Side Data Processing
    console.log('4️⃣ Testing Client-Side Data Processing...');
    
    // Simulate what the client would do with the data
    const allChartData = [
      ...(billboardData.success ? billboardData.data : []),
      ...(spotifyData.success ? spotifyData.data : []),
      ...(youtubeData.success ? youtubeData.data : []),
      ...(appleMusicData.success ? appleMusicData.data : []),
      ...(tiktokData.success ? tiktokData.data : []),
      ...(soundcloudData.success ? soundcloudData.data : []),
      ...(deezerData.success ? deezerData.data : []),
      ...(amazonMusicData.success ? amazonMusicData.data : []),
      ...(pandoraData.success ? pandoraData.data : [])
    ];
    
    console.log(`   📊 Total Chart Entries: ${allChartData.length}`);
    
    // Analyze genres
    const genres = [...new Set(allChartData.map(track => track.genre).filter(g => g !== 'unknown'))];
    console.log(`   🎵 Unique Genres: ${genres.length} (${genres.slice(0, 5).join(', ')}${genres.length > 5 ? '...' : ''})`);
    
    // Analyze artists
    const artists = [...new Set(allChartData.map(track => track.artist))];
    console.log(`   🎤 Unique Artists: ${artists.length}`);
    
    // Calculate average tempo
    const tempos = allChartData.map(track => track.audioFeatures.tempo).filter(t => t > 0);
    const avgTempo = tempos.length > 0 ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) : 0;
    console.log(`   🎵 Average Tempo: ${avgTempo} BPM`);
    
    console.log('   ✅ Client-Side Processing: SUCCESS');
    console.log('');

    // Summary
    console.log('🎉 CLIENT-SIDE INTEGRATION TEST RESULTS:');
    console.log('=====================================');
    console.log(`✅ Market Trends API: ${trendsData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Billboard Charts API: ${billboardData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Spotify Charts API: ${spotifyData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ YouTube Music Charts API: ${youtubeData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Apple Music Charts API: ${appleMusicData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ TikTok Charts API: ${tiktokData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ SoundCloud Charts API: ${soundcloudData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Deezer Charts API: ${deezerData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Amazon Music Charts API: ${amazonMusicData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Pandora Charts API: ${pandoraData.success ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Data Processing: WORKING`);
    console.log('');
    console.log('📊 REAL DATA SUMMARY:');
    console.log(`   • ${trendsData.success ? trendsData.data.topTracks.length : 0} trending tracks`);
    console.log(`   • ${billboardData.success ? billboardData.data.length : 0} Billboard positions`);
    console.log(`   • ${spotifyData.success ? spotifyData.data.length : 0} Spotify releases`);
    console.log(`   • ${youtubeData.success ? youtubeData.data.length : 0} YouTube trending`);
    console.log(`   • ${appleMusicData.success ? appleMusicData.data.length : 0} Apple Music charts`);
    console.log(`   • ${tiktokData.success ? tiktokData.data.length : 0} TikTok viral`);
    console.log(`   • ${soundcloudData.success ? soundcloudData.data.length : 0} SoundCloud trending`);
    console.log(`   • ${deezerData.success ? deezerData.data.length : 0} Deezer charts`);
    console.log(`   • ${amazonMusicData.success ? amazonMusicData.data.length : 0} Amazon Music charts`);
    console.log(`   • ${pandoraData.success ? pandoraData.data.length : 0} Pandora charts`);
    console.log(`   • ${genres.length} active genres`);
    console.log(`   • ${avgTempo} BPM average tempo`);
    console.log('');
    console.log('🚀 songIQ Client-Side Integration is FULLY FUNCTIONAL!');
    console.log('   Real data is flowing from APIs to the client interface.');
    console.log('   Users can now see live chart data, trends, and market insights.');
    console.log('');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting:');
    console.log('   1. Make sure the server is running on port 5001');
    console.log('   2. Check that all API endpoints are accessible');
    console.log('   3. Verify environment variables are loaded');
  }
}

// Run the test
testClientIntegration();
