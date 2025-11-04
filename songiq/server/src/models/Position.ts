import mongoose, { Schema, Document } from 'mongoose';

export interface IPosition extends Document {
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId;
  outcomeId: string;
  shares: number;
  averageCost: number; // Average cost per share
  totalInvested: number;
  currentValue: number;
  realizedPnL: number; // Profit/Loss from closed positions
  unrealizedPnL: number; // Current profit/loss
  createdAt: Date;
  updatedAt: Date;
}

const PositionSchema = new Schema({
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
  shares: {
    type: Number,
    required: true,
    default: 0
  },
  averageCost: {
    type: Number,
    required: true,
    default: 0
  },
  totalInvested: {
    type: Number,
    required: true,
    default: 0
  },
  currentValue: {
    type: Number,
    default: 0
  },
  realizedPnL: {
    type: Number,
    default: 0
  },
  unrealizedPnL: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for unique user-market-outcome positions
PositionSchema.index({ userId: 1, marketId: 1, outcomeId: 1 }, { unique: true });
PositionSchema.index({ userId: 1, marketId: 1 });
PositionSchema.index({ marketId: 1 });

export default mongoose.model<IPosition>('Position', PositionSchema);

