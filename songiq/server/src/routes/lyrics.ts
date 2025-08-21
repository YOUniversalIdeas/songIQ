// LYRICS ROUTES - UNRELEASED SONGS ONLY (ACTIVE)
// Spotify lyrics routes are commented out below

import express from 'express';
import multer from 'multer';
import LyricsAnalysisService from '../services/lyricsAnalysisService';
import { LyricsUploadRequest } from '../types/lyrics';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.lrc', '.srt'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt, .lrc, and .srt files are allowed'));
    }
  }
});

// SPOTIFY LYRICS ROUTES - TEMPORARILY DISABLED
/*
import SpotifyLyricsService from '../services/spotifyLyricsService';

// Middleware to check if user has valid Spotify access token
const requireSpotifyAuth = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!accessToken) {
    res.status(401).json({ 
      error: 'Spotify access token required',
      message: 'Please authenticate with Spotify to access lyrics analysis'
    });
    return;
  }
  
  // Add spotifyToken to req object
  (req as any).spotifyToken = accessToken;
  next();
};

// Get lyrics analysis for a single track
router.get('/analyze/:trackId', requireSpotifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { trackId } = req.params;
    const { trackName, artistName } = req.query;
    
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID is required' });
    }

    const lyricsService = new SpotifyLyricsService((req as any).spotifyToken);
    
    // Fetch lyrics from Spotify
    const lyricsResponse = await lyricsService.getTrackLyrics(trackId);
    
    if (!lyricsResponse) {
      return res.status(404).json({ 
        error: 'Lyrics not found',
        message: 'No lyrics available for this track'
      });
    }

    // Extract plain text lyrics
    const plainLyrics = lyricsService.extractPlainLyrics(lyricsResponse);
    
    if (!plainLyrics.trim()) {
      return res.status(404).json({ 
        error: 'No lyrics content',
        message: 'Track has no lyrical content to analyze'
      });
    }

    // Analyze lyrics
    const analysis = await lyricsService.analyzeLyrics(
      trackId,
      (trackName as string) || 'Unknown Track',
      (artistName as string) || 'Unknown Artist',
      plainLyrics
    );

    return res.json({
      success: true,
      data: analysis,
      metadata: {
        trackId,
        analysisTimestamp: new Date().toISOString(),
        lyricsSource: 'Spotify API'
      }
    });

  } catch (error: any) {
    console.error('Error analyzing lyrics:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze lyrics',
      message: error.message 
    });
  }
});

// Get synchronized lyrics with timing
router.get('/sync/:trackId', requireSpotifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { trackId } = req.params;
    
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID is required' });
    }

    const lyricsService = new SpotifyLyricsService((req as any).spotifyToken);
    const lyricsResponse = await lyricsService.getTrackLyrics(trackId);
    
    if (!lyricsResponse) {
      return res.status(404).json({ 
        error: 'Lyrics not found',
        message: 'No synchronized lyrics available for this track'
      });
    }

    const synchronizedLyrics = lyricsService.getSynchronizedLyrics(lyricsResponse);
    
    return res.json({
      success: true,
      data: {
        trackId,
        syncType: lyricsResponse.lyrics.syncType,
        lines: synchronizedLyrics
      }
    });

  } catch (error: any) {
    console.error('Error fetching synchronized lyrics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch synchronized lyrics',
      message: error.message 
    });
  }
});

// Compare lyrics between two tracks
router.post('/compare', requireSpotifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { track1Id, track2Id } = req.body;
    
    if (!track1Id || !track2Id) {
      return res.status(400).json({ 
        error: 'Both track IDs are required',
        message: 'Please provide track1Id and track2Id'
      });
    }

    const lyricsService = new SpotifyLyricsService((req as any).spotifyToken);
    const comparison = await lyricsService.compareLyrics(track1Id, track2Id);
    
    return res.json({
      success: true,
      data: comparison,
      metadata: {
        comparisonTimestamp: new Date().toISOString(),
        lyricsSource: 'Spotify API'
      }
    });

  } catch (error: any) {
    console.error('Error comparing lyrics:', error);
    return res.status(500).json({ 
      error: 'Failed to compare lyrics',
      message: error.message 
    });
  }
});

// Get lyrics themes analysis
router.get('/themes/:trackId', requireSpotifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { trackId } = req.params;
    
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID is required' });
    }

    const lyricsService = new SpotifyLyricsService((req as any).spotifyToken);
    const lyricsResponse = await lyricsService.getTrackLyrics(trackId);
    
    if (!lyricsResponse) {
      return res.status(404).json({ 
        error: 'Lyrics not found',
        message: 'No lyrics available for this track'
      });
    }

    const plainLyrics = lyricsService.extractPlainLyrics(lyricsResponse);
    const analysis = await lyricsService.analyzeLyrics(
      trackId,
      'Unknown Track',
      'Unknown Artist',
      plainLyrics
    );

    return res.json({
      success: true,
      data: {
        trackId,
        trackName: 'Unknown Track',
        artistName: 'Unknown Artist',
        themes: analysis.themes,
        wordCount: analysis.wordCount,
        uniqueWords: analysis.uniqueWords
      }
    });

  } catch (error: any) {
    console.error('Error analyzing themes:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze themes',
      message: error.message 
    });
  }
});

// Get lyrics complexity analysis
router.get('/complexity/:trackId', requireSpotifyAuth, async (req: express.Request, res: express.Response) => {
  try {
    const { trackId } = req.params;
    
    if (!trackId) {
      return res.status(400).json({ error: 'Track ID is required' });
    }

    const lyricsService = new SpotifyLyricsService((req as any).spotifyToken);
    const lyricsResponse = await lyricsService.getTrackLyrics(trackId);
    
    if (!lyricsResponse) {
      return res.status(404).json({ 
        error: 'Lyrics not found',
        message: 'No lyrics available for this track'
      });
    }

    const plainLyrics = lyricsService.extractPlainLyrics(lyricsResponse);
    const analysis = await lyricsService.analyzeLyrics(
      trackId,
      'Unknown Track',
      'Unknown Artist',
      plainLyrics
    );

    return res.json({
      success: true,
      data: {
        trackId,
        complexity: analysis.complexity,
        structure: analysis.structure,
        language: analysis.language
      }
    });

  } catch (error: any) {
    console.error('Error analyzing complexity:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze complexity',
      message: error.message 
    });
  }
});
*/

