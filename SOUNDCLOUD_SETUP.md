# 🎵 SoundCloud Setup Guide for songIQ News Section

This guide will help you set up SoundCloud integration to fetch music tracks for the News section.

## Overview

The SoundCloud integration uses the **SoundCloud API** to fetch recent tracks from independent artists. This API allows you to:
- Search for music tracks by keywords
- Get track metadata, descriptions, and artwork
- Filter tracks by relevance to independent music
- Display tracks in the Social Media tab

## Prerequisites

1. A SoundCloud account (free)
2. A registered SoundCloud application

## Step-by-Step Setup

### Step 1: Create a SoundCloud Account

1. Go to [SoundCloud.com](https://soundcloud.com/)
2. Sign up for a free account if you don't have one
3. Complete your profile

### Step 2: Register a SoundCloud Application

1. Go to [SoundCloud Developers](https://developers.soundcloud.com/)
2. Click **"Register a new application"** or **"My Apps"**
3. Log in with your SoundCloud account
4. Fill in the application details:
   - **App Name**: `songIQ News Aggregator` (or any name you prefer)
   - **Website**: Your website URL (can be `http://localhost:3001` for development)
   - **Redirect URI**: `http://localhost:3001/callback` (for OAuth, optional for read-only)
   - **Description**: `Music news aggregation platform`
5. Click **"Register"**

### Step 3: Get Your Client ID

1. After registering, you'll be taken to your application dashboard
2. You'll see your **Client ID** (also called **Client Key**)
3. Copy this value - you'll need it for your `.env` file

**Note:** SoundCloud has limited the issuance of new API keys in recent years. If you see a message that new applications are not being accepted, you may need to:
- Use an existing SoundCloud application if you have one
- Contact SoundCloud support
- Consider alternative platforms (Reddit is already working without API keys)

### Step 4: Add Client ID to Environment File

1. Open your `.env` file (or `.env.development` for development)
2. Add the following:
   ```bash
   SOUNDCLOUD_CLIENT_ID=your_client_id_here
   ```

3. Save the file and restart your server

### Step 5: Test the Integration

1. Restart your server:
   ```bash
   cd songiq/server
   npm run dev
   ```

2. Test manually via API (if you have admin access):
   ```bash
   curl -X POST http://localhost:5001/api/news/admin/fetch/soundcloud \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. Check the server logs for SoundCloud fetch results

4. Visit the News page and check the "Social Media" tab to see SoundCloud tracks

## How It Works

The integration:
- Searches for tracks using keywords like "indie music", "independent artist", "underground music"
- Fetches up to 20 tracks per search query
- Only imports tracks from the last 7 days
- Filters tracks by relevance to independent music (minimum score: 30/100)
- Extracts genres and artist names from track metadata
- Displays tracks in the Social Media tab alongside Reddit posts

## Important Notes

### API Limitations

- **Rate Limits**: SoundCloud API has rate limits (typically 200 requests per 15 minutes)
- **Search Results**: The API may return limited results depending on search terms
- **New Applications**: SoundCloud has restricted new API key issuance - you may need to use an existing application

### Track Filtering

- Only tracks with descriptions or titles are imported
- Tracks must be from the last 7 days
- Tracks must score at least 30/100 for music relevance
- Duplicate tracks are automatically skipped

### Track Information

Each imported track includes:
- Track title and description
- Artist name
- Track artwork (if available)
- Play count and like count
- Link to the SoundCloud track page
- Extracted genres and artists

## Troubleshooting

### "Invalid Client ID" Error

- Verify your `SOUNDCLOUD_CLIENT_ID` is correct in your `.env` file
- Make sure there are no extra spaces or quotes
- Check that your application is still active in the SoundCloud developer portal

### "No Tracks Found"

- Check if the SoundCloud API is returning results for your search queries
- Verify your API key has the necessary permissions
- Try searching manually on SoundCloud to see if tracks exist for your keywords
- Check server logs for specific error messages

### "API Key Not Available"

- SoundCloud has limited new API key issuance
- If you can't get a new key, you may need to:
  - Use an existing SoundCloud application
  - Contact SoundCloud support
  - Use alternative platforms (Reddit is already working)

### "Rate Limit Exceeded"

- The integration includes rate limiting (1 second between queries)
- If you still hit rate limits, reduce the number of search queries in the code
- Wait 15 minutes before trying again

## Alternative: Using SoundCloud Without API

If you can't get a SoundCloud API key, you can still:
- Use Reddit (already working, no API key needed)
- Add RSS feeds from music blogs
- Use NewsAPI for music news articles

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Verify your credentials in the `.env` file
3. Test your API key using the SoundCloud API directly:
   ```bash
   curl "https://api.soundcloud.com/tracks?client_id=YOUR_CLIENT_ID&q=indie%20music&limit=5"
   ```
4. Ensure your SoundCloud application is active in the developer portal

## Next Steps

Once SoundCloud is configured:
1. Tracks will automatically be fetched every 4 hours
2. You can manually trigger fetches via the admin API
3. Tracks will appear in the "Social Media" tab on the News page
4. Users can click tracks to listen on SoundCloud

