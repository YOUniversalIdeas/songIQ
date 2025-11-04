# Prediction Markets Feature Guide

## 🎯 Overview

The **Prediction Markets** feature adds Polymarket-style functionality to songIQ, allowing users to trade on the future success of songs, artists, and music industry events. Users can buy and sell shares in different outcomes, with prices reflecting the crowd's collective predictions.

## ✨ Features

### Core Functionality
- **Market Creation**: Create prediction markets about song success, chart positions, awards, and more
- **Trading Interface**: Buy and sell shares with real-time pricing
- **Automated Market Maker (AMM)**: Dynamic pricing based on supply and demand
- **Position Tracking**: Monitor your holdings and profit/loss in real-time
- **Market Categories**: 
  - 📊 Chart Position
  - 🎵 Streaming Numbers
  - 🏆 Awards
  - 📈 Genre Trends
  - ⭐ Artist Popularity
  - 🚀 Release Success

### Trading Features
- **Real-time Pricing**: Prices automatically adjust based on market activity
- **Fee Structure**: 2% platform fee on all trades
- **Market Resolution**: Markets settle when outcomes are determined
- **Profit/Loss Tracking**: Track realized and unrealized gains
- **Trade History**: View all your past trades

## 🏗️ Architecture

### Backend Components

#### Models (`/server/src/models/`)

1. **Market.ts**
   - Stores prediction market data
   - Manages multiple outcomes per market
   - Tracks volume, liquidity, and status
   - Fields: title, description, category, outcomes, endDate, status, totalVolume, totalLiquidity

2. **Position.ts**
   - Tracks user positions in markets
   - Calculates profit/loss
   - Fields: userId, marketId, outcomeId, shares, averageCost, totalInvested, realizedPnL, unrealizedPnL

3. **Trade.ts**
   - Records all trades
   - Fields: userId, marketId, outcomeId, type (buy/sell), shares, price, totalCost, fee, status

#### API Routes (`/server/src/routes/markets.ts`)

```
GET    /api/markets                  - List all markets (with filters)
GET    /api/markets/:id              - Get market details
POST   /api/markets                  - Create new market (authenticated)
POST   /api/markets/:id/trade        - Execute trade (authenticated)
GET    /api/markets/user/positions   - Get user positions (authenticated)
GET    /api/markets/user/trades      - Get user trade history (authenticated)
POST   /api/markets/:id/resolve      - Resolve market (admin)
GET    /api/markets/meta/categories  - Get available categories
```

### Frontend Components

#### Pages (`/client/src/pages/`)

1. **MarketsPage.tsx**
   - Browse all active markets
   - Filter by category
   - Search functionality
   - Market statistics overview

2. **PredictionMarketPage.tsx**
   - Detailed market view
   - Trading interface
   - Recent trades
   - Outcome probabilities

#### Components (`/client/src/components/`)

1. **MarketCard.tsx**
   - Display market summary
   - Show leading outcomes
   - Real-time price updates
   - Category badges

2. **TradingInterface.tsx**
   - Buy/sell interface
   - Position display
   - Trade cost calculation
   - Potential profit preview

## 📊 Pricing Model

The system uses a simplified Automated Market Maker (AMM) for pricing:

```typescript
price = totalShares / (totalShares + liquidityPool)
```

- Prices range from 0.01 to 0.99 (1% to 99%)
- Prices represent implied probability
- Buying increases price, selling decreases price
- All outcomes sum to approximately 100%

### Example:
- Outcome A: 60 shares → 60/(60+1000) = 5.7% → $0.057 per share
- Outcome B: 150 shares → 150/(150+1000) = 13% → $0.13 per share

## 💰 Trading Mechanics

### Buying Shares
1. Select outcome and quantity
2. System calculates:
   - Share cost = shares × current_price
   - Fee = share_cost × 0.02 (2%)
   - Total cost = share_cost + fee
3. Trade executes, updates:
   - User position (shares, average cost)
   - Market outcome (shares, price, volume)
   - New AMM price calculated

### Selling Shares
1. Must own sufficient shares
2. System calculates:
   - Sale value = shares × current_price
   - Fee = sale_value × 0.02
   - Net proceeds = sale_value - fee
   - Profit/Loss = net_proceeds - cost_basis
3. Trade executes, updates position

### Market Resolution
When a market resolves:
- Winning shares pay out $1.00 each
- Losing shares pay out $0.00
- Profit/Loss is finalized
- Market status changes to "resolved"

## 🚀 Getting Started

### 1. Setup Backend

The routes are already registered in `/server/src/index.ts`:

```typescript
import marketsRoutes from './routes/markets';
app.use('/api/markets', marketsRoutes);
```

