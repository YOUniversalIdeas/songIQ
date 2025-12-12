import express from 'express';
import UnifiedArtist from '../models/UnifiedArtist';
import UnifiedTrack from '../models/UnifiedTrack';
import { authenticateToken } from '../middleware/auth';
import { requireAdminOrSuperAdmin } from '../middleware/adminAuth';
import chartDataAggregator from '../services/chartDataAggregator';
import trackDataAggregator from '../services/trackDataAggregator';
import chartScoringEngine, { DEFAULT_WEIGHTS } from '../services/chartScoringEngine';
import * as musicbrainzService from '../services/musicbrainzService';
import independentArtistDetector from '../services/independentArtistDetector';

const router = express.Router();

// Store scoring weights (can be updated via admin API)
let currentWeights: typeof DEFAULT_WEIGHTS = { ...DEFAULT_WEIGHTS };

// ==================== PUBLIC ENDPOINTS ====================

/**
 * GET /api/charts/artists/top
 * Get top artists by composite score
 */
router.get('/artists/top', async (req, res) => {
  try {
    const { limit = 50, offset = 0, sortBy = 'composite' } = req.query;

    let sortField = 'compositeScore';
    if (sortBy === 'momentum') sortField = 'momentumScore';
    if (sortBy === 'reach') sortField = 'reachScore';

    // Filter for independent artists
    // Show all independent artists, even if score is 0 (they'll be sorted by score anyway)
    const query: any = {
      isIndependent: true
    };
    
    // Only filter by score if explicitly requested
    if (req.query.minScore) {
      query.compositeScore = { $gte: Number(req.query.minScore) };
    }

    const artists = await UnifiedArtist.find(query)
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('-scoreHistory'); // Exclude history for list views

    const total = await UnifiedArtist.countDocuments(query);

    res.json({
      artists,
      total,
      hasMore: Number(offset) + artists.length < total
    });
  } catch (error: any) {
    console.error('Error fetching top artists:', error);
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
});

/**
 * GET /api/charts/artists/rising
 * Get rising artists (high momentum)
 */
router.get('/artists/rising', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // Filter for independent artists with momentum (rising artists)
    // Show artists with any momentum, prioritizing higher momentum
    const artists = await UnifiedArtist.find({ 
      momentumScore: { $gt: 0 }, // Any momentum for rising artists
      isIndependent: true 
    })
      .sort({ momentumScore: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('-scoreHistory');

    const total = await UnifiedArtist.countDocuments({ 
      momentumScore: { $gt: 0 },
      isIndependent: true 
    });

    res.json({
      artists,
      total,
      hasMore: Number(offset) + artists.length < total
    });
  } catch (error: any) {
    console.error('Error fetching rising artists:', error);
    res.status(500).json({ error: 'Failed to fetch rising artists' });
  }
});

/**
 * GET /api/charts/artists/genre/:genre
 * Get genre-specific charts
 */
router.get('/artists/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Filter for independent artists
    const artists = await UnifiedArtist.find({
      genres: { $in: [new RegExp(genre, 'i')] },
      compositeScore: { $gt: 0 },
      isIndependent: true
    })
      .sort({ compositeScore: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('-scoreHistory');

    const total = await UnifiedArtist.countDocuments({
      genres: { $in: [new RegExp(genre, 'i')] },
      compositeScore: { $gt: 0 },
      isIndependent: true
    });

    res.json({
      artists,
      total,
      hasMore: Number(offset) + artists.length < total
    });
  } catch (error: any) {
    console.error('Error fetching genre artists:', error);
    res.status(500).json({ error: 'Failed to fetch genre artists' });
  }
});

/**
 * GET /api/charts/artists/:id
 * Get single artist details
 */
router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await UnifiedArtist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json({ artist });
  } catch (error: any) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

/**
 * GET /api/charts/artists/:id/history
 * Get score history for an artist
 */
