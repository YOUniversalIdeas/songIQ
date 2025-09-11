# 🚀 API Setup Guide for songIQ

This guide will help you set up all the external APIs needed for songIQ to function with real data instead of mock data.

## 📋 Prerequisites

- Node.js and npm installed
- Access to the songIQ project directory
- Basic understanding of API authentication

## 🎵 Music Industry APIs

### 1. Spotify API

**What it provides:** Chart data, audio features, genre detection, track information

**Setup Steps:**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - App name: `songIQ`
   - App description: `Music analysis and market intelligence platform`
   - Website: `https://songiq.ai`
   - Redirect URI: `http://localhost:3001/callback` (for development)
5. Accept the terms and create the app
6. Copy your `Client ID` and `Client Secret`
7. Add to your `.env` file:
   ```bash
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

**Rate Limits:** 25 requests per second

### 2. Last.fm API

**What it provides:** Chart data, artist information, genre detection

**Setup Steps:**
1. Go to [Last.fm API Account Creation](https://www.last.fm/api/account/create)
2. Fill in the application details:
   - Application name: `songIQ`
   - Description: `Music analysis platform`
   - Website: `https://songiq.ai`
3. Accept the terms and create the account
4. Copy your `API Key`
5. Add to your `.env` file:
   ```bash
   LASTFM_API_KEY=your_api_key_here
   ```

**Rate Limits:** 5 requests per second

### 3. YouTube API

**What it provides:** Music video data, trending content, search results

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your `API Key`
6. Add to your `.env` file:
   ```bash
   YOUTUBE_API_KEY=your_api_key_here
   ```

**Rate Limits:** 10,000 units per day (1 unit per search, 100 units per video)

## 📱 Social Media APIs

### 4. Twitter API v2

**What it provides:** Music mentions, trending topics, sentiment analysis

**Setup Steps:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Apply for a developer account (may take 24-48 hours)
3. Create a new app
4. Go to "Keys and Tokens"
5. Generate "Bearer Token"
6. Add to your `.env` file:
   ```bash
   TWITTER_BEARER_TOKEN=your_bearer_token_here
   ```

**Rate Limits:** 300 requests per 15 minutes (for Basic tier)

### 5. Instagram Basic Display API

**What it provides:** Music-related content, engagement metrics

**Setup Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Instagram Basic Display" product
4. Configure OAuth redirect URIs
5. Generate access token
6. Add to your `.env` file:
   ```bash
   INSTAGRAM_ACCESS_TOKEN=your_access_token_here
   ```

**Rate Limits:** 200 requests per hour

### 6. TikTok API

**What it provides:** Trending music content, viral songs

**Setup Steps:**
1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a developer account
3. Create a new app
4. Generate access token
5. Add to your `.env` file:
   ```bash
   TIKTOK_ACCESS_TOKEN=your_access_token_here
   ```

**Rate Limits:** Varies by plan

## 🔧 Environment File Setup

### Development Environment

1. Copy the development template:
   ```bash
   cp songiq/server/env.development.template songiq/server/.env.development
   ```

2. Edit `.env.development` and add your API keys

3. Start the server:
   ```bash
   npm run dev
   ```

### Production Environment

1. Copy the production template:
   ```bash
   cp songiq/server/env.production.template songiq/server/.env.production
   ```

2. Edit `.env.production` and add your production API keys

3. Deploy with:
   ```bash
   npm run deploy:production
   ```

## 🧪 Testing API Connections

### Test Spotify API
```bash
curl -X GET "http://localhost:5001/api/market/spotify-charts" \
  -H "Content-Type: application/json"
```

### Test Last.fm API
```bash
curl -X GET "http://localhost:5001/api/market/billboard-charts" \
  -H "Content-Type: application/json"
```

### Test Social Media APIs
```bash
curl -X GET "http://localhost:5001/api/market/social-signals" \
  -H "Content-Type: application/json"
```

## ⚠️ Important Notes

1. **Never commit `.env` files to git**
2. **Use different API keys for development and production**
3. **Monitor your API usage to stay within rate limits**
4. **Keep your API keys secure and rotate them regularly**
5. **Some APIs require approval processes that may take time**

## 🚨 Troubleshooting

### Common Issues

**"Invalid API Key" errors:**
- Verify the API key is correct
- Check if the API key has the right permissions
- Ensure the API key is active and not expired

**Rate limit exceeded:**
- Implement caching to reduce API calls
- Add delays between requests
- Consider upgrading your API plan

**CORS errors:**
- Check your `ALLOWED_ORIGINS` setting
- Ensure the frontend URL is correct

### Getting Help

- Check the API provider's documentation
- Review the songIQ server logs for detailed error messages
- Check the API status pages for service outages

## 📊 API Usage Monitoring

Monitor your API usage to optimize costs and performance:

- **Spotify:** Check your app's usage in the developer dashboard
- **Last.fm:** Monitor API calls in your account
- **Twitter:** Check rate limit status in API responses
- **YouTube:** Monitor quota usage in Google Cloud Console

## 🔄 Next Steps

After setting up all APIs:

1. **Test the integrations** using the test endpoints above
2. **Implement caching** to reduce API calls
3. **Add error handling** for API failures
4. **Set up monitoring** for API health
5. **Optimize rate limiting** based on your usage patterns

---

**Need help?** Check the songIQ documentation or create an issue in the repository.
