# Multi-Currency Trading Platform Guide

## Overview

SongIQ now features a comprehensive multi-currency trading system that supports:
- **Multiple ERC20 tokens** (USDC, USDT, DAI, ETH, MATIC, etc.)
- **Cross-currency trading pairs** with orderbook matching engine
- **Stablecoin integration** for stable value trading
- **Fiat on/off ramps** via Stripe, Circle, and Coinbase
- **Automated Market Maker (AMM)** liquidity pools
- **Smart contract integration** for decentralized trading

## Architecture

### Core Components

1. **Models** (`/src/models/`)
   - `Currency.ts` - Currency/token definitions
   - `Wallet.ts` - User wallet management (custodial & non-custodial)
   - `Balance.ts` - User balances per currency
   - `TradingPair.ts` - Trading pair configurations
   - `Order.ts` - Limit/market orders
   - `Transaction.ts` - Deposit/withdrawal tracking

2. **Services** (`/src/services/`)
   - `blockchainService.ts` - Web3 integration (ethers.js)
   - `matchingEngine.ts` - Order matching and execution
   - `currencyConversionService.ts` - Real-time exchange rates
   - `fiatIntegrationService.ts` - Fiat payment processing

3. **Smart Contracts** (`/contracts/`)
   - `TradingPlatform.sol` - Multi-currency DEX with AMM
   - `MockERC20.sol` - Test tokens

4. **API Routes** (`/src/routes/`)
   - `/api/currencies` - Currency management
   - `/api/wallets` - Wallet operations
   - `/api/transactions` - Deposits & withdrawals
   - `/api/trading` - Order placement & trading
   - `/api/admin/currency` - Admin management

## Setup Instructions

### 1. Install Dependencies

```bash
cd songiq/server
npm install
```

The following packages are now installed:
- `ethers` - Ethereum blockchain interaction
- `@openzeppelin/contracts` - Secure smart contract standards

### 2. Environment Configuration

Add these variables to your `.env` file:

```bash
# Blockchain RPC URLs
ETH_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# Wallet Encryption
WALLET_ENCRYPTION_KEY=your_32_byte_hex_key_here

# Payment Providers
STRIPE_SECRET_KEY=sk_test_your_key
CIRCLE_API_KEY=your_circle_api_key
COINBASE_API_KEY=your_coinbase_api_key

# Blockchain Explorers (for verification)
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
BSCSCAN_API_KEY=your_bscscan_key

# Smart Contract Deployment
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
```

### 3. Initialize Database

Seed initial currencies and trading pairs:

```bash
cd songiq/server
npm run seed:currencies
```

Or manually:

```bash
npx ts-node scripts/seed-currencies.ts
```

This will create:
- **Currencies**: USD, USDC, USDT, DAI, ETH, BTC, MATIC
- **Trading Pairs**: ETH/USDC, BTC/USDC, MATIC/USDC, etc.

### 4. Deploy Smart Contracts (Optional)

For blockchain-based trading:

```bash
cd songiq/server/contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

## API Usage

### Currency Management

#### Get All Currencies
```bash
GET /api/currencies
```

Response:
```json
{
  "currencies": [
    {
      "_id": "...",
      "symbol": "USDC",
      "name": "USD Coin",
      "type": "stablecoin",
      "priceUSD": 1.0,
      "decimals": 6,
      "isActive": true
    }
  ]
}
```

#### Get Currency Balances (Authenticated)
```bash
GET /api/currencies/user/balances
Authorization: Bearer <token>
```

#### Convert Between Currencies
```bash
GET /api/currencies/convert?from=ETH&to=USDC&amount=1.5
```

### Wallet Management

#### Create Custodial Wallet
```bash
POST /api/wallets
Authorization: Bearer <token>
Content-Type: application/json

{
  "chainId": 1,
  "label": "My Ethereum Wallet"
}
```

#### Connect Non-Custodial Wallet
```bash
POST /api/wallets/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": "0x...",
  "chainId": 1,
  "label": "MetaMask"
}
```

#### Get Wallet Balance
```bash
GET /api/wallets/:id/balance?tokenAddress=0x...
Authorization: Bearer <token>
```

### Transactions

#### Crypto Deposit
```bash
POST /api/transactions/deposit/crypto
Authorization: Bearer <token>
Content-Type: application/json

{
  "currencyId": "...",
  "amount": "100",
  "txHash": "0x...",
  "chainId": 1
}
```

#### Fiat Deposit (Stripe)
```bash
POST /api/transactions/deposit/fiat
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "currency": "USD",
  "provider": "stripe"
}
```

#### Crypto Withdrawal
```bash
POST /api/transactions/withdrawal/crypto
Authorization: Bearer <token>
Content-Type: application/json

{
  "currencyId": "...",
  "amount": "50",
  "toAddress": "0x...",
  "walletId": "...",
  "chainId": 1
}
```

### Trading

#### Get Trading Pairs
```bash
GET /api/trading/pairs
```

#### Get Orderbook
```bash
GET /api/trading/pairs/:id/orderbook
```

#### Place Market Order
```bash
POST /api/trading/orders/market
Authorization: Bearer <token>
Content-Type: application/json