router.get('/artists/:id/history', async (req, res) => {
  try {
    const artist = await UnifiedArtist.findById(req.params.id)
      .select('scoreHistory name');

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    res.json({
      artistId: artist._id,
      artistName: artist.name,
      history: artist.scoreHistory || []
    });
  } catch (error: any) {
    console.error('Error fetching artist history:', error);
    res.status(500).json({ error: 'Failed to fetch artist history' });
  }
});

/**
 * GET /api/charts/discover
 * Discover similar artists
 */
router.get('/discover', async (req, res) => {
  try {
    const { seedArtistId } = req.query;

    if (!seedArtistId) {
      return res.status(400).json({ error: 'seedArtistId is required' });
    }

    const seedArtist = await UnifiedArtist.findById(seedArtistId);
    if (!seedArtist) {
      return res.status(404).json({ error: 'Seed artist not found' });
    }

    // Find independent artists with similar genres
    const similarArtists = await UnifiedArtist.find({
      _id: { $ne: seedArtistId },
      genres: { $in: seedArtist.genres || [] },
      compositeScore: { $gt: 0 },
      isIndependent: true
    })
      .sort({ compositeScore: -1 })
      .limit(20)
      .select('-scoreHistory');

    res.json({ artists: similarArtists });
  } catch (error: any) {
    console.error('Error discovering artists:', error);
    res.status(500).json({ error: 'Failed to discover artists' });
  }
});

/**
 * GET /api/charts/search
 * Search artists
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Filter for independent artists only
    const artists = await UnifiedArtist.find({
      $text: { $search: q as string },
      isIndependent: true
    })
      .sort({ compositeScore: -1 })
      .limit(Number(limit))
      .select('-scoreHistory');

    res.json({ artists });
  } catch (error: any) {
    console.error('Error searching artists:', error);
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

/**
 * GET /api/charts/genres
 * Get list of genres with counts
 */
router.get('/genres', async (req, res) => {
  try {
    // Only count genres from independent artists
    const artists = await UnifiedArtist.find({ 
      genres: { $exists: true, $ne: [] },
      isIndependent: true
    });
    
    const genreCounts: Record<string, number> = {};
    artists.forEach(artist => {
      (artist.genres || []).forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    const genres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ genres });
  } catch (error: any) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

/**
 * GET /api/charts/stats
 * Get overall statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Only count independent artists
    const totalArtists = await UnifiedArtist.countDocuments({ isIndependent: true });
    const artistsWithScores = await UnifiedArtist.countDocuments({ 
      compositeScore: { $gt: 0 },
      isIndependent: true 
    });
    // Only aggregate independent artists
    const avgScore = await UnifiedArtist.aggregate([
      { $match: { compositeScore: { $gt: 0 }, isIndependent: true } },
      { $group: { _id: null, avg: { $avg: '$compositeScore' } } }
    ]);

    const topArtist = await UnifiedArtist.findOne({ isIndependent: true })
      .sort({ compositeScore: -1 })
      .select('name compositeScore');

    const risingArtist = await UnifiedArtist.findOne({ isIndependent: true })
      .sort({ momentumScore: -1 })
      .select('name momentumScore');

    res.json({
      totalArtists,
      artistsWithScores,
      averageScore: avgScore[0]?.avg || 0,
      topArtist: topArtist ? {
        name: topArtist.name,
        score: topArtist.compositeScore
      } : null,
      risingArtist: risingArtist ? {
        name: risingArtist.name,
        score: risingArtist.momentumScore
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * POST /api/charts/admin/import/lastfm
 * Import artists from Last.fm
 */
router.post('/admin/import/lastfm', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.body;

    const imported = await chartDataAggregator.importFromLastfm(limit);

    res.json({
      success: true,
      imported,
      message: `Imported ${imported} artists from Last.fm`
    });
  } catch (error: any) {
    console.error('Error importing from Last.fm:', error);
    res.status(500).json({ error: 'Failed to import from Last.fm' });
  }
});

/**
 * POST /api/charts/admin/import/genre
 * Import artists by genre
 */
