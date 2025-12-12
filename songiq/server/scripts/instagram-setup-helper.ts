import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n📱 Instagram Graph API Setup Helper\n');
  console.log('This script will guide you through setting up Instagram integration.\n');
  console.log('⚠️  Requirements:');
  console.log('   1. Instagram Business or Creator account');
  console.log('   2. Facebook Page linked to your Instagram account');
  console.log('   3. Facebook Developer account\n');

  // Step 1: Check account type
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Verify Instagram Account Type\n');
  console.log('Please check your Instagram account:');
  console.log('  1. Open Instagram app → Profile → Settings → Account');
  console.log('  2. Look for "Switch to Professional Account" or "Account Type"');
  console.log('  3. It should say "Business" or "Creator" (not "Personal")\n');
  
  const accountType = await question('Is your Instagram account Business or Creator? (yes/no): ');
  if (accountType.toLowerCase() !== 'yes') {
    console.log('\n❌ You need to convert your account first:');
    console.log('   1. Open Instagram app');
    console.log('   2. Go to Profile → Settings → Account');
    console.log('   3. Tap "Switch to Professional Account"');
    console.log('   4. Choose "Business" or "Creator"');
    console.log('   5. Complete the setup\n');
    console.log('Run this script again after converting your account.\n');
    rl.close();
    return;
  }

  // Step 2: Check Facebook Page link
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Link Instagram to Facebook Page\n');
  console.log('Please check if your Instagram is linked to a Facebook Page:');
  console.log('  1. Open Instagram app → Profile → Settings → Account → Linked Accounts');
  console.log('  2. Check if "Facebook" is listed and connected\n');
  
  const isLinked = await question('Is your Instagram account linked to a Facebook Page? (yes/no): ');
  if (isLinked.toLowerCase() !== 'yes') {
    console.log('\n❌ You need to link your account to a Facebook Page:');
    console.log('   1. Open Instagram app');
    console.log('   2. Go to Profile → Settings → Account → Linked Accounts');
    console.log('   3. Tap "Facebook"');
    console.log('   4. If you don\'t have a Facebook Page, create one at:');
    console.log('      https://www.facebook.com/pages/create');
    console.log('   5. Link your Instagram account to the Page\n');
    console.log('Run this script again after linking.\n');
    rl.close();
    return;
  }

  // Step 3: Facebook Developer Account
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 3: Facebook Developer Account\n');
  console.log('Do you have a Facebook Developer account?');
  console.log('  - If yes, we\'ll help you create an app');
  console.log('  - If no, we\'ll guide you to create one\n');
  
  const hasDevAccount = await question('Do you have a Facebook Developer account? (yes/no): ');
  if (hasDevAccount.toLowerCase() !== 'yes') {
    console.log('\n📝 Creating Facebook Developer Account:');
    console.log('   1. Go to: https://developers.facebook.com/');
    console.log('   2. Click "Get Started" or "My Apps"');
    console.log('   3. Sign in with your Facebook account');
    console.log('   4. Complete the developer account setup\n');
    const continueStep = await question('Press Enter when you\'ve created your developer account...');
  }

  // Step 4: Create Facebook App
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 4: Create Facebook App\n');
  console.log('Now we need to create a Facebook App:');
  console.log('   1. Go to: https://developers.facebook.com/apps/');
  console.log('   2. Click "Create App"');
  console.log('   3. Select "Business" as the app type');
  console.log('   4. Fill in:');
  console.log('      - App Name: songIQ News Aggregator (or any name)');
  console.log('      - App Contact Email: your email');
  console.log('   5. Click "Create App"\n');
  
  const continueApp = await question('Press Enter when you\'ve created the app...');
  
  // Step 5: Get App ID and Secret
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 5: Get App Credentials\n');
  console.log('We need your App ID and App Secret:');
  console.log('   1. In your app dashboard, go to "Settings" → "Basic"');
  console.log('   2. You\'ll see "App ID" (copy this)');
  console.log('   3. You\'ll see "App Secret" (click "Show" and copy this)\n');
  
  const appId = await question('Enter your App ID: ');
  const appSecret = await question('Enter your App Secret: ');

  // Step 6: Add Instagram Graph API
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 6: Add Instagram Graph API Product\n');
  console.log('Add Instagram Graph API to your app:');
  console.log('   1. In your app dashboard, find "Add Product" or go to "Products"');
  console.log('   2. Find "Instagram Graph API" and click "Set Up"');
  console.log('   3. Follow the setup wizard\n');
  
  const continueProduct = await question('Press Enter when you\'ve added Instagram Graph API...');

  // Step 7: Generate Access Token
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 7: Generate Access Token\n');
  console.log('We\'ll help you generate an access token using Graph API Explorer:');
  console.log('   1. Go to: https://developers.facebook.com/tools/explorer/');
  console.log('   2. Select your app from the "Meta App" dropdown (top right)');
  console.log('   3. Click "Generate Access Token" → "Generate User Token"');
  console.log('   4. Select these permissions:');
  console.log('      - instagram_basic');
  console.log('      - pages_read_engagement');
  console.log('      - pages_show_list');
  console.log('      - business_management');
  console.log('   5. Click "Generate Access Token"');
  console.log('   6. Copy the token that appears\n');
  
  const shortLivedToken = await question('Paste your access token here: ');

  // Step 8: Exchange for Long-Lived Token
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 8: Exchange for Long-Lived Token\n');
  console.log('Exchanging your short-lived token for a long-lived token (60 days)...\n');
  
  try {
    const exchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const exchangeResponse = await axios.get(exchangeUrl);
    
    if (exchangeResponse.data && exchangeResponse.data.access_token) {
      const longLivedToken = exchangeResponse.data.access_token;
      console.log('✅ Successfully generated long-lived token!\n');
      
      // Step 9: Get Page ID
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('STEP 9: Get Facebook Page ID\n');
      console.log('Getting your Facebook Page ID...\n');
      
      try {
        const pagesResponse = await axios.get(`https://graph.facebook.com/v21.0/me/accounts`, {
          params: {
            access_token: longLivedToken
          }
        });
        
        if (pagesResponse.data && pagesResponse.data.data && pagesResponse.data.data.length > 0) {
          const pages = pagesResponse.data.data;
          console.log('Found the following Facebook Pages:');
          pages.forEach((page: any, index: number) => {
            console.log(`   ${index + 1}. ${page.name} (ID: ${page.id})`);
          });
          
          let selectedPage;
          if (pages.length === 1) {
            selectedPage = pages[0];
            console.log(`\n✅ Using: ${selectedPage.name}\n`);
          } else {
            const pageChoice = await question(`\nWhich page is linked to your Instagram? (1-${pages.length}): `);
            const pageIndex = parseInt(pageChoice) - 1;
            if (pageIndex >= 0 && pageIndex < pages.length) {
              selectedPage = pages[pageIndex];
            } else {
              console.log('Invalid choice, using first page');
              selectedPage = pages[0];
            }
          }
          
          // Step 10: Get Instagram Business Account ID
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('STEP 10: Get Instagram Business Account ID\n');
          console.log('Getting your Instagram Business Account ID...\n');
          
          try {
            const instagramResponse = await axios.get(`https://graph.facebook.com/v21.0/${selectedPage.id}`, {
              params: {
                fields: 'instagram_business_account',
                access_token: longLivedToken
              }
            });
            
            if (instagramResponse.data && instagramResponse.data.instagram_business_account) {
              const instagramAccountId = instagramResponse.data.instagram_business_account.id;
              console.log('✅ Found Instagram Business Account ID!\n');
              
              // Step 11: Get Page Access Token
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('STEP 11: Get Page Access Token\n');
              console.log('Getting Page Access Token (required for Instagram API)...\n');
              
              // The long-lived token we have should work, but let's verify
              const pageAccessToken = selectedPage.access_token || longLivedToken;
              
              // Final summary
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('✅ SETUP COMPLETE!\n');
              console.log('Add these to your .env file:\n');
              console.log(`INSTAGRAM_ACCESS_TOKEN=${pageAccessToken}`);
              console.log(`INSTAGRAM_BUSINESS_ACCOUNT_ID=${instagramAccountId}\n`);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
              
              const saveToFile = await question('Would you like me to add these to your .env file? (yes/no): ');
              if (saveToFile.toLowerCase() === 'yes') {
                // Read current .env file
                const fs = require('fs');
                const envPath = path.join(__dirname, '../.env');
                let envContent = '';
                
                try {
                  envContent = fs.readFileSync(envPath, 'utf8');
                } catch (e) {
                  // File doesn't exist or can't be read
                }
                
                // Remove old Instagram variables if they exist
                envContent = envContent.replace(/INSTAGRAM_ACCESS_TOKEN=.*\n/g, '');
                envContent = envContent.replace(/INSTAGRAM_USER_ID=.*\n/g, '');
                envContent = envContent.replace(/INSTAGRAM_BUSINESS_ACCOUNT_ID=.*\n/g, '');
                
                // Add new variables
                envContent += `\n# Instagram Graph API\n`;
                envContent += `INSTAGRAM_ACCESS_TOKEN=${pageAccessToken}\n`;
                envContent += `INSTAGRAM_BUSINESS_ACCOUNT_ID=${instagramAccountId}\n`;
                
                fs.writeFileSync(envPath, envContent);
                console.log('\n✅ Credentials saved to .env file!\n');
              }
              
              console.log('Next steps:');
              console.log('   1. Restart your server');
              console.log('   2. Test with: npm run test-instagram');
              console.log('   3. Fetch posts: POST /api/news/admin/fetch/instagram\n');
              
            } else {
              console.log('❌ Could not find Instagram Business Account linked to this page.');
              console.log('   Make sure your Instagram account is:');
              console.log('   - A Business or Creator account');
              console.log('   - Linked to this Facebook Page\n');
            }
          } catch (error: any) {
            console.log('❌ Error getting Instagram Business Account ID:');
            console.log(`   ${error.response?.data?.error?.message || error.message}\n`);
          }
        } else {
          console.log('❌ No Facebook Pages found.');
          console.log('   Make sure your Instagram is linked to a Facebook Page.\n');
        }
      } catch (error: any) {
        console.log('❌ Error getting Facebook Pages:');
        console.log(`   ${error.response?.data?.error?.message || error.message}\n`);
      }
    } else {
      console.log('❌ Failed to exchange token. Please check your App ID and Secret.\n');
    }
  } catch (error: any) {
    console.log('❌ Error exchanging token:');
    console.log(`   ${error.response?.data?.error?.message || error.message}\n`);
    console.log('Please check:');
    console.log('   - Your App ID is correct');
    console.log('   - Your App Secret is correct');
    console.log('   - Your access token is valid\n');
  }

  rl.close();
}

main().catch(console.error);

