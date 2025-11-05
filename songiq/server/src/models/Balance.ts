import mongoose, { Schema, Document } from 'mongoose';

export interface IBalance extends Document {
  userId: mongoose.Types.ObjectId;
  currencyId: mongoose.Types.ObjectId;
  available: number; // Available balance for trading/withdrawal
  locked: number; // Locked in open orders or pending operations
  total: number; // Total = available + locked
  address?: string; // Associated wallet address
  chainId?: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  lock(amount: number): Promise<IBalance>;
  unlock(amount: number): Promise<IBalance>;
  deduct(amount: number): Promise<IBalance>;
  credit(amount: number): Promise<IBalance>;
}

const BalanceSchema = new Schema({
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
  available: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  locked: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  address: {
    type: String,
    lowercase: true,
    trim: true
  },
  chainId: {
    type: Number,
    min: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
BalanceSchema.index({ userId: 1, currencyId: 1 }, { unique: true });
BalanceSchema.index({ userId: 1 });
BalanceSchema.index({ currencyId: 1 });

// Auto-calculate total before saving
BalanceSchema.pre('save', function(next) {
  this.total = this.available + this.locked;
  this.lastUpdated = new Date();
  next();
});

// Methods
BalanceSchema.methods.lock = async function(amount: number) {
  if (this.available < amount) {
    throw new Error('Insufficient available balance');
  }
  this.available -= amount;
  this.locked += amount;
  return this.save();
};

BalanceSchema.methods.unlock = async function(amount: number) {
  if (this.locked < amount) {
    throw new Error('Insufficient locked balance');
  }
  this.locked -= amount;
  this.available += amount;
  return this.save();
};

BalanceSchema.methods.deduct = async function(amount: number) {
  if (this.available < amount) {
    throw new Error('Insufficient available balance');
  }
  this.available -= amount;
  return this.save();
};

BalanceSchema.methods.credit = async function(amount: number) {
  this.available += amount;
  return this.save();
};

export default mongoose.model<IBalance>('Balance', BalanceSchema);