router.post('/admin/import/genre', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { genre, limit = 50 } = req.body;

    if (!genre) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    const imported = await chartDataAggregator.importByGenre(genre, limit);

    res.json({
      success: true,
      imported,
      message: `Imported ${imported} artists for genre ${genre}`
    });
  } catch (error: any) {
    console.error('Error importing by genre:', error);
    res.status(500).json({ error: 'Failed to import by genre' });
  }
});

/**
 * POST /api/charts/admin/import/listenbrainz
 * Import from ListenBrainz
 */
router.post('/admin/import/listenbrainz', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { limit = 100, range = 'week' } = req.body;

    const imported = await chartDataAggregator.importFromListenBrainz(limit, range);

    res.json({
      success: true,
      imported,
      message: `Imported ${imported} artists from ListenBrainz`
    });
  } catch (error: any) {
    console.error('Error importing from ListenBrainz:', error);
    res.status(500).json({ error: 'Failed to import from ListenBrainz' });
  }
});

/**
 * POST /api/charts/admin/import/fresh-releases
 * Import fresh releases
 */
router.post('/admin/import/fresh-releases', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { daysBack = 14 } = req.body;

    const imported = await chartDataAggregator.importFreshReleases(daysBack);

    res.json({
      success: true,
      imported,
      message: `Imported ${imported} fresh releases`
    });
  } catch (error: any) {
    console.error('Error importing fresh releases:', error);
    res.status(500).json({ error: 'Failed to import fresh releases' });
  }
});

/**
 * POST /api/charts/admin/seed-test-data
 * Seed test data (no auth required for testing)
 */
router.post('/admin/seed-test-data', async (req, res) => {
  try {
    const testArtists = [
      {
        name: 'Taylor Swift',
        genres: ['pop', 'country', 'indie'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 95000000,
            popularity: 95,
            followersGrowth7d: 500000,
            followersGrowthPct7d: 0.53
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 12000000,
            playcount: 500000000,
            listenersGrowth7d: 100000,
            playcountGrowth7d: 5000000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb712d4e8e0e0c3e7c0c5c5c5c',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '06HL4z0CvFAxyc27GXpf02'
        }
      },
      {
        name: 'The Weeknd',
        genres: ['r&b', 'pop', 'electronic'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 75000000,
            popularity: 92,
            followersGrowth7d: 300000,
            followersGrowthPct7d: 0.40
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 8500000,
            playcount: 350000000,
            listenersGrowth7d: 80000,
            playcountGrowth7d: 3500000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb1a5b5b5b5b5b5b5b5b5b5b5b',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '1Xyo4u8uXC1ZmMpatF05PJ'
        }
      },
      {
        name: 'Billie Eilish',
        genres: ['indie', 'pop', 'alternative'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 85000000,
            popularity: 93,
            followersGrowth7d: 400000,
            followersGrowthPct7d: 0.47
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 9500000,
            playcount: 400000000,
            listenersGrowth7d: 90000,
            playcountGrowth7d: 4000000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb2c2c2c2c2c2c2c2c2c2c2c2c',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '6qqNVTkY8uBg9cP3Jd7DAH'
        }
      },
      {
        name: 'Drake',
        genres: ['hip-hop', 'rap', 'r&b'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 110000000,
            popularity: 98,
            followersGrowth7d: 600000,
            followersGrowthPct7d: 0.55
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 15000000,
            playcount: 600000000,
            listenersGrowth7d: 120000,
            playcountGrowth7d: 6000000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb3c3c3c3c3c3c3c3c3c3c3c3c',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '3TVXtAsR1Inumwj472S9r4'
        }
      },
      {
        name: 'Ariana Grande',
        genres: ['pop', 'r&b'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 90000000,
            popularity: 94,
            followersGrowth7d: 450000,
            followersGrowthPct7d: 0.50
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 11000000,
            playcount: 450000000,
            listenersGrowth7d: 100000,
            playcountGrowth7d: 4500000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb4d4d4d4d4d4d4d4d4d4d4d4d',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '66CXWjxzNUsdJxJ2JdwvnR'
        }
      },
      {
        name: 'Ed Sheeran',
        genres: ['pop', 'folk', 'acoustic'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 105000000,
            popularity: 96,
            followersGrowth7d: 550000,
            followersGrowthPct7d: 0.53
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 13000000,
            playcount: 550000000,
            listenersGrowth7d: 110000,
            playcountGrowth7d: 5500000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb5e5e5e5e5e5e5e5e5e5e5e5e5e',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '6eUKZXaKkcviH0Ku9w2n3V'
        }
      },
      {
        name: 'Post Malone',
        genres: ['hip-hop', 'pop', 'rock'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 70000000,
            popularity: 90,
            followersGrowth7d: 350000,
            followersGrowthPct7d: 0.50
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 8000000,
            playcount: 320000000,
            listenersGrowth7d: 75000,
            playcountGrowth7d: 3200000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb6f6f6f6f6f6f6f6f6f6f6f6f6f',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '246dkjvS1zLTtiykXe5h60'
        }
      },
      {
        name: 'Dua Lipa',
        genres: ['pop', 'dance', 'electronic'],
        metrics: {
          spotify: {
            timestamp: new Date(),
            source: 'spotify',
            followers: 80000000,
            popularity: 91,
            followersGrowth7d: 400000,
            followersGrowthPct7d: 0.50
          },
          lastfm: {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: 9000000,
            playcount: 380000000,
            listenersGrowth7d: 85000,
            playcountGrowth7d: 3800000
          }
        },
        images: [{
          url: 'https://i.scdn.co/image/ab6761610000e5eb7g7g7g7g7g7g7g7g7g7g7g7g',
          source: 'spotify'
        }],
        externalIds: {
          spotify: '6M2wZ9GZgrQXHCFfjv46we'
        }
      }
    ];

    // Create or update artists
    for (const artistData of testArtists) {
      let artist = await UnifiedArtist.findOne({ name: artistData.name });
      
      if (artist) {
        // Update existing
        await UnifiedArtist.findByIdAndUpdate(artist._id, artistData);
      } else {
        // Create new
        artist = new UnifiedArtist(artistData);
        await artist.save();
      }
    }

    // Calculate scores for all artists
    await chartScoringEngine.updateAllArtistScores(currentWeights);
    
    // Update independent flags for all artists
    await independentArtistDetector.updateAllIndependentFlags();

    const count = await UnifiedArtist.countDocuments({ isIndependent: true });

    res.json({
      success: true,
      message: `Seeded ${testArtists.length} test artists`,
      totalArtists: count
    });
  } catch (error: any) {
    console.error('Error seeding test data:', error);
    res.status(500).json({ error: 'Failed to seed test data', details: error.message });
  }
});