### 2. Seed Sample Markets

Run the seed script to create sample markets:

```bash
cd songiq/server
npx ts-node scripts/seed-markets.ts
```

This creates 8 sample markets across different categories.

### 3. Access Frontend

Navigate to:
- **Markets List**: `http://localhost:3001/markets`
- **Individual Market**: `http://localhost:3001/markets/:id`

The "Markets" link is available in the main navigation bar.

## 🎨 UI/UX Features

### Market Cards
- Category badges with icons
- Time remaining countdown
- Volume display
- Top 2 outcomes with probabilities
- Interactive hover effects

### Trading Interface
- Buy/Sell toggle
- Outcome selector
- Share quantity input
- Current position display
- Real-time cost calculation
- Potential profit preview

### Market Details
- Comprehensive market info
- All outcomes with probabilities
- Recent trade activity
- Live statistics
- Sticky trading panel

## 🔒 Security & Validation

### Input Validation
- Market title: max 200 characters
- Description: max 1000 characters
- Outcomes: 2-10 per market
- End date: must be in future
- Trade shares: must be > 0

### Authentication
- Trading requires authentication
- Position viewing requires authentication
- Market creation requires authentication
- Resolution requires admin role (TODO)

### Rate Limiting
- API rate limits apply (5000 requests/15 minutes)
- Protection against spam trading

## 📈 Example Use Cases

### Song Chart Performance
```
Market: "Will 'Summer Hit' reach Top 10?"
Outcomes:
- Yes, Top 10 (45% probability = $0.45/share)
- No, not Top 10 (55% probability = $0.55/share)
```

### Award Predictions
```
Market: "Grammy 2026 - Album of the Year"
Outcomes:
- Taylor Swift (30% = $0.30)
- Drake (25% = $0.25)
- The Weeknd (20% = $0.20)
- Other (25% = $0.25)
```

### Streaming Milestones
```
Market: "Will new album reach 1B streams in month 1?"
Outcomes:
- Yes (15% = $0.15)
- No (85% = $0.85)
```

## 🔧 Customization

### Adding New Categories

Edit both:
1. **Backend**: `/server/src/models/Market.ts`
   ```typescript
   category: {
     type: String,
     enum: [..., 'new_category']
   }
   ```

2. **Frontend**: Market components and pages
   ```typescript
   const categories = [
     { id: 'new_category', name: 'New Category', icon: '🎸' }
   ]
   ```

### Adjusting Fees

In `/server/src/routes/markets.ts`:
```typescript
// Change default fee (currently 2%)
fee: 0.02, // Change to 0.01 for 1%, etc.
```

### Modifying Liquidity Pool

In `Market.ts` model:
```typescript
totalLiquidity: {
  default: 1000, // Adjust starting liquidity
}
```

## 📱 Future Enhancements

Potential improvements:
- [ ] Real-time WebSocket updates
- [ ] Market comments/discussion
- [ ] Leaderboards for top traders
- [ ] Portfolio analytics dashboard
- [ ] Market maker incentives
- [ ] Social sharing of positions
- [ ] Mobile-optimized trading
- [ ] Advanced order types (limit orders)
- [ ] Market recommendation engine
- [ ] Integration with song analysis results

## 🐛 Troubleshooting

### Markets not appearing
- Check MongoDB connection
- Verify markets are seeded
- Check API endpoint: `/api/markets`

### Trading fails
- Ensure user is authenticated
- Check token in localStorage
- Verify sufficient shares for selling
- Check market status (must be "active")

### Prices not updating
- Verify AMM calculation function
- Check market.save() is called after trades
- Ensure outcome shares are updating

## 📝 API Response Examples

### List Markets
```json
{
  "markets": [...],
  "total": 8,
  "hasMore": false
}
```

### Trade Execution
```json
{
  "trade": {
    "_id": "...",
    "type": "buy",
    "shares": 10,
    "price": 0.45,
    "totalCost": 4.59
  },
  "position": {
    "shares": 10,
    "averageCost": 0.459,
    "unrealizedPnL": 0
  },
  "market": {
    "id": "...",
    "outcomes": [...]
  }
}
```

## 🎓 Learn More

- **Polymarket**: https://polymarket.com (inspiration)
- **Prediction Markets**: https://en.wikipedia.org/wiki/Prediction_market
- **AMM Pricing**: https://en.wikipedia.org/wiki/Automated_market_maker

---

**Built with**: Express.js, MongoDB, React, TypeScript, Tailwind CSS

**Author**: songIQ Team  
**Version**: 1.0.0  
**Last Updated**: November 2025

