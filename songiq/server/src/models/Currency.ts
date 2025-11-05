import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrency extends Document {
  symbol: string; // USD, USDC, DAI, ETH, etc.
  name: string;
  type: 'fiat' | 'crypto' | 'stablecoin';
  decimals: number;
  contractAddress?: string; // For ERC20 tokens
  chainId?: number; // Ethereum = 1, Polygon = 137, etc.
  isActive: boolean;
  minDeposit: number;
  minWithdrawal: number;
  withdrawalFee: number;
  depositFee: number;
  icon?: string;
  description?: string;
  priceUSD: number; // Current price in USD
  price24hChange?: number; // 24h price change percentage
  priceLastUpdated: Date;
  totalSupply?: number; // For crypto tracking
  circulatingSupply?: number;
  marketCap?: number;
  // Blockchain specific
  abi?: string; // ERC20 ABI for token interactions
  isNative: boolean; // ETH, MATIC, etc.
  // Fiat specific
  fiatProvider?: 'stripe' | 'circle' | 'paypal' | 'coinbase'; // Payment processor
  fiatCurrency?: string; // ISO currency code
  // Feature flags
  allowDeposits: boolean;
  allowWithdrawals: boolean;
  allowTrading: boolean;
  // Metadata
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CurrencySchema = new Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['fiat', 'crypto', 'stablecoin']
  },
  decimals: {
    type: Number,
    required: true,
    default: 18,
    min: 0,
    max: 18
  },
  contractAddress: {
    type: String,
    trim: true,
    lowercase: true
  },
  chainId: {
    type: Number,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minDeposit: {
    type: Number,
    default: 0,
    min: 0
  },
  minWithdrawal: {
    type: Number,
    default: 0,
    min: 0
  },
  withdrawalFee: {
    type: Number,
    default: 0,
    min: 0
  },
  depositFee: {
    type: Number,
    default: 0,
    min: 0
  },
  icon: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  priceUSD: {
    type: Number,
    default: 0,
    min: 0
  },
  price24hChange: {
    type: Number,
    default: 0
  },
  priceLastUpdated: {
    type: Date,
    default: Date.now
  },
  totalSupply: {
    type: Number,
    min: 0
  },
  circulatingSupply: {
    type: Number,
    min: 0
  },
  marketCap: {
    type: Number,
    min: 0
  },
  abi: {
    type: String
  },
  isNative: {
    type: Boolean,
    default: false
  },
  fiatProvider: {
    type: String,
    enum: ['stripe', 'circle', 'paypal', 'coinbase']
  },
  fiatCurrency: {
    type: String,
    uppercase: true,
    trim: true
  },
  allowDeposits: {
    type: Boolean,
    default: true
  },
  allowWithdrawals: {
    type: Boolean,
    default: true
  },
  allowTrading: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
CurrencySchema.index({ symbol: 1 });
CurrencySchema.index({ type: 1, isActive: 1 });
CurrencySchema.index({ contractAddress: 1, chainId: 1 });
CurrencySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model<ICurrency>('Currency', CurrencySchema);

