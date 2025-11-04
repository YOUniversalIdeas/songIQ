import User from '../models/User';
import Streak from '../models/Streak';
import Challenge from '../models/Challenge';
import UserChallenge from '../models/UserChallenge';
import DailyReward from '../models/DailyReward';
import Achievement, { ACHIEVEMENT_TYPES } from '../models/Achievement';
import Trade from '../models/Trade';
import Position from '../models/Position';
import Market from '../models/Market';
import Comment from '../models/Comment';

// XP Rewards for different actions
export const XP_REWARDS = {
  DAILY_LOGIN: 10,
  FIRST_TRADE: 50,
  TRADE: 5,
  WIN_TRADE: 20,
  CREATE_MARKET: 30,
  COMMENT: 3,
  LIKE_COMMENT: 1,
  FOLLOW_USER: 2,
  GET_FOLLOWED: 5,
  COMPLETE_CHALLENGE: 100,
  LEVEL_UP: 50,
  STREAK_MILESTONE: 25
};

// Daily reward tiers (resets every 7 days)
const DAILY_REWARDS = [
  { day: 1, xp: 10, coins: 10, bonus: null },
  { day: 2, xp: 15, coins: 15, bonus: null },
  { day: 3, xp: 20, coins: 20, bonus: '🎁 Bonus!' },
  { day: 4, xp: 25, coins: 25, bonus: null },
  { day: 5, xp: 30, coins: 30, bonus: null },
  { day: 6, xp: 40, coins: 40, bonus: '🎁 Big Bonus!' },
  { day: 7, xp: 100, coins: 100, bonus: '🎉 Week Complete!' }
];

export class GamificationService {
  
