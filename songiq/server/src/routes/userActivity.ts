import express from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import Song from '../models/Song';
import Analysis from '../models/Analysis';

const router = express.Router();

// Get all user submissions
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const songs = await Song.find({ userId }).sort({ createdAt: -1 });
    const submissions = await Promise.all(
      songs.map(async (song: any) => {
        const analysis = await Analysis.findOne({ songId: song._id });
        return {
          id: song._id.toString(),
          songName: song.title,
          submittedAt: song.createdAt,
          status: analysis ? 'completed' : 'processing',
          reportUrl: analysis ? `/api/user-activity/reports/${song._id}/download` : undefined,
          analysisId: analysis?._id
        };
      })
    );
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Demo endpoint for development (no authentication required)
router.get('/demo/submissions', async (req, res) => {
  try {
    // Return mock data for demo purposes
    const mockSubmissions = [
      {
        id: 'demo-song-1',
        songName: 'Demo Song 1',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        status: 'completed',
        reportUrl: '/api/user-activity/reports/demo-song-1/download',
        analysisId: 'demo-analysis-1'
      },
      {
        id: 'demo-song-2',
        songName: 'Demo Song 2',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'completed',
        reportUrl: '/api/user-activity/reports/demo-song-2/download',
        analysisId: 'demo-analysis-2'
      },
      {
        id: 'demo-song-3',
        songName: 'Demo Song 3',
        submittedAt: new Date().toISOString(), // Today
        status: 'processing',
        reportUrl: undefined,
        analysisId: undefined
      }
    ];
    
    res.json(mockSubmissions);
  } catch (error) {
    console.error('Error fetching demo submissions:', error);
    res.status(500).json({ error: 'Failed to fetch demo submissions' });
  }
});

// Download report for a specific song
router.get('/reports/:songId/download', authenticateToken, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user!.id;
    const song = await Song.findOne({ _id: songId, userId });
    if (!song) {
      res.status(404).json({ error: 'Song not found or access denied' });
      return;
    }
    const analysis = await Analysis.findOne({ songId });
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found for this song' });
      return;
    }
    const reportData = {
      songTitle: song.title,
      artist: song.artist,
      submittedAt: song.createdAt,
      successScore: analysis.successScore,
      marketPotential: analysis.marketPotential,
      socialScore: analysis.socialScore,
      genreAnalysis: analysis.genreAnalysis,
      audienceAnalysis: analysis.audienceAnalysis,
      competitiveAnalysis: analysis.competitiveAnalysis,
      productionQuality: analysis.productionQuality,
      releaseRecommendations: analysis.releaseRecommendations,
      recommendations: analysis.recommendations
    };
    res.setHeader('Content-Type', 'application/json'); // Currently JSON, will be PDF
    res.setHeader('Content-Disposition', `attachment; filename="${song.title}_Report.json"`);
    res.json(reportData);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const totalSongs = await Song.countDocuments({ userId });
    const completedAnalyses = await Analysis.countDocuments({ 
      songId: { $in: await Song.find({ userId }).distinct('_id') }
    });
    
    res.json({
      totalSongs,
      completedAnalyses,
      pendingAnalyses: totalSongs - completedAnalyses
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Demo endpoint for development (no authentication required)
router.get('/demo/stats', async (req, res) => {
  try {
    // Return mock stats for demo purposes
    res.json({
      totalSongs: 3,
      completedAnalyses: 2,
      pendingAnalyses: 1
    });
  } catch (error) {
    console.error('Error fetching demo stats:', error);
    res.status(500).json({ error: 'Failed to fetch demo stats' });
  }
});

export default router;
