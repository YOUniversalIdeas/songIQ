import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyReward extends Document {
  userId: mongoose.Types.ObjectId;
  day: number; // Day in streak (1-7, then resets)
  claimedAt: Date;
  rewards: {
    xp: number;
    coins: number;
    bonus?: string;
  };
  streakDay: number; // Overall consecutive days
}

const DailyRewardSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  claimedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  rewards: {
    xp: {
      type: Number,
      required: true
    },
    coins: {
      type: Number,
      default: 0
    },
    bonus: String
  },
  streakDay: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for finding today's rewards
DailyRewardSchema.index({ userId: 1, claimedAt: -1 });

export default mongoose.model<IDailyReward>('DailyReward', DailyRewardSchema);

