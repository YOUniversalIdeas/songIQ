import express from 'express'
import path from 'path'
import { Song, User } from '../models'
import { 
  uploadSingleAudio, 
  handleUploadError, 
  extractFileMetadata, 
  cleanupFile,
  validateUploadRequest,
  validateTempUploadRequest
} from '../middleware/uploadMiddleware'
import { authenticateToken } from '../middleware/auth'
import { 
  extractAudioMetadata, 
  validateAudioFile,
  formatDuration,
  formatFileSize,
  getAudioFormatInfo 
} from '../utils/audioUtils'
import { analyzeAudioSimple, convertToAudioFeatures } from '../services/simpleAudioAnalysisService'

const router = express.Router()

// POST /api/songs/upload - Upload a new song
router.post('/upload', authenticateToken, uploadSingleAudio, handleUploadError, async (req: express.Request, res: express.Response) => {
  let uploadedFile: Express.Multer.File | undefined;
  
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

    // Validate request body
    validateUploadRequest(req);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required',
        details: 'Please provide an audio file using the "audioFile" field'
      });
    }
    
    uploadedFile = req.file;
    const { title, artist, isReleased, releaseDate, platforms, genre } = req.body;
    const userId = req.user!.id; // Use authenticated user's ID

    // Extract file metadata
    const fileMetadata = extractFileMetadata(req.file);
    
    // Validate audio file integrity
    const validationResult = await validateAudioFile(req.file.path);
    if (!validationResult.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        details: validationResult.error
      });
    }
    
    // Extract audio metadata (duration, bitrate, etc.)
    const audioAnalysis = await extractAudioMetadata(req.file.path);
    if (!audioAnalysis.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Could not analyze audio file',
        details: audioAnalysis.error
      });
    }
    
    // Perform local audio analysis (works for both released and unreleased songs)
    const simpleAnalysis = await analyzeAudioSimple(req.file.path);
    const audioFeatures = convertToAudioFeatures(simpleAnalysis);
    
    // Note: For unreleased songs, we use local analysis
    // For released songs on Spotify, we could optionally fetch Spotify features later
    const analysisSource = isReleased === 'true' ? 'local' : 'local';
    
    // Calculate success score and market potential
    const { calculateSuccessScore } = await import('../services/successScoringService');
    const successScore = await calculateSuccessScore(audioFeatures, genre, releaseDate ? new Date(releaseDate) : undefined);
    
    // Prepare song data
    const songData: any = {
      title,
      artist,
      duration: audioAnalysis.metadata.duration,
      fileUrl: fileMetadata.url,
      isReleased: isReleased === 'true',
      ...(userId && { userId }),
      ...(isReleased === 'true' && releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(isReleased === 'true' && platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    };
    
    // Create and save audio features
    const { default: AudioFeatures } = await import('../models/AudioFeatures');
    const audioFeaturesDoc = new AudioFeatures(audioFeatures);
    await audioFeaturesDoc.save();
    
    // Create and save analysis results
    const { default: Analysis } = await import('../models/Analysis');
    const analysisDoc = new Analysis({
      successScore: successScore.overallScore,
      marketPotential: successScore.marketPotential,
      socialScore: successScore.socialScore,
      recommendations: successScore.recommendations,
      genreAnalysis: {
        primaryGenre: genre || 'unknown',
        genreConfidence: successScore.confidence,
        genreTrends: successScore.breakdown.genreAlignment
      },
      audienceAnalysis: {
        targetAudience: 'general',
        audienceSize: 'medium',
        audienceEngagement: successScore.socialScore
      },
      competitiveAnalysis: {
        marketPosition: successScore.overallScore > 70 ? 'strong' : successScore.overallScore > 50 ? 'moderate' : 'weak',
        competitiveAdvantage: successScore.recommendations.slice(0, 3).map(r => r.title),
        marketGaps: successScore.riskFactors
      },
      productionQuality: {
        overallQuality: successScore.overallScore,
        technicalScore: successScore.breakdown.audioFeatures,
        marketAlignment: successScore.breakdown.marketTrends
      }
    });
    await analysisDoc.save();
    
    // Update song data with audio features and analysis references
    songData.audioFeatures = audioFeaturesDoc._id;
    songData.analysisResults = analysisDoc._id;

    // Create and save song
    const song = new Song(songData);
    await song.save();
    
    // Increment user's song analysis usage
    user.subscription.usage.songsAnalyzed += 1;
    await user.save();
    
    // Get format information
    const formatInfo = getAudioFormatInfo(fileMetadata.extension);
    
    // Prepare response data
    const responseData = {
      songId: song._id.toString(),
      uploadUrl: fileMetadata.url,
      analysisStatus: 'pending' as const,
      fileMetadata: {
        ...fileMetadata,
        duration: audioAnalysis.metadata.duration,
        durationFormatted: formatDuration(audioAnalysis.metadata.duration),
        sizeFormatted: formatFileSize(fileMetadata.size),
        formatInfo
      },
      audioFeatures: {
        tempo: audioFeatures.tempo,
        key: audioFeatures.key,
        mode: audioFeatures.mode,
        loudness: audioFeatures.loudness,
        energy: audioFeatures.energy,
        danceability: audioFeatures.danceability,
        valence: audioFeatures.valence,
        analysisSource: analysisSource,
        isUnreleased: isReleased !== 'true'
      },
      successScore: {
        overallScore: successScore.overallScore,
        confidence: successScore.confidence,
        breakdown: successScore.breakdown,
        recommendations: successScore.recommendations.slice(0, 3),
        riskFactors: successScore.riskFactors,
        marketPotential: successScore.marketPotential,
        socialScore: successScore.socialScore
      },
      song: {
        id: song._id.toString(),
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        uploadDate: song.uploadDate,
        isReleased: song.isReleased,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt
      }
    };

    return res.status(201).json({
      success: true,
      data: responseData,
      message: 'Song uploaded successfully'
    });
    
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (uploadedFile) {
      await cleanupFile(uploadedFile.path);
    }
    
    console.error('Upload error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: 'Upload failed',
        details: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: 'Failed to process upload'
    });
  }
});

