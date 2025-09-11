import express from 'express';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';
import Song from '../models/Song';
import Analysis from '../models/Analysis';
import SimpleAnalysis from '../models/SimpleAnalysis';

const router = express.Router();

// Get all user submissions
router.get('/submissions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const songs = await Song.find({ userId }).sort({ createdAt: -1 });
    const submissions = await Promise.all(
      songs.map(async (song: any) => {
        // Check both Analysis and SimpleAnalysis models
        const analysis = await Analysis.findOne({ songId: song._id });
        const simpleAnalysis = await SimpleAnalysis.findOne({ songId: song._id });
        const hasAnalysis = analysis || simpleAnalysis;
        
        return {
          id: song._id.toString(),
          songName: song.title,
          artist: song.artist,
          submittedAt: song.createdAt,
          status: hasAnalysis ? 'completed' : 'processing',
          reportUrl: hasAnalysis ? `/api/user-activity/reports/${song._id}/download` : undefined,
          analysisId: hasAnalysis?._id,
          // Include the scores from the analysis (prefer SimpleAnalysis if available)
          successScore: simpleAnalysis?.successScore || analysis?.successScore,
          marketPotential: simpleAnalysis?.marketPotential || analysis?.marketPotential,
          socialScore: simpleAnalysis?.socialScore || analysis?.socialScore,
          genre: song.genre,
          duration: song.duration
        };
      })
    );
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// TODO: Implement real user submissions endpoint
router.get('/demo/submissions', async (req, res) => {
  try {
    // TODO: Replace with real database query
    // TODO: Replace with real database query
    // const submissions = await Song.find({ userId: req.user?.id })
    //   .populate('analysisId')
    //   .sort({ createdAt: -1 });
    
    // For now, return empty array to indicate no real data
    const mockSubmissions: any[] = [];
    
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
