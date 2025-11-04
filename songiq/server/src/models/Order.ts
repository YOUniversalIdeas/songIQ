import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  tradingPairId?: mongoose.Types.ObjectId; // Optional for multi-currency trading
  marketId?: mongoose.Types.ObjectId; // For prediction markets
  outcomeId?: string; // For prediction markets
  type: 'market' | 'limit' | 'stop' | 'stop-limit';
  side: 'buy' | 'sell';
  price?: number; // For limit orders
  stopPrice?: number; // For stop orders
  amount: number; // Amount of base currency or shares
  filled: number; // Amount filled
  remaining: number; // Amount remaining
  total: number; // Total value in quote currency
  fee: number;
  status: 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'expired' | 'failed';
  timeInForce: 'GTC' | 'IOC' | 'FOK'; // Good Till Cancel, Immediate Or Cancel, Fill Or Kill
  expiresAt?: Date;
  // Execution details
  averagePrice?: number; // Average execution price
  trades: mongoose.Types.ObjectId[]; // Related trade IDs
  // Blockchain related
  txHash?: string;
  blockNumber?: number;
  // Metadata
  clientOrderId?: string; // Client-provided order ID
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tradingPairId: {
    type: Schema.Types.ObjectId,
    ref: 'TradingPair'
  },
  marketId: {
    type: Schema.Types.ObjectId,
    ref: 'Market'
  },
  outcomeId: {
    type: String
  },
  type: {
    type: String,
    required: true,
    enum: ['market', 'limit', 'stop', 'stop-limit']
  },
  side: {
    type: String,
    required: true,
    enum: ['buy', 'sell']
  },
  price: {
    type: Number,
    min: 0
  },
  stopPrice: {
    type: Number,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
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
    required: true,
    enum: ['pending', 'open', 'partially_filled', 'filled', 'cancelled', 'expired', 'failed'],
    default: 'pending'
  },
  timeInForce: {
    type: String,
    default: 'GTC',
    enum: ['GTC', 'IOC', 'FOK']
  },
  expiresAt: {
    type: Date
  },
  averagePrice: {
    type: Number,
    min: 0
  },
  trades: [{
    type: Schema.Types.ObjectId,
    ref: 'Trade'
  }],
  txHash: {
    type: String,
    lowercase: true,
    trim: true
  },
  blockNumber: {
    type: Number,
    min: 0
  },
  clientOrderId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ tradingPairId: 1, side: 1, price: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ clientOrderId: 1 }, { sparse: true });

// Auto-update remaining amount
OrderSchema.pre('save', function(next) {
  this.remaining = this.amount - this.filled;
  
  // Update status based on filled amount
  if (this.filled === 0) {
    if (this.status === 'partially_filled') {
      this.status = 'open';
    }
  } else if (this.filled >= this.amount) {
    this.status = 'filled';
    this.remaining = 0;
  } else if (this.filled > 0) {
    this.status = 'partially_filled';
  }
  
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);