// POST /api/songs/upload-temp - Upload a song without authentication (temporary access)
router.post('/upload-temp', uploadSingleAudio, handleUploadError, async (req: express.Request, res: express.Response) => {
  let uploadedFile: Express.Multer.File | undefined;
  
  try {
    // Validate request body (temporary upload - no duration required yet)
    validateTempUploadRequest(req);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required',
        details: 'Please provide an audio file using the "audioFile" field'
      });
    }
    
    uploadedFile = req.file;
    const { title, artist, isReleased, releaseDate, platforms, genre } = req.body;

    // Extract file metadata
    const fileMetadata = extractFileMetadata(req.file);
    
    // Validate audio file integrity
    const validationResult = await validateAudioFile(req.file.path);
    if (!validationResult.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        details: validationResult.error
      });
    }
    
    // Extract audio metadata (duration, bitrate, etc.)
    const audioAnalysis = await extractAudioMetadata(req.file.path);
    if (!audioAnalysis.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Could not analyze audio file',
        details: audioAnalysis.error
      });
    }
    
    // Perform local audio analysis
    const simpleAnalysis = await analyzeAudioSimple(req.file.path);
    const audioFeatures = convertToAudioFeatures(simpleAnalysis);
    
    // Calculate success score and market potential
    const { calculateSuccessScore } = await import('../services/successScoringService');
    const successScore = await calculateSuccessScore(audioFeatures, genre, releaseDate ? new Date(releaseDate) : undefined);
    
    // Prepare song data (without userId)
    const songData: any = {
      title,
      artist,
      duration: audioAnalysis.metadata.duration,
      fileUrl: fileMetadata.url,
      isReleased: isReleased === 'true',
      isTemporary: true, // Mark as temporary
      ...(isReleased === 'true' && releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(isReleased === 'true' && platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    };
    
    // First, create and save the song (without audio features and analysis references)
    const song = new Song(songData);
    await song.save();
    
    // Now create and save audio features with the song ID
    const { default: AudioFeatures } = await import('../models/AudioFeatures');
    const audioFeaturesDoc = new AudioFeatures({
      ...audioFeatures,
      songId: song._id
    });
    await audioFeaturesDoc.save();
    
    // Create and save analysis results with the song ID
    const { default: Analysis } = await import('../models/Analysis');
    const analysisDoc = new Analysis({
      songId: song._id,
      successScore: successScore.overallScore,
      marketPotential: successScore.marketPotential,
      socialScore: successScore.socialScore,
      recommendations: successScore.recommendations.map((rec: any) => ({
        category: 'production', // Default category since ML doesn't provide this
        title: rec.title || 'Improve production quality',
        description: rec.description || 'Focus on enhancing overall production',
        priority: 'medium',
        impact: Math.round(rec.impact || 50)
      })),
      genreAnalysis: {
        primaryGenre: (genre || 'pop').toLowerCase(),
        subGenres: [],
        genreConfidence: successScore.confidence || 75,
        marketTrend: 'stable' // Default since ML doesn't provide this
      },
      audienceAnalysis: {
        targetDemographics: ['young_adults', 'music_enthusiasts'],
        ageRange: {
          min: 18,
          max: 35
        },
        geographicMarkets: ['global'],
        listeningHabits: ['streaming', 'social_media']
      },
      competitiveAnalysis: {
        similarArtists: [],
        marketGap: 'Focus on unique production style and marketing',
        competitiveAdvantage: successScore.recommendations.slice(0, 3).map((r: any) => r.title || 'Quality production')
      },
      productionQuality: {
        overall: successScore.overallScore,
        mixing: Math.round(successScore.overallScore * 0.9),
        mastering: Math.round(successScore.overallScore * 0.85),
        arrangement: Math.round(successScore.overallScore * 0.95),
        performance: Math.round(successScore.overallScore * 0.88)
      },
      releaseRecommendations: {
        optimalReleaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        targetPlatforms: ['spotify', 'apple_music', 'youtube'],
        marketingStrategy: ['Social media promotion', 'Playlist pitching', 'Influencer collaboration'],
        pricingStrategy: 'standard'
      }
    });
    await analysisDoc.save();
    
    // Update the song with the audio features and analysis references
    song.audioFeatures = audioFeaturesDoc._id;
    song.analysisResults = analysisDoc._id;
    await song.save();
    
    // Get format information
    const formatInfo = getAudioFormatInfo(fileMetadata.extension);
    
    // Create temporary access token
    const jwt = require('jsonwebtoken');
    const tempToken = jwt.sign(
      { 
        songId: song._id.toString(), 
        type: 'temp_access',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'your-secret-key'
    );
    
    // Prepare response data
    const responseData = {
      songId: song._id.toString(),
      tempAccessToken: tempToken,
      requiresAccount: true,
      uploadUrl: fileMetadata.url,
      analysisStatus: 'completed' as const,
      fileMetadata: {
        ...fileMetadata,
        duration: audioAnalysis.metadata.duration,
        durationFormatted: formatDuration(audioAnalysis.metadata.duration),
        sizeFormatted: formatFileSize(fileMetadata.size),
        formatInfo
      },
      audioFeatures: {
        tempo: audioFeatures.tempo,
        key: audioFeatures.key,
        mode: audioFeatures.mode,
        loudness: audioFeatures.loudness,
        energy: audioFeatures.energy,
        danceability: audioFeatures.danceability,
        valence: audioFeatures.valence,
        analysisSource: 'local',
        isUnreleased: isReleased !== 'true'
      },
      successScore: {
        overallScore: successScore.overallScore,
        confidence: successScore.confidence,
        breakdown: successScore.breakdown,
        recommendations: successScore.recommendations.slice(0, 3),
        riskFactors: successScore.riskFactors,
        marketPotential: successScore.marketPotential,
        socialScore: successScore.socialScore
      },
      song: {
        id: song._id.toString(),
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        uploadDate: song.uploadDate,
        isReleased: song.isReleased,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt
      }
    };

    return res.status(201).json({
      success: true,
      message: 'Song uploaded and analysis completed! Create an account to view your results.',
      data: responseData
    });
    
  } catch (error: any) {
    // Cleanup uploaded file if it exists
    if (uploadedFile) {
      await cleanupFile(uploadedFile.path);
    }
    
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      details: error.message
    });
  }
});

