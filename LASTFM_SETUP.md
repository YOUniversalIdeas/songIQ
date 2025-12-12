# Last.fm API Setup Guide

## Step 1: Get Your API Key

1. Visit: **https://www.last.fm/api/account/create**
2. Sign in with your Last.fm account (or create one - it's free)
3. Fill out the application form:
   - **Application name:** `songIQ`
   - **Description:** `Music intelligence platform for artist charts`
   - **Callback URL:** `http://localhost:3001`
   - **Application website:** `https://songiq.ai`
4. Click "Submit" and **copy your API key**

## Step 2: Add to Environment Variables

Add your API key to `songiq/server/.env`:

```bash
LASTFM_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the key you copied.

## Step 3: Restart Your Server

After adding the API key, restart your backend server:

```bash
cd songiq/server
npm run dev
```

## Step 4: Import Real Data

Once your server is running with the API key, you can import real artist data:

### Option A: Import Top Artists (Recommended)

```bash
curl -X POST http://localhost:5001/api/charts/admin/import/lastfm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"limit": 100}'
```

This will import the top 100 artists from Last.fm charts.

### Option B: Import by Genre

```bash
# Import indie artists
curl -X POST http://localhost:5001/api/charts/admin/import/genre \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"genre": "indie", "limit": 50}'

# Import electronic artists
curl -X POST http://localhost:5001/api/charts/admin/import/genre \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"genre": "electronic", "limit": 50}'
```

### Option C: Update Scores

After importing, calculate scores:

```bash
curl -X POST http://localhost:5001/api/charts/admin/update-scores \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## What Data You'll Get

Last.fm provides:
- **Artist listeners** - Total unique listeners
- **Playcount** - Total track plays
- **Tags/Genres** - Artist genres and tags
- **Growth metrics** - 7-day growth rates
- **Artist images** - Profile pictures

## Rate Limits

- Last.fm allows **5 requests per second**
- The import functions have built-in delays (200ms between requests)
- For 100 artists, expect ~20-30 seconds

## Troubleshooting

### "Last.fm service not configured"
- Make sure `LASTFM_API_KEY` is in your `.env` file
- Restart your server after adding the key
- Check that there are no extra spaces in the `.env` file

### Rate limiting errors
- The service has built-in delays, but if you see errors, wait a few seconds and try again
- Reduce the `limit` parameter if importing large batches

### No data appearing
1. Check that imports completed successfully (check server logs)
2. Run the score update: `POST /api/charts/admin/update-scores`
3. Verify MongoDB has the data: Check your database directly

## Testing Without Admin Auth

For testing, you can use the test data seeder (no auth required):

```bash
curl -X POST http://localhost:5001/api/charts/admin/seed-test-data \
  -H "Content-Type: application/json"
```

This creates 8 test artists with realistic metrics.

