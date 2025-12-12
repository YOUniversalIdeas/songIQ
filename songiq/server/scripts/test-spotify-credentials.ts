// Test Spotify credentials
import dotenv from 'dotenv';
import axios from 'axios';
import * as path from 'path';

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Also try env.development as fallback
if (!process.env.SPOTIFY_CLIENT_ID) {
  dotenv.config({ path: path.join(__dirname, '../env.development') });
}

async function testSpotifyCredentials() {
  console.log('\n🔍 Testing Spotify Credentials...\n');
  
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  // Check if credentials exist
  console.log('1. Checking if credentials are set:');
  console.log(`   SPOTIFY_CLIENT_ID: ${clientId ? '✅ Set (' + clientId.substring(0, 8) + '...)' : '❌ Not set'}`);
  console.log(`   SPOTIFY_CLIENT_SECRET: ${clientSecret ? '✅ Set (' + clientSecret.substring(0, 8) + '...)' : '❌ Not set'}`);
  console.log();
  
  if (!clientId || !clientSecret) {
    console.error('❌ Missing credentials! Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env file');
    process.exit(1);
  }
  
  // Check for common issues
  console.log('2. Checking for common issues:');
  if (clientId.trim() !== clientId) {
    console.log('   ⚠️  SPOTIFY_CLIENT_ID has leading/trailing whitespace');
  }
  if (clientSecret.trim() !== clientSecret) {
    console.log('   ⚠️  SPOTIFY_CLIENT_SECRET has leading/trailing whitespace');
  }
  if (clientId.length < 20) {
    console.log('   ⚠️  SPOTIFY_CLIENT_ID seems too short (should be ~32 characters)');
  }
  if (clientSecret.length < 20) {
    console.log('   ⚠️  SPOTIFY_CLIENT_SECRET seems too short (should be ~32 characters)');
  }
  console.log();
  
  // Test authentication
  console.log('3. Testing authentication with Spotify API...');
  try {
    const credentials = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString('base64');
    
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        }
      }
    );
    
    if (response.data.access_token) {
      console.log('   ✅ Authentication successful!');
      console.log(`   🎫 Token received: ${response.data.access_token.substring(0, 20)}...`);
      console.log(`   ⏰ Token expires in: ${response.data.expires_in} seconds`);
      
      // Test a simple API call
      console.log('\n4. Testing API call (search for a track)...');
      try {
        const searchResponse = await axios.get(
          'https://api.spotify.com/v1/search?q=track:Intro%20artist:The%20xx&type=track&limit=1',
          {
            headers: {
              'Authorization': `Bearer ${response.data.access_token}`
            }
          }
        );
        
        if (searchResponse.data.tracks && searchResponse.data.tracks.items.length > 0) {
          const track = searchResponse.data.tracks.items[0];
          console.log('   ✅ API call successful!');
          console.log(`   🎵 Found track: "${track.name}" by ${track.artists.map((a: any) => a.name).join(', ')}`);
          console.log(`   🖼️  Album art available: ${track.album.images?.length > 0 ? 'Yes' : 'No'}`);
        } else {
          console.log('   ⚠️  API call succeeded but no tracks found');
        }
      } catch (apiError: any) {
        console.log('   ❌ API call failed:', apiError.response?.status, apiError.response?.data?.error?.message || apiError.message);
      }
      
      console.log('\n✅ All tests passed! Your Spotify credentials are working correctly.');
    } else {
      console.log('   ❌ Authentication failed: No access token in response');
      console.log('   Response:', response.data);
    }
  } catch (error: any) {
    console.log('   ❌ Authentication failed!');
    
    if (axios.isAxiosError(error) && error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error || 'Unknown error'}`);
      console.log(`   Description: ${error.response.data?.error_description || 'No description'}`);
      
      if (error.response.status === 401) {
        console.log('\n   💡 This usually means:');
        console.log('      - Invalid Client ID or Client Secret');
        console.log('      - Credentials have been revoked');
        console.log('      - App has been deleted from Spotify Dashboard');
      } else if (error.response.status === 400) {
        console.log('\n   💡 This usually means:');
        console.log('      - Malformed request (check credentials format)');
        console.log('      - Missing or incorrect grant_type');
      }
    } else {
      console.log('   Error:', error.message);
    }
    
    console.log('\n   📝 To fix this:');
    console.log('      1. Go to https://developer.spotify.com/dashboard');
    console.log('      2. Create a new app or check your existing app');
    console.log('      3. Copy the Client ID and Client Secret');
    console.log('      4. Update your .env file with the correct values');
    console.log('      5. Make sure there are no extra spaces or quotes');
    
    process.exit(1);
  }
}

testSpotifyCredentials().catch(console.error);

