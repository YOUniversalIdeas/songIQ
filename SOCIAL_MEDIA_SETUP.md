# Social Media Integration Setup Guide (Phase 3)

## Overview

Phase 3 adds Reddit and Instagram integration to the News section, bringing in community discussions and visual content from social platforms.

## Reddit Integration ✅

**Status: READY TO USE (No setup required)**

Reddit integration is **completely free** and requires **no authentication** for read-only access. It's already working!

### How It Works

- Fetches hot posts from 10 music-related subreddits:
  - r/indiemusic
  - r/listentothis
  - r/WeAreTheMusicMakers
  - r/Music
  - r/indieheads
  - r/hiphopheads
  - r/electronicmusic
  - r/folk
  - r/jazz
  - r/metal

- Rate Limits: 60 requests per minute (we use 1.1 second delays)
- Fetches posts from last 7 days
- Filters for music relevance (score ≥ 30)
- Stores as `sourceType: 'reddit'`

### Usage

Reddit fetching happens automatically every 4 hours with the scheduler. You can also manually trigger:

```bash
POST /api/news/admin/fetch/reddit
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Instagram Integration

**Status: REQUIRES SETUP**

Instagram integration is free but requires app setup and access tokens.

### Setup Options

#### Option 1: Instagram Basic Display API (Personal Accounts)

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add "Instagram Basic Display" product

2. **Configure OAuth**
   - Add valid OAuth redirect URIs
   - Get App ID and App Secret

3. **Get Access Token**
   - Use OAuth flow to get user access token
   - Token expires in 60 days (can be refreshed)

4. **Get User ID**
   - Use Graph API Explorer or API call to get your Instagram User ID

5. **Add to Environment**
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   INSTAGRAM_USER_ID=your_user_id_here
   ```

#### Option 2: Instagram Graph API (Business/Creator Accounts)

1. **Convert to Business Account**
   - Convert Instagram account to Business or Creator
   - Link to a Facebook Page

2. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create app and add "Instagram Graph API"

3. **Get Access Token**
   - Use Graph API Explorer
   - Request `instagram_basic` and `pages_read_engagement` permissions

4. **Add to Environment**
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   INSTAGRAM_USER_ID=your_user_id_here
   ```

### Limitations

- **Access Token Expiration**: Tokens expire (60 days for Basic Display, varies for Graph API)
- **Rate Limits**: Instagram has rate limits (varies by endpoint)
- **Content Scope**: Can only access your own account's posts (or pages you manage)
- **App Review**: Some features may require Facebook App Review

### Usage

Once configured, Instagram fetching happens automatically. Manual trigger:

```bash
POST /api/news/admin/fetch/instagram
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Features

### Reddit Posts
- ✅ No authentication required
- ✅ Fetches from 10 music subreddits
- ✅ Extracts artist mentions
- ✅ Relevance scoring
- ✅ Upvote counts included
- ✅ Image extraction from posts

### Instagram Posts
- ✅ Visual content (images/videos)
- ✅ Caption analysis
- ✅ Artist mention extraction
- ✅ Relevance scoring
- ⚠️ Requires access token setup

## API Endpoints

### Fetch All Sources (RSS + NewsAPI + Reddit + Instagram)
```bash
POST /api/news/admin/fetch
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Fetch Specific Source
```bash
POST /api/news/admin/fetch/reddit
POST /api/news/admin/fetch/instagram
POST /api/news/admin/fetch/newsapi
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Rate Limits

### Reddit
- **60 requests per minute**
- Current implementation: 1.1 second delay between subreddits
- 10 subreddits = ~11 seconds total

### Instagram
- **200 requests per hour** (Graph API)
- **50 requests per hour** (Basic Display API)
- Current implementation: Fetches 25 posts per run

## Troubleshooting

### Reddit Not Fetching

1. **Check Server Logs**
   - Look for Reddit fetch messages
   - Check for rate limit errors

2. **Test Manually**
   ```bash
   curl -X POST http://localhost:5001/api/news/admin/fetch/reddit \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Verify Subreddit Names**
   - Check if subreddits exist and are accessible
   - Some may be private or banned

### Instagram Not Fetching

1. **Check Access Token**
   - Verify `INSTAGRAM_ACCESS_TOKEN` is set
   - Check if token has expired

2. **Check User ID**
   - Verify `INSTAGRAM_USER_ID` is correct
   - Use Graph API Explorer to test

3. **Check Permissions**
   - Ensure token has required permissions
   - `instagram_basic` for Basic Display
   - `pages_read_engagement` for Graph API

4. **Token Refresh**
   - Basic Display tokens expire in 60 days
   - Use refresh token endpoint to get new token

## Next Steps

1. **Reddit**: Already working! No setup needed.
2. **Instagram**: Follow setup instructions above to enable.
3. **Twitter/X**: Can be added in future (requires paid API access).

## Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Developers Portal](https://developers.facebook.com/)

