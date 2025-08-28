import express from 'express';
import spotifyService from '../services/spotifyService';
import { authenticateToken } from '../middleware/auth';
import { User } from '../models';

const router = express.Router();

// Test endpoint to debug Spotify API
router.get('/test/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log(`🧪 Testing Spotify API for track: ${trackId}`);
    
    // Test direct API call
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${spotifyService['accessToken'] || 'no-token'}`
      }
    });
    
    const data = await response.json();
    
    console.log(`🧪 API Response status: ${response.status}`);
    console.log(`🧪 API Response data:`, data);
    
    res.json({
      success: true,
      debug: {
        trackId,
        hasAccessToken: !!spotifyService['accessToken'],
        apiStatus: response.status,
        apiData: data
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test endpoint for audio features
router.get('/test-audio/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log(`🧪 Testing Spotify Audio Features API for track: ${trackId}`);
    
    // Test direct API call to audio features
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${spotifyService['accessToken'] || 'no-token'}`
      }
    });
    
    const data = await response.json();
    
    console.log(`🧪 Audio Features API Response status: ${response.status}`);
    console.log(`🧪 Audio Features API Response data:`, data);
    
    res.json({
      success: true,
      debug: {
        trackId,
        hasAccessToken: !!spotifyService['accessToken'],
        apiStatus: response.status,
        apiData: data
      }
    });
  } catch (error) {
    console.error('Audio features test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Audio features test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to check Spotify credentials
router.get('/debug', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  res.json({
    success: true,
    debug: {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId ? clientId.length : 0,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      clientIdPreview: clientId ? `${clientId.substring(0, 8)}...` : 'none',
      clientSecretPreview: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'none'
    }
  });
});

// GET /api/spotify/search - Search for tracks on Spotify
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    const searchResults = await spotifyService.searchTracks(
      q as string, 
      parseInt(limit as string), 
      parseInt(offset as string)
    );
    
    if (!searchResults) {
      return res.status(500).json({
        success: false,
        error: 'Failed to search tracks'
      });
    }

    return res.json({
      success: true,
      data: searchResults.tracks,
      total: searchResults.total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

// GET /api/spotify/track/:trackId - Get track details and analysis
router.get('/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    const analysis = await spotifyService.analyzeTrack(trackId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Track not found or analysis failed'
      });
    }
    
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Spotify track analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze Spotify track'
    });
  }
});

// GET /api/spotify/audio-features/:trackId - Get audio features for a track
router.get('/audio-features/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    const features = await spotifyService.getTrackAudioFeatures(trackId);
    
    if (!features) {
      return res.status(404).json({
        success: false,
        error: 'Audio features not found for this track'
      });
    }
    
    return res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Spotify audio features error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get audio features'
    });
  }
});

// GET /api/spotify/similar/:trackId - Get similar tracks
router.get('/similar/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const { limit = 10 } = req.query;
    
    const similarTracks = await spotifyService.getSimilarTracks(trackId, Number(limit));
    
    return res.json({
      success: true,
      data: similarTracks,
      count: similarTracks.length
    });
  } catch (error) {
    console.error('Spotify similar tracks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get similar tracks'
    });
  }
});

// GET /api/spotify/genre/:genre - Get genre insights
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    
    const insights = await spotifyService.getGenreInsights(genre);
    
    if (!insights) {
      return res.status(404).json({
        success: false,
        error: 'Genre insights not available'
      });
    }
    
    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Spotify genre insights error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get genre insights'
    });
  }
});

// POST /api/spotify/analyze - Analyze a track by URL or ID
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    // Check if user can analyze another song
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.canAnalyzeSong()) {
      return res.status(403).json({
        success: false,
        error: 'Song analysis limit reached',
        details: `You have reached your limit of ${user.getSongLimit()} songs for your ${user.subscription.plan} plan. Please upgrade to analyze more songs.`,
        currentUsage: user.subscription.usage.songsAnalyzed,
        songLimit: user.getSongLimit(),
        remainingSongs: user.getRemainingSongs()
      });
    }

    const { trackId, trackUrl } = req.body;
    
    let finalTrackId = trackId;
    
    // If trackUrl is provided, extract track ID from it
    if (trackUrl && !trackId) {
      const urlMatch = trackUrl.match(/track\/([a-zA-Z0-9]+)/);
      if (urlMatch) {
        finalTrackId = urlMatch[1];
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid Spotify track URL'
        });
      }
    }
    
    if (!finalTrackId) {
      return res.status(400).json({
        success: false,
        error: 'Track ID or URL is required'
      });
    }
    
    console.log(`🔍 Analyzing Spotify track: ${finalTrackId}`);
    const analysis = await spotifyService.analyzeTrack(finalTrackId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Track not found or analysis failed'
      });
    }

    // Increment user's song analysis usage
    user.subscription.usage.songsAnalyzed += 1;
    await user.save();
    
    return res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Spotify analyze error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze track'
    });
  }
});

export default router; 