/**
 * POST /api/charts/admin/update-scores
 * Recalculate all scores
 */
router.post('/admin/update-scores', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    await chartScoringEngine.updateAllArtistScores(currentWeights);
    await chartScoringEngine.updateAllTrackScores();
    
    // Update independent flags after scoring
    await independentArtistDetector.updateAllIndependentFlags();

    res.json({
      success: true,
      message: 'All scores and independent flags updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating scores:', error);
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

/**
 * POST /api/charts/admin/fetch-spotify-ids
 * Fetch Spotify IDs for artists that don't have them
 */
router.post('/admin/fetch-spotify-ids', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const fetched = await chartDataAggregator.fetchSpotifyIdsForArtists();
    res.json({ 
      success: true,
      message: `Fetched Spotify IDs for ${fetched} artists`,
      fetched 
    });
  } catch (error: any) {
    console.error('Error fetching Spotify IDs:', error);
    res.status(500).json({ error: 'Failed to fetch Spotify IDs' });
  }
});

/**
 * POST /api/charts/admin/update-metrics
 * Update all artist and track metrics from all sources
 */
router.post('/admin/update-metrics', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    // Update artist metrics
    await chartDataAggregator.updateAllArtistMetrics();
    
    // Update track metrics
    await trackDataAggregator.updateAllTrackMetrics();
    
    res.json({
      success: true,
      message: 'All artist and track metrics updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating metrics:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

/**
 * POST /api/charts/admin/update-artist-images
 * Update artist images for artists that don't have them
 */
router.post('/admin/update-artist-images', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    await chartDataAggregator.updateArtistImages();
    
    res.json({
      success: true,
      message: 'Artist images updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating artist images:', error);
    res.status(500).json({ error: 'Failed to update artist images', details: error.message });
  }
});

/**
 * GET /api/charts/admin/scheduler-status
 * Get chart update scheduler status
 */
router.get('/admin/scheduler-status', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const chartUpdateScheduler = await import('../services/chartUpdateScheduler');
    const status = chartUpdateScheduler.default.getStatus();
    
    res.json({
      success: true,
      scheduler: status
    });
  } catch (error: any) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * GET /api/charts/admin/test-spotify-search
 * Test Spotify search for a specific track (for debugging)
 */
router.get('/admin/test-spotify-search', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { trackName, artistName } = req.query;
    
    if (!trackName || !artistName) {
      return res.status(400).json({ 
        error: 'trackName and artistName query parameters are required' 
      });
    }

    const spotifyService = await import('../services/spotifyService');
    const searchQuery = `track:${trackName} artist:${artistName}`;
    
    console.log(`🔍 Testing Spotify search: ${searchQuery}`);
    
    const searchResults = await spotifyService.default.searchTracks(searchQuery, 5);
    
    const results = searchResults.tracks.map((track: any) => ({
      name: track.name,
      artists: track.artists.map((a: any) => a.name),
      spotifyId: track.id,
      album: track.album.name,
      hasImages: track.album.images?.length > 0,
      imageUrl: track.album.images?.[0]?.url,
      popularity: track.popularity
    }));

    res.json({
      success: true,
      query: searchQuery,
      found: searchResults.tracks.length,
      total: searchResults.total,
      results
    });
  } catch (error: any) {
    console.error('Error testing Spotify search:', error);
    res.status(500).json({ 
      error: 'Failed to test Spotify search', 
      details: error.message 
    });
  }
});

