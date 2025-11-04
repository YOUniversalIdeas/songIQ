import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  currencyId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'transfer' | 'reward';
  amount: number;
  fee: number;
  netAmount: number; // amount - fee
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  // Blockchain related
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  blockNumber?: number;
  confirmations?: number;
  requiredConfirmations?: number;
  chainId?: number;
  gasUsed?: number;
  gasPrice?: number;
  // Fiat related
  fiatProvider?: 'stripe' | 'circle' | 'paypal' | 'coinbase';
  fiatTransactionId?: string;
  fiatPaymentMethod?: string;
  // Related entities
  orderId?: mongoose.Types.ObjectId;
  tradeId?: mongoose.Types.ObjectId;
  walletId?: mongoose.Types.ObjectId;
  // Metadata
  description?: string;
  metadata?: any;
  error?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['deposit', 'withdrawal', 'trade', 'fee', 'transfer', 'reward']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  fee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  txHash: {
    type: String,
    lowercase: true,
    trim: true
  },
  fromAddress: {
    type: String,
    lowercase: true,
    trim: true
  },
  toAddress: {
    type: String,
    lowercase: true,
    trim: true
  },
  blockNumber: {
    type: Number,
    min: 0
  },
  confirmations: {
    type: Number,
    default: 0,
    min: 0
  },
  requiredConfirmations: {
    type: Number,
    default: 12
  },
  chainId: {
    type: Number,
    min: 1
  },
  gasUsed: {
    type: Number,
    min: 0
  },
  gasPrice: {
    type: Number,
    min: 0
  },
  fiatProvider: {
    type: String,
    enum: ['stripe', 'circle', 'paypal', 'coinbase']
  },
  fiatTransactionId: {
    type: String,
    trim: true
  },
  fiatPaymentMethod: {
    type: String,
    trim: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  tradeId: {
    type: Schema.Types.ObjectId,
    ref: 'Trade'
  },
  walletId: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  description: {
    type: String,
    maxlength: 500
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  error: {
    type: String,
    maxlength: 1000
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ txHash: 1 }, { sparse: true });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ currencyId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ fiatTransactionId: 1 }, { sparse: true });

// Auto-calculate net amount
TransactionSchema.pre('save', function(next) {
  this.netAmount = this.amount - this.fee;
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);