// GET /api/songs - Get all songs with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const userId = req.user!.id // Only show user's own songs
    
    const songs = await Song.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('analysisResults', 'successPrediction.score audioFeatures.genre')
      .populate('performanceMetrics', 'streamingData.spotify.streams')

    const total = await Song.countDocuments({ userId })

    return res.json({
      success: true,
      data: songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get songs error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve songs'
    })
  }
})

// GET /api/songs/stats - Get real-time statistics (public endpoint)
router.get('/stats', async (req, res) => {
  try {
    // Import models
    const { User, Analysis } = await import('../models');
    
    // Get total songs analyzed
    const totalSongs = await Song.countDocuments();
    
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get songs analyzed in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSongs = await Song.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Calculate prediction accuracy based on analysis confidence scores
    let predictionAccuracy = 95; // Default fallback
    
    try {
      const analysisConfidence = await Analysis.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$genreAnalysis.genreConfidence' } } }
      ]);
      
      if (analysisConfidence.length > 0 && analysisConfidence[0].avgConfidence) {
        // Convert confidence to accuracy percentage (0-1 to 0-100)
        predictionAccuracy = Math.round(analysisConfidence[0].avgConfidence * 100);
      } else {
        // Fallback: calculate based on success score variance
        const successScoreStats = await Analysis.aggregate([
          { $group: { 
            _id: null, 
            avgScore: { $avg: '$successScore' },
            stdDev: { $stdDevPop: '$successScore' }
          }}
        ]);
        
        if (successScoreStats.length > 0 && successScoreStats[0].stdDev) {
          // Lower standard deviation = higher accuracy
          const variance = successScoreStats[0].stdDev / 100; // Normalize to 0-1
          predictionAccuracy = Math.round((1 - variance) * 100);
        }
      }
      
      // Ensure accuracy is within reasonable bounds
      predictionAccuracy = Math.max(85, Math.min(99, predictionAccuracy));
    } catch (error) {
      console.log('Using default prediction accuracy:', predictionAccuracy);
    }
    
    // Get total analysis results
    const totalAnalyses = await Analysis.countDocuments();
    
    // Get average success score
    const avgSuccessScore = await Analysis.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$successScore' } } }
    ]);
    
    const averageScore = avgSuccessScore.length > 0 ? Math.round(avgSuccessScore[0].avgScore) : 0;
    
    const stats = {
      songsAnalyzed: totalSongs,
      predictionAccuracy: predictionAccuracy,
      happyArtists: totalUsers,
      recentActivity: recentSongs,
      totalAnalyses: totalAnalyses,
      averageSuccessScore: averageScore,
      lastUpdated: new Date().toISOString()
    };
    
    return res.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