/**
 * POST /api/charts/admin/update-artist/:id
 * Update single artist
 */
router.post('/admin/update-artist/:id', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const artistId = req.params.id;
    
    await chartScoringEngine.updateArtistScore(artistId, currentWeights);

    const artist = await UnifiedArtist.findById(artistId);

    res.json({
      success: true,
      artist,
      message: 'Artist updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating artist:', error);
    res.status(500).json({ error: 'Failed to update artist' });
  }
});

/**
 * GET /api/charts/admin/weights
 * Get current scoring weights
 */
router.get('/admin/weights', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    res.json({ weights: currentWeights });
  } catch (error: any) {
    console.error('Error fetching weights:', error);
    res.status(500).json({ error: 'Failed to fetch weights' });
  }
});

/**
 * POST /api/charts/admin/weights
 * Update scoring weights
 */
router.post('/admin/weights', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const newWeights = req.body.weights;

    // Validate weights sum to ~1.0
    const total = (Object.values(newWeights) as number[]).reduce((sum: number, val: number) => {
      return sum + (typeof val === 'number' ? val : 0);
    }, 0);
    const diff = total - 1.0;
    if (Math.abs(diff) > 0.1) {
      return res.status(400).json({ 
        error: 'Weights must sum to approximately 1.0',
        currentSum: total
      });
    }

    currentWeights = { ...currentWeights, ...newWeights };

    // Recalculate all scores with new weights
    await chartScoringEngine.updateAllArtistScores(currentWeights);

    res.json({
      success: true,
      weights: currentWeights,
      message: 'Weights updated and scores recalculated'
    });
  } catch (error: any) {
    console.error('Error updating weights:', error);
    res.status(500).json({ error: 'Failed to update weights' });
  }
});

// ==================== TRACK CHARTS ENDPOINTS ====================

/**
 * GET /api/charts/tracks/top
 * Get top tracks by composite score (independent artists only)
 */
