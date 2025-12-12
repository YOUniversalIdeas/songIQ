import mongoose, { Schema, Document } from 'mongoose';

export interface IOutcome {
  id: string;
  name: string;
  description: string;
  shares: number;
  price: number; // Current price per share (0-1)
  totalVolume: number;
}

export interface IMarket extends Document {
  title: string;
  description: string;
  category: 'chart_position' | 'streaming_numbers' | 'awards' | 'genre_trend' | 'artist_popularity' | 'release_success' | 'other';
  outcomes: IOutcome[];
  endDate: Date;
  resolutionDate?: Date;
  resolvedOutcomeId?: string;
  status: 'active' | 'closed' | 'resolved' | 'cancelled';
  creatorId: mongoose.Types.ObjectId;
  relatedSongId?: mongoose.Types.ObjectId;
  totalVolume: number;
  totalLiquidity: number;
  fee: number; // Platform fee percentage (0-1)
  createdAt: Date;
  updatedAt: Date;
}

const OutcomeSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  shares: { type: Number, required: true, default: 100 },
  price: { type: Number, required: true, min: 0.01, max: 0.99 },
  totalVolume: { type: Number, default: 0 }
});

const MarketSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['chart_position', 'streaming_numbers', 'awards', 'genre_trend', 'artist_popularity', 'release_success', 'other']
  },
  outcomes: {
    type: [OutcomeSchema],
    required: true,
    validate: {
      validator: function(outcomes: IOutcome[]) {
        return outcomes.length >= 2 && outcomes.length <= 10;
      },
      message: 'Market must have between 2 and 10 outcomes'
    }
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date: Date) {
        return date > new Date();
      },
      message: 'End date must be in the future'
    }
  },
  resolutionDate: {
    type: Date
  },
  resolvedOutcomeId: {
    type: String
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'closed', 'resolved', 'cancelled'],
    default: 'active'
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedSongId: {
    type: Schema.Types.ObjectId,
    ref: 'Song'
  },
  totalVolume: {
    type: Number,
    default: 0,
    min: 0
  },
  totalLiquidity: {
    type: Number,
    default: 1000, // Initial liquidity pool
    min: 0
  },
  fee: {
    type: Number,
    default: 0.02, // 2% platform fee
    min: 0,
    max: 0.1
  }
}, {
  timestamps: true
});

// Index for efficient querying
MarketSchema.index({ status: 1, endDate: 1 });
MarketSchema.index({ category: 1, status: 1 });
MarketSchema.index({ creatorId: 1 });
MarketSchema.index({ relatedSongId: 1 });

export default mongoose.model<IMarket>('Market', MarketSchema);

