import express from 'express';
import spotifyService from '../services/spotifyService';

const router = express.Router();

// GET /api/spotify/search - Search for tracks
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        details: 'Please provide a search query'
      });
    }

    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter',
        details: 'Limit must be a number between 1 and 50'
      });
    }

    const tracks = await spotifyService.searchTracks(q, limitNum);

    return res.json({
      success: true,
      data: {
        tracks,
        query: q,
        limit: limitNum,
        total: tracks.length
      }
    });

  } catch (error) {
    console.error('Spotify search error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to search Spotify tracks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/spotify/features/:trackId - Get audio features for a track
router.get('/features/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;

    if (!trackId || typeof trackId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Track ID is required',
        details: 'Please provide a valid Spotify track ID'
      });
    }

    // Validate Spotify track ID format (22 characters, alphanumeric)
    if (!/^[a-zA-Z0-9]{22}$/.test(trackId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid track ID format',
        details: 'Spotify track ID must be 22 alphanumeric characters'
      });
    }

    const audioFeatures = await spotifyService.getTrackAudioFeatures(trackId);
    const trackInfo = await spotifyService.getTrackInfo(trackId);

    return res.json({
      success: true,
      data: {
        trackId,
        trackInfo,
        audioFeatures
      }
    });

  } catch (error) {
    console.error('Spotify features error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: error.message
      });
    }

    if (error instanceof Error && error.message.includes('No audio features found')) {
      return res.status(404).json({
        success: false,
        error: 'Track not found',
        details: 'No audio features available for this track'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to get track audio features',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/spotify/track/:trackId - Get track information
router.get('/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;

    if (!trackId || typeof trackId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Track ID is required',
        details: 'Please provide a valid Spotify track ID'
      });
    }

    if (!/^[a-zA-Z0-9]{22}$/.test(trackId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid track ID format',
        details: 'Spotify track ID must be 22 alphanumeric characters'
      });
    }

    const trackInfo = await spotifyService.getTrackInfo(trackId);

    return res.json({
      success: true,
      data: trackInfo
    });

  } catch (error) {
    console.error('Spotify track info error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to get track information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/spotify/features/batch - Get audio features for multiple tracks
router.post('/features/batch', async (req, res) => {
  try {
    const { trackIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({
        success: false,
        error: 'Track IDs array is required',
        details: 'Please provide an array of Spotify track IDs'
      });
    }

    if (trackIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Empty track IDs array',
        details: 'Please provide at least one track ID'
      });
    }

    if (trackIds.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many track IDs',
        details: 'Maximum 100 track IDs allowed per request'
      });
    }

    // Validate all track IDs
    const invalidIds = trackIds.filter(id => !/^[a-zA-Z0-9]{22}$/.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid track ID format',
        details: `Invalid track IDs: ${invalidIds.join(', ')}`
      });
    }

    const audioFeatures = await spotifyService.getMultipleTracksAudioFeatures(trackIds);

    return res.json({
      success: true,
      data: {
        trackIds,
        audioFeatures,
        total: audioFeatures.length,
        requested: trackIds.length
      }
    });

  } catch (error) {
    console.error('Spotify batch features error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to get batch audio features',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/spotify/recommendations - Get track recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { seedFeatures, limit = 20 } = req.body;

    if (!seedFeatures || typeof seedFeatures !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Seed features are required',
        details: 'Please provide audio features for recommendations'
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter',
        details: 'Limit must be a number between 1 and 100'
      });
    }

    const recommendations = await spotifyService.getRecommendations(seedFeatures, limitNum);

    return res.json({
      success: true,
      data: {
        recommendations,
        seedFeatures,
        limit: limitNum,
        total: recommendations.length
      }
    });

  } catch (error) {
    console.error('Spotify recommendations error:', error);
    
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        details: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/spotify/rate-limit - Get current rate limit status
router.get('/rate-limit', async (req, res) => {
  try {
    const status = spotifyService.getRateLimitStatus();

    return res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Rate limit status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get rate limit status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 