// GET /api/songs/public/:id - Get public song information (no auth required)
router.get('/public/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .select('title artist genre duration uploadDate isReleased releaseDate platforms')
      .lean()

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    return res.json({
      success: true,
      data: song
    })
  } catch (error) {
    console.error('Get public song error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve song information'
    })
  }
})

// GET /api/songs/:id - Get song details (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('analysisResults')
      .populate('performanceMetrics')

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    // Check if user owns this song
    if (song.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    return res.json({
      success: true,
      data: song
    })
  } catch (error) {
    console.error('Get song error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve song'
    })
  }
})

// PUT /api/songs/:id - Update song information
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, artist, isReleased, releaseDate, platforms } = req.body

    // Check if user owns this song
    const song = await Song.findById(req.params.id)
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    if (song.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const updateData = {
      ...(title && { title }),
      ...(artist && { artist }),
      ...(isReleased !== undefined && { isReleased }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    }

    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!updatedSong) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    return res.json({
      success: true,
      data: updatedSong
    })
  } catch (error) {
    console.error('Update song error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update song'
    })
  }
})

// DELETE /api/songs/:id - Delete a song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Clean up associated files
    if (song.fileUrl) {
      const filePath = path.join(__dirname, '../../uploads', path.basename(song.fileUrl));
      await cleanupFile(filePath);
    }

    // Delete the song (this will cascade to related documents if configured)
    await Song.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Song deleted successfully',
      data: {
        songId: req.params.id,
        deletedFiles: song.fileUrl ? [path.basename(song.fileUrl)] : []
      }
    });
  } catch (error) {
    console.error('Delete song error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete song'
    });
  }
});

