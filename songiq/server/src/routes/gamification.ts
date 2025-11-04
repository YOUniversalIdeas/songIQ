import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { GamificationService } from '../services/gamificationService';
import Challenge from '../models/Challenge';
import UserChallenge from '../models/UserChallenge';
import DailyReward from '../models/DailyReward';
import Streak from '../models/Streak';
import User from '../models/User';

const router = express.Router();

// GET /api/gamification/stats - Get user's gamification stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const stats = await GamificationService.getUserStats(userId);
    
    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/gamification/daily-reward - Claim daily reward
router.post('/daily-reward', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const result = await GamificationService.trackDailyLogin(userId);

    if (!result) {
      return res.status(500).json({ error: 'Failed to claim reward' });
    }

    if (result.alreadyClaimed) {
      return res.status(400).json({ 
        error: 'Daily reward already claimed',
        streak: result.streak
      });
    }

    res.json({
      message: 'Daily reward claimed!',
      reward: result.reward,
      streak: result.streak,
      level: result.userLevel,
      xp: result.userXP
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

// GET /api/gamification/challenges - Get active challenges
router.get('/challenges', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    const query: any = {
      isActive: true,
      endDate: { $gte: new Date() }
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    const challenges = await Challenge.find(query).sort({ createdAt: -1 });

    // Get user's progress for each challenge
    const challengesWithProgress = await Promise.all(
      challenges.map(async (challenge) => {
        const userChallenge = await UserChallenge.findOne({
          userId,
          challengeId: challenge._id
        });

        return {
          ...challenge.toObject(),
          userProgress: userChallenge?.progress || 0,
          isCompleted: userChallenge?.isCompleted || false,
          completedAt: userChallenge?.completedAt
        };
      })
    );

    res.json({ challenges: challengesWithProgress });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// GET /api/gamification/challenges/completed - Get completed challenges
router.get('/challenges/completed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 10, skip = 0 } = req.query;

    const completedChallenges = await UserChallenge.find({
      userId,
      isCompleted: true
    })
      .populate('challengeId')
      .sort({ completedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await UserChallenge.countDocuments({
      userId,
      isCompleted: true
    });

    res.json({
      challenges: completedChallenges,
      total,
      hasMore: Number(skip) + completedChallenges.length < total
    });
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    res.status(500).json({ error: 'Failed to fetch completed challenges' });
  }
});

// GET /api/gamification/streaks - Get user's streaks
router.get('/streaks', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;

    const [loginStreak, tradingStreak, winningStreak] = await Promise.all([
      Streak.findOne({ userId, type: 'login' }),
      Streak.findOne({ userId, type: 'trading' }),
      Streak.findOne({ userId, type: 'winning' })
    ]);

    res.json({
      login: {
        current: loginStreak?.currentStreak || 0,
        longest: loginStreak?.longestStreak || 0,
        lastActivity: loginStreak?.lastActivityDate
      },
      trading: {
        current: tradingStreak?.currentStreak || 0,
        longest: tradingStreak?.longestStreak || 0,
        lastActivity: tradingStreak?.lastActivityDate
      },
      winning: {
        current: winningStreak?.currentStreak || 0,
        longest: winningStreak?.longestStreak || 0,
        lastActivity: winningStreak?.lastActivityDate
      }
    });
  } catch (error) {
    console.error('Error fetching streaks:', error);
    res.status(500).json({ error: 'Failed to fetch streaks' });
  }
});

// GET /api/gamification/leaderboard - Get tier-based leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { tier, limit = 50 } = req.query;

    const query: any = { isActive: true };
    if (tier && tier !== 'all') {
      query['gamification.tier'] = tier;
    }

    const users = await User.find(query)
      .select('username firstName lastName gamification')
      .sort({ 'gamification.level': -1, 'gamification.totalXp': -1 })
      .limit(Number(limit))
      .lean();

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      level: user.gamification.level,
      xp: user.gamification.totalXp,
      tier: user.gamification.tier
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/gamification/daily-rewards/history - Get daily reward history
router.get('/daily-rewards/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 7 } = req.query;

    const rewards = await DailyReward.find({ userId })
      .sort({ claimedAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ rewards });
  } catch (error) {
    console.error('Error fetching daily rewards history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/gamification/tier-info - Get tier information
router.get('/tier-info', (req, res) => {
  const { tier } = req.query;

  if (!tier) {
    // Return all tiers
    const allTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'].map(t =>
      GamificationService.getTierInfo(t)
    );
    return res.json({ tiers: allTiers });
  }

  const tierInfo = GamificationService.getTierInfo(tier as string);
  res.json({ tier: tierInfo });
});

// POST /api/gamification/award-xp - Award XP (for testing/admin)
router.post('/award-xp', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid XP amount' });
    }

    const result = await GamificationService.awardXP(userId, 'TRADE', amount / 5);

    res.json({
      message: 'XP awarded',
      ...result
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

export default router;

