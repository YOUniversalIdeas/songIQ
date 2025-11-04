import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId; // User who is following
  followingId: mongoose.Types.ObjectId; // User being followed
  createdAt: Date;
}

const FollowSchema = new Schema({
  followerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  followingId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate follows and enable fast lookups
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, createdAt: -1 }); // For getting followers
FollowSchema.index({ followerId: 1, createdAt: -1 }); // For getting following

// Prevent self-follow
FollowSchema.pre('save', function(next) {
  if (this.followerId.equals(this.followingId)) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

export default mongoose.model<IFollow>('Follow', FollowSchema);

