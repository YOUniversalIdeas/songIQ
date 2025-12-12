# Charts Feature Testing Guide

## Overview

The charts feature for independent artists has been implemented with the following components:

### Backend Components
- **Routes**: `/api/charts/*` endpoints in `songiq/server/src/routes/charts.ts`
- **Services**:
  - `chartDataAggregator.ts` - Aggregates data from multiple sources (Last.fm, ListenBrainz, Spotify)
  - `chartScoringEngine.ts` - Calculates composite, momentum, and reach scores
  - `lastfmService.ts` - Last.fm API integration
  - `listenbrainzService.ts` - ListenBrainz API integration
  - `musicbrainzService.ts` - MusicBrainz API integration
- **Models**:
  - `UnifiedArtist.ts` - Unified artist model with metrics from all sources
  - `UnifiedTrack.ts` - Unified track model

### Frontend Components
- **Pages**:
  - `ChartsPage.tsx` - Main charts listing page
  - `ChartArtistPage.tsx` - Individual artist detail page
- **Components**:
  - `ChartCard.tsx` - Artist card component for listings
- **Navigation**: Charts link in Trends dropdown menu

## Current Status

✅ **LastFM API Key**: Configured in `.env` file
✅ **Routes**: All chart routes registered in server
✅ **Frontend**: Charts pages and components created
✅ **Navigation**: Charts accessible via Trends dropdown

## Testing Steps

### 1. Start the Servers

From the project root, you can use the start script:

```bash
./START_EVERYTHING.sh
```

Or manually:

```bash
# Terminal 1 - Backend
cd songiq/server
npm run dev

# Terminal 2 - Frontend  
cd songiq/client
npm run dev
```

### 2. Seed Test Data

The easiest way to test is to seed some test data (no authentication required):

```bash
curl -X POST http://localhost:5001/api/charts/admin/seed-test-data \
  -H "Content-Type: application/json"
```

This will create 8 test artists with realistic metrics:
- Taylor Swift
- The Weeknd
- Billie Eilish
- Drake
- Ariana Grande
- Ed Sheeran
- Post Malone
- Dua Lipa

### 3. Test API Endpoints

Use the provided test script:

```bash
./test-charts.sh
```

Or test manually:

```bash
# Get stats
curl http://localhost:5001/api/charts/stats

# Get top artists
curl http://localhost:5001/api/charts/artists/top?limit=10

# Get rising artists
curl http://localhost:5001/api/charts/artists/rising?limit=10

# Get genres
curl http://localhost:5001/api/charts/genres

# Search artists
curl "http://localhost:5001/api/charts/search?q=taylor&limit=5"

# Get specific artist
curl http://localhost:5001/api/charts/artists/{ARTIST_ID}

# Get artist history
curl http://localhost:5001/api/charts/artists/{ARTIST_ID}/history
```

### 4. Test Last.fm Import (Admin Required)

If you have admin credentials, you can import real data from Last.fm:

```bash
# Import top 100 artists from Last.fm
curl -X POST http://localhost:5001/api/charts/admin/import/lastfm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"limit": 100}'

# Import by genre
curl -X POST http://localhost:5001/api/charts/admin/import/genre \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"genre": "indie", "limit": 50}'

# Update all scores after import
curl -X POST http://localhost:5001/api/charts/admin/update-scores \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Test Frontend

1. Navigate to `http://localhost:3001/charts`
2. Or click "Trends" → "Charts" in the navigation menu
3. You should see:
   - Stats cards at the top
   - Filter options (Top Artists / Rising, Genre, Sort By)
   - Search functionality
   - Grid of artist cards
4. Click on any artist card to see the detailed artist page

## API Endpoints Reference

### Public Endpoints

- `GET /api/charts/artists/top` - Get top artists
  - Query params: `limit`, `offset`, `sortBy` (composite|momentum|reach)
- `GET /api/charts/artists/rising` - Get rising artists
  - Query params: `limit`, `offset`
- `GET /api/charts/artists/genre/:genre` - Get genre-specific charts
  - Query params: `limit`, `offset`
- `GET /api/charts/artists/:id` - Get single artist details
- `GET /api/charts/artists/:id/history` - Get score history
- `GET /api/charts/discover?seedArtistId=...` - Discover similar artists
- `GET /api/charts/search?q=...` - Search artists
- `GET /api/charts/genres` - Get list of genres
- `GET /api/charts/stats` - Get overall statistics

