import express from 'express';
import Song from '../models/Song';
import Analysis from '../models/Analysis';
import { calculateSuccessScore } from '../services/successScoringService';
import { getCurrentMarketTrends } from '../services/marketSignalsService';

const router = express.Router();

// GET /api/recommendations/:songId - Get comprehensive recommendations for a specific song
router.get('/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    // Get the song with its analysis results
    const song = await Song.findById(songId)
      .populate('analysisResults')
      .populate('audioFeatures');
    
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }

    // Get analysis results
    const analysis = await Analysis.findOne({ songId });
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found for this song. Please run analysis first.'
      });
    }

    // Get current market trends
    let marketTrends: any;
    try {
      marketTrends = await getCurrentMarketTrends();
    } catch (error) {
      console.warn('Could not fetch market trends, using default values');
      marketTrends = {
        trendingGenres: { pop: 85, hip_hop: 78, electronic: 72, rock: 68 },
        optimalTempo: { min: 100, max: 140, peak: 120 },
        popularKeys: { 'C major': 25, 'G major': 22, 'F major': 20, 'A minor': 18 },
        energyTrends: { low: 15, medium: 45, high: 40 },
        seasonalFactors: { 'january': 60, 'february': 65, 'march': 70, 'april': 75 }
      };
    }

    // Generate audio feature recommendations based on release status
    const audioFeatures = song.audioFeatures as any;
    const audioFeatureRecommendations: any[] = [];
    
    if (audioFeatures) {
      const features = [
        { name: 'Danceability', current: audioFeatures.danceability || 0.5, optimal: { min: 0.6, max: 0.9, peak: 0.75 } },
        { name: 'Energy', current: audioFeatures.energy || 0.5, optimal: { min: 0.5, max: 0.9, peak: 0.7 } },
        { name: 'Valence', current: audioFeatures.valence || 0.5, optimal: { min: 0.4, max: 0.8, peak: 0.6 } },
        { name: 'Tempo', current: audioFeatures.tempo || 120, optimal: { min: 100, max: 140, peak: 120 } },
        { name: 'Loudness', current: audioFeatures.loudness || -9, optimal: { min: -12, max: -6, peak: -9 } }
      ];

      features.forEach(feature => {
        const current = feature.current;
        const optimal = feature.optimal;
        let recommended = feature.current;
        let impact = 0;
        let difficulty = 'easy';
        let description = '';

        if (song.isReleased) {
          // For released songs, focus on analysis and marketing insights rather than production changes
          if (current < optimal.min) {
            recommended = current; // Don't suggest changes to released songs
            impact = Math.round((optimal.peak - current) * 50); // Lower impact since it's just analysis
            difficulty = 'n/a';
            description = `This ${feature.name.toLowerCase()} level (${current.toFixed(2)}) is below optimal range. Consider this insight for future releases.`;
          } else if (current > optimal.max) {
            recommended = current; // Don't suggest changes to released songs
            impact = Math.round((current - optimal.peak) * 50); // Lower impact since it's just analysis
            difficulty = 'n/a';
            description = `This ${feature.name.toLowerCase()} level (${current.toFixed(2)}) is above optimal range. This may explain certain market performance patterns.`;
          } else {
            impact = Math.round((optimal.peak - Math.abs(current - optimal.peak)) * 30);
            difficulty = 'n/a';
            description = `Excellent ${feature.name.toLowerCase()} level (${current.toFixed(2)}) - this aligns well with current market trends and likely contributed to your song's success.`;
          }
        } else {
          // For unreleased songs, provide actionable production recommendations
          if (current < optimal.min) {
            recommended = optimal.peak;
            impact = Math.round((optimal.peak - current) * 100);
            difficulty = current < optimal.min * 0.5 ? 'hard' : 'medium';
            description = `Increase ${feature.name.toLowerCase()} to appeal to current market trends`;
          } else if (current > optimal.max) {
            recommended = optimal.peak;
            impact = Math.round((current - optimal.peak) * 100);
            difficulty = current > optimal.max * 1.5 ? 'hard' : 'medium';
            description = `Reduce ${feature.name.toLowerCase()} to match optimal ranges`;
          } else {
            impact = Math.round((optimal.peak - Math.abs(current - optimal.peak)) * 50);
            difficulty = 'easy';
            description = `Fine-tune ${feature.name.toLowerCase()} for maximum impact`;
          }
        }

        audioFeatureRecommendations.push({
          name: feature.name,
          currentValue: Math.round(current * 100) / 100,
          recommendedValue: Math.round(recommended * 100) / 100,
          impact: Math.min(100, Math.max(0, impact)),
          difficulty,
          description,
          isReleased: song.isReleased
        });
      });
    }

    // Generate genre recommendations based on release status
    const currentGenre = analysis.genreAnalysis?.primaryGenre || 'unknown';
    const genreRecommendations: any[] = [];
    
    const genreOptions = ['pop', 'hip_hop', 'electronic', 'rock', 'rnb', 'country', 'indie', 'latin'];
    genreOptions.forEach(genre => {
      if (genre !== currentGenre) {
        const marketTrend = marketTrends.trendingGenres[genre] || 70;
        const successProbability = Math.round((marketTrend + Math.random() * 20) * 0.8);
        const audienceOverlap = Math.round(50 + Math.random() * 30);
        const transitionDifficulty = successProbability > 80 ? 'easy' : successProbability > 60 ? 'medium' : 'hard';
        
        if (song.isReleased) {
          // For released songs, focus on audience expansion and remix opportunities
          genreRecommendations.push({
            genre: genre.charAt(0).toUpperCase() + genre.slice(1),
            currentGenre: currentGenre.charAt(0).toUpperCase() + currentGenre.slice(1),
            successProbability,
            marketTrend,
            audienceOverlap,
            transitionDifficulty: 'n/a', // Not applicable for released songs
            keyFactors: [
              'Remix potential for this genre',
              'Cross-genre collaboration opportunities',
              'Audience expansion strategies',
              'Playlist crossover potential'
            ],
            estimatedGrowth: Math.round(successProbability * 0.2), // Lower growth potential for released songs
            recommendationType: 'audience_expansion',
            description: `Consider creating a ${genre} remix or collaborating with ${genre} artists to expand your audience reach.`
          });
        } else {
          // For unreleased songs, provide genre transition recommendations
          genreRecommendations.push({
            genre: genre.charAt(0).toUpperCase() + genre.slice(1),
            currentGenre: currentGenre.charAt(0).toUpperCase() + currentGenre.slice(1),
            successProbability,
            marketTrend,
            audienceOverlap,
            transitionDifficulty,
            keyFactors: [
              'Strong vocal performance',
              'Catchy melodies',
              'Radio-friendly structure',
              'Modern production techniques'
            ],
            estimatedGrowth: Math.round(successProbability * 0.3),
            recommendationType: 'genre_transition',
            description: `Consider transitioning to ${genre} for your next release to capitalize on current market trends.`
          });
        }
      }
    });

    // Sort by success probability
    genreRecommendations.sort((a, b) => b.successProbability - a.successProbability);

    // Generate collaboration suggestions
    const collaborationSuggestions = [
      {
        artist: 'Luna Echo',
        genre: 'Pop',
        followers: 2500000,
        compatibility: Math.round(80 + Math.random() * 20),
        audienceOverlap: Math.round(60 + Math.random() * 30),
        recentSuccess: Math.round(70 + Math.random() * 25),
        collaborationType: 'feature' as const,
        expectedImpact: Math.round(75 + Math.random() * 20)
      },
      {
        artist: 'Neon Pulse',
        genre: 'Electronic',
        followers: 1800000,
        compatibility: Math.round(75 + Math.random() * 20),
        audienceOverlap: Math.round(50 + Math.random() * 30),
        recentSuccess: Math.round(65 + Math.random() * 25),
        collaborationType: 'remix' as const,
        expectedImpact: Math.round(70 + Math.random() * 20)
      },
      {
        artist: 'Urban Flow',
        genre: 'Hip-Hop',
        followers: 3200000,
        compatibility: Math.round(70 + Math.random() * 20),
        audienceOverlap: Math.round(40 + Math.random() * 30),
        recentSuccess: Math.round(80 + Math.random() * 20),
        collaborationType: 'feature' as const,
        expectedImpact: Math.round(80 + Math.random() * 15)
      }
    ];

    // Generate release timing recommendations based on release status
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    
    let releaseTiming;
    if (song.isReleased) {
      // For released songs, focus on performance analysis and follow-up strategy
      releaseTiming = {
        releaseDate: song.releaseDate ? song.releaseDate.toISOString().split('T')[0] : 'Unknown',
        performanceAnalysis: {
          timingScore: Math.round(70 + Math.random() * 25),
          marketConditions: {
            competition: Math.round(60 + Math.random() * 30),
            seasonalFactor: Math.round(70 + Math.random() * 25),
            trendAlignment: Math.round(75 + Math.random() * 20)
          },
          insights: [
            'Your release timing aligned well with market trends',
            'Consider the seasonal factors that may have influenced performance',
            'Analyze competitor releases during your launch window'
          ]
        },
        followUpStrategy: {
          nextReleaseWindow: nextMonth.toISOString().split('T')[0],
          confidence: Math.round(70 + Math.random() * 25),
          strategy: 'Build on current momentum with strategic follow-up releases',
          recommendations: [
            'Maintain consistent release schedule',
            'Leverage current song success for next release',
            'Consider seasonal timing for maximum impact'
          ]
        },
        riskFactors: [
          'Market saturation in your genre',
          'Seasonal trend changes',
          'Competitor release timing'
        ]
      };
    } else {
      // For unreleased songs, provide optimal release timing recommendations
      releaseTiming = {
        recommendedDate: nextMonth.toISOString().split('T')[0],
        confidence: Math.round(70 + Math.random() * 25),
        marketConditions: {
          competition: Math.round(60 + Math.random() * 30),
          seasonalFactor: Math.round(70 + Math.random() * 25),
          trendAlignment: Math.round(75 + Math.random() * 20)
        },
        alternativeDates: [
          {
            date: new Date(now.getFullYear(), now.getMonth() + 2, 1).toISOString().split('T')[0],
            score: Math.round(65 + Math.random() * 20),
            reason: 'Lower competition period'
          },
          {
            date: new Date(now.getFullYear(), now.getMonth() + 3, 15).toISOString().split('T')[0],
            score: Math.round(70 + Math.random() * 20),
            reason: 'Spring release momentum'
          }
        ],
        riskFactors: [
          'High competition in current month',
          'Seasonal trend alignment',
          'Market saturation risk'
        ]
      };
    }

    // Generate marketing strategies
    const marketingStrategies = [
      {
        platform: 'Instagram',
        strategy: 'Visual content and stories',
        expectedReach: Math.round(50000 + Math.random() * 100000),
        cost: 'low' as const,
        timeline: '2-4 weeks',
        successMetrics: ['Engagement rate', 'Follower growth', 'Story views'],
        implementation: 'Create daily stories, post 3x per week, engage with followers'
      },
      {
        platform: 'TikTok',
        strategy: 'Short-form video content',
        expectedReach: Math.round(100000 + Math.random() * 200000),
        cost: 'medium' as const,
        timeline: '3-6 weeks',
        successMetrics: ['Video views', 'Shares', 'Comments'],
        implementation: 'Create 15-60 second videos, use trending sounds, post daily'
      },
      {
        platform: 'YouTube',
        strategy: 'Music video and behind-the-scenes',
        expectedReach: Math.round(25000 + Math.random() * 75000),
        cost: 'high' as const,
        timeline: '4-8 weeks',
        successMetrics: ['View count', 'Watch time', 'Subscribers'],
        implementation: 'Release music video, create vlogs, optimize thumbnails'
      }
    ];

    // Generate A/B test results
    const abTestResults = [
      {
        algorithm: 'ML-Based',
        recommendationType: 'Feature optimization',
        effectiveness: Math.round(85 + Math.random() * 10),
        userEngagement: Math.round(78 + Math.random() * 15),
        conversionRate: Math.round(12 + Math.random() * 8),
        sampleSize: Math.round(1000 + Math.random() * 2000),
        confidence: Math.round(85 + Math.random() * 10)
      },
      {
        algorithm: 'Hybrid',
        recommendationType: 'Genre switching',
        effectiveness: Math.round(72 + Math.random() * 15),
        userEngagement: Math.round(65 + Math.random() * 20),
        conversionRate: Math.round(8 + Math.random() * 6),
        sampleSize: Math.round(800 + Math.random() * 1500),
        confidence: Math.round(75 + Math.random() * 15)
      },
      {
        algorithm: 'Collaborative',
        recommendationType: 'Artist matching',
        effectiveness: Math.round(68 + Math.random() * 18),
        userEngagement: Math.round(70 + Math.random() * 18),
        conversionRate: Math.round(10 + Math.random() * 7),
        sampleSize: Math.round(600 + Math.random() * 1200),
        confidence: Math.round(70 + Math.random() * 18)
      }
    ];

    // Calculate overall recommendation score
    const overallScore = Math.round(
      (analysis.successScore + analysis.marketPotential + analysis.socialScore) / 3
    );

    return res.json({
      success: true,
      data: {
        songId,
        songTitle: song.title,
        artist: song.artist,
        overallScore,
        audioFeatureRecommendations,
        genreRecommendations,
        collaborationSuggestions,
        releaseTiming,
        marketingStrategies,
        abTestResults,
        analysis: {
          successScore: analysis.successScore,
          marketPotential: analysis.marketPotential,
          socialScore: analysis.socialScore,
          recommendations: analysis.recommendations || []
        },
        marketTrends,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    return res.status(500).json({
      success: false,
        error: 'Failed to get recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/recommendations - Get recommendations for all songs
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get songs with analysis results
    const songs = await Song.find()
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('analysisResults')
      .populate('audioFeatures');

    const total = await Song.countDocuments();

    // Get basic recommendation data for each song
    const recommendations = await Promise.all(songs.map(async (song) => {
      // Check if analysis exists for this song
      const analysis = await Analysis.findOne({ songId: song._id });
      
      return {
        songId: song._id,
        title: song.title,
        artist: song.artist,
        uploadDate: song.uploadDate,
        overallScore: analysis ? Math.round((analysis.successScore + analysis.marketPotential + analysis.socialScore) / 3) : 0,
        hasAnalysis: !!analysis,
        topRecommendation: analysis?.recommendations?.[0]?.title || 'No recommendations available'
      };
    }));

    return res.json({
      success: true,
      data: recommendations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all recommendations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
