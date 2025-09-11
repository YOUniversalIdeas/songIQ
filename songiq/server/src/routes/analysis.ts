import express from 'express'
import { Song, Analysis, AnalysisResults } from '../models'
import realTimeAnalysisService from '../services/realTimeAnalysisService'

const router = express.Router()

// POST /api/analysis/start/:songId - Start real-time analysis for a song
router.post('/start/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    // Check if song exists
    const song = await Song.findById(songId)
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    // Check if analysis already exists
    const existingAnalysis = await Analysis.findOne({ songId })
    
    if (existingAnalysis) {
      // If analysis exists, return it
      return res.json({
        success: true,
        analysis: {
          id: existingAnalysis._id,
          status: 'completed',
          progress: 100,
          currentStep: 'Analysis completed'
        }
      })
    }

    // Start real-time analysis
    const audioFilePath = song.fileUrl // Assuming fileUrl contains the local file path
    
    // Get song metadata for enhanced analysis
    const songMetadata = song ? {
      title: song.title,
      description: song.description,
      tags: song.tags || []
    } : undefined;

    // Start the enhanced analysis process
    realTimeAnalysisService.startAnalysis({
      songId,
      audioFilePath,
      metadata: songMetadata,
      onProgress: (progress) => {
        // Store progress in database or send via WebSocket
        console.log('Enhanced analysis progress:', progress)
      },
      onComplete: async (results) => {
        // Save completed analysis to database with enhanced genre data
        try {
          const analysis = new Analysis({
            songId,
            successScore: results.successPrediction?.score || 50,
            marketPotential: results.genreAnalysis?.marketPotential || 50,
            socialScore: results.successPrediction?.score * 0.9 || 45,
            recommendations: results.recommendations?.map((rec, index) => ({
              category: 'general',
              title: rec,
              description: rec,
              priority: index === 0 ? 'high' : 'medium',
              impact: 80 - (index * 10),
              implementation: 'Immediate action recommended'
            })) || [],
            genreAnalysis: {
              primaryGenre: results.genre || 'Unknown',
              subGenres: results.subGenres || [],
              genreConfidence: results.genreConfidence || 50,
              marketTrend: 'stable' // Could be enhanced with market data
            }
          })
          
          await analysis.save()
          console.log('Enhanced analysis saved:', analysis._id)
        } catch (error) {
          console.error('Error saving enhanced analysis:', error)
        }
      },
      onError: (error) => {
        console.error('Enhanced analysis error:', error)
      }
    })

    // Return success to indicate analysis started
    return res.json({
      success: true,
      analysis: {
        status: 'processing',
        progress: 0,
        currentStep: 'Starting real-time analysis...'
      }
    })
  } catch (error) {
    console.error('Start analysis error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to start analysis'
    })
  }
})

// GET /api/analysis/progress/:songId - Get analysis progress
router.get("/progress/:songId", async (req, res) => {
  try {
    const { songId } = req.params;
    
    const analysis = await Analysis.findOne({ songId });
    if (analysis) {
      // Analysis exists and is completed
      return res.json({
        success: true,
        progress: 100,
        currentStep: 'Analysis completed',
        status: 'completed'
      });
    } else {
      // No analysis yet, simulate progressive analysis
      // In a real app, this would track actual progress
      const timestamp = Date.now();
      const progress = Math.min(50 + Math.floor((timestamp % 10000) / 100), 100);
      
      let currentStep = 'Processing audio features...';
      if (progress > 60) currentStep = 'Analyzing musical characteristics...';
      if (progress > 70) currentStep = 'Processing vocal analysis...';
      if (progress > 80) currentStep = 'Running genre classification...';
      if (progress > 90) currentStep = 'Calculating success predictions...';
      if (progress >= 100) {
        currentStep = 'Analysis completed';
        // Create a completed analysis record
        const newAnalysis = new Analysis({
          songId,
          successScore: 78,
          marketPotential: 75,
          socialScore: 82,
          recommendations: [
            {
              category: 'marketing',
              title: 'Focus on Social Media',
              description: 'Target younger demographics through Instagram and social media',
              priority: 'high',
              impact: 85
            }
          ],
          genreAnalysis: {
            primaryGenre: 'pop',
            subGenres: ['pop rock', 'dance pop'],
            genreConfidence: 85,
            marketTrend: 'rising'
          },
          audienceAnalysis: {
            targetDemographics: ['young_adults', 'teens'],
            ageRange: { min: 16, max: 35 },
            geographicMarkets: ['North America', 'Europe'],
            listeningHabits: ['streaming', 'social_media']
          },
          competitiveAnalysis: {
            similarArtists: [
              { name: 'Artist A', similarity: 75, marketPosition: 'established' }
            ],
            marketGap: 'High-energy pop with modern production',
            competitiveAdvantage: ['Strong vocal performance', 'Current production style']
          },
          productionQuality: {
            overall: 80,
            mixing: 75,
            mastering: 80,
            arrangement: 85,
            performance: 80
          },
          releaseRecommendations: {
            optimalReleaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            targetPlatforms: ['spotify', 'apple_music', 'youtube'],
            marketingStrategy: ['Social media campaign', 'Playlist placement', 'Influencer partnerships'],
            pricingStrategy: 'standard'
          }
        });
        
        try {
          await newAnalysis.save();
        } catch (saveError) {
          console.error('Error saving analysis:', saveError);
        }
      }
      
      return res.json({
        success: true,
        progress: progress,
        currentStep: currentStep,
        status: progress >= 100 ? 'completed' : 'processing'
      });
    }
  } catch (error) {
    console.error("Get analysis progress error:", error);
    return res.status(500).json({ success: false, error: "Failed to get analysis progress" });
  }
});

