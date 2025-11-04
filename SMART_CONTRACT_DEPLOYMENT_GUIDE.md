# Smart Contract Deployment Guide

## 🚀 Quick Start - Local Deployment

### Step 1: Setup Environment

Add these variables to your `.env` file:

```bash
# For Testnet Deployment (Sepolia)
SEPOLIA_RPC_URL=https://rpc.sepolia.org
DEPLOYER_PRIVATE_KEY=your_private_key_here  # WITHOUT 0x prefix
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: For other networks
ETH_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_key
BSC_RPC_URL=https://bsc-dataseed.binance.org
BSCSCAN_API_KEY=your_bscscan_key
```

⚠️ **IMPORTANT**: Never commit your private keys to Git!

### Step 2: Get Test ETH

For Sepolia testnet, get free test ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucet.quicknode.com/ethereum/sepolia

### Step 3: Deploy Locally (Recommended First)

```bash
cd songiq/server/contracts

# Terminal 1: Start local Hardhat node
npx hardhat node

# Terminal 2: Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

This will:
- ✅ Deploy TradingPlatform contract
- ✅ Deploy 3 mock ERC20 tokens (USDC, USDT, DAI)
- ✅ Create 3 trading pairs
- ✅ Mint test tokens to deployer

### Step 4: Deploy to Sepolia Testnet

Once local testing works:

```bash
cd songiq/server/contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

### Step 5: Verify Contracts

After deployment:

```bash
# Verify TradingPlatform
npx hardhat verify --network sepolia <PLATFORM_ADDRESS>

# Verify Mock Tokens
npx hardhat verify --network sepolia <USDC_ADDRESS> "Mock USD Coin" "USDC" 6 1000000
npx hardhat verify --network sepolia <USDT_ADDRESS> "Mock Tether" "USDT" 6 1000000
npx hardhat verify --network sepolia <DAI_ADDRESS> "Mock Dai" "DAI" 18 1000000
```

## 📦 What Gets Deployed

### Contracts

1. **TradingPlatform.sol**
   - Multi-token DEX with orderbook
   - AMM with constant product formula
   - Liquidity pools
   - Token swaps
   - Emergency pause functionality

2. **MockERC20.sol** (3 instances)
   - USDC (6 decimals)
   - USDT (6 decimals)
   - DAI (18 decimals)

### Trading Pairs Created

1. USDC/USDT - Pair ID: 1
2. USDC/DAI - Pair ID: 2
3. USDT/DAI - Pair ID: 3

Fees:
- Maker Fee: 0.1% (10 basis points)
- Taker Fee: 0.2% (20 basis points)

### Initial Token Distribution

Deployer receives 10,000 of each token for testing.

## 🧪 Testing the Contracts

### Test Deposit

```javascript
// Approve TradingPlatform to spend tokens
const usdc = await ethers.getContractAt("MockERC20", USDC_ADDRESS);
await usdc.approve(PLATFORM_ADDRESS, ethers.parseUnits("1000", 6));

// Deposit to platform
const platform = await ethers.getContractAt("TradingPlatform", PLATFORM_ADDRESS);
await platform.deposit(USDC_ADDRESS, ethers.parseUnits("1000", 6));
```

### Test Trading

```javascript
// Place limit order
await platform.placeOrder(
  1,  // pairId (USDC/USDT)
  true,  // isBuy
  ethers.parseUnits("1", 6),  // price
  ethers.parseUnits("100", 6)  // amount
);
```

### Test AMM Swap

```javascript
// Swap USDC for USDT
await platform.swap(
  1,  // pairId
  USDC_ADDRESS,  // tokenIn
  ethers.parseUnits("100", 6),  // amountIn
  ethers.parseUnits("95", 6)  // minAmountOut (slippage protection)
);
```

## 🔗 Integration with Backend

### Update Server Configuration

After deployment, add contract addresses to your server `.env`:

```bash
# Smart Contract Addresses (Sepolia)
TRADING_PLATFORM_ADDRESS=0x...
USDC_TOKEN_ADDRESS=0x...
USDT_TOKEN_ADDRESS=0x...
DAI_TOKEN_ADDRESS=0x...
```

### Update Currency Records

Run this script to update your database:

```bash
cd songiq/server
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Currency = require('./src/models/Currency').default;
  
  await Currency.updateOne(
    { symbol: 'USDC' },
    { 
      contractAddress: 'YOUR_USDC_ADDRESS',
      chainId: 11155111  // Sepolia
    }
  );
  
  await Currency.updateOne(
    { symbol: 'USDT' },
    { 
      contractAddress: 'YOUR_USDT_ADDRESS',
      chainId: 11155111
    }
  );
  
  await Currency.updateOne(
    { symbol: 'DAI' },
    { 
      contractAddress: 'YOUR_DAI_ADDRESS',
      chainId: 11155111
    }
  );
  
  console.log('✅ Currency addresses updated');
  process.exit(0);
});
"
```

## 🔒 Security Considerations

### Before Mainnet Deployment

1. **Audit Contracts**
   - Professional smart contract audit
   - Test extensively on testnet
   - Consider bug bounty program

2. **Use Multi-Sig Wallet**
   - Gnosis Safe for contract ownership
   - Multiple signers for critical operations
   - Time-lock for sensitive functions

3. **Monitor Contract Activity**
   - Set up alerts for large transactions
   - Monitor for unusual activity
   - Keep emergency pause capability

4. **Insurance**
   - Consider protocol insurance
   - Set aside funds for potential issues

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All contracts compile without errors
- [ ] Tests pass locally
- [ ] Security audit completed (for mainnet)
- [ ] Deployment script tested on testnet
- [ ] Environment variables configured
- [ ] Sufficient ETH in deployer wallet

### During Deployment
- [ ] Deploy to testnet first
- [ ] Verify contracts on Etherscan
- [ ] Test all functions
- [ ] Create trading pairs
- [ ] Add initial liquidity
- [ ] Test trading flow

### Post-Deployment
- [ ] Update backend with contract addresses
- [ ] Update database with token addresses
- [ ] Test integration with backend
- [ ] Monitor gas costs
- [ ] Document deployment addresses
- [ ] Transfer ownership to multisig (mainnet)

## 🐛 Troubleshooting

### Compiler Download Issues

If you get compiler download errors:

```bash
# Try with a specific Hardhat cache
rm -rf cache artifacts
npx hardhat clean
npx hardhat compile --force
```

### Insufficient Funds

```
Error: insufficient funds for intrinsic transaction cost
```

**Solution**: Get more test ETH from faucets listed above.

### Invalid Nonce

```
Error: nonce has already been used
```

**Solution**: Reset your account nonce:
```bash
npx hardhat clean
# Or use --reset flag in Hardhat
```

### Contract Verification Failed

```
Error: contract verification failed
```

**Solution**: 
1. Check constructor arguments match deployment
2. Wait 1-2 minutes after deployment
3. Try verification command again

## 📈 Gas Optimization Tips

1. **Batch Operations**
   - Create multiple trading pairs in one transaction
   - Batch token approvals

2. **Use Lower Gas Price**
   - For testnet, gas price doesn't matter
   - For mainnet, monitor gas tracker
   - Deploy during off-peak hours

3. **Optimize Contract Size**
   - Our contracts are already optimized
   - Optimizer runs set to 200

## 🎓 Advanced: Production Deployment

### Mainnet Deployment

```bash
# ONLY after thorough testing and audit
npx hardhat run scripts/deploy.ts --network mainnet

# Verify
npx hardhat verify --network mainnet <ADDRESS> <CONSTRUCTOR_ARGS>
```

### Multi-Chain Deployment

Deploy to multiple chains:

```bash
# Polygon
npx hardhat run scripts/deploy.ts --network polygon

# BSC
npx hardhat run scripts/deploy.ts --network bsc
```

## 📝 Deployment Record

The deployment script automatically saves deployment info to:
```
contracts/deployments/deployment-{network}-{timestamp}.json
```

This file contains:
- Contract addresses
- Network information
- Trading pair IDs
- Deployer address
- Timestamp

## 🔄 Upgrading Contracts

Our contracts are **not upgradeable** by design for security. To upgrade:

1. Deploy new version of contract
2. Migrate liquidity to new contract
3. Update backend configuration
4. Deprecate old contract

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Etherscan Verification](https://etherscan.io/verifyContract)
- [Sepolia Faucets](https://sepoliafaucet.com/)

---

**Ready to deploy? Start with local testing, then move to testnet!** 🚀

