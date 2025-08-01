import mongoose, { Document, Schema } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: string;
  uploadDate: Date;
  audioFile: string;
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  analysisResults?: mongoose.Types.ObjectId;
  performanceMetrics?: mongoose.Types.ObjectId;
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
  uploadDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  audioFile: {
    type: String,
    required: [true, 'Audio file path is required']
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
  analysisResults: {
    type: Schema.Types.ObjectId,
    ref: 'AnalysisResults'
  },
  performanceMetrics: {
    type: Schema.Types.ObjectId,
    ref: 'PerformanceMetrics'
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
SongSchema.index({ 'analysisResults': 1 });

// Virtual for formatted duration
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