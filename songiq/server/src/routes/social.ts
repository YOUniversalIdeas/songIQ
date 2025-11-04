import express from 'express';
import Follow from '../models/Follow';
import Achievement, { ACHIEVEMENT_TYPES } from '../models/Achievement';
import User from '../models/User';
import Trade from '../models/Trade';
import Position from '../models/Position';
import Market from '../models/Market';
import Comment from '../models/Comment';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// ===== USER PROFILES =====

// GET /api/social/profile/:userId - Get user profile with statistics
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id; // May be undefined if not authenticated

    // Get user basic info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get trading statistics
    const positions = await Position.find({ userId });
    const trades = await Trade.find({ userId });
    const marketsCreated = await Market.countDocuments({ creatorId: userId });
    const comments = await Comment.countDocuments({ userId });

    // Calculate performance metrics
    const totalPnL = positions.reduce((sum, p) => sum + p.realizedPnL + p.unrealizedPnL, 0);
    const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
    const roi = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    const activePositions = positions.filter(p => p.shares > 0).length;
    const winningPositions = positions.filter(p => p.realizedPnL > 0).length;
    const totalClosedPositions = positions.filter(p => p.shares === 0 && p.realizedPnL !== 0).length;
    const winRate = totalClosedPositions > 0 ? (winningPositions / totalClosedPositions) * 100 : 0;

    // Get followers and following counts
    const followersCount = await Follow.countDocuments({ followingId: userId });
    const followingCount = await Follow.countDocuments({ followerId: userId });

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRelation = await Follow.findOne({ 
        followerId: currentUserId, 
        followingId: userId 
      });
      isFollowing = !!followRelation;
    }

    // Get achievements
    const achievements = await Achievement.find({ userId })
      .sort({ unlockedAt: -1 })
      .limit(20);

    // Calculate reputation score
    const reputationScore = calculateReputation({
      totalPnL,
      winRate,
      marketsCreated,
      comments,
      followersCount,
      tradesCount: trades.length,
      achievements: achievements.length
    });

    // Recent activity
    const recentTrades = await Trade.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('marketId', 'title category');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      statistics: {
        totalPnL,
        totalInvested,
        roi,
        activePositions,
        totalTrades: trades.length,
        marketsCreated,
        comments,
        winRate,
        winningPositions,
        totalClosedPositions
      },
      social: {
        followersCount,
        followingCount,
        isFollowing,
        reputationScore
      },
      achievements: achievements.map(a => ({
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.icon,
        rarity: a.rarity,
        unlockedAt: a.unlockedAt
      })),
      recentActivity: recentTrades
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Helper function to calculate reputation score
function calculateReputation(data: {
  totalPnL: number;
  winRate: number;
  marketsCreated: number;
  comments: number;
  followersCount: number;
  tradesCount: number;
  achievements: number;
}): number {
  let score = 0;

  // P&L contribution (max 30 points)
  if (data.totalPnL > 0) {
    score += Math.min(30, data.totalPnL / 100);
  }

  // Win rate contribution (max 25 points)
  score += (data.winRate / 100) * 25;

  // Activity contribution (max 20 points)
  score += Math.min(10, data.tradesCount / 10);
  score += Math.min(5, data.marketsCreated * 2);
  score += Math.min(5, data.comments / 10);

  // Social contribution (max 15 points)
  score += Math.min(15, data.followersCount / 2);

  // Achievement contribution (max 10 points)
  score += Math.min(10, data.achievements);

  return Math.min(100, Math.round(score));
}

// ===== FOLLOW SYSTEM =====

