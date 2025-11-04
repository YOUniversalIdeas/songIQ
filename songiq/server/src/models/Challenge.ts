import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'trading' | 'social' | 'achievement' | 'streak';
  requirement: {
    action: string; // e.g., 'trade', 'win', 'comment', 'login'
    count: number;
    timeframe?: string; // e.g., '7d', '30d'
  };
  rewards: {
    xp: number;
    coins?: number;
    badge?: string;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participantCount: number;
  completionCount: number;
}

const ChallengeSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['trading', 'social', 'achievement', 'streak'],
    required: true
  },
  requirement: {
    action: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    },
    timeframe: String
  },
  rewards: {
    xp: {
      type: Number,
      required: true
    },
    coins: Number,
    badge: String
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participantCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

ChallengeSchema.index({ isActive: 1, endDate: 1 });
ChallengeSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);

