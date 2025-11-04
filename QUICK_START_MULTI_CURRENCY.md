# Quick Start: Multi-Currency Trading System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (30 seconds)
```bash
cd songiq/server
npm install
```

### Step 2: Configure Environment (2 minutes)

Add these essential variables to your `.env` file:

```bash
# Blockchain (use free public RPCs for testing)
ETH_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
WALLET_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Payment (use test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Database (your existing)
MONGODB_URI=mongodb://localhost:27017/songiq

# JWT (your existing)
JWT_SECRET=your_jwt_secret
```

### Step 3: Seed Database (1 minute)
```bash
npm run seed:currencies
```

This creates:
- ✅ 7 currencies (USD, USDC, USDT, DAI, ETH, BTC, MATIC)
- ✅ 11 trading pairs (ETH/USDC, BTC/USDC, etc.)
- ✅ Default fee structures

### Step 4: Start Server (10 seconds)
```bash
npm run dev
```

### Step 5: Test the System (2 minutes)

#### Get Available Currencies
```bash
curl http://localhost:5001/api/currencies
```

#### Get Trading Pairs
```bash
curl http://localhost:5001/api/trading/pairs
```

#### Get Currency Conversion Rate
```bash
curl "http://localhost:5001/api/currencies/convert?from=ETH&to=USDC&amount=1"
```

## 🎯 Create Your First Trade

### 1. Get Authentication Token
```bash
# Register or login to get JWT token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'
```

Save the token from response: `"token": "eyJhbGc..."`

### 2. Create Test Wallet
```bash
# Replace <userId> with your user ID from login
npm run create:test-wallet <userId>
```

This gives you:
- ✅ Ethereum wallet
- ✅ Polygon wallet
- ✅ Test balances in all currencies

### 3. Check Your Balances
```bash
curl http://localhost:5001/api/currencies/user/balances \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Place Your First Order
```bash
# Buy 0.1 ETH with USDC (market order)
curl -X POST http://localhost:5001/api/trading/orders/market \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tradingPairId": "GET_FROM_PAIRS_ENDPOINT",
    "side": "buy",
    "amount": 0.1
  }'
```

### 5. View Order History
```bash
curl http://localhost:5001/api/trading/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 Key Endpoints Reference

### Public Endpoints (No Auth Required)
```bash
GET  /api/currencies                    # List all currencies
GET  /api/currencies/symbol/:symbol     # Get specific currency
GET  /api/currencies/convert            # Convert between currencies
GET  /api/trading/pairs                 # List trading pairs
GET  /api/trading/pairs/:id/orderbook   # View orderbook
```

### User Endpoints (Auth Required)
```bash
# Balances & Portfolio
GET  /api/currencies/user/balances      # Your balances
GET  /api/currencies/user/portfolio     # Portfolio summary

# Wallets
GET  /api/wallets                       # Your wallets
POST /api/wallets                       # Create custodial wallet
POST /api/wallets/connect               # Connect external wallet

# Trading
POST /api/trading/orders/market         # Place market order
POST /api/trading/orders/limit          # Place limit order
GET  /api/trading/orders                # Your orders
DELETE /api/trading/orders/:id          # Cancel order

# Transactions
GET  /api/transactions                  # Transaction history
POST /api/transactions/deposit/crypto   # Deposit crypto
POST /api/transactions/deposit/fiat     # Deposit fiat
POST /api/transactions/withdrawal/crypto # Withdraw crypto
```

### Admin Endpoints (Admin Auth Required)
```bash
POST /api/admin/currency/currencies     # Add currency
POST /api/admin/currency/trading-pairs  # Add trading pair
GET  /api/admin/currency/stats          # Platform stats
POST /api/admin/currency/prices/update  # Force price update
```

## 🧪 Testing Scenarios

### Scenario 1: Simple Buy Order
```javascript
// 1. Get ETH/USDC pair ID
const pairs = await fetch('http://localhost:5001/api/trading/pairs').then(r => r.json());
const ethUsdcPair = pairs.pairs.find(p => p.symbol === 'ETH/USDC');

// 2. Place market order
const order = await fetch('http://localhost:5001/api/trading/orders/market', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tradingPairId: ethUsdcPair._id,
    side: 'buy',
    amount: 0.1
  })
}).then(r => r.json());

console.log('Order placed:', order);
```

