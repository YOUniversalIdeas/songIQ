# Prediction Markets - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Development Server

Make sure your MongoDB is running, then:

```bash
# From the project root
cd songiq/server
npm run dev

# In another terminal
cd songiq/client
npm run dev
```

### Step 2: Seed Sample Markets

```bash
cd songiq/server
npx ts-node scripts/seed-markets.ts
```

Expected output:
```
✅ Connected to MongoDB
📝 Using user xxx@example.com as market creator
✅ Created market: Will "Summer Vibes 2025" reach Top 10...
✅ Created market: Will Drake release a new album in 2025?
...
🎉 Successfully seeded 8 prediction markets!
```

### Step 3: Access the Markets

1. Open your browser to `http://localhost:3001`
2. Click **"Markets"** in the navigation bar
3. Browse available prediction markets

### Step 4: Make Your First Trade

1. Click on any market card
2. Review the outcomes and current prices
3. Click the **Trading Interface** on the right
4. Select **Buy** or **Sell**
5. Choose an outcome and number of shares
6. Click the trade button

**Note**: You must be logged in to trade!

## 📊 Sample Markets Available

After seeding, you'll have:

1. **Chart Position**: Will songs reach Top 10?
2. **Awards**: Grammy predictions
3. **Streaming Numbers**: 1B stream milestones
4. **Artist Popularity**: Most monthly listeners
5. **Genre Trends**: Afrobeats, hyperpop mainstream adoption
6. **Release Success**: Album release predictions

## 💡 Quick Tips

- **Prices = Probabilities**: A $0.60 share means 60% implied probability
- **Winning Pays $1.00**: If your outcome wins, each share pays $1.00
- **2% Fee**: Platform takes 2% on each trade
- **Trade Anytime**: Buy and sell before market closes
- **Track P&L**: Your positions show unrealized profit/loss

## 🎯 Example Trade Walkthrough

### Scenario: Buy shares in "Yes, Top 10"

**Market**: "Will Summer Vibes 2025 reach Top 10?"
- **Outcome Selected**: "Yes, Top 10"
- **Current Price**: $0.35/share (35% probability)
- **Shares to Buy**: 10

**Cost Calculation**:
- Share Cost: 10 × $0.35 = $3.50
- Fee (2%): $3.50 × 0.02 = $0.07
- **Total Cost**: $3.57

**If You Win**:
- Payout: 10 shares × $1.00 = $10.00
- Profit: $10.00 - $3.57 = **$6.43** (180% return!)

**If You Lose**:
- Payout: $0.00
- Loss: **-$3.57**

## 🛠️ Troubleshooting

**"No markets found"**
- Run the seed script (Step 2)
- Refresh the page

**"Please login to trade"**
- Create an account at `/auth`
- Login with your credentials

**"Insufficient shares to sell"**
- You must own shares before selling
- Buy some shares first

**Prices seem wrong**
- Prices are probabilities (0.01 to 0.99)
- They automatically adjust as trades happen

## 📱 Navigation

- **Markets List**: Browse all markets
- **Market Detail**: Click any card to see full details
- **My Positions**: View in user menu (coming soon)
- **Trade History**: Check your past trades

## 🎨 Key Features to Explore

1. **Category Filtering**: Filter markets by type
2. **Search**: Find specific markets
3. **Real-time Updates**: Prices update after each trade
4. **Recent Trades**: See what others are trading
5. **Outcome Probabilities**: Visual bars show implied odds
6. **Time Remaining**: Countdown to market close

## 💰 Understanding Payouts

### Binary Market (Yes/No)
```
Buy "Yes" at $0.40 → Cost $0.40/share
If Yes wins: Pay $1.00/share → Profit $0.60
If No wins: Pay $0.00/share → Loss $0.40
```

### Multiple Outcomes
```
Buy "Taylor Swift" at $0.30 → Cost $0.30/share
If Taylor wins: Pay $1.00/share → Profit $0.70
If others win: Pay $0.00/share → Loss $0.30
```

## 🔐 User Roles

- **All Users**: Browse markets, view details
- **Authenticated**: Trade, view positions
- **Admin**: Create markets, resolve outcomes

## 📈 Next Steps

1. ✅ Browse markets
2. ✅ Make your first trade
3. ✅ Track your positions
4. ✅ Sell shares for profit
5. ⬜ Create your own market (admin only)
6. ⬜ Share predictions with friends

## 🆘 Need Help?

See the full documentation:
- `PREDICTION_MARKETS_GUIDE.md` - Complete feature documentation
- API: `http://localhost:5001/api/markets` - Test endpoints
- Support: Open an issue on GitHub

---

**Happy Trading! 📊🎵**

