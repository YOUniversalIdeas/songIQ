import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

async function testInstagramCredentials() {
  console.log('🔍 Testing Instagram Graph API Credentials...\n');
  console.log('⚠️  Note: Instagram Basic Display API was deprecated on Dec 4, 2024');
  console.log('    This test uses Instagram Graph API (requires Business/Creator account)\n');

  // Check if credentials are set
  if (!INSTAGRAM_ACCESS_TOKEN) {
    console.error('❌ INSTAGRAM_ACCESS_TOKEN is not set in .env file');
    console.error('   This should be a Facebook Page access token (not Instagram Basic Display token)');
    process.exit(1);
  }

  if (!INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.error('❌ INSTAGRAM_BUSINESS_ACCOUNT_ID is not set in .env file');
    console.error('   Get this from: https://graph.facebook.com/v21.0/PAGE_ID?fields=instagram_business_account');
    process.exit(1);
  }

  console.log('✅ Credentials found in .env file');
  console.log(`   Business Account ID: ${INSTAGRAM_BUSINESS_ACCOUNT_ID}`);
  console.log(`   Access Token: ${INSTAGRAM_ACCESS_TOKEN.substring(0, 20)}...\n`);

  try {
    // Test 1: Get business account info
    console.log('📋 Test 1: Getting Instagram Business Account information...');
    const accountResponse = await axios.get(`https://graph.facebook.com/v21.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}`, {
      params: {
        fields: 'id,username,name,profile_picture_url',
        access_token: INSTAGRAM_ACCESS_TOKEN
      }
    });

    if (accountResponse.data) {
      console.log('✅ Business account info retrieved successfully:');
      console.log(`   Username: ${accountResponse.data.username || 'N/A'}`);
      console.log(`   Name: ${accountResponse.data.name || 'N/A'}`);
      console.log(`   ID: ${accountResponse.data.id}\n`);
    }

    // Test 2: Get media list
    console.log('📋 Test 2: Fetching media list...');
    const mediaResponse = await axios.get(`https://graph.facebook.com/v21.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,username,thumbnail_url',
        access_token: INSTAGRAM_ACCESS_TOKEN,
        limit: 5
      }
    });

    if (mediaResponse.data && mediaResponse.data.data) {
      const posts = mediaResponse.data.data;
      console.log(`✅ Successfully fetched ${posts.length} posts\n`);
      
      if (posts.length > 0) {
        console.log('📸 Sample post:');
        const firstPost = posts[0];
        console.log(`   ID: ${firstPost.id}`);
        console.log(`   Type: ${firstPost.media_type}`);
        console.log(`   Caption: ${firstPost.caption ? firstPost.caption.substring(0, 100) + '...' : 'No caption'}`);
        console.log(`   URL: ${firstPost.permalink}`);
        console.log(`   Timestamp: ${firstPost.timestamp}\n`);
      }
    } else {
      console.log('⚠️  No posts found (this is normal if the account has no recent posts)\n');
    }

    // Test 3: Check token expiration and type
    console.log('📋 Test 3: Checking token validity and type...');
    const tokenInfoResponse = await axios.get('https://graph.facebook.com/v21.0/me', {
      params: {
        fields: 'id,name',
        access_token: INSTAGRAM_ACCESS_TOKEN
      }
    });

    // If we get here, token is valid
    console.log('✅ Access token is valid');
    console.log(`   Token type: Facebook Page Access Token`);
    if (tokenInfoResponse.data) {
      console.log(`   Associated with: ${tokenInfoResponse.data.name || 'N/A'}\n`);
    }

    console.log('🎉 All tests passed! Instagram integration is configured correctly.\n');
    console.log('💡 Next steps:');
    console.log('   1. Make sure your server is running');
    console.log('   2. Test the fetch endpoint: POST /api/news/admin/fetch/instagram');
    console.log('   3. Check the News page to see Instagram posts\n');

  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      console.error(`❌ API Error (Status ${status}):`);
      console.error(`   Message: ${data.error?.message || JSON.stringify(data)}`);
      console.error(`   Type: ${data.error?.type || 'Unknown'}`);
      console.error(`   Code: ${data.error?.code || 'N/A'}\n`);

      if (status === 401) {
        console.error('💡 This usually means:');
        console.error('   - Your access token has expired');
        console.error('   - Your access token is invalid');
        console.error('   - The token doesn\'t have the required permissions');
        console.error('   - You\'re using a User token instead of a Page token\n');
        console.error('   Solution: Generate a new Facebook Page access token (see INSTAGRAM_SETUP.md)\n');
      } else if (status === 400) {
        console.error('💡 This usually means:');
        console.error('   - Invalid Instagram Business Account ID');
        console.error('   - Missing required permissions');
        console.error('   - The Instagram account is not a Business/Creator account');
        console.error('   - The account is not linked to a Facebook Page\n');
      } else if (status === 403) {
        console.error('💡 This usually means:');
        console.error('   - The Instagram account is not added as a tester');
        console.error('   - Your app doesn\'t have permission to access this account');
        console.error('   - The account is a personal account (not Business/Creator)\n');
      }
    } else if (error.request) {
      console.error('❌ Network Error: No response received from Instagram API');
      console.error('   Check your internet connection\n');
    } else {
      console.error('❌ Error:', error.message);
    }

    process.exit(1);
  }
}

// Run the test
testInstagramCredentials();