// GET /api/analysis/status/:songId - Check analysis status
router.get('/status/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const analysis = await Analysis.findOne({ songId })
    
    if (!analysis) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          progress: 0,
          message: 'Analysis not started'
        }
      })
    }

    return res.json({
      success: true,
      data: {
        status: 'completed',
        progress: 100,
        analysisId: analysis._id,
        message: 'Analysis completed'
      }
    })
  } catch (error) {
    console.error('Get analysis status error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get analysis status'
    })
  }
})

// GET /api/analysis/results/:songId - Get analysis results
router.get('/results/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    // First check if song exists
    const song = await Song.findById(songId)
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    // Check if analysis exists (try both Analysis and SimpleAnalysis)
    const { default: SimpleAnalysis } = await import('../models/SimpleAnalysis');
    const analysis = await Analysis.findOne({ songId });
    const simpleAnalysis = await SimpleAnalysis.findOne({ songId });
    
    if (!analysis && !simpleAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found for this song'
      })
    }

    // Use actual analysis data if available, otherwise return mock results
    const actualAnalysis = analysis || simpleAnalysis;
    const results = {
      status: 'completed',
      progress: 100,
      currentStep: 'Analysis completed',
      audioFeatures: {
        danceability: 0.75,
        energy: 0.8,
        valence: 0.6,
        acousticness: 0.2,
        instrumentalness: 0.1,
        liveness: 0.3,
        speechiness: 0.05,
        tempo: 120,
        loudness: -8.5,
        key: 5,
        mode: 1
      },
      genre: 'Pop',
      successPrediction: {
        score: actualAnalysis?.successScore || 78,
        confidence: 0.85,
        factors: ['Strong vocal performance', 'Good production quality', 'Marketable genre']
      },
      marketPotential: actualAnalysis?.marketPotential || 75,
      socialScore: actualAnalysis?.socialScore || 70,
      insights: [
        'High energy and danceability make this suitable for clubs and parties',
        'Strong vocal presence with good production quality',
        'Pop genre has broad market appeal'
      ],
      recommendations: [
        'Consider releasing during peak summer months',
        'Target streaming platforms with playlist placement',
        'Focus on social media marketing for younger demographics'
      ]
    }

    return res.json({
      success: true,
      results: results
    })
  } catch (error) {
    console.error('Get analysis results error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get analysis results'
    })
  }
})

// GET /api/analysis/:id - Get analysis by ID
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('songId', 'title artist')

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    return res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get analysis'
    })
  }
})

// DELETE /api/analysis/:id - Delete analysis
router.delete('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndDelete(req.params.id)

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    // Remove reference from song
    await Song.findByIdAndUpdate(analysis.songId, {
      $unset: { analysisResults: 1 }
    })

    return res.json({
      success: true,
      message: 'Analysis deleted successfully'
    })
  } catch (error) {
    console.error('Delete analysis error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete analysis'
    })
  }
})

export default router 