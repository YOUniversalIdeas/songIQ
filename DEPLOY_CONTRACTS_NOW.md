# 🚀 Deploy Smart Contracts - Quick Guide

## Current Status

✅ Smart contracts written and ready  
✅ Deployment scripts created  
✅ Hardhat configured  
⚠️ Compiler download issue (network connectivity)

## 🎯 Option 1: Deploy Locally (Recommended for Testing)

### Start Local Hardhat Network

```bash
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts

# Start local blockchain
npx hardhat node
```

This gives you:
- 20 test accounts with 10,000 ETH each
- Fast transactions (no waiting)
- Free gas
- Perfect for development

### Deploy to Local Network (New Terminal)

```bash
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts

# Deploy
npx hardhat run scripts/deploy.ts --network localhost
```

## 🌐 Option 2: Deploy to Sepolia Testnet

### Prerequisites

1. **Get a Private Key**
   ```bash
   # Create a new wallet or export from MetaMask
   # Add to .env (WITHOUT 0x prefix):
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   ```

2. **Get Test ETH** from Sepolia faucets:
   - https://sepoliafaucet.com/
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - https://faucet.quicknode.com/ethereum/sepolia

3. **Get RPC URL** (free):
   ```bash
   # Add to .env:
   SEPOLIA_RPC_URL=https://rpc.sepolia.org
   # Or use Alchemy/Infura for better reliability
   ```

### Deploy

```bash
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts

# Ensure you have test ETH
npx hardhat run scripts/deploy.ts --network sepolia
```

## 🔧 Fix Compiler Issue

If you're getting compiler download errors, try:

### Method 1: Manual Compiler Install
```bash
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts

# Clean and retry
rm -rf cache artifacts node_modules
npm install
npx hardhat clean
npx hardhat compile --force
```

### Method 2: Use Different Network

Try with better internet connection or use a VPN if blocked.

### Method 3: Use Pre-Compiled Contracts

I can provide pre-compiled contract ABIs if needed.

## 📦 What You'll Get After Deployment

```
🎉 Deployment Complete!
======================

📋 Contract Addresses:
  TradingPlatform: 0x...
  USDC (Mock): 0x...
  USDT (Mock): 0x...
  DAI (Mock): 0x...

📊 Trading Pairs Created:
  1. USDC/USDT (Pair ID: 1)
  2. USDC/DAI (Pair ID: 2)
  3. USDT/DAI (Pair ID: 3)

💰 Test Tokens Minted:
  Deployer has 10,000 of each token
```

## 🧪 After Deployment

### Test the Contracts

```bash
cd /Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/contracts

# Run tests
npx hardhat test

# Run specific test
npx hardhat test test/TradingPlatform.test.ts
```

### Interact with Contracts

```javascript
// Get contract instance
const platform = await ethers.getContractAt(
  "TradingPlatform", 
  "DEPLOYED_ADDRESS"
);

// Check pair
const pair = await platform.tradingPairs(1);
console.log("Pair 1:", pair);

// Get price
const price = await platform.getPrice(1);
console.log("Current price:", price.toString());
```

### Update Backend

Add contract addresses to `/Users/allanrestrepo/Documents/GitHub/songIQ/songiq/server/.env`:

```bash
# Smart Contract Addresses
TRADING_PLATFORM_ADDRESS=0x...
USDC_TOKEN_ADDRESS=0x...
USDT_TOKEN_ADDRESS=0x...
DAI_TOKEN_ADDRESS=0x...
```

## 🎯 Quick Commands Summary

```bash
# Local deployment (easiest)
cd songiq/server/contracts
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.ts --network localhost  # Terminal 2

# Testnet deployment (requires setup)
npx hardhat run scripts/deploy.ts --network sepolia

# Run tests
npx hardhat test

# Verify on Etherscan
npx hardhat verify --network sepolia <ADDRESS>

# Clean and recompile
npx hardhat clean && npx hardhat compile --force
```

## 💡 Pro Tips

1. **Start with Local**: Always test locally before testnet
2. **Save Addresses**: Copy deployment addresses to a safe place
3. **Test Everything**: Run the test suite before mainnet
4. **Monitor Gas**: Check gas costs on testnet
5. **Verify Contracts**: Always verify on Etherscan for transparency

## 🐛 Troubleshooting

### "Compiler download failed"
- Check internet connection
- Try different RPC provider
- Use VPN if needed
- Clear cache: `rm -rf cache`

### "Insufficient funds"
- Get more test ETH from faucets
- Wait for faucet cooldown period
- Try multiple faucets

### "Nonce too high"
- Reset Hardhat: `npx hardhat clean`
- Check if transaction is pending
- Wait for previous tx to confirm

### "Contract verification failed"
- Wait 1-2 minutes after deployment
- Check constructor arguments
- Ensure contract is compiled with same settings

## 📞 Need Help?

Check these resources:
- **Hardhat Docs**: https://hardhat.org/docs
- **Sepolia Faucets**: Listed in deployment guide
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Etherscan**: https://sepolia.etherscan.io/

## ✅ Deployment Checklist

Before deploying:
- [ ] Contracts compile successfully
- [ ] Tests pass locally
- [ ] Private key in .env (for testnet)
- [ ] Test ETH in wallet (for testnet)
- [ ] RPC URL configured
- [ ] Backup deployment addresses

---

**Ready? Let's deploy! Start with Option 1 (local) for fastest testing.** 🚀