// POST /api/social/follow/:userId - Follow a user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user!.id;
    const followingId = req.params.userId;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow relationship
    const follow = new Follow({ followerId, followingId });
    await follow.save();

    // Check for achievement (10 followers)
    const followerCount = await Follow.countDocuments({ followingId });
    if (followerCount === 10) {
      await awardAchievement(followingId, ACHIEVEMENT_TYPES.FOLLOWED_BY_10);
    } else if (followerCount === 100) {
      await awardAchievement(followingId, ACHIEVEMENT_TYPES.FOLLOWED_BY_100);
    }

    res.json({ 
      message: 'Successfully followed user',
      followersCount: followerCount
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// DELETE /api/social/follow/:userId - Unfollow a user
router.delete('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const followerId = req.user!.id;
    const followingId = req.params.userId;

    const result = await Follow.findOneAndDelete({ followerId, followingId });
    
    if (!result) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    const followerCount = await Follow.countDocuments({ followingId });

    res.json({ 
      message: 'Successfully unfollowed user',
      followersCount: followerCount
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// GET /api/social/followers/:userId - Get user's followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const followers = await Follow.find({ followingId: userId })
      .populate('followerId', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Follow.countDocuments({ followingId: userId });

    res.json({
      followers: followers.map(f => f.followerId),
      total,
      hasMore: Number(skip) + followers.length < total
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// GET /api/social/following/:userId - Get users that this user follows
router.get('/following/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const following = await Follow.find({ followerId: userId })
      .populate('followingId', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Follow.countDocuments({ followerId: userId });

    res.json({
      following: following.map(f => f.followingId),
      total,
      hasMore: Number(skip) + following.length < total
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// ===== SOCIAL FEED =====

// GET /api/social/feed - Get social feed of followed users' activity
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { limit = 20, type = 'all' } = req.query;

    // Get list of users this user follows
    const following = await Follow.find({ followerId: userId }).select('followingId');
    const followingIds = following.map(f => f.followingId);

    if (followingIds.length === 0) {
      return res.json({ activities: [], message: 'Follow users to see their activity' });
    }

    const activities: any[] = [];

    // Get trades from followed users
    if (type === 'all' || type === 'trades') {
      const trades = await Trade.find({ 
        userId: { $in: followingIds },
        status: 'completed'
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('userId', 'username firstName lastName')
        .populate('marketId', 'title category')
        .lean();

      activities.push(...trades.map(trade => ({
        type: 'trade',
        user: trade.userId,
        data: trade,
        timestamp: trade.createdAt
      })));
    }

    // Get markets created by followed users
    if (type === 'all' || type === 'markets') {
      const markets = await Market.find({ 
        creatorId: { $in: followingIds }
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('creatorId', 'username firstName lastName')
        .lean();

      activities.push(...markets.map(market => ({
        type: 'market_created',
        user: market.creatorId,
        data: market,
        timestamp: market.createdAt
      })));
    }

    // Get comments from followed users
    if (type === 'all' || type === 'comments') {
      const comments = await Comment.find({ 
        userId: { $in: followingIds }
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .populate('userId', 'username firstName lastName')
        .populate('marketId', 'title')
        .lean();

      activities.push(...comments.map(comment => ({
        type: 'comment',
        user: comment.userId,
        data: comment,
        timestamp: comment.createdAt
      })));
    }

    // Get achievements from followed users
    if (type === 'all' || type === 'achievements') {
      const achievements = await Achievement.find({ 
        userId: { $in: followingIds }
      })
        .sort({ unlockedAt: -1 })
        .limit(Number(limit))
        .populate('userId', 'username firstName lastName')
        .lean();

      activities.push(...achievements.map(achievement => ({
        type: 'achievement',
        user: achievement.userId,
        data: achievement,
        timestamp: achievement.unlockedAt
      })));
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to requested number
    const limitedActivities = activities.slice(0, Number(limit));

    res.json({
      activities: limitedActivities,
      total: limitedActivities.length
    });
  } catch (error) {
    console.error('Error fetching social feed:', error);
    res.status(500).json({ error: 'Failed to fetch social feed' });
  }
});

// ===== ACHIEVEMENTS =====

// GET /api/social/achievements/:userId - Get user's achievements
router.get('/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const achievements = await Achievement.find({ userId })
      .sort({ unlockedAt: -1 });

    // Group by rarity
    const groupedByRarity = {
      legendary: achievements.filter(a => a.rarity === 'legendary'),
      epic: achievements.filter(a => a.rarity === 'epic'),
      rare: achievements.filter(a => a.rarity === 'rare'),
      common: achievements.filter(a => a.rarity === 'common')
    };

    res.json({
      achievements,
      groupedByRarity,
      total: achievements.length
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// POST /api/social/achievements/check - Check and award achievements for current user
router.post('/achievements/check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const newAchievements: any[] = [];

    // Check for various achievements
    const checks = await checkAllAchievements(userId);
    
    for (const achievement of checks) {
      const awarded = await awardAchievement(userId, achievement.type, achievement);
      if (awarded) {
        newAchievements.push(awarded);
      }
    }

    res.json({
      newAchievements,
      message: newAchievements.length > 0 
        ? `Unlocked ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`
        : 'No new achievements'
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// Helper function to award achievement
async function awardAchievement(userId: string, type: string, data?: any): Promise<any> {
  try {
    // Check if already awarded
    const existing = await Achievement.findOne({ userId, type });
    if (existing) {
      return null;
    }

    const achievementDefinitions: any = {
      [ACHIEVEMENT_TYPES.FIRST_TRADE]: {
        title: 'First Trade',
        description: 'Completed your first trade',
        icon: '🎯',
        rarity: 'common'
      },
      [ACHIEVEMENT_TYPES.PROFITABLE_TRADER]: {
        title: 'Profitable Trader',
        description: 'Achieved positive total P&L',
        icon: '💰',
        rarity: 'rare'
      },
      [ACHIEVEMENT_TYPES.WINNING_STREAK_3]: {
        title: 'Hot Streak',
        description: 'Won 3 trades in a row',
        icon: '🔥',
        rarity: 'rare'
      },
      [ACHIEVEMENT_TYPES.WINNING_STREAK_5]: {
        title: 'Unstoppable',
        description: 'Won 5 trades in a row',
        icon: '⚡',
        rarity: 'epic'
      },
      [ACHIEVEMENT_TYPES.WHALE_TRADER]: {
        title: 'Whale Trader',
        description: 'Traded over $10,000 volume',
        icon: '🐋',
        rarity: 'epic'
      },
      [ACHIEVEMENT_TYPES.MARKET_CREATOR]: {
        title: 'Market Maker',
        description: 'Created your first market',
        icon: '🏗️',
        rarity: 'common'
      },
      [ACHIEVEMENT_TYPES.COMMENTER]: {
        title: 'Conversationalist',
        description: 'Posted your first comment',
        icon: '💬',
        rarity: 'common'
      },
      [ACHIEVEMENT_TYPES.SOCIAL_BUTTERFLY]: {
        title: 'Social Butterfly',
        description: 'Posted 100 comments',
        icon: '🦋',
        rarity: 'epic'
      },
      [ACHIEVEMENT_TYPES.FOLLOWED_BY_10]: {
        title: 'Rising Star',
        description: 'Reached 10 followers',
        icon: '⭐',
        rarity: 'rare'
      },
      [ACHIEVEMENT_TYPES.FOLLOWED_BY_100]: {
        title: 'Influencer',
        description: 'Reached 100 followers',
        icon: '👑',
        rarity: 'legendary'
      },
      [ACHIEVEMENT_TYPES.LEADERBOARD_TOP_10]: {
        title: 'Top 10',
        description: 'Ranked in top 10 on leaderboard',
        icon: '🏆',
        rarity: 'epic'
      },
      [ACHIEVEMENT_TYPES.LEADERBOARD_TOP_1]: {
        title: 'Champion',
        description: 'Ranked #1 on leaderboard',
        icon: '👑',
        rarity: 'legendary'
      },
      [ACHIEVEMENT_TYPES.DIAMOND_HANDS]: {
        title: 'Diamond Hands',
        description: 'Held a position for 30+ days',
        icon: '💎',
        rarity: 'rare'
      },
      [ACHIEVEMENT_TYPES.MOONSHOT]: {
        title: 'Moonshot',
        description: 'Achieved 10x return on a trade',
        icon: '🚀',
        rarity: 'legendary'
      },
      [ACHIEVEMENT_TYPES.DIVERSIFIED]: {
        title: 'Diversified',
        description: 'Active positions in 5+ markets',
        icon: '📊',
        rarity: 'rare'
      },
      [ACHIEVEMENT_TYPES.EARLY_ADOPTER]: {
        title: 'Early Adopter',
        description: 'Joined in the first month',
        icon: '🌟',
        rarity: 'rare'
      }
    };

    const definition = achievementDefinitions[type];
    if (!definition) {
      return null;
    }

    const achievement = new Achievement({
      userId,
      type,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
      rarity: definition.rarity,
      metadata: data
    });

    await achievement.save();
    return achievement;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return null;
  }
}

// Helper function to check all possible achievements
async function checkAllAchievements(userId: string): Promise<any[]> {
  const toAward: any[] = [];

  try {
    // Get user data
    const trades = await Trade.find({ userId, status: 'completed' });
    const positions = await Position.find({ userId });
    const markets = await Market.countDocuments({ creatorId: userId });
    const comments = await Comment.countDocuments({ userId });
    const followers = await Follow.countDocuments({ followingId: userId });

    // First trade
    if (trades.length >= 1) {
      toAward.push({ type: ACHIEVEMENT_TYPES.FIRST_TRADE });
    }

    // Profitable trader
    const totalPnL = positions.reduce((sum, p) => sum + p.realizedPnL + p.unrealizedPnL, 0);
    if (totalPnL > 0) {
      toAward.push({ type: ACHIEVEMENT_TYPES.PROFITABLE_TRADER });
    }

    // Whale trader
    const totalVolume = trades.reduce((sum, t) => sum + t.totalCost, 0);
    if (totalVolume >= 10000) {
      toAward.push({ type: ACHIEVEMENT_TYPES.WHALE_TRADER });
    }

    // Market creator
    if (markets >= 1) {
      toAward.push({ type: ACHIEVEMENT_TYPES.MARKET_CREATOR });
    }

    // Commenter
    if (comments >= 1) {
      toAward.push({ type: ACHIEVEMENT_TYPES.COMMENTER });
    }

    // Social butterfly
    if (comments >= 100) {
      toAward.push({ type: ACHIEVEMENT_TYPES.SOCIAL_BUTTERFLY });
    }

    // Diversified
    const activePositions = positions.filter(p => p.shares > 0);
    if (activePositions.length >= 5) {
      toAward.push({ type: ACHIEVEMENT_TYPES.DIVERSIFIED });
    }

    // Check winning streak
    const recentTrades = trades.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    let currentStreak = 0;
    for (const trade of recentTrades) {
      const position = positions.find(p => 
        p.marketId.toString() === trade.marketId.toString() && 
        p.outcomeId === trade.outcomeId
      );
      if (position && position.realizedPnL > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    if (currentStreak >= 3) {
      toAward.push({ type: ACHIEVEMENT_TYPES.WINNING_STREAK_3 });
    }
    if (currentStreak >= 5) {
      toAward.push({ type: ACHIEVEMENT_TYPES.WINNING_STREAK_5 });
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return toAward;
}

// GET /api/social/leaderboard/reputation - Get reputation leaderboard
router.get('/leaderboard/reputation', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // This would be calculated live, but for performance, 
    // we'll calculate top users' reputation on-demand
    const topUsers = await User.find()
      .select('username firstName lastName email createdAt')
      .limit(100)
      .lean();

    const usersWithReputation = await Promise.all(
      topUsers.map(async (user) => {
        const positions = await Position.find({ userId: user._id });
        const trades = await Trade.countDocuments({ userId: user._id });
        const marketsCreated = await Market.countDocuments({ creatorId: user._id });
        const comments = await Comment.countDocuments({ userId: user._id });
        const followersCount = await Follow.countDocuments({ followingId: user._id });
        const achievements = await Achievement.countDocuments({ userId: user._id });

        const totalPnL = positions.reduce((sum, p) => sum + p.realizedPnL + p.unrealizedPnL, 0);
        const totalInvested = positions.reduce((sum, p) => sum + p.totalInvested, 0);
        const closedPositions = positions.filter(p => p.shares === 0 && p.realizedPnL !== 0);
        const winningPositions = closedPositions.filter(p => p.realizedPnL > 0);
        const winRate = closedPositions.length > 0 ? (winningPositions.length / closedPositions.length) * 100 : 0;

        const reputation = calculateReputation({
          totalPnL,
          winRate,
          marketsCreated,
          comments,
          followersCount,
          tradesCount: trades,
          achievements
        });

        return {
          userId: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          reputation,
          stats: {
            totalPnL,
            winRate,
            tradesCount: trades,
            followersCount
          }
        };
      })
    );

    // Sort by reputation and take top N
    usersWithReputation.sort((a, b) => b.reputation - a.reputation);
    const topReputation = usersWithReputation.slice(0, Number(limit));

    res.json({
      leaderboard: topReputation.map((user, index) => ({
        ...user,
        rank: index + 1
      }))
    });
  } catch (error) {
    console.error('Error fetching reputation leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch reputation leaderboard' });
  }
});

export default router;

