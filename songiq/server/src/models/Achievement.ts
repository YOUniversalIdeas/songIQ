import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: string; // e.g., 'first_trade', 'profitable_trader', 'market_creator'
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: number; // For progressive achievements (0-100)
  metadata?: any; // Additional data specific to the achievement
}

const AchievementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 100 // 100 means completed
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate achievements
AchievementSchema.index({ userId: 1, type: 1 }, { unique: true });
AchievementSchema.index({ userId: 1, unlockedAt: -1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);

// Achievement type definitions for reference
export const ACHIEVEMENT_TYPES = {
  // Trading achievements
  FIRST_TRADE: 'first_trade',
  PROFITABLE_TRADER: 'profitable_trader',
  WINNING_STREAK_3: 'winning_streak_3',
  WINNING_STREAK_5: 'winning_streak_5',
  WHALE_TRADER: 'whale_trader', // Large volume
  PERFECT_PREDICTION: 'perfect_prediction',
  
  // Market achievements
  MARKET_CREATOR: 'market_creator',
  POPULAR_MARKET: 'popular_market', // Market with high volume
  RESOLVED_MARKET: 'resolved_market',
  
  // Social achievements
  COMMENTER: 'commenter', // First comment
  SOCIAL_BUTTERFLY: 'social_butterfly', // 100 comments
  POPULAR_COMMENT: 'popular_comment', // Comment with 10+ likes
  FOLLOWED_BY_10: 'followed_by_10',
  FOLLOWED_BY_100: 'followed_by_100',
  
  // Engagement achievements
  EARLY_ADOPTER: 'early_adopter',
  DAILY_TRADER: 'daily_trader', // 7 days straight
  MARKET_MAVEN: 'market_maven', // Traded in 10+ markets
  DIVERSIFIED: 'diversified', // Active positions in 5+ markets
  
  // Special achievements
  DIAMOND_HANDS: 'diamond_hands', // Held position for 30 days
  PAPER_HANDS: 'paper_hands', // Sold within 1 hour
  MOONSHOT: 'moonshot', // 10x return on single trade
  LEADERBOARD_TOP_10: 'leaderboard_top_10',
  LEADERBOARD_TOP_1: 'leaderboard_top_1'
};

