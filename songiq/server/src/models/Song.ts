import mongoose, { Document, Schema } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: string;
  duration: number; // Duration in seconds
  audioFeatures?: mongoose.Types.ObjectId; // Reference to AudioFeatures model
  uploadDate: Date;
  fileUrl: string; // URL to the audio file
  analysisResults?: mongoose.Types.ObjectId; // Reference to Analysis model
  userId?: mongoose.Types.ObjectId; // Reference to User who uploaded
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  performanceMetrics?: mongoose.Types.ObjectId;
  // Unreleased song specific fields
  description?: string; // Description for unreleased tracks
  genre?: string; // Genre classification
  targetReleaseDate?: Date; // Planned release date
  isPrivate?: boolean; // Private/unlisted tracks
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<ISong>({
  title: {
    type: String,
    required: [true, 'Song title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot be more than 100 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [0, 'Duration must be positive']
  },
  audioFeatures: {
    type: Schema.Types.ObjectId,
    ref: 'AudioFeatures'
  },
  uploadDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  analysisResults: {
    type: Schema.Types.ObjectId,
    ref: 'Analysis'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isReleased: {
    type: Boolean,
    default: false,
    required: true
  },
  releaseDate: {
    type: Date,
    required: function(this: ISong) {
      return this.isReleased;
    }
  },
  platforms: [{
    type: String,
    enum: ['spotify', 'apple', 'youtube', 'soundcloud', 'tidal', 'amazon'],
    required: function(this: ISong) {
      return this.isReleased;
    }
  }],
  performanceMetrics: {
    type: Schema.Types.ObjectId,
    ref: 'PerformanceMetrics'
  },
  // Unreleased song specific fields
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  genre: {
    type: String,
    maxlength: [50, 'Genre cannot be more than 50 characters']
  },
  targetReleaseDate: {
    type: Date,
    validate: {
      validator: function(this: ISong, value: Date) {
        return !value || value > new Date();
      },
      message: 'Target release date must be in the future'
    }
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
SongSchema.index({ title: 1, artist: 1 });
SongSchema.index({ uploadDate: -1 });
SongSchema.index({ isReleased: 1 });
SongSchema.index({ userId: 1 });
SongSchema.index({ duration: 1 });
SongSchema.index({ 'analysisResults': 1 });
SongSchema.index({ 'audioFeatures': 1 });

// Virtual for formatted duration
SongSchema.virtual('formattedDuration').get(function(this: ISong) {
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted upload date
SongSchema.virtual('formattedUploadDate').get(function(this: ISong) {
  return this.uploadDate.toLocaleDateString();
});

// Pre-save middleware for validation
SongSchema.pre('save', function(next) {
  if (this.isReleased && !this.releaseDate) {
    this.releaseDate = new Date();
  }
  next();
});

export default mongoose.model<ISong>('Song', SongSchema); 