{
  "tradingPairId": "...",
  "side": "buy",
  "amount": 1.5
}
```

#### Place Limit Order
```bash
POST /api/trading/orders/limit
Authorization: Bearer <token>
Content-Type: application/json

{
  "tradingPairId": "...",
  "side": "buy",
  "price": 2000,
  "amount": 1.5,
  "timeInForce": "GTC"
}
```

#### Cancel Order
```bash
DELETE /api/trading/orders/:id
Authorization: Bearer <token>
```

### Admin Operations

#### Create Currency (Admin Only)
```bash
POST /api/admin/currency/currencies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "symbol": "LINK",
  "name": "Chainlink",
  "type": "crypto",
  "decimals": 18,
  "contractAddress": "0x514910771af9ca656af840dff83e8264ecf986ca",
  "chainId": 1
}
```

#### Create Trading Pair (Admin Only)
```bash
POST /api/admin/currency/trading-pairs
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "baseCurrencyId": "...",
  "quoteCurrencyId": "...",
  "makerFee": 0.001,
  "takerFee": 0.002
}
```

#### Update Prices
```bash
POST /api/admin/currency/prices/update
Authorization: Bearer <admin_token>
```

## Features

### 1. Multi-Token Support
- ERC20 token integration
- Native blockchain tokens (ETH, MATIC, BNB)
- Automatic token detection and metadata fetching

### 2. Cross-Currency Markets
- Orderbook-based matching engine
- Market and limit orders
- Time-in-force options (GTC, IOC, FOK)
- Real-time order matching

### 3. Stablecoin Integration
- USDC (Circle)
- USDT (Tether)
- DAI (MakerDAO)
- Automatic price pegging to USD

### 4. Fiat On/Off Ramps
- **Stripe**: Credit card deposits, bank transfers
- **Circle**: USDC direct purchases
- **Coinbase**: Crypto-to-fiat conversion
- Webhook support for payment confirmations

### 5. AMM Liquidity Pools
- Constant product formula (x * y = k)
- Add/remove liquidity
- Liquidity provider tokens
- Price impact calculation

### 6. Security Features
- Encrypted private keys for custodial wallets
- Rate limiting on all endpoints
- Transaction confirmation requirements
- Multi-signature support (future)

## Trading Flow

### Orderbook Trading

1. **User places limit order**
   - Balance is locked
   - Order added to orderbook

2. **Matching engine processes**
   - Finds opposite side orders
   - Matches by price-time priority
   - Executes trades atomically

3. **Settlement**
   - Balances updated
   - Trade records created
   - Locked funds released

### AMM Trading

1. **User swaps tokens**
   - Input amount specified
   - Output calculated via formula
   - Slippage protection

2. **Pool update**
   - Reserves adjusted
   - Price updated
   - LP tokens issued/burned

## Monitoring & Analytics

### Platform Statistics
```bash
GET /api/admin/currency/stats
Authorization: Bearer <admin_token>
```

Returns:
- Total currencies and trading pairs
- 24h volume
- Active orders
- Pending transactions

### User Portfolio
```bash
GET /api/currencies/user/portfolio
Authorization: Bearer <token>
```

Returns:
- Total USD value
- Asset allocation
- Per-currency balances

## Development

### Running Tests

```bash
# Unit tests
npm test

# Smart contract tests
cd contracts
npx hardhat test
```

### Local Blockchain

Use Hardhat for local development:

```bash
cd contracts
npx hardhat node
```

### Price Updates

Set up a cron job to update currency prices:

```bash
# Every 5 minutes
*/5 * * * * curl -X POST http://localhost:5001/api/currencies/prices/update
```

## Production Deployment

### 1. Smart Contracts

Deploy to mainnet:

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network mainnet
```

### 2. Environment

Ensure all production keys are set:
- Use production RPC providers (Alchemy, Infura)
- Enable Stripe live mode
- Set up proper encryption keys
- Configure webhooks

### 3. Monitoring

- Set up transaction monitoring
- Enable error alerts
- Track gas prices
- Monitor liquidity

## Troubleshooting

### Common Issues

1. **Transaction Failed**
   - Check gas prices
   - Verify balance
   - Ensure contract approval

2. **Price Not Updating**
   - Check API rate limits
   - Verify CoinGecko connectivity
   - Manual price update via admin

3. **Order Not Matching**
   - Check price alignment
   - Verify orderbook liquidity
   - Ensure sufficient balance

## Support

For issues or questions:
- Check logs: `songiq/server/logs/`
- Review transaction history in admin panel
- Contact support with transaction hash

## Future Enhancements

- [ ] Multi-chain support (Arbitrum, Optimism)
- [ ] Advanced order types (Stop-loss, Take-profit)
- [ ] Margin trading
- [ ] Futures contracts
- [ ] Cross-chain bridges
- [ ] Mobile wallet integration
- [ ] Advanced charting
- [ ] Social trading features

## Security Audit

Before production:
1. Smart contract audit
2. Penetration testing
3. Key management review
4. Compliance check (KYC/AML)

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Documentation:** https://songiq.ai/docs/multi-currency

