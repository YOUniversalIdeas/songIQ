# 🎵 Spotify Integration Setup Guide

## Overview
This guide will help you set up Spotify integration for your songIQ application, allowing users to search, analyze, and get insights from any track on Spotify.

## Prerequisites
- Spotify Developer Account
- Node.js application with environment variable support

## Step 1: Create Spotify Developer Account

### 1.1 Go to Spotify Developer Dashboard
- Visit: [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
- Sign in with your Spotify account (or create one if you don't have it)

### 1.2 Create a New App
- Click **"Create App"**
- Fill in the required information:
  - **App name**: `songIQ Music Analysis`
  - **App description**: `Music analysis and market insights powered by Spotify data`
  - **Website**: `https://yourdomain.com` (or your actual domain)
  - **Redirect URI**: `http://localhost:3000/callback` (for development)
  - **API/SDKs**: Check "Web API"

### 1.3 Get Your Credentials
After creating the app, you'll see:
- **Client ID**: A long string of letters and numbers
- **Client Secret**: Click "Show Client Secret" to reveal it

## Step 2: Configure Environment Variables

### 2.1 Update Your .env File
In your `songiq/server/.env` file, add:

```bash
# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_actual_client_id_here
SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
```

### 2.2 Example .env File
```bash
# Server Configuration
PORT=9004
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/songiq

# Spotify API Configuration
SPOTIFY_CLIENT_ID=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
SPOTIFY_CLIENT_SECRET=xyz987wvu654tsr321qpo098nml654kji321hgf098edc

# Other configurations...
```

## Step 3: Test the Integration

### 3.1 Start Your Server
```bash
cd songiq/server
npm run dev
```

### 3.2 Test Spotify Search API
```bash
curl "http://localhost:9004/api/spotify/search?q=shape%20of%20you&limit=5"
```

### 3.3 Test Track Analysis
```bash
# First get a track ID from search, then analyze it
curl "http://localhost:9004/api/spotify/track/4iJyoBOLtHqaGxP12qzhQI"
```

## Step 4: Use the Spotify Integration Component

### 4.1 Access the Component
Navigate to your Spotify integration page (you'll need to add this to your routing)

### 4.2 Features Available
- **Track Search**: Search for any song, artist, or album
- **Audio Analysis**: Get detailed audio features (danceability, energy, etc.)
- **Market Insights**: Popularity, trending status, and market recommendations
- **Similar Tracks**: Discover comparable songs
- **Genre Analysis**: Understand genre trends and market positioning

## API Endpoints Available

### Search Tracks
```
GET /api/spotify/search?q={query}&limit={number}
```

### Analyze Track
```
GET /api/spotify/track/{trackId}
```

### Get Audio Features
```
GET /api/spotify/audio-features/{trackId}
```

### Get Similar Tracks
```
GET /api/spotify/similar/{trackId}?limit={number}
```

### Get Genre Insights
```
GET /api/spotify/genre/{genre}
```

### Analyze by URL or ID
```
POST /api/spotify/analyze
Body: { "trackId": "string" } or { "trackUrl": "spotify:track:..." }
```

## Rate Limits and Best Practices

### Spotify API Limits
- **Client Credentials Flow**: 25 requests per second
- **User Authorization Flow**: 25 requests per second per user

### Best Practices
1. **Cache Results**: Store analysis results to avoid repeated API calls
2. **Batch Requests**: Use batch endpoints when possible
3. **Error Handling**: Implement proper error handling for rate limits
4. **User Feedback**: Show loading states during API calls

## Troubleshooting

### Common Issues

#### 1. "Invalid Client" Error
- Verify your Client ID and Secret are correct
- Ensure you've copied them exactly from the Spotify Dashboard

#### 2. "Rate Limit Exceeded" Error
- Implement exponential backoff
- Cache frequently requested data
- Monitor your API usage

#### 3. "Track Not Found" Error
- Verify the track ID is valid
- Check if the track is available in your region
- Ensure the track hasn't been removed from Spotify

### Debug Steps
1. Check server logs for detailed error messages
2. Verify environment variables are loaded correctly
3. Test API endpoints with curl or Postman
4. Check Spotify Dashboard for app status

## Security Considerations

### API Key Protection
- Never commit `.env` files to version control
- Use environment variables in production
- Rotate client secrets regularly

### Rate Limiting
- Implement server-side rate limiting
- Monitor API usage patterns
- Set up alerts for unusual activity

## Next Steps

### Enhancements to Consider
1. **User Authentication**: Implement Spotify OAuth for user-specific data
2. **Playlist Analysis**: Analyze entire playlists for trends
3. **Historical Data**: Track track performance over time
4. **Market Predictions**: Use machine learning for success predictions
5. **Social Integration**: Connect with social media platforms

### YouTube & Instagram Integration
Consider adding these platforms for comprehensive music analysis:
- **YouTube**: Video performance and audience retention
- **Instagram**: Viral potential and trending analysis

## Support

### Resources
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Developer Community](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)
- [API Reference](https://developer.spotify.com/documentation/web-api/reference/)

### Getting Help
- Check the troubleshooting section above
- Review Spotify API documentation
- Join the Spotify Developer Community
- Contact support if issues persist

---

**Note**: This integration uses Spotify's Client Credentials flow, which is perfect for server-to-server communication and doesn't require user authentication. For user-specific features, you'll need to implement OAuth 2.0 with user authorization.