  // Track daily login and award rewards
  static async trackDailyLogin(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      // Update login streak
      const loginStreak = await this.updateStreak(userId, 'login');
      
      // Check if user already claimed today's reward
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastReward = await DailyReward.findOne({
        userId,
        claimedAt: { $gte: today }
      });

      if (lastReward) {
        return { alreadyClaimed: true, streak: loginStreak };
      }

      // Calculate which day in the 7-day cycle
      const streakDay = loginStreak.currentStreak % 7 || 7;
      const reward = DAILY_REWARDS[streakDay - 1];

      // Create daily reward record
      const dailyReward = new DailyReward({
        userId,
        day: streakDay,
        rewards: {
          xp: reward.xp,
          coins: reward.coins,
          bonus: reward.bonus
        },
        streakDay: loginStreak.currentStreak
      });
      await dailyReward.save();

      // Award XP and coins
      await user.addXP(reward.xp);
      await user.addCoins(reward.coins);
      await user.save();

      // Check for streak milestones
      if (loginStreak.currentStreak % 7 === 0) {
        await user.addXP(XP_REWARDS.STREAK_MILESTONE);
      }

      return {
        alreadyClaimed: false,
        reward: dailyReward,
        streak: loginStreak,
        userLevel: user.gamification.level,
        userXP: user.gamification.xp
      };
    } catch (error) {
      console.error('Error tracking daily login:', error);
      return null;
    }
  }

  // Update streak (login, trading, winning)
  static async updateStreak(userId: string, type: 'login' | 'trading' | 'winning') {
    try {
      let streak = await Streak.findOne({ userId, type });
      
      if (!streak) {
        streak = new Streak({ userId, type, currentStreak: 1, longestStreak: 1 });
      } else {
        (streak as any).updateStreak();
      }
      
      await streak.save();
      return streak;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }

  // Award XP for action
  static async awardXP(userId: string, action: keyof typeof XP_REWARDS, multiplier: number = 1) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const xpAmount = XP_REWARDS[action] * multiplier;
      const result = await user.addXP(xpAmount);
      await user.save();

      return result;
    } catch (error) {
      console.error('Error awarding XP:', error);
      return null;
    }
  }

  // Check and update challenge progress
  static async updateChallengeProgress(userId: string, action: string) {
    try {
      // Find active challenges matching this action
      const challenges = await Challenge.find({
        isActive: true,
        endDate: { $gte: new Date() },
        'requirement.action': action
      });

      for (const challenge of challenges) {
        // Get or create user challenge
        let userChallenge = await UserChallenge.findOne({
          userId,
          challengeId: challenge._id
        });

        if (!userChallenge) {
          userChallenge = new UserChallenge({
            userId,
            challengeId: challenge._id,
            progress: 0
          });
        }

        if (userChallenge.isCompleted) continue;

        // Update progress
        userChallenge.progress += 1;

        // Check if completed
        if (userChallenge.progress >= challenge.requirement.count) {
          userChallenge.isCompleted = true;
          userChallenge.completedAt = new Date();
          
          // Award rewards
          const user = await User.findById(userId);
          if (user) {
            await user.addXP(challenge.rewards.xp);
            if (challenge.rewards.coins) {
              await user.addCoins(challenge.rewards.coins);
            }
            await user.save();
          }

          // Update challenge stats
          challenge.completionCount += 1;
          await challenge.save();
        }

        await userChallenge.save();
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  // Create default challenges
  static async createDefaultChallenges() {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const challenges = [
      {
        title: 'Weekly Trader',
        description: 'Make 10 trades this week',
        type: 'weekly' as const,
        category: 'trading' as const,
        requirement: {
          action: 'trade',
          count: 10,
          timeframe: '7d'
        },
        rewards: {
          xp: 200,
          coins: 50
        },
        endDate: endOfWeek
      },
      {
        title: 'Social Butterfly',
        description: 'Post 5 comments this week',
        type: 'weekly' as const,
        category: 'social' as const,
        requirement: {
          action: 'comment',
          count: 5,
          timeframe: '7d'
        },
        rewards: {
          xp: 100,
          coins: 25
        },
        endDate: endOfWeek
      },
      {
        title: 'Perfect Week',
        description: 'Login 7 days in a row',
        type: 'weekly' as const,
        category: 'streak' as const,
        requirement: {
          action: 'login',
          count: 7,
          timeframe: '7d'
        },
        rewards: {
          xp: 300,
          coins: 100,
          badge: 'perfect_week'
        },
        endDate: endOfWeek
      }
    ];

    for (const challengeData of challenges) {
      const existing = await Challenge.findOne({
        title: challengeData.title,
        isActive: true,
        endDate: { $gte: now }
      });

      if (!existing) {
        const challenge = new Challenge(challengeData);
        await challenge.save();
      }
    }
  }

  // Get user gamification stats
  static async getUserStats(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const [loginStreak, tradingStreak, achievements, activeChallenges, completedChallenges] = await Promise.all([
        Streak.findOne({ userId, type: 'login' }),
        Streak.findOne({ userId, type: 'trading' }),
        Achievement.countDocuments({ userId }),
        UserChallenge.find({ userId, isCompleted: false }).populate('challengeId'),
        UserChallenge.find({ userId, isCompleted: true }).populate('challengeId')
      ]);

      // Calculate next daily reward
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastReward = await DailyReward.findOne({ userId, claimedAt: { $gte: today } });
      const canClaimDaily = !lastReward;
      const nextRewardDay = (loginStreak?.currentStreak || 0) % 7 + 1;

      return {
        level: user.gamification.level,
        xp: user.gamification.xp,
        totalXp: user.gamification.totalXp,
        coins: user.gamification.coins,
        tier: user.gamification.tier,
        loginStreak: loginStreak?.currentStreak || 0,
        longestLoginStreak: loginStreak?.longestStreak || 0,
        tradingStreak: tradingStreak?.currentStreak || 0,
        achievementsCount: achievements,
        activeChallenges: activeChallenges.length,
        completedChallenges: completedChallenges.length,
        canClaimDailyReward: canClaimDaily,
        nextDailyReward: DAILY_REWARDS[nextRewardDay - 1]
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  // Get tier requirements
  static getTierInfo(tier: string) {
    const tiers = {
      bronze: { minLevel: 1, maxLevel: 9, color: '#CD7F32', name: 'Bronze' },
      silver: { minLevel: 10, maxLevel: 19, color: '#C0C0C0', name: 'Silver' },
      gold: { minLevel: 20, maxLevel: 29, color: '#FFD700', name: 'Gold' },
      platinum: { minLevel: 30, maxLevel: 39, color: '#E5E4E2', name: 'Platinum' },
      diamond: { minLevel: 40, maxLevel: 49, color: '#B9F2FF', name: 'Diamond' },
      legend: { minLevel: 50, maxLevel: 999, color: '#FF69B4', name: 'Legend' }
    };

    return tiers[tier as keyof typeof tiers] || tiers.bronze;
  }
}

export default GamificationService;