router.get('/tracks/top', async (req, res) => {
  try {
    const { limit = 50, offset = 0, sortBy = 'composite', genre } = req.query;

    let sortField = 'compositeScore';
    if (sortBy === 'momentum') sortField = 'momentumScore';

    // Build query - only current tracks from independent artists
    const query: any = {};

    // Filter by genre if provided
    if (genre) {
      query.genres = { $in: [genre] };
    }

    // Filter for recent tracks only (last 3 years) - Billboard-style current charts
    // But be flexible: if no release date, allow tracks with any momentum or recent creation
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    
    // Build recency filter - prefer recent tracks but don't exclude all old tracks if they have momentum
    const recencyFilter: any[] = [
      { releaseDate: { $gte: threeYearsAgo } }, // Has release date in last 3 years
      { createdAt: { $gte: threeYearsAgo } } // Or was added to our system recently
    ];
    
    // If track has no release date, require it to have momentum (indicating current activity)
    // This allows tracks without release dates but with current momentum
    recencyFilter.push({
      $and: [
        { releaseDate: { $exists: false } },
        { $or: [
          { momentumScore: { $gte: 5 } },
          { compositeScore: { $gt: 0 } } // Or at least has some score
        ]}
      ]
    });
    
    query.$or = recencyFilter;

    // Get independent artist IDs (with momentum requirement relaxed - just need to be independent)
    const independentArtists = await UnifiedArtist.find({ 
      isIndependent: true
    })
      .select('_id');
    const independentArtistIds = independentArtists.map(a => a._id);
    
    // If no independent artists, return empty result
    if (independentArtistIds.length === 0) {
      return res.json({ tracks: [], total: 0, hasMore: false });
    }

    query.artistId = { $in: independentArtistIds };
    
    // Only filter by score if explicitly requested
    if (req.query.minScore) {
      query.compositeScore = { $gte: Number(req.query.minScore) };
    }

    const tracks = await UnifiedTrack.find(query)
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('artistId', 'name images genres')
      .select('-scoreHistory');

    const total = await UnifiedTrack.countDocuments(query);

    res.json({
      tracks,
      total,
      hasMore: Number(offset) + tracks.length < total
    });
  } catch (error: any) {
    console.error('Error fetching top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch top tracks' });
  }
});

/**
 * GET /api/charts/tracks/genre/:genre
 * Get top tracks by genre (independent artists only)
 */
router.get('/tracks/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 50, offset = 0, sortBy = 'composite' } = req.query;

    let sortField = 'compositeScore';
    if (sortBy === 'momentum') sortField = 'momentumScore';

    // Filter for recent tracks only (last 3 years)
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Get independent artist IDs
    const independentArtists = await UnifiedArtist.find({ 
      isIndependent: true
    })
      .select('_id');
    const independentArtistIds = independentArtists.map(a => a._id);
    
    if (independentArtistIds.length === 0) {
      return res.json({ tracks: [], total: 0, genre, hasMore: false });
    }

    // Build recency filter similar to top tracks
    const threeYearsAgoGenre = new Date();
    threeYearsAgoGenre.setFullYear(threeYearsAgoGenre.getFullYear() - 3);
    const recencyFilter: any[] = [
      { releaseDate: { $gte: threeYearsAgoGenre } },
      { createdAt: { $gte: threeYearsAgoGenre } },
      {
        $and: [
          { releaseDate: { $exists: false } },
          { $or: [
            { momentumScore: { $gte: 5 } },
            { compositeScore: { $gt: 0 } }
          ]}
        ]
      }
    ];

    const tracks = await UnifiedTrack.find({
      genres: { $in: [genre] },
      artistId: { $in: independentArtistIds },
      $or: recencyFilter
    })
      .sort({ [sortField]: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .populate('artistId', 'name images genres')
      .select('-scoreHistory');

    const total = await UnifiedTrack.countDocuments({
      genres: { $in: [genre] },
      artistId: { $in: independentArtistIds },
      $or: recencyFilter
    });

    res.json({
      tracks,
      total,
      genre,
      hasMore: Number(offset) + tracks.length < total
    });
  } catch (error: any) {
    console.error('Error fetching tracks by genre:', error);
    res.status(500).json({ error: 'Failed to fetch tracks by genre' });
  }
});

