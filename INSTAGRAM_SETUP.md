# 📱 Instagram Setup Guide for songIQ News Section

**⚠️ IMPORTANT UPDATE:** Instagram Basic Display API was **deprecated on December 4, 2024**. This guide now covers the **Instagram Graph API**, which is the replacement.

## Overview

The Instagram integration uses the **Instagram Graph API** to fetch posts from Instagram Business or Creator accounts. This API allows you to:
- Fetch recent posts from an Instagram Business/Creator account
- Get post captions, images, and metadata
- Filter posts by relevance to independent music

## Prerequisites

1. **Instagram Business or Creator account** (Personal accounts are no longer supported)
2. **Facebook Page** linked to your Instagram account
3. **Facebook Developer account**
4. **Facebook App** with Instagram Graph API product

## Step-by-Step Setup

### Step 1: Convert Instagram Account to Business/Creator

1. Open the **Instagram app** on your mobile device
2. Go to your **profile** and tap the **menu icon** (three lines) in the top-right
3. Tap **"Settings"** → **"Account"**
4. Tap **"Switch to Professional Account"**
5. Choose either **"Business"** or **"Creator"** (both work for API access)
6. Complete the setup process

### Step 2: Link Instagram to Facebook Page

1. In Instagram, go to **Settings** → **Account** → **Linked Accounts**
2. Tap **"Facebook"** and link your Instagram account to a Facebook Page
   - If you don't have a Facebook Page, create one at [facebook.com/pages/create](https://www.facebook.com/pages/create)
3. Make sure the Page is **published** (not unpublished)

### Step 3: Create a Facebook Developer Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"Get Started"** or **"My Apps"**
3. Sign in with your Facebook account
4. Complete the developer account setup if prompted

### Step 4: Create a Facebook App

1. In the Facebook Developers dashboard, click **"Create App"**
2. Select **"Business"** as the app type
3. Fill in the app details:
   - **App Name**: `songIQ News Aggregator` (or any name you prefer)
   - **App Contact Email**: Your email address
   - **Business Account**: Select your business account (or create one)
4. Click **"Create App"**

### Step 5: Add Instagram Graph API Product

1. In your app dashboard, find **"Add Product"** or go to **"Products"** in the left sidebar
2. Find **"Instagram Graph API"** and click **"Set Up"**
3. You'll be taken to the Instagram Graph API configuration page

### Step 6: Configure Instagram Graph API

1. **Add Instagram Testers** (for development):
   - Go to **"Roles"** → **"Instagram Testers"**
   - Click **"Add Instagram Testers"**
   - Enter the Instagram username you want to use
   - The Instagram account owner must accept the invitation

2. **Request Permissions**:
   - Go to **"App Review"** → **"Permissions and Features"**
   - Request these permissions:
     - `instagram_basic` (usually auto-approved)
     - `pages_read_engagement` (for reading posts)
     - `pages_show_list` (to list pages)

### Step 7: Get Your Facebook Page Access Token

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the **"Meta App"** dropdown
3. Click **"Generate Access Token"** → **"Generate User Token"**
4. Select these permissions:
   - `instagram_basic`
   - `pages_read_engagement`
   - `pages_show_list`
   - `business_management`
5. Click **"Generate Access Token"**
6. Copy the generated token (this is a short-lived token)

### Step 8: Exchange for Long-Lived Token

Short-lived tokens expire in 1-2 hours. Exchange for a long-lived token (60 days):

```bash
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
```

Replace:
- `YOUR_APP_ID`: Found in your app's **Settings** → **Basic**
- `YOUR_APP_SECRET`: Found in your app's **Settings** → **Basic** (click "Show")
- `SHORT_LIVED_TOKEN`: The token from Step 7

The response will include a `access_token` that's valid for 60 days.

### Step 9: Get Your Instagram Business Account ID

1. First, get your Facebook Page ID:
   ```bash
   curl "https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN"
   ```

2. Find your Page ID from the response, then get the Instagram Business Account ID:
   ```bash
   curl "https://graph.facebook.com/v21.0/PAGE_ID?fields=instagram_business_account&access_token=YOUR_LONG_LIVED_TOKEN"
   ```

