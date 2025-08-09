import express from 'express'
import { Song, AnalysisResults } from '../models'

const router = express.Router()

// POST /api/analysis/start/:songId - Start analysis process
router.post('/start/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const song = await Song.findById(songId)
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      })
    }

    // Check if analysis already exists
    const existingAnalysis = await AnalysisResults.findOne({ songId })
    if (existingAnalysis) {
      return res.status(400).json({
        success: false,
        error: 'Analysis already exists for this song'
      })
    }

    // TODO: Start actual analysis process (queue job, etc.)
    // For now, create a placeholder analysis
    const analysisData = {
      songId,
      audioFeatures: {
        genre: 'pop',
        subGenre: 'pop rock',
        tempo: 128,
        key: 'C#',
        mood: 'energetic',
        energy: 75,
        duration: 225,
        dynamicRange: 65,
        loudness: -12.5,
        spectralCentroid: 2500,
        spectralRolloff: 5000
      },
      vocalCharacteristics: {
        style: 'pop',
        range: 'tenor',
        intensity: 70,
        clarity: 80,
        presence: 75
      },
      instrumentation: ['drums', 'bass', 'guitar', 'synth'],
      lyricalThemes: ['love', 'energy', 'freedom'],
      successPrediction: {
        score: 78,
        ranking: 'good',
        insights: [
          'Strong vocal performance with clear articulation',
          'Tempo aligns well with current pop trends',
          'Energy level matches successful songs in this genre',
          'Consider adding more dynamic range for impact'
        ],
        confidence: 85,
        factors: [
          {
            name: 'Tempo Alignment',
            weight: 0.25,
            score: 85,
            description: 'Tempo matches current popular range'
          },
          {
            name: 'Energy Level',
            weight: 0.20,
            score: 75,
            description: 'Good energy for the genre'
          },
          {
            name: 'Vocal Quality',
            weight: 0.30,
            score: 80,
            description: 'Strong vocal performance'
          },
          {
            name: 'Production Quality',
            weight: 0.25,
            score: 70,
            description: 'Good production standards'
          }
        ]
      }
    }

    const analysis = new AnalysisResults(analysisData)
    await analysis.save()

    // Update song with analysis reference
    song.analysisResults = analysis._id
    await song.save()

    return res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        status: 'completed',
        message: 'Analysis completed successfully'
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

// GET /api/analysis/status/:songId - Check analysis status
router.get('/status/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const analysis = await AnalysisResults.findOne({ songId })
    
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

    const analysis = await AnalysisResults.findOne({ songId })
      .populate('songId', 'title artist')

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis results not found'
      })
    }

    return res.json({
      success: true,
      data: analysis
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
    const analysis = await AnalysisResults.findById(req.params.id)
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
    const analysis = await AnalysisResults.findByIdAndDelete(req.params.id)

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