import mongoose, { Schema, Document } from 'mongoose';

export interface IStreak extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'login' | 'trading' | 'winning';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  history: Array<{
    date: Date;
    count: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const StreakSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['login', 'trading', 'winning'],
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient queries
StreakSchema.index({ userId: 1, type: 1 }, { unique: true });

// Method to update streak
StreakSchema.methods.updateStreak = function(activityDate: Date = new Date()) {
  const today = new Date(activityDate);
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(this.lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return this.currentStreak;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
  } else {
    // Streak broken
    this.currentStreak = 1;
  }
  
  this.lastActivityDate = activityDate;
  this.history.push({ date: activityDate, count: this.currentStreak });
  
  // Keep only last 90 days
  if (this.history.length > 90) {
    this.history = this.history.slice(-90);
  }
  
  return this.currentStreak;
};

export default mongoose.model<IStreak>('Streak', StreakSchema);

