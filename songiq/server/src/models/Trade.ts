import mongoose, { Schema, Document } from 'mongoose';

export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  outcomeId: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number; // Price per share at execution
  totalCost: number; // Including fees
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market',
    required: true
  },
  outcomeId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['buy', 'sell']
  },
  shares: {
    type: Number,
    required: true,
    min: 0.01
  },
  price: {
    type: Number,
    required: true,
    min: 0.01,
    max: 0.99
  },
  totalCost: {
    type: Number,
    required: true
  },
  fee: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
TradeSchema.index({ userId: 1, createdAt: -1 });
TradeSchema.index({ marketId: 1, createdAt: -1 });
TradeSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<ITrade>('Trade', TradeSchema);