// GET /api/songs/upload/status/:songId - Get upload and analysis status
router.get('/upload/status/:songId', authenticateToken, async (req, res) => {
  try {
    const { songId } = req.params;
    
    const song = await Song.findById(songId)
      .populate('analysisResults')
      .populate('audioFeatures');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    // Check if user owns this song
    if (song.userId?.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Determine analysis status
    let analysisStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
    let progress = 0;
    let currentStep = 'Upload completed';
    
    if (song.analysisResults) {
      analysisStatus = 'completed';
      progress = 100;
      currentStep = 'Analysis completed';
    } else if (song.audioFeatures) {
      analysisStatus = 'processing';
      progress = 50;
      currentStep = 'Analyzing audio features';
    } else {
      analysisStatus = 'pending';
      progress = 25;
      currentStep = 'Queued for analysis';
    }
    
    const responseData = {
      songId: song._id.toString(),
      status: analysisStatus,
      progress,
      currentStep,
      song: {
        id: song._id.toString(),
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        uploadDate: song.uploadDate,
        fileUrl: song.fileUrl,
        isReleased: song.isReleased
      },
      analysis: song.analysisResults && typeof song.analysisResults === 'object' ? {
        successScore: (song.analysisResults as any).successScore,
        marketPotential: (song.analysisResults as any).marketPotential,
        socialScore: (song.analysisResults as any).socialScore,
        ratingCategory: (song.analysisResults as any).ratingCategory
      } : null
    };
    
    return res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Get upload status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get upload status'
    });
  }
});

// POST /api/songs/analyze-unreleased - Analyze unreleased song with local processing
router.post('/analyze-unreleased', authenticateToken, uploadSingleAudio, handleUploadError, async (req: express.Request, res: express.Response) => {
  let uploadedFile: Express.Multer.File | undefined;
  
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

    // Validate request body
    validateUploadRequest(req);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required',
        details: 'Please provide an audio file using the "audioFile" field'
      });
    }
    
    uploadedFile = req.file;
    const { title, artist, description, genre, targetReleaseDate } = req.body;
    const userId = req.user!.id; // Use authenticated user's ID

    // Extract file metadata
    const fileMetadata = extractFileMetadata(req.file);
    
    // Validate audio file integrity
    const validationResult = await validateAudioFile(req.file.path);
    if (!validationResult.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid audio file',
        details: validationResult.error
      });
    }
    
    // Extract audio metadata (duration, bitrate, etc.)
    const audioAnalysis = await extractAudioMetadata(req.file.path);
    if (!audioAnalysis.isValid) {
      await cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Could not analyze audio file',
        details: audioAnalysis.error
      });
    }
    
    // Perform comprehensive local audio analysis for unreleased song
    const simpleAnalysis = await analyzeAudioSimple(req.file.path);
    const audioFeatures = convertToAudioFeatures(simpleAnalysis);
    
    // Prepare song data for unreleased track
    const songData: any = {
      title,
      artist,
      duration: audioAnalysis.metadata.duration,
      fileUrl: fileMetadata.url,
      isReleased: false,
      ...(userId && { userId }),
      ...(description && { description }),
      ...(genre && { genre }),
      ...(targetReleaseDate && { targetReleaseDate: new Date(targetReleaseDate) })
    };
    
    // Create and save audio features
    const { default: AudioFeatures } = await import('../models/AudioFeatures');
    const audioFeaturesDoc = new AudioFeatures({
      ...audioFeatures,
      analysisSource: 'local',
      isUnreleased: true
    });
    await audioFeaturesDoc.save();
    
    // Update song data with audio features reference
    songData.audioFeatures = audioFeaturesDoc._id;

    // Create and save song
    const song = new Song(songData);
    await song.save();
    
    // Increment user's song analysis usage
    user.subscription.usage.songsAnalyzed += 1;
    await user.save();
    
    // Get format information
    const formatInfo = getAudioFormatInfo(fileMetadata.extension);
    
    // Prepare comprehensive response for unreleased song
    const responseData = {
      songId: song._id.toString(),
      uploadUrl: fileMetadata.url,
      analysisStatus: 'completed' as const,
      isUnreleased: true,
      analysisSource: 'local',
      fileMetadata: {
        ...fileMetadata,
        duration: audioAnalysis.metadata.duration,
        durationFormatted: formatDuration(audioAnalysis.metadata.duration),
        sizeFormatted: formatFileSize(fileMetadata.size),
        formatInfo
      },
      audioFeatures: {
        tempo: audioFeatures.tempo,
        key: audioFeatures.key,
        mode: audioFeatures.mode,
        loudness: audioFeatures.loudness,
        energy: audioFeatures.energy,
        danceability: audioFeatures.danceability,
        valence: audioFeatures.valence,
        acousticness: audioFeatures.acousticness,
        instrumentalness: audioFeatures.instrumentalness,
        liveness: audioFeatures.liveness,
        speechiness: audioFeatures.speechiness
      },
      analysisDetails: {
        spectralFeatures: simpleAnalysis.spectralFeatures,
        pitchAnalysis: simpleAnalysis.pitchAnalysis,
        rhythmAnalysis: simpleAnalysis.rhythmAnalysis,
        waveformData: simpleAnalysis.waveform.slice(0, 1000) // First 1000 samples for preview
      },
      song: {
        id: song._id.toString(),
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        uploadDate: song.uploadDate,
        isReleased: song.isReleased,
        description: song.description,
        genre: song.genre,
        targetReleaseDate: song.targetReleaseDate,
        createdAt: song.createdAt,
        updatedAt: song.updatedAt
      }
    };

    return res.status(201).json({
      success: true,
      data: responseData,
      message: 'Unreleased song uploaded and analyzed successfully'
    });
    
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (uploadedFile) {
      await cleanupFile(uploadedFile.path);
    }
    
    console.error('Unreleased song upload error:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: 'Upload failed',
        details: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: 'Failed to process unreleased song upload'
    });
  }
});