### Scenario 2: Check Portfolio Value
```javascript
const portfolio = await fetch('http://localhost:5001/api/currencies/user/portfolio', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
}).then(r => r.json());

console.log('Total Portfolio Value: $', portfolio.totalValue);
console.log('Asset Allocation:', portfolio.allocation);
```

### Scenario 3: Create Trading Pair (Admin)
```javascript
// First, get currency IDs
const currencies = await fetch('http://localhost:5001/api/currencies').then(r => r.json());
const matic = currencies.currencies.find(c => c.symbol === 'MATIC');
const dai = currencies.currencies.find(c => c.symbol === 'DAI');

// Create MATIC/DAI pair
const pair = await fetch('http://localhost:5001/api/admin/currency/trading-pairs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ADMIN_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    baseCurrencyId: matic._id,
    quoteCurrencyId: dai._id,
    makerFee: 0.001,
    takerFee: 0.002
  })
}).then(r => r.json());

console.log('New pair created:', pair);
```

## 🔍 Monitoring

### Real-Time Price Updates
```bash
# Set up cron job (every 5 minutes)
*/5 * * * * curl -X POST http://localhost:5001/api/currencies/prices/update
```

### Check Platform Health
```bash
curl http://localhost:5001/api/health
```

### View Platform Stats (Admin)
```bash
curl http://localhost:5001/api/admin/currency/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🐛 Troubleshooting

### Issue: "Currency not found"
**Solution:** Run the seed script again
```bash
npm run seed:currencies
```

### Issue: "Insufficient balance"
**Solution:** Create test wallet with funds
```bash
npm run create:test-wallet YOUR_USER_ID
```

### Issue: "Order not matching"
**Solution:** Check orderbook and price alignment
```bash
curl http://localhost:5001/api/trading/pairs/:pairId/orderbook
```

### Issue: "Transaction failed"
**Solution:** Check gas prices and wallet balance
```bash
# Check wallet balance
curl http://localhost:5001/api/wallets/:walletId/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Next Steps

1. **Test Trading Flow**
   - Place limit orders
   - Try different trading pairs
   - Test order cancellation

2. **Explore AMM Features**
   - Add liquidity to pools
   - Perform token swaps
   - Calculate price impact

3. **Test Payment Integration**
   - Configure Stripe test mode
   - Test fiat deposits
   - Test withdrawal flow

4. **Deploy Smart Contracts**
   - Set up Hardhat
   - Deploy to testnet
   - Test on-chain trading

5. **Add Frontend**
   - Build trading interface
   - Create wallet connection
   - Add order placement UI

## 🎓 Resources

- **Full Documentation**: See `MULTI_CURRENCY_GUIDE.md`
- **Implementation Details**: See `MULTI_CURRENCY_IMPLEMENTATION_SUMMARY.md`
- **Smart Contracts**: Check `songiq/server/contracts/`
- **API Examples**: All routes in `songiq/server/src/routes/`

## 💡 Pro Tips

1. Use Postman or Insomnia for easier API testing
2. Keep test tokens in `.env.test` file
3. Monitor logs for debugging: `tail -f logs/server.log`
4. Use testnet tokens from faucets (free!)
5. Enable verbose logging: `LOG_LEVEL=debug npm run dev`

## ⚡ Performance Tips

1. Cache authentication tokens
2. Batch API requests when possible
3. Use WebSockets for real-time updates (coming soon)
4. Optimize database queries with proper indexes
5. Use Redis for rate limiting in production

## 🎉 You're Ready!

Your multi-currency trading platform is now fully operational. Start trading, testing, and building amazing features!

**Need Help?**
- Check the logs: `songiq/server/logs/`
- Review documentation files
- Test with curl or Postman
- Monitor database: `mongo mongodb://localhost:27017/songiq`

---

**Happy Trading! 🚀💰**