// UNRELEASED SONGS ROUTES - ACTIVE

// Analyze lyrics from uploaded file (for unreleased songs)
router.post('/upload', upload.single('lyricsFile'), async (req: express.Request, res: express.Response) => {
  try {
    const { trackName, artistName } = req.body;
    const file = req.file;
    
    if (!trackName || !artistName) {
      return res.status(400).json({ 
        error: 'Track name and artist name are required',
        message: 'Please provide both track name and artist name'
      });
    }

    const lyricsService = new LyricsAnalysisService();
    let analysis: any;

    if (file) {
      // Analyze from uploaded file
      analysis = await lyricsService.analyzeLyricsFromFile(
        file.buffer,
        file.originalname,
        trackName,
        artistName
      );
    } else {
      // Analyze from manually entered lyrics
      const { lyrics } = req.body;
      if (!lyrics || !lyrics.trim()) {
        return res.status(400).json({ 
          error: 'Lyrics content is required',
          message: 'Please provide lyrics text or upload a lyrics file'
        });
      }
      
      analysis = await lyricsService.analyzeLyricsFromText(lyrics, trackName, artistName);
    }

    return res.json({
      success: true,
      data: analysis,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        source: file ? 'uploaded_file' : 'manual_input',
        trackName,
        artistName
      }
    });

  } catch (error: any) {
    console.error('Error analyzing uploaded lyrics:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze lyrics',
      message: error.message 
    });
  }
});

// Analyze lyrics from plain text (for unreleased songs)
router.post('/analyze-text', async (req: express.Request, res: express.Response) => {
  try {
    const { lyrics, trackName, artistName } = req.body;
    
    if (!lyrics || !lyrics.trim()) {
      return res.status(400).json({ 
        error: 'Lyrics text is required',
        message: 'Please provide the lyrics content'
      });
    }

    if (!trackName || !artistName) {
      return res.status(400).json({ 
        error: 'Track name and artist name are required',
        message: 'Please provide both track name and artist name'
      });
    }

    const lyricsService = new LyricsAnalysisService();
    const analysis = await lyricsService.analyzeLyricsFromText(lyrics, trackName, artistName);

    return res.json({
      success: true,
      data: analysis,
      metadata: {
        analysisTimestamp: new Date().toISOString(),
        source: 'manual_input',
        trackName,
        artistName
      }
    });

  } catch (error: any) {
    console.error('Error analyzing text lyrics:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze lyrics',
      message: error.message 
    });
  }
});

export default router;
