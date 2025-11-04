import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserChallengeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true,
    index: true
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  rewardsClaimed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index
UserChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
UserChallengeSchema.index({ userId: 1, isCompleted: 1 });

export default mongoose.model<IUserChallenge>('UserChallenge', UserChallengeSchema);

