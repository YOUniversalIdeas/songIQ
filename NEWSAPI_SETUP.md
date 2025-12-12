# NewsAPI Setup Guide

## Overview

NewsAPI integration has been added to the News section (Phase 2). NewsAPI provides access to news articles from thousands of sources, expanding your article coverage beyond RSS feeds.

## Getting a NewsAPI Key

1. **Sign up for NewsAPI**
   - Visit [https://newsapi.org/register](https://newsapi.org/register)
   - Create a free account
   - Free tier includes: 100 requests per day, 1 request per second

2. **Get Your API Key**
   - After registration, you'll receive an API key
   - Copy the API key (it looks like: `abc123def456...`)

## Configuration

Add the NewsAPI key to your environment variables:

### Development (.env file)
```env
NEWSAPI_KEY=your_newsapi_key_here
```

### Production
Add `NEWSAPI_KEY` to your production environment variables.

## How It Works

### Article Fetching
- NewsAPI searches for music-related articles using keywords:
  - music, musician, artist, album, song, concert, tour
  - indie, independent music, record label, music industry
  - music festival, music streaming, spotify, apple music
  - music producer, music video, music chart, billboard

### Filtering
- Only articles with relevance score ≥ 40 are imported
- Articles are filtered for music-related content
- Duplicate articles (by URL) are automatically skipped
- Only articles from the last 7 days are imported

### Rate Limiting
- The service limits to 5 keywords per fetch to stay within free tier limits
- 1 second delay between requests to respect rate limits
- Articles are fetched from the last 7 days only

## Usage

### Automatic Fetching
The scheduler automatically fetches from NewsAPI every 4 hours along with RSS feeds.

### Manual Fetching (Admin)
You can manually trigger a NewsAPI fetch:

```bash
POST /api/news/admin/fetch/newsapi
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Or fetch all sources (including NewsAPI):

```bash
POST /api/news/admin/fetch
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## API Limits

### Free Tier
- **100 requests per day**
- **1 request per second**
- Articles from last 7 days only
- Up to 100 results per request

### Recommendations
- The current implementation uses 5 keywords per fetch
- Each keyword = 1 API request
- With 4-hour scheduler, you'll use ~30 requests per day (well within limits)

## Troubleshooting

### NewsAPI Not Fetching Articles

1. **Check API Key**
   - Verify `NEWSAPI_KEY` is set in environment variables
   - Restart the server after adding the key

2. **Check Logs**
   - Look for "⚠️ NewsAPI key not configured" message
   - Check for API errors in server logs

3. **Verify Rate Limits**
   - Free tier: 100 requests/day
   - If exceeded, wait 24 hours or upgrade plan

### Low Article Count

- NewsAPI filters for music-related content
- Only articles with relevance ≥ 40 are imported
- Try adjusting relevance threshold in `newsService.ts`

### API Errors

- **401 Unauthorized**: Invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid parameters

## Integration Details

### Source Type
NewsAPI articles are stored with:
- `sourceType: 'api'`
- `source: 'NewsAPI'` or the original source name

### Merging with RSS
- NewsAPI articles are merged with RSS feed articles
- All articles appear in the same feed
- Filtering by source works for both RSS and NewsAPI

## Next Steps

After setting up NewsAPI, you can:
1. Monitor article counts in the News stats
2. Adjust music keywords if needed
3. Consider upgrading to a paid plan for more requests
4. Move to Phase 3 (Reddit/Twitter integration)

## Support

- NewsAPI Documentation: [https://newsapi.org/docs](https://newsapi.org/docs)
- NewsAPI Support: [https://newsapi.org/contact](https://newsapi.org/contact)

