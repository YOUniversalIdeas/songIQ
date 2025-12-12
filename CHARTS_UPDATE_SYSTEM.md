# Charts Update System

## Overview

The charts system automatically updates artist metrics and scores on a scheduled basis. This ensures the charts always reflect current data from Last.fm, Spotify, and other sources.

## Automatic Updates

The chart update scheduler runs automatically when the server starts (unless disabled). It performs the following scheduled tasks:

### 1. **Daily Metrics Update** (2:00 AM)
- Updates all artist metrics from all sources:
  - Spotify: Followers, popularity, genres, images
  - Last.fm: Listeners, playcount
  - ListenBrainz: Listen counts
- Calculates growth metrics (7-day growth rates)
- Duration: ~5-15 minutes depending on number of artists

### 2. **Daily Score Recalculation** (3:00 AM)
- Recalculates composite, momentum, and reach scores for all artists
- Updates independent artist flags
- Updates track scores
- Runs after metrics update to use fresh data
- Duration: ~1-3 minutes

### 3. **Weekly Artist Import** (Sunday 1:00 AM)
- Imports top 50 new artists from Last.fm
- Fetches MusicBrainz and Spotify data for new artists
- Updates scores for newly imported artists
- Duration: ~20-30 minutes (due to rate limiting)

### 4. **Hourly Top Artists Update** (Every Hour)
- Lightweight update for top 100 artists only
- Updates Spotify metrics (followers, popularity)
- Recalculates scores for updated artists
- Duration: ~2-5 minutes

## Manual Updates

You can also trigger updates manually via admin endpoints:

### Update All Metrics
```bash
curl -X POST http://localhost:5001/api/charts/admin/update-metrics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update All Scores
```bash
curl -X POST http://localhost:5001/api/charts/admin/update-scores \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Single Artist
```bash
curl -X POST http://localhost:5001/api/charts/admin/update-artist/ARTIST_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Check Scheduler Status
```bash
curl http://localhost:5001/api/charts/admin/scheduler-status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Disabling Automatic Updates

To disable the automatic scheduler, set this environment variable:

```bash
ENABLE_CHART_SCHEDULER=false
```

Or remove/comment out the scheduler initialization in `songiq/server/src/index.ts`.

## Update Process Flow

```
1. Metrics Update (Daily 2 AM)
   ├── Fetch Spotify data for all artists
   ├── Fetch Last.fm data for all artists
   ├── Fetch ListenBrainz data for all artists
   └── Calculate growth metrics

2. Score Recalculation (Daily 3 AM)
   ├── Calculate composite scores
   ├── Calculate momentum scores
   ├── Calculate reach scores
   └── Update independent flags

3. Weekly Import (Sunday 1 AM)
   ├── Import new artists from Last.fm
   ├── Fetch MusicBrainz IDs
   ├── Fetch Spotify IDs and data
   └── Calculate initial scores

4. Hourly Top Artists (Every Hour)
   ├── Update Spotify metrics for top 100
   └── Recalculate scores for updated artists
```

## Rate Limiting

The update system respects API rate limits:
- **Last.fm**: 5 requests/second (200ms delay between requests)
- **MusicBrainz**: 1 request/second (1000ms delay)
- **Spotify**: Uses existing rate limiting in spotifyService

## Monitoring

Check server logs for update status:
- `🔄 Starting daily metrics update...`
- `✅ Daily metrics update completed in Xs`
- `❌ Daily metrics update failed: [error]`

## Data Freshness

- **Top 100 Artists**: Updated hourly
- **All Artists**: Updated daily
- **New Artists**: Imported weekly
- **Scores**: Recalculated daily (after metrics update)

## Troubleshooting

### Charts not updating
1. Check scheduler is enabled: `GET /api/charts/admin/scheduler-status`
2. Check server logs for errors
3. Verify API keys are set (LASTFM_API_KEY, SPOTIFY_CLIENT_ID, etc.)
4. Manually trigger update to test

### Updates taking too long
- Reduce the number of artists being updated
- Check API rate limits aren't being hit
- Consider running updates during off-peak hours

### Missing data
- Run manual metrics update: `POST /api/charts/admin/update-metrics`
- Check that artists have external IDs (Spotify, Last.fm)
- Verify API keys are valid

## Configuration

Update schedules can be modified in `songiq/server/src/services/chartUpdateScheduler.ts`:

```typescript
// Change daily update time
this.scheduleDaily('full-metrics-update', this.updateAllMetrics, 2); // 2 AM

// Change weekly import day/time
this.scheduleWeekly('import-new-artists', this.importNewArtists, 0, 1); // Sunday 1 AM

// Change hourly update interval
this.scheduleHourly('top-artists-update', this.updateTopArtists); // Every hour
```

