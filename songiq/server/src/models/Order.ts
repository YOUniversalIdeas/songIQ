import mongoose, { Schema, Document } from 'mongoose';

/**
 * Order Model - For Prediction Markets Limit Orders
 * This is NOT for crypto trading - it's for prediction market limit orders
 */
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  marketId: mongoose.Types.ObjectId; // Prediction market ID
  outcomeId: string; // Outcome ID within the market
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  price?: number; // Limit price (0-1 for prediction markets)
  amount: number; // Number of shares
  filled: number; // Shares filled so far
  remaining: number; // Shares remaining
  total: number; // Total order value
  fee: number;
  status: 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'pending';
  timeInForce: 'GTC' | 'IOC' | 'FOK'; // Good Till Cancel, Immediate Or Cancel, Fill Or Kill
  trades?: mongoose.Types.ObjectId[]; // References to Trade documents
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  type: {
    type: String,
    enum: ['market', 'limit'],
    required: true
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  price: {
    type: Number,
    min: 0.01,
    max: 0.99,
    required: function(this: IOrder) {
      return this.type === 'limit';
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  filled: {
    type: Number,
    default: 0,
    min: 0
  },
  remaining: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['open', 'partially_filled', 'filled', 'cancelled', 'pending'],
    default: 'open',
    index: true
  },
  timeInForce: {
    type: String,
    enum: ['GTC', 'IOC', 'FOK'],
    default: 'GTC'
  },
  trades: [{
    type: Schema.Types.ObjectId,
    ref: 'Trade'
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
OrderSchema.index({ marketId: 1, outcomeId: 1, status: 1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ marketId: 1, status: 1, type: 1, price: 1, createdAt: 1 });

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;


