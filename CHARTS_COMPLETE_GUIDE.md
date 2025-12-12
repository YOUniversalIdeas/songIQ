# Independent Artist Charts - Complete Guide

## Overview

The charts feature provides real-time rankings of independent artists based on data aggregated from multiple sources (Last.fm, Spotify, MusicBrainz, ListenBrainz). The system uses a proprietary algorithm that combines Spotify and MusicBrainz data to create enriched artist profiles.

## Key Features

✅ **Independent Artist Focus**: Only shows artists that meet independent criteria
✅ **Multi-Source Data**: Aggregates data from Last.fm, Spotify, MusicBrainz, ListenBrainz
✅ **Proprietary Algorithm**: Uses MusicBrainz as bridge to combine Spotify + Last.fm data
✅ **Automatic Updates**: Scheduled jobs keep charts fresh
✅ **Real-Time Scores**: Composite, momentum, and reach scores

## Independent Artist Criteria

An artist is considered independent if they meet ALL of these criteria:

- **Spotify followers** < 1,000,000 (1M)
- **Spotify popularity** < 70 (out of 100)
- **Last.fm listeners** < 500,000 (500K)
- **Not on major labels** (Universal, Sony, Warner, etc.)
- **Composite score** < 60 (or has low follower count)

## Update Schedule

### Automatic Updates (Enabled by Default)

1. **Daily Metrics Update** (2:00 AM)
   - Fetches latest data from all sources
   - Updates Spotify followers, popularity
   - Updates Last.fm listeners, playcount
   - Calculates 7-day growth rates

2. **Daily Score Recalculation** (3:00 AM)
   - Recalculates composite, momentum, reach scores
   - Updates independent artist flags
   - Updates track scores

3. **Weekly Artist Import** (Sunday 1:00 AM)
   - Imports top 50 new artists from Last.fm
   - Fetches MusicBrainz and Spotify data
   - Calculates initial scores

4. **Hourly Top Artists Update** (Every Hour)
   - Lightweight update for top 100 artists
   - Updates Spotify metrics only
   - Recalculates scores for updated artists

### Manual Updates

You can trigger updates manually via admin API:

```bash
# Update all metrics
POST /api/charts/admin/update-metrics

# Update all scores
POST /api/charts/admin/update-scores

# Update single artist
POST /api/charts/admin/update-artist/:id

# Check scheduler status
GET /api/charts/admin/scheduler-status
```

## Data Sources & Integration

### 1. Last.fm
- **What**: Listener counts, playcounts, artist tags
- **How**: Direct API calls to Last.fm
- **Update Frequency**: Daily

### 2. MusicBrainz (Bridge Service)
- **What**: Canonical artist IDs, external service links
- **How**: Used to connect Last.fm artists to Spotify
- **Update Frequency**: During import

### 3. Spotify (via MusicBrainz)
- **What**: Followers, popularity, genres, images
- **How**: MusicBrainz provides Spotify ID → Fetch from Spotify API
- **Update Frequency**: Daily (all), Hourly (top 100)

### 4. ListenBrainz
- **What**: Listen counts, listener stats
- **How**: Direct API calls
- **Update Frequency**: Daily

## Scoring System

### Composite Score (0-100)
Overall performance across all platforms:
- Spotify followers (15%)
- Spotify popularity (10%)
- Last.fm listeners (10%)
- Last.fm playcount (8%)
- ListenBrainz listeners (7%)
- Spotify growth 7d (15%)
- Last.fm growth 7d (10%)
- Cross-platform presence (10%)
- Plays per listener (8%)

### Momentum Score (0-100)
Growth and engagement indicators:
- **With Growth Data**: Uses actual 7-day growth rates
- **Without Growth Data**: Uses engagement metrics:
  - Plays per listener ratio
  - Cross-platform presence
  - Spotify popularity (40-70 range = momentum)
  - Listener counts (10K-200K = sweet spot)
  - Recent activity indicators

### Reach Score (0-100)
Total audience size:
- Spotify followers (40%)
- Last.fm listeners (30%)
- ListenBrainz listeners (30%)

## API Endpoints

### Public Endpoints