### Admin Endpoints (Require Authentication)

- `POST /api/charts/admin/seed-test-data` - Seed test data (no auth for testing)
- `POST /api/charts/admin/import/lastfm` - Import from Last.fm
- `POST /api/charts/admin/import/genre` - Import by genre
- `POST /api/charts/admin/import/listenbrainz` - Import from ListenBrainz
- `POST /api/charts/admin/import/fresh-releases` - Import fresh releases
- `POST /api/charts/admin/update-scores` - Recalculate all scores
- `POST /api/charts/admin/update-artist/:id` - Update single artist
- `GET /api/charts/admin/weights` - Get scoring weights
- `POST /api/charts/admin/weights` - Update scoring weights

## Scoring System

The charts use a composite scoring system with three main scores:

1. **Composite Score** (0-100): Overall performance across all platforms
   - Factors: Spotify followers, popularity, Last.fm listeners/playcount, ListenBrainz data, growth rates, cross-platform presence

2. **Momentum Score** (0-100): Growth rate over the past 7 days
   - Factors: Follower growth, listener growth, playcount growth

3. **Reach Score** (0-100): Total audience size across platforms
   - Factors: Total followers/listeners across Spotify, Last.fm, ListenBrainz

### Default Weights

```javascript
{
  spotifyFollowers: 0.15,
  spotifyPopularity: 0.10,
  lastfmListeners: 0.10,
  lastfmPlaycount: 0.08,
  listenbrainzListeners: 0.07,
  spotifyGrowth7d: 0.15,
  lastfmGrowth7d: 0.10,
  crossPlatformPresence: 0.10,
  playsPerListener: 0.08
}
```

Weights can be adjusted via the admin API.

## Troubleshooting

### "No artists found" on frontend
1. Make sure you've seeded test data or imported from Last.fm
2. Check that scores have been calculated: `POST /api/charts/admin/update-scores`
3. Verify MongoDB has data: Check your database directly

### Last.fm import fails
1. Verify `LASTFM_API_KEY` is set in `songiq/server/.env`
2. Check server logs for API errors
3. Last.fm has rate limits (5 requests/second) - the service includes delays

### Scores not updating
1. Run the update-scores endpoint: `POST /api/charts/admin/update-scores`
2. Check that artists have metrics data
3. Verify scoring engine is working: Check server logs

### Frontend not loading
1. Verify both servers are running (backend on 5001, frontend on 3001)
2. Check browser console for errors
3. Verify API_BASE_URL in frontend config points to correct backend

## Next Steps

1. ✅ Test with seed data
2. ✅ Verify frontend displays correctly
3. ⏭️ Import real data from Last.fm
4. ⏭️ Test ListenBrainz integration
5. ⏭️ Test MusicBrainz integration
6. ⏭️ Adjust scoring weights if needed
7. ⏭️ Add more genres/artists

## Files Modified/Created

### Backend
- `songiq/server/src/routes/charts.ts` - Chart routes
- `songiq/server/src/services/chartDataAggregator.ts` - Data aggregation
- `songiq/server/src/services/chartScoringEngine.ts` - Scoring engine
- `songiq/server/src/services/lastfmService.ts` - Last.fm service
- `songiq/server/src/services/listenbrainzService.ts` - ListenBrainz service
- `songiq/server/src/services/musicbrainzService.ts` - MusicBrainz service
- `songiq/server/src/models/UnifiedArtist.ts` - Artist model
- `songiq/server/src/models/UnifiedTrack.ts` - Track model
- `songiq/server/src/index.ts` - Registered charts routes

### Frontend
- `songiq/client/src/pages/ChartsPage.tsx` - Main charts page
- `songiq/client/src/pages/ChartArtistPage.tsx` - Artist detail page
- `songiq/client/src/components/ChartCard.tsx` - Artist card component
- `songiq/client/src/App.tsx` - Added charts routes
- `songiq/client/src/components/Navigation.tsx` - Updated charts link

### Documentation
- `LASTFM_SETUP.md` - Last.fm API setup guide
- `CHARTS_TESTING_GUIDE.md` - This file
- `test-charts.sh` - Testing script

