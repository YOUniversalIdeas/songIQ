import express from 'express';
import { calculateSuccessScore } from '../services/successScoringService';
import { getCurrentMarketTrends, aggregateMarketSignals } from '../services/marketSignalsService';
import { 
  createABTest, 
  getActiveABTest, 
  assignVariant, 
  applyABTestVariant,
  analyzeABTest,
  getAllABTests,
  getABTestResults,
  stopABTest,
  createExampleABTests
} from '../services/abTestingService';

const router = express.Router();

// POST /api/success/calculate - Calculate success score for a song
router.post('/calculate', async (req, res) => {
  try {
    const { audioFeatures, genre, releaseDate, includeMarketTrends = true } = req.body;

    if (!audioFeatures) {
      return res.status(400).json({
        success: false,
        error: 'Audio features are required',
        details: 'Please provide audio features for analysis'
      });
    }

    // Get current market trends if requested
    let marketTrends;
    if (includeMarketTrends) {
      try {
        marketTrends = await getCurrentMarketTrends();
      } catch (error) {
        console.warn('Could not fetch market trends, using default values');
      }
    }

    // Parse release date if provided
    const parsedReleaseDate = releaseDate ? new Date(releaseDate) : undefined;

    // Calculate success score
    const result = await calculateSuccessScore(
      audioFeatures,
      genre,
      parsedReleaseDate,
      marketTrends
    );

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Success score calculated successfully'
    });

  } catch (error) {
    console.error('Success score calculation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate success score',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/success/market-trends - Get current market trends
router.get('/market-trends', async (req, res) => {
  try {
    const marketTrends = await getCurrentMarketTrends();

    return res.status(200).json({
      success: true,
      data: marketTrends,
      message: 'Market trends retrieved successfully'
    });

  } catch (error) {
    console.error('Market trends fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch market trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/market-signals/update - Manually trigger market signals update
router.post('/market-signals/update', async (req, res) => {
  try {
    const marketSignal = await aggregateMarketSignals();

    return res.status(200).json({
      success: true,
      data: {
        timestamp: marketSignal.timestamp,
        confidence: marketSignal.confidence,
        trendingGenres: Object.keys(marketSignal.data.trendingGenres).slice(0, 5),
        topSongs: marketSignal.data.topSongs.slice(0, 3)
      },
      message: 'Market signals updated successfully'
    });

  } catch (error) {
    console.error('Market signals update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update market signals',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// A/B Testing Routes

// POST /api/success/ab-tests - Create a new A/B test
router.post('/ab-tests', async (req, res) => {
  try {
    const { name, description, variants, targetMetric, minSampleSize } = req.body;

    if (!name || !variants || Object.keys(variants).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid A/B test configuration',
        details: 'Name and variants are required'
      });
    }

    const test = createABTest({
      name,
      description,
      variants,
      targetMetric: targetMetric || 'accuracy',
      minSampleSize: minSampleSize || 100,
      isActive: true,
      startDate: new Date()
    });

    return res.status(201).json({
      success: true,
      data: test,
      message: 'A/B test created successfully'
    });

  } catch (error) {
    console.error('A/B test creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create A/B test',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/success/ab-tests - Get all A/B tests
router.get('/ab-tests', async (req, res) => {
  try {
    const tests = getAllABTests();

    return res.status(200).json({
      success: true,
      data: tests,
      message: 'A/B tests retrieved successfully'
    });

  } catch (error) {
    console.error('A/B tests fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch A/B tests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/success/ab-tests/:testId - Get specific A/B test
router.get('/ab-tests/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const tests = getAllABTests();
    const test = tests.find(t => t.testId === testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        error: 'A/B test not found',
        details: `No test found with ID: ${testId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: test,
      message: 'A/B test retrieved successfully'
    });

  } catch (error) {
    console.error('A/B test fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch A/B test',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/:testId/analyze - Analyze A/B test results
router.post('/ab-tests/:testId/analyze', async (req, res) => {
  try {
    const { testId } = req.params;
    const analysis = analyzeABTest(testId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'A/B test not found or no results available',
        details: `No analysis available for test ID: ${testId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
      message: 'A/B test analysis completed successfully'
    });

  } catch (error) {
    console.error('A/B test analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze A/B test',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/:testId/stop - Stop an A/B test
router.post('/ab-tests/:testId/stop', async (req, res) => {
  try {
    const { testId } = req.params;
    const stopped = stopABTest(testId);

    if (!stopped) {
      return res.status(404).json({
        success: false,
        error: 'A/B test not found',
        details: `No test found with ID: ${testId}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A/B test stopped successfully'
    });

  } catch (error) {
    console.error('A/B test stop error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to stop A/B test',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/success/ab-tests/:testId/results - Get A/B test results
router.get('/ab-tests/:testId/results', async (req, res) => {
  try {
    const { testId } = req.params;
    const results = getABTestResults(testId);

    return res.status(200).json({
      success: true,
      data: {
        testId,
        results,
        count: results.length
      },
      message: 'A/B test results retrieved successfully'
    });

  } catch (error) {
    console.error('A/B test results fetch error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch A/B test results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/calculate - Calculate success score with A/B testing
router.post('/ab-tests/calculate', async (req, res) => {
  try {
    const { songId, audioFeatures, genre, releaseDate } = req.body;

    if (!songId || !audioFeatures) {
      return res.status(400).json({
        success: false,
        error: 'Song ID and audio features are required',
        details: 'Please provide song ID and audio features for A/B testing'
      });
    }

    // Get active A/B test for this song
    const activeTest = getActiveABTest(songId);

    if (!activeTest) {
      // No active A/B test, use standard calculation
      const result = await calculateSuccessScore(audioFeatures, genre, releaseDate ? new Date(releaseDate) : undefined);
      
      return res.status(200).json({
        success: true,
        data: {
          ...result,
          abTest: null,
          variant: null
        },
        message: 'Success score calculated (no active A/B test)'
      });
    }

    // Assign variant and calculate score
    const variantId = assignVariant(activeTest, songId);
    const result = await applyABTestVariant(activeTest, variantId, audioFeatures, genre, releaseDate ? new Date(releaseDate) : undefined);

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        abTest: {
          testId: activeTest.testId,
          name: activeTest.name,
          description: activeTest.description
        },
        variant: {
          id: variantId,
          name: activeTest.variants[variantId]?.name || 'Unknown',
          description: activeTest.variants[variantId]?.description || 'No description'
        }
      },
      message: 'Success score calculated with A/B testing'
    });

  } catch (error) {
    console.error('A/B test calculation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate success score with A/B testing',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/feedback - Record user feedback for A/B test
router.post('/ab-tests/feedback', async (req, res) => {
  try {
    const { testId, songId, userFeedback } = req.body;

    if (!testId || !songId || userFeedback === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Test ID, song ID, and user feedback are required',
        details: 'Please provide all required fields'
      });
    }

    // Import the function to record feedback
    const { recordUserFeedback } = await import('../services/abTestingService');
    recordUserFeedback(testId, songId, userFeedback);

    return res.status(200).json({
      success: true,
      message: 'User feedback recorded successfully'
    });

  } catch (error) {
    console.error('User feedback recording error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record user feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/performance - Record actual performance for A/B test
router.post('/ab-tests/performance', async (req, res) => {
  try {
    const { testId, songId, actualPerformance } = req.body;

    if (!testId || !songId || actualPerformance === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Test ID, song ID, and actual performance are required',
        details: 'Please provide all required fields'
      });
    }

    // Import the function to record performance
    const { recordActualPerformance } = await import('../services/abTestingService');
    recordActualPerformance(testId, songId, actualPerformance);

    return res.status(200).json({
      success: true,
      message: 'Actual performance recorded successfully'
    });

  } catch (error) {
    console.error('Performance recording error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to record actual performance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/success/ab-tests/example - Create example A/B tests
router.post('/ab-tests/example', async (req, res) => {
  try {
    createExampleABTests();
    const tests = getAllABTests();

    return res.status(201).json({
      success: true,
      data: tests,
      message: 'Example A/B tests created successfully'
    });

  } catch (error) {
    console.error('Example A/B tests creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create example A/B tests',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 