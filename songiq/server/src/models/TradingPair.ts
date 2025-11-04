import mongoose, { Schema, Document } from 'mongoose';

export interface ITradingPair extends Document {
  baseCurrencyId: mongoose.Types.ObjectId; // e.g., ETH
  quoteCurrencyId: mongoose.Types.ObjectId; // e.g., USDC
  symbol: string; // e.g., ETH/USDC
  isActive: boolean;
  minTradeAmount: number;
  maxTradeAmount: number;
  pricePrecision: number; // Number of decimal places for price
  amountPrecision: number; // Number of decimal places for amount
  makerFee: number; // Fee for market makers (0.001 = 0.1%)
  takerFee: number; // Fee for market takers (0.002 = 0.2%)
  // Liquidity pool (AMM style)
  liquidityPoolEnabled: boolean;
  baseReserve: number; // Amount of base currency in pool
  quoteReserve: number; // Amount of quote currency in pool
  totalLiquidity: number; // Total liquidity tokens issued
  lpTokenAddress?: string; // LP token contract address if applicable
  // Price tracking
  lastPrice: number;
  price24hHigh: number;
  price24hLow: number;
  price24hChange: number;
  volume24h: number;
  // Market data
  orderBookDepth: number;
  priceLastUpdated: Date;
  // Metadata
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TradingPairSchema = new Schema({
  baseCurrencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
  },
  quoteCurrencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Currency',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  minTradeAmount: {
    type: Number,
    required: true,
    default: 0.001,
    min: 0
  },
  maxTradeAmount: {
    type: Number,
    default: 1000000,
    min: 0
  },
  pricePrecision: {
    type: Number,
    default: 8,
    min: 0,
    max: 18
  },
  amountPrecision: {
    type: Number,
    default: 8,
    min: 0,
    max: 18
  },
  makerFee: {
    type: Number,
    default: 0.001, // 0.1%
    min: 0,
    max: 0.1
  },
  takerFee: {
    type: Number,
    default: 0.002, // 0.2%
    min: 0,
    max: 0.1
  },
  liquidityPoolEnabled: {
    type: Boolean,
    default: false
  },
  baseReserve: {
    type: Number,
    default: 0,
    min: 0
  },
  quoteReserve: {
    type: Number,
    default: 0,
    min: 0
  },
  totalLiquidity: {
    type: Number,
    default: 0,
    min: 0
  },
  lpTokenAddress: {
    type: String,
    lowercase: true,
    trim: true
  },
  lastPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  price24hHigh: {
    type: Number,
    default: 0,
    min: 0
  },
  price24hLow: {
    type: Number,
    default: 0,
    min: 0
  },
  price24hChange: {
    type: Number,
    default: 0
  },
  volume24h: {
    type: Number,
    default: 0,
    min: 0
  },
  orderBookDepth: {
    type: Number,
    default: 0,
    min: 0
  },
  priceLastUpdated: {
    type: Date,
    default: Date.now
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
TradingPairSchema.index({ symbol: 1 });
TradingPairSchema.index({ baseCurrencyId: 1, quoteCurrencyId: 1 }, { unique: true });
TradingPairSchema.index({ isActive: 1, displayOrder: 1 });

// Methods for AMM calculations (Constant Product Formula: x * y = k)
TradingPairSchema.methods.calculatePrice = function() {
  if (this.baseReserve === 0) return 0;
  return this.quoteReserve / this.baseReserve;
};

TradingPairSchema.methods.calculateBuyAmount = function(quoteAmount: number) {
  // How much base currency user gets for quoteAmount of quote currency
  const k = this.baseReserve * this.quoteReserve;
  const newQuoteReserve = this.quoteReserve + quoteAmount;
  const newBaseReserve = k / newQuoteReserve;
  const baseAmount = this.baseReserve - newBaseReserve;
  return baseAmount;
};

TradingPairSchema.methods.calculateSellAmount = function(baseAmount: number) {
  // How much quote currency user gets for baseAmount of base currency
  const k = this.baseReserve * this.quoteReserve;
  const newBaseReserve = this.baseReserve + baseAmount;
  const newQuoteReserve = k / newBaseReserve;
  const quoteAmount = this.quoteReserve - newQuoteReserve;
  return quoteAmount;
};

TradingPairSchema.methods.calculatePriceImpact = function(baseAmountIn: number, quoteAmountOut: number) {
  const currentPrice = this.calculatePrice();
  const executionPrice = quoteAmountOut / baseAmountIn;
  const priceImpact = Math.abs((executionPrice - currentPrice) / currentPrice);
  return priceImpact;
};

export default mongoose.model<ITradingPair>('TradingPair', TradingPairSchema);