- `GET /api/charts/artists/top` - Top independent artists
- `GET /api/charts/artists/rising` - Rising independent artists
- `GET /api/charts/artists/genre/:genre` - Genre-specific charts
- `GET /api/charts/artists/:id` - Artist details
- `GET /api/charts/artists/:id/history` - Score history
- `GET /api/charts/discover?seedArtistId=...` - Discover similar artists
- `GET /api/charts/search?q=...` - Search artists
- `GET /api/charts/genres` - List of genres
- `GET /api/charts/stats` - Overall statistics

### Admin Endpoints

- `POST /api/charts/admin/import/lastfm` - Import from Last.fm
- `POST /api/charts/admin/import/genre` - Import by genre tag
- `POST /api/charts/admin/import/listenbrainz` - Import from ListenBrainz
- `POST /api/charts/admin/update-metrics` - Update all metrics
- `POST /api/charts/admin/update-scores` - Recalculate all scores
- `POST /api/charts/admin/update-artist/:id` - Update single artist
- `GET /api/charts/admin/scheduler-status` - Check scheduler status
- `GET /api/charts/admin/weights` - Get scoring weights
- `POST /api/charts/admin/weights` - Update scoring weights

## Frontend

Visit: **http://localhost:3001/charts**

Features:
- Top Artists view
- Rising Artists view
- Genre filtering
- Search functionality
- Individual artist detail pages
- Score history charts
- Platform metrics display

## Configuration

### Enable/Disable Scheduler

Set environment variable:
```bash
ENABLE_CHART_SCHEDULER=false  # Disable automatic updates
```

### Change Update Times

Edit `songiq/server/src/services/chartUpdateScheduler.ts`:
```typescript
// Daily update at 2 AM
this.scheduleDaily('full-metrics-update', this.updateAllMetrics, 2);

// Weekly import Sunday at 1 AM
this.scheduleWeekly('import-new-artists', this.importNewArtists, 0, 1);
```

### Adjust Scoring Weights

Use admin API:
```bash
POST /api/charts/admin/weights
{
  "weights": {
    "spotifyFollowers": 0.20,
    "spotifyPopularity": 0.10,
    ...
  }
}
```

## Troubleshooting

### Charts showing mainstream artists
- Run: `POST /api/charts/admin/update-scores` to update independent flags
- Check independent thresholds in `independentArtistDetector.ts`

### Momentum scores all the same
- This happens when growth data isn't available
- Scores will vary once metrics are updated
- Run: `POST /api/charts/admin/update-metrics` to fetch latest data

### Scheduler not running
- Check: `GET /api/charts/admin/scheduler-status`
- Verify `ENABLE_CHART_SCHEDULER` is not set to `false`
- Check server logs for scheduler startup messages

### No artists showing
- Import artists: `POST /api/charts/admin/import/genre` with genre "indie"
- Or seed test data: `POST /api/charts/admin/seed-test-data`
- Update scores: `POST /api/charts/admin/update-scores`

## Files

### Backend
- `songiq/server/src/routes/charts.ts` - Chart API routes
- `songiq/server/src/services/chartDataAggregator.ts` - Data aggregation
- `songiq/server/src/services/chartScoringEngine.ts` - Score calculation
- `songiq/server/src/services/chartUpdateScheduler.ts` - Automatic updates
- `songiq/server/src/services/independentArtistDetector.ts` - Indie detection
- `songiq/server/src/services/lastfmService.ts` - Last.fm integration
- `songiq/server/src/services/musicbrainzService.ts` - MusicBrainz bridge
- `songiq/server/src/models/UnifiedArtist.ts` - Artist model

### Frontend
- `songiq/client/src/pages/ChartsPage.tsx` - Main charts page
- `songiq/client/src/pages/ChartArtistPage.tsx` - Artist detail page
- `songiq/client/src/components/ChartCard.tsx` - Artist card component

## Next Steps

1. ✅ Import more independent artists by genre
2. ✅ Let automatic updates run to build historical data
3. ✅ Monitor scheduler logs for update status
4. ⏭️ Adjust scoring weights based on results
5. ⏭️ Add more data sources if needed