3. The response will include:
   ```json
   {
     "instagram_business_account": {
       "id": "17841405309211844"
     }
   }
   ```

4. Copy the `id` value - this is your `INSTAGRAM_BUSINESS_ACCOUNT_ID`

### Step 10: Add Credentials to Environment File

1. Open your `.env` file (or `.env.development` for development)
2. Add the following:
   ```bash
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_facebook_page_access_token_here
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id_here
   ```

3. Save the file and restart your server

### Step 11: Test the Integration

1. Restart your server:
   ```bash
   cd songiq/server
   npm run dev
   ```

2. Test your credentials:
   ```bash
   npm run test-instagram
   ```

3. Test manually via API (if you have admin access):
   ```bash
   curl -X POST http://localhost:5001/api/news/admin/fetch/instagram \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

4. Check the server logs for Instagram fetch results

## Important Notes

### Token Expiration

- **Short-lived tokens**: Valid for 1-2 hours
- **Long-lived tokens**: Valid for 60 days
- **Refresh tokens**: You can refresh long-lived tokens before they expire

### Token Refresh

To refresh a long-lived token before it expires:

```bash
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_LONG_LIVED_TOKEN"
```

### Rate Limits

- Instagram Graph API: **200 requests per hour per user**
- The integration fetches up to 25 posts per request
- Posts are only imported if they're from the last 7 days and have music-related content

### Account Requirements

- ✅ **Business or Creator accounts**: Supported
- ❌ **Personal accounts**: No longer supported (deprecated Dec 4, 2024)
- ✅ **Must be linked to a Facebook Page**: Required for API access

### Limitations

- **Business/Creator Only**: Personal Instagram accounts cannot use the API
- **Content Filtering**: Only posts with captions and music-related content are imported
- **Relevance Score**: Posts must score at least 30/100 for relevance to be imported
- **7-Day Window**: Only posts from the last 7 days are imported

## Troubleshooting

### "Invalid Access Token" Error

- Check if your token has expired (long-lived tokens expire after 60 days)
- Verify the token is a **Page Access Token**, not a User Access Token
- Make sure the token has the required permissions
- Try generating a new token

### "User ID Not Found" Error

- Verify your `INSTAGRAM_BUSINESS_ACCOUNT_ID` is correct
- Make sure the Instagram account is a Business or Creator account
- Ensure the account is linked to a Facebook Page
- Check that the Page is published (not unpublished)

### "No Posts Found"

- Check if the Instagram account has recent posts (last 7 days)
- Verify the account is added as a tester in your Facebook App
- Ensure the account is a Business/Creator account (not personal)
- Check server logs for specific error messages

### "Permission Denied"

- Ensure the Instagram account has accepted the tester invitation
- Verify the access token has the correct permissions:
  - `instagram_basic`
  - `pages_read_engagement`
  - `pages_show_list`
- Make sure your app has been approved for these permissions (some require App Review)

### "Account Not Linked to Page"

- Go to Instagram → Settings → Account → Linked Accounts
- Make sure Facebook is linked
- Verify the linked Facebook Page is published
- Try unlinking and relinking the account

## Migration from Basic Display API

If you were previously using Instagram Basic Display API:

1. **Convert your account**: Switch to Business or Creator account
2. **Link to Facebook Page**: Required for Graph API
3. **Update credentials**: Use Facebook Page access token instead of Instagram Basic Display token
4. **Update environment variables**: Change `INSTAGRAM_USER_ID` to `INSTAGRAM_BUSINESS_ACCOUNT_ID`
5. **Test**: Run `npm run test-instagram` to verify the new setup

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify your credentials in the `.env` file
3. Test your access token using the Graph API Explorer
4. Ensure your Instagram account is:
   - A Business or Creator account (not personal)
   - Linked to a published Facebook Page
   - Added as a tester in your Facebook App

## Additional Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Instagram Business Account Setup](https://www.facebook.com/business/help/502981923235522)
