import express from 'express'
import { AnalysisResults, PerformanceMetrics } from '../models'

const router = express.Router()

// GET /api/market/compare/:songId - Get similar songs and market data
router.get('/compare/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const analysis = await AnalysisResults.findOne({ songId })
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found for this song'
      })
    }

    // Mock similar songs data
    const similarSongs = [
      {
        id: 'similar-1',
        title: 'Similar Hit 1',
        artist: 'Artist A',
        similarity: 87,
        performance: {
          streams: 15000000,
          chartPosition: 15
        }
      },
      {
        id: 'similar-2',
        title: 'Similar Hit 2',
        artist: 'Artist B',
        similarity: 82,
        performance: {
          streams: 12000000,
          chartPosition: 23
        }
      },
      {
        id: 'similar-3',
        title: 'Similar Hit 3',
        artist: 'Artist C',
        similarity: 79,
        performance: {
          streams: 9000000,
          chartPosition: 45
        }
      }
    ]

    return res.json({
      success: true,
      data: {
        similarSongs,
        genreInsights: {
          genre: analysis.audioFeatures.genre,
          averageTempo: 125,
          popularKeys: ['C#', 'D', 'F#'],
          successFactors: [
            'Strong vocal performance',
            'Catchy melody',
            'Good production quality',
            'Trending tempo range'
          ],
          marketSize: 85000000
        }
      }
    })
  } catch (error) {
    console.error('Get market comparison error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get market comparison'
    })
  }
})

// GET /api/market/trends/:genre - Get current genre trends
router.get('/trends/:genre', async (req, res) => {
  try {
    const { genre } = req.params

    // Mock trends data
    const trends = {
      popularTempos: [120, 125, 130, 128, 122],
      popularKeys: ['C#', 'D', 'F#', 'G', 'A'],
      trendingGenres: ['pop', 'hip-hop', 'electronic', 'r&b'],
      currentEnergy: 75,
      popularMoods: ['energetic', 'happy', 'uplifting', 'confident']
    }

    return res.json({
      success: true,
      data: trends
    })
  } catch (error) {
    console.error('Get trends error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get trends'
    })
  }
})

// GET /api/market/predictions/:songId - Get success predictions
router.get('/predictions/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const analysis = await AnalysisResults.findOne({ songId })
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found for this song'
      })
    }

    // Mock prediction data
    const predictions = {
      successScore: analysis.successPrediction.score,
      confidence: analysis.successPrediction.confidence,
      ranking: analysis.successPrediction.ranking,
      insights: analysis.successPrediction.insights,
      factors: analysis.successPrediction.factors,
      marketPosition: {
        genreRank: 15,
        overallRank: 125,
        potentialReach: 2500000
      },
      recommendations: [
        'Consider adding more dynamic range for impact',
        'Vocal performance could be enhanced with backing harmonies',
        'Production quality is good but could benefit from more modern mixing',
        'Tempo choice aligns well with current trends'
      ]
    }

    return res.json({
      success: true,
      data: predictions
    })
  } catch (error) {
    console.error('Get predictions error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get predictions'
    })
  }
})

// GET /api/market/performance/:songId - Get performance metrics for released songs
router.get('/performance/:songId', async (req, res) => {
  try {
    const { songId } = req.params

    const performance = await PerformanceMetrics.findOne({ songId })
    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Performance metrics not found for this song'
      })
    }

    return res.json({
      success: true,
      data: performance
    })
  } catch (error) {
    console.error('Get performance error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    })
  }
})

// POST /api/market/performance/update/:songId - Update performance metrics
router.post('/performance/update/:songId', async (req, res) => {
  try {
    const { songId } = req.params
    const updateData = req.body

    const performance = await PerformanceMetrics.findOneAndUpdate(
      { songId },
      updateData,
      { new: true, upsert: true }
    )

    return res.json({
      success: true,
      data: performance
    })
  } catch (error) {
    console.error('Update performance error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update performance metrics'
    })
  }
})

// GET /api/market/top-songs - Get top performing songs
router.get('/top-songs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const genre = req.query.genre as string

    let query = {}
    if (genre) {
      query = { 'audioFeatures.genre': genre }
    }

    const topSongs = await AnalysisResults.find(query)
      .sort({ 'successPrediction.score': -1 })
      .limit(limit)
      .populate('songId', 'title artist')

    return res.json({
      success: true,
      data: topSongs
    })
  } catch (error) {
    console.error('Get top songs error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get top songs'
    })
  }
})

export default router 