/**
 * GET /api/charts/tracks/stats
 * Get track statistics
 */
router.get('/tracks/stats', async (req, res) => {
  try {
    // Get independent artist IDs
    const independentArtists = await UnifiedArtist.find({ isIndependent: true })
      .select('_id');
    const independentArtistIds = independentArtists.map(a => a._id);

    const totalTracks = await UnifiedTrack.countDocuments({
      artistId: { $in: independentArtistIds }
    });

    const tracksWithScores = await UnifiedTrack.countDocuments({
      artistId: { $in: independentArtistIds },
      compositeScore: { $gt: 0 }
    });

    const avgScore = await UnifiedTrack.aggregate([
      { $match: { artistId: { $in: independentArtistIds }, compositeScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$compositeScore' } } }
    ]);

    const topTrack = await UnifiedTrack.findOne({
      artistId: { $in: independentArtistIds },
      compositeScore: { $gt: 0 }
    })
      .sort({ compositeScore: -1 })
      .populate('artistId', 'name')
      .select('name artistName compositeScore');

    // Get genre distribution
    const genreStats = await UnifiedTrack.aggregate([
      { $match: { artistId: { $in: independentArtistIds }, genres: { $exists: true, $ne: [] } } },
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalTracks,
      tracksWithScores,
      averageScore: avgScore[0]?.avg || 0,
      topTrack: topTrack ? {
        name: topTrack.name,
        artist: topTrack.artistName,
        score: topTrack.compositeScore
      } : null,
      genreDistribution: genreStats.map((g: any) => ({
        genre: g._id,
        count: g.count
      }))
    });
  } catch (error: any) {
    console.error('Error fetching track stats:', error);
    res.status(500).json({ error: 'Failed to fetch track stats', details: error.message });
  }
});

/**
 * GET /api/charts/tracks/:id
 * Get track details
 */
router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await UnifiedTrack.findById(req.params.id)
      .populate('artistId');

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ track });
  } catch (error: any) {
    console.error('Error fetching track:', error);
    res.status(500).json({ error: 'Failed to fetch track' });
  }
});

/**
 * GET /api/charts/tracks/:id/history
 * Get track score history
 */
router.get('/tracks/:id/history', async (req, res) => {
  try {
    const track = await UnifiedTrack.findById(req.params.id)
      .select('scoreHistory name artistName');

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({
      trackId: track._id,
      trackName: track.name,
      artistName: track.artistName,
      history: track.scoreHistory || []
    });
  } catch (error: any) {
    console.error('Error fetching track history:', error);
    res.status(500).json({ error: 'Failed to fetch track history' });
  }
});

// ==================== TRACK ADMIN ENDPOINTS ====================

/**
 * POST /api/charts/admin/import/tracks/lastfm
 * Import tracks from Last.fm
 */
router.post('/admin/import/tracks/lastfm', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.body;
    const imported = await trackDataAggregator.importFromLastfm(limit);
    
    // Update scores for imported tracks
    await chartScoringEngine.updateAllTrackScores();

    res.json({
      success: true,
      message: `Imported ${imported} tracks from Last.fm`,
      imported
    });
  } catch (error: any) {
    console.error('Error importing tracks:', error);
    res.status(500).json({ error: 'Failed to import tracks', details: error.message });
  }
});

/**
 * POST /api/charts/admin/import/tracks/genre
 * Import tracks by genre
 */
router.post('/admin/import/tracks/genre', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { genre, limit = 50 } = req.body;
    
    if (!genre) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    const imported = await trackDataAggregator.importByGenre(genre, limit);
    
    // Update scores for imported tracks
    await chartScoringEngine.updateAllTrackScores();

    res.json({
      success: true,
      message: `Imported ${imported} tracks for genre ${genre}`,
      imported,
      genre
    });
  } catch (error: any) {
    console.error('Error importing tracks by genre:', error);
    res.status(500).json({ error: 'Failed to import tracks by genre', details: error.message });
  }
});

export default router;
