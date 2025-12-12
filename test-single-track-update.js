// Test updating a single track to see what's happening
const https = require('https');

async function testTrackUpdate() {
  const trackName = 'Intro';
  const artistName = 'The xx';
  
  console.log(`\n🔍 Testing Spotify search for: "${trackName}" by "${artistName}"\n`);
  
  // Get Spotify access token
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Spotify credentials not found in environment');
    return;
  }
  
  console.log('✅ Spotify credentials found');
  
  // Get access token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const token = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'accounts.spotify.com',
      path: '/api/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.access_token) {
            resolve(json.access_token);
          } else {
            reject(new Error('No access token in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end('grant_type=client_credentials');
  });
  
  console.log('✅ Got Spotify access token\n');
  
  // Search for track
  const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
  const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`;
  
  console.log(`Search URL: ${searchUrl}\n`);
  
  const searchResults = await new Promise((resolve, reject) => {
    https.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
  
  if (searchResults.tracks && searchResults.tracks.items && searchResults.tracks.items.length > 0) {
    console.log(`✅ Found ${searchResults.tracks.items.length} track(s):\n`);
    
    searchResults.tracks.items.forEach((track, i) => {
      console.log(`${i + 1}. "${track.name}" by ${track.artists.map(a => a.name).join(', ')}`);
      console.log(`   Spotify ID: ${track.id}`);
      console.log(`   Album: ${track.album.name}`);
      if (track.album.images && track.album.images.length > 0) {
        console.log(`   ✅ Album art available (${track.album.images.length} sizes)`);
        console.log(`   Largest: ${track.album.images[0].url.substring(0, 60)}...`);
      } else {
        console.log(`   ❌ No album images`);
      }
      
      // Check artist name matching
      const trackArtists = track.artists.map(a => a.name.toLowerCase());
      const artistNameLower = artistName.toLowerCase();
      const artistNameNoThe = artistNameLower.replace(/^the /, '');
      
      const matches = trackArtists.includes(artistNameLower) || 
                     trackArtists.some(a => a.replace(/^the /, '') === artistNameNoThe) ||
                     trackArtists.some(a => a.includes(artistNameLower) || artistNameLower.includes(a));
      
      console.log(`   Artist match: ${matches ? '✅ YES' : '❌ NO'}`);
      console.log(`   Expected: "${artistName}"`);
      console.log(`   Found: ${track.artists.map(a => a.name).join(', ')}`);
      console.log('');
    });
  } else {
    console.log('❌ No tracks found');
    console.log('Response:', JSON.stringify(searchResults, null, 2).substring(0, 500));
  }
}

testTrackUpdate().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

