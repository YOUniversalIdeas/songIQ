import express from 'express'
import path from 'path'
import { Song } from '../models'
import { 
  uploadSingleAudio, 
  handleUploadError, 
  extractFileMetadata, 
  cleanupFile,
  validateUploadRequest 
} from '../middleware/uploadMiddleware'
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
router.post('/upload', uploadSingleAudio, handleUploadError, async (req: express.Request, res: express.Response) => {
  let uploadedFile: Express.Multer.File | undefined;
  
  try {
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
    const { title, artist, isReleased, releaseDate, platforms, userId, genre } = req.body;

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
    const songData = {
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

// GET /api/songs/:id - Get song details
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
  try {
    const { title, artist, isReleased, releaseDate, platforms } = req.body

    const updateData = {
      ...(title && { title }),
      ...(artist && { artist }),
      ...(isReleased !== undefined && { isReleased }),
      ...(releaseDate && { releaseDate: new Date(releaseDate) }),
      ...(platforms && { platforms: Array.isArray(platforms) ? platforms : [platforms] })
    }

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

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

// GET /api/songs - Get all songs (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const songs = await Song.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('analysisResults', 'successPrediction.score audioFeatures.genre')
      .populate('performanceMetrics', 'streamingData.spotify.streams')

    const total = await Song.countDocuments()

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

// GET /api/songs/upload/status/:songId - Get upload and analysis status
router.get('/upload/status/:songId', async (req, res) => {
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
router.post('/analyze-unreleased', uploadSingleAudio, handleUploadError, async (req: express.Request, res: express.Response) => {
  let uploadedFile: Express.Multer.File | undefined;
  
  try {
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
    const { title, artist, userId, description, genre, targetReleaseDate } = req.body;

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
    const songData = {
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

export default router 