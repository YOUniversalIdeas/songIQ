# 🐘 Mastodon Setup Guide for songIQ News Section

This guide explains how Mastodon integration works in songIQ. **Good news: No setup required!** Mastodon integration works out of the box.

## Overview

The Mastodon integration uses the **Mastodon Public API** to fetch posts from various Mastodon instances. This integration:
- **Requires NO API keys** - uses public endpoints
- **Requires NO authentication** - fetches public posts only
- **Works immediately** - no configuration needed
- Fetches music-related posts from multiple Mastodon instances
- Filters posts by relevance to independent music

## How It Works

Mastodon is a **federated social network** - it's made up of many independent servers (called "instances"). The integration:

1. **Connects to multiple Mastodon instances**:
   - `mastodon.social` (general)
   - `mastodon.music` (music-focused)
   - `mastodon.art` (arts and music)
   - `mstdn.social` (general)

2. **Fetches from public timelines** - no authentication needed

3. **Filters posts** by:
   - Music relevance (minimum score: 30/100)
   - Date (only last 7 days)
   - Content quality (minimum 20 characters)

4. **Extracts metadata**:
   - Genres
   - Artists
   - Images (if attached)
   - Engagement metrics (likes, shares)

## No Configuration Required!

Unlike Instagram or SoundCloud, Mastodon integration works **immediately** with no setup:

- ✅ No API keys needed
- ✅ No account registration required
- ✅ No authentication tokens
- ✅ Works out of the box

Just restart your server and Mastodon posts will start appearing!

## Customization (Optional)

If you want to customize which Mastodon instances to use, you can edit:

**File:** `songiq/server/src/services/newsService.ts`

**Look for:**
```typescript
const MASTODON_INSTANCES = [
  'mastodon.social',
  'mastodon.music',
  'mastodon.art',
  'mstdn.social'
];
```

You can:
- Add more instances (e.g., `music.instance.social`)
- Remove instances that don't work
- Focus on music-specific instances

## How Posts Are Imported

1. **Public Timeline**: Fetches from each instance's public timeline
2. **Filtering**: Only imports posts that:
   - Are from the last 7 days
   - Have music-related content (relevance score ≥ 30)
   - Are not replies to other posts
   - Have meaningful content (≥ 20 characters)

3. **Processing**: Extracts:
   - Post text (HTML tags removed)
   - Images (if attached)
   - Author information
   - Engagement metrics

4. **Storage**: Saves to database with:
   - Source: `Mastodon: [instance name]`
   - Source Type: `mastodon`
   - Genres and artists extracted from content

## Viewing Mastodon Posts

Mastodon posts appear in:
- **News Page** → **Social Media** tab
- Styled with purple color scheme
- Shows author, content, images, and engagement metrics
- Click to view original post on Mastodon

## Rate Limiting

The integration includes rate limiting:
- 2 seconds between instances
- Respects Mastodon's rate limits
- Handles errors gracefully

## Troubleshooting

### "No Posts Found"

- **Check server logs** for specific error messages
- Some instances may be down or blocking requests
- Try adding different instances to `MASTODON_INSTANCES`

### "Instance Not Responding"

- Some Mastodon instances may be slow or unavailable
- The integration will skip unavailable instances and continue
- Check the instance status at [instances.social](https://instances.social/)

### "Posts Not Appearing"

- Verify the integration is running (check server logs)
- Ensure posts meet the relevance threshold (≥ 30)
- Check that posts are from the last 7 days
- Verify posts aren't being filtered as duplicates

## Finding Music-Focused Instances

If you want to add more music-focused Mastodon instances:

1. Visit [instances.social](https://instances.social/)
2. Search for "music" or "art"
3. Find instances with good uptime and user counts
4. Add them to `MASTODON_INSTANCES` array

Popular music instances:
- `mastodon.music`
- `music.instance.social`
- `metalhead.club` (metal music)
- `indiepocalypse.social` (indie music)

## Manual Fetching

You can manually trigger a Mastodon fetch:

```bash
curl -X POST http://localhost:5001/api/news/admin/fetch/mastodon \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Automatic Fetching

Mastodon posts are automatically fetched:
- Every 4 hours (via scheduled task)
- Along with other social media sources
- In the background (doesn't block other operations)

## Advantages Over Other Platforms

Mastodon integration is easier than:
- **Instagram**: No Business account, Facebook Page, or OAuth needed
- **SoundCloud**: No API key registration required
- **Twitter**: No developer account approval needed

Just works! 🎉

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify Mastodon instances are accessible
3. Test manually: `curl https://mastodon.social/api/v1/timelines/public?limit=5`
4. Check that posts meet filtering criteria

## Next Steps

Once your server is running:
1. Mastodon posts will automatically appear in the Social Media tab
2. Posts update every 4 hours
3. You can manually trigger fetches via the admin API
4. Customize instances as needed

Enjoy your Mastodon integration! 🐘🎵

