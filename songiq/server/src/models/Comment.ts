import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  marketId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentCommentId?: mongoose.Types.ObjectId; // For nested replies
  likes: number;
  likedBy: mongoose.Types.ObjectId[]; // Users who liked this comment
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
CommentSchema.index({ marketId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1, createdAt: -1 });
CommentSchema.index({ marketId: 1, parentCommentId: 1, createdAt: -1 });

// Don't return deleted comments in normal queries
CommentSchema.pre(/^find/, function(next) {
  const query = this as any;
  if (!query._conditions.includeDeleted) {
    query.where({ isDeleted: false });
  }
  next();
});

export default mongoose.model<IComment>('Comment', CommentSchema);

