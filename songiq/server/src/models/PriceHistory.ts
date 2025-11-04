import mongoose, { Schema, Document } from 'mongoose';

export interface IPriceHistory extends Document {
  marketId: mongoose.Types.ObjectId;
  outcomeId: string;
  price: number;
  volume: number; // Trading volume at this point
  liquidity: number; // Liquidity pool at this point
  timestamp: Date;
}

const PriceHistorySchema = new Schema({
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
    index: true
  },
  outcomeId: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  volume: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  liquidity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // We use timestamp field instead
});

// Compound indexes for efficient queries
PriceHistorySchema.index({ marketId: 1, outcomeId: 1, timestamp: -1 });
PriceHistorySchema.index({ timestamp: -1 }); // For cleanup/archival

// TTL index - automatically delete records older than 90 days
PriceHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IPriceHistory>('PriceHistory', PriceHistorySchema);

