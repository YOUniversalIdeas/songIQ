import express from 'express';
import { Song } from '../models/Song';
import { Analysis } from '../models/Analysis';
import { AnalysisResults } from '../models/AnalysisResults';

const router = express.Router();

// Start analysis for a song
router.post('/start/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, error: 'Song not found' });
    }

    // Check if analysis already exists
    let analysis = await Analysis.findOne({ songId });
    
    if (!analysis) {
      // Create new analysis
      analysis = new Analysis({
        songId,
        status: 'processing',
        startedAt: new Date(),
        progress: 0,
        currentStep: 'Initializing analysis...'
      });
      await analysis.save();
    } else if (analysis.status === 'completed') {
      // Reset completed analysis
      analysis.status = 'processing';
      analysis.progress = 0;
      analysis.currentStep = 'Initializing analysis...';
      analysis.startedAt = new Date();
      await analysis.save();
    }

    // Start the analysis process (simulated for now)
    startAnalysisProcess(songId);

    res.json({ 
      success: true, 
      message: 'Analysis started',
      analysisId: analysis._id,
      status: analysis.status
    });
  } catch (error) {
    console.error('Start analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to start analysis' });
  }
});

// Get analysis status
router.get('/status/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const analysis = await Analysis.findOne({ songId });
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.json({
      success: true,
      status: analysis.status,
      progress: analysis.progress,
      currentStep: analysis.currentStep,
      startedAt: analysis.startedAt,
      completedAt: analysis.completedAt
    });
  } catch (error) {
    console.error('Get analysis status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis status' });
  }
});

// Get analysis progress
router.get('/progress/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const analysis = await Analysis.findOne({ songId });
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    res.json({
      success: true,
      progress: analysis.progress,
      currentStep: analysis.currentStep,
      status: analysis.status
    });
  } catch (error) {
    console.error('Get analysis progress error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis progress' });
  }
});

// Get analysis results
router.get('/results/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const analysis = await Analysis.findOne({ songId });
    if (!analysis) {
      return res.status(404).json({ success: false, error: 'Analysis not found' });
    }

    if (analysis.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Analysis not completed yet' });
    }

    const results = await AnalysisResults.findOne({ analysisId: analysis._id });
    if (!results) {
      return res.status(404).json({ success: false, error: 'Analysis results not found' });
    }

    res.json({
      success: true,
      results: results
    });
  } catch (error) {
    console.error('Get analysis results error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis results' });
  }
});

// Simulated analysis process
async function startAnalysisProcess(songId: string) {
  const steps = [
    'Initializing analysis...',
    'Extracting audio features...',
    'Analyzing musical characteristics...',
    'Processing vocal analysis...',
    'Running genre classification...',
    'Calculating success predictions...',
    'Generating insights...',
    'Finalizing results...'
  ];

  let currentStepIndex = 0;
  let progress = 0;

  const interval = setInterval(async () => {
    try {
      const analysis = await Analysis.findOne({ songId });
      if (!analysis) {
        clearInterval(interval);
        return;
      }

      // Update progress
      progress += Math.random() * 15;
      if (progress > 100) progress = 100;

      // Update step
      if (progress > (currentStepIndex + 1) * 12.5 && currentStepIndex < steps.length - 1) {
        currentStepIndex++;
      }

      // Update analysis in database
      analysis.progress = Math.min(progress, 100);
      analysis.currentStep = steps[currentStepIndex];
      
      if (progress >= 100) {
        analysis.status = 'completed';
        analysis.completedAt = new Date();
        analysis.progress = 100;
        analysis.currentStep = 'Analysis completed';
        
        // Create sample results
        const results = new AnalysisResults({
          analysisId: analysis._id,
          songId: songId,
          audioFeatures: {
            tempo: Math.floor(Math.random() * 60) + 80,
            key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)],
            mode: Math.random() > 0.5 ? 'major' : 'minor',
            energy: Math.random(),
            danceability: Math.random(),
            valence: Math.random()
          },
          genre: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz'][Math.floor(Math.random() * 5)],
          successPrediction: Math.floor(Math.random() * 40) + 60,
          insights: [
            'Strong melodic structure detected',
            'Good rhythm consistency',
            'Vocals are well-balanced with instrumentation',
            'Commercial appeal potential identified'
          ],
          recommendations: [
            'Consider adding more dynamic range',
            'Focus on hook development',
            'Explore additional genre elements'
          ]
        });
        await results.save();
        
        clearInterval(interval);
      }
      
      await analysis.save();
    } catch (error) {
      console.error('Analysis process error:', error);
      clearInterval(interval);
    }
  }, 1000);
}

export default router;
