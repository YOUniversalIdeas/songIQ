# News Section - Phase 1 Implementation Guide

## Overview

Phase 1 of the News section has been successfully implemented with RSS feed aggregation. This provides a foundation for importing news articles about independent music from various sources.

## What's Been Implemented

### Backend Components

1. **NewsArticle Model** (`songiq/server/src/models/NewsArticle.ts`)
   - Stores articles with metadata (title, description, URL, source, etc.)
   - Tracks relevance scores, genres, artists mentioned
   - Supports filtering by independent music focus

2. **News Service** (`songiq/server/src/services/newsService.ts`)
   - RSS feed parser (basic implementation)
   - Fetches from 8 music news sources:
     - Pitchfork
     - Bandcamp Daily
     - Stereogum
     - Brooklyn Vegan
     - The Fader
     - Consequence
     - NPR Music
     - Tiny Mix Tapes
   - Calculates relevance scores for independent music
   - Extracts genres and artists mentioned
   - Filters articles from last 30 days

3. **News Routes** (`songiq/server/src/routes/news.ts`)
   - `GET /api/news` - List articles with filtering/pagination
   - `GET /api/news/trending` - Get trending articles
   - `GET /api/news/:id` - Get single article
   - `GET /api/news/sources/list` - List available sources
   - `GET /api/news/stats/overview` - Get statistics
   - Admin endpoints for manual fetching and curation

4. **News Scheduler** (`songiq/server/src/services/newsUpdateScheduler.ts`)
   - Automatically fetches new articles every 4 hours
   - Daily cleanup of old articles (90+ days, low relevance)
   - Can be disabled with `ENABLE_NEWS_SCHEDULER=false`

### Frontend Components

1. **NewsPage** (`songiq/client/src/pages/NewsPage.tsx`)
   - Beautiful grid layout for articles
   - Filtering by source, view (all/trending/independent)
   - Search functionality
   - Sort by date, relevance, or recently added
   - Infinite scroll with "Load More"
   - Statistics dashboard
   - Responsive design with dark mode support

## API Endpoints

### Public Endpoints

- `GET /api/news` - Get articles
  - Query params: `limit`, `offset`, `source`, `isIndependent`, `minRelevanceScore`, `genre`, `artist`, `search`, `sortBy`
  
- `GET /api/news/trending?limit=10` - Get trending articles

- `GET /api/news/:id` - Get single article

- `GET /api/news/sources/list` - List sources

- `GET /api/news/stats/overview` - Get statistics

### Admin Endpoints (require admin auth)

- `POST /api/news/admin/fetch` - Manually trigger fetch from all feeds
- `POST /api/news/admin/fetch/:source` - Fetch from specific source
- `PUT /api/news/admin/article/:id` - Update article
- `DELETE /api/news/admin/article/:id` - Deactivate article
- `POST /api/news/admin/article` - Create article manually
- `GET /api/news/admin/articles` - Get all articles (including inactive)

## Usage

### Accessing the News Page

Navigate to `/news` in your application to view the news section.

### Manual Fetch (Admin)

To manually trigger a news fetch:

```bash
curl -X POST http://localhost:5001/api/news/admin/fetch \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Environment Variables

The news scheduler can be disabled by setting:
```env
ENABLE_NEWS_SCHEDULER=false
```

## RSS Feed Sources

The system currently fetches from these RSS feeds:

1. **Pitchfork** - `https://pitchfork.com/feed/feed-news/rss`
2. **Bandcamp Daily** - `https://daily.bandcamp.com/feed` (Independent focus)
3. **Stereogum** - `https://www.stereogum.com/feed/`
4. **Brooklyn Vegan** - `https://www.brooklynvegan.com/feed/`
5. **The Fader** - `https://www.thefader.com/rss.xml`
6. **Consequence** - `https://consequence.net/feed/`
7. **NPR Music** - `https://www.npr.org/rss/rss.php?id=1039` (Independent focus)
8. **Tiny Mix Tapes** - `https://www.tinymixtapes.com/rss.xml` (Independent focus)