// GET /api/songs/:songId - Get song by ID
router.get('/:songId', async (req: express.Request, res: express.Response) => {
  try {
    const { songId } = req.params;
    
    if (!songId) {
      return res.status(400).json({
        success: false,
        error: 'Song ID is required'
      });
    }

    // Find the song
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Format the response
    const responseData = {
      id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      genre: song.genre,
      isReleased: song.isReleased,
      uploadDate: song.uploadDate,
      formattedUploadDate: song.uploadDate ? new Date(song.uploadDate).toISOString().split('T')[0] : null,
      description: song.description,
      targetReleaseDate: song.targetReleaseDate,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt
    };

    return res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get song error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch song information'
    });
  }
});

// GET /api/songs/temp-results/:songId - Get temporary analysis results (requires account creation)
router.get('/temp-results/:songId', async (req: express.Request, res: express.Response) => {
  try {
    const { songId } = req.params;
    const { tempToken } = req.query;

    if (!tempToken) {
      return res.status(401).json({
        success: false,
        error: 'Temporary access token required',
        requiresAccount: true
      });
    }

    // Verify temporary token
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(tempToken as string, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      if (decoded.type !== 'temp_access' || decoded.songId !== songId) {
        return res.status(403).json({
          success: false,
          error: 'Invalid temporary access token',
          requiresAccount: true
        });
      }

      // Check if token is expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(403).json({
          success: false,
          error: 'Temporary access token expired',
          requiresAccount: true
        });
      }
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: 'Invalid temporary access token',
        requiresAccount: true
      });
    }

    // Find the song
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Check if song is temporary
    if (!song.isTemporary) {
      return res.status(403).json({
        success: false,
        error: 'This song requires authentication',
        requiresAccount: true
      });
    }

    // Get analysis results
    const { default: Analysis } = await import('../models/Analysis');
    const analysis = await Analysis.findById(song.analysisResults);
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis results not found'
      });
    }

    // Get audio features
    const { default: AudioFeatures } = await import('../models/AudioFeatures');
    const audioFeatures = await AudioFeatures.findById(song.audioFeatures);
    if (!audioFeatures) {
      return res.status(404).json({
        success: false,
        error: 'Audio features not found'
      });
    }

    // Return results with account creation requirement
    return res.json({
      success: true,
      requiresAccount: true,
      message: 'Create an account to view your complete analysis results',
      data: {
        song: {
          id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          duration: song.duration,
          uploadDate: song.uploadDate,
          isReleased: song.isReleased
        },
        analysis: {
          successScore: analysis.successScore,
          marketPotential: analysis.marketPotential,
          socialScore: analysis.socialScore,
          recommendations: analysis.recommendations.slice(0, 2), // Limited preview
          genreAnalysis: analysis.genreAnalysis
        },
        audioFeatures: {
          tempo: audioFeatures.tempo,
          key: audioFeatures.key,
          mode: audioFeatures.mode,
          energy: audioFeatures.energy,
          danceability: audioFeatures.danceability
        }
      }
    });

  } catch (error: any) {
    console.error('Get temp results error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get temporary results',
      requiresAccount: true
    });
  }
});

export default router 