## Features

### Relevance Scoring

Articles are scored (0-100) based on:
- Keywords indicating independent music (indie, unsigned, DIY, etc.)
- Negative scoring for major label content
- Source type (some sources are marked as independent-focused)

### Artist Extraction

The system attempts to match article content against artists in your database to identify which artists are mentioned.

### Genre Extraction

Common music genres are extracted from article content for filtering.

### Filtering Options

- **Source**: Filter by specific news source
- **Independent**: Show only independent music articles
- **Relevance Score**: Minimum relevance threshold
- **Genre**: Filter by music genre
- **Artist**: Filter by mentioned artist
- **Search**: Full-text search

## Limitations (Phase 1)

1. **RSS Parser**: Uses a basic regex-based parser. For production, consider using a library like `rss-parser` for better compatibility.

2. **Content Extraction**: Only extracts basic metadata. Full article content scraping would require additional libraries.

3. **Rate Limiting**: Currently has 2-second delays between feeds. Some sources may have rate limits.

4. **Image Extraction**: Basic image URL extraction. Some feeds may not provide images.

## Phase 2: NewsAPI Integration ✅

**Status: COMPLETED**

NewsAPI integration has been added to expand article coverage:
- ✅ NewsAPI service integration
- ✅ Music-related keyword filtering
- ✅ Automatic merging with RSS content
- ✅ Relevance scoring for music articles
- ✅ Rate limiting and error handling

**Setup Required:**
- Get a free NewsAPI key from [newsapi.org](https://newsapi.org/register)
- Add `NEWSAPI_KEY` to your environment variables
- See `NEWSAPI_SETUP.md` for detailed setup instructions

### Phase 3: Social Media Integration ✅

**Status: COMPLETED (Reddit ready, Instagram requires setup)**

Social media integration has been added:
- ✅ Reddit API integration (10 music subreddits)
- ✅ Instagram API integration (requires access token setup)
- ⏳ Twitter/X API (requires paid API access - future)

**Reddit:**
- ✅ No setup required - works immediately
- ✅ Fetches from r/indiemusic, r/listentothis, r/WeAreTheMusicMakers, and 7 more
- ✅ Automatic fetching every 4 hours

**Instagram:**
- ⚠️ Requires Facebook App setup and access token
- ⚠️ Free but needs configuration
- See `SOCIAL_MEDIA_SETUP.md` for detailed setup instructions

**Setup Required for Instagram:**
- Create Facebook Developer app
- Get Instagram access token
- Add `INSTAGRAM_ACCESS_TOKEN` and `INSTAGRAM_USER_ID` to environment variables

### Phase 4: Enhancements
- Better content extraction
- Article summarization
- Related articles suggestions
- User favorites/bookmarks
- Email newsletter integration

## Testing

To test the news section:

1. **Start the server** - The scheduler will automatically start fetching articles
2. **Visit `/news`** - View the news page
3. **Admin fetch** - Use admin endpoint to manually trigger a fetch
4. **Check database** - Verify articles are being stored in MongoDB

## Troubleshooting

### No Articles Showing

1. Check if scheduler is running (should see logs on server start)
2. Manually trigger a fetch via admin endpoint
3. Check RSS feed URLs are accessible
4. Verify MongoDB connection

### RSS Parsing Errors

Some RSS feeds may have non-standard formats. The basic parser handles most standard RSS 2.0 feeds. For problematic feeds, consider:
- Using a proper RSS parser library
- Adding feed-specific parsing logic
- Using alternative feed URLs

### Performance

- Articles older than 30 days are not imported
- Old articles (90+ days, low relevance) are automatically deactivated
- Consider adding pagination limits for large result sets

## Notes

- Articles are deduplicated by URL
- Only articles from the last 30 days are imported
- The scheduler runs every 4 hours automatically
- All timestamps are stored in UTC

