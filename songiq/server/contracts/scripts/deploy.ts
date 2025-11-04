import { ethers } from "hardhat";

async function main() {
  console.log("\n🚀 Starting SongIQ Smart Contract Deployment");
  console.log("===========================================\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployment Details:");
  console.log("  Deployer address:", deployer.address);
  console.log("  Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network Information:");
  console.log("  Network name:", network.name);
  console.log("  Chain ID:", network.chainId.toString());
  console.log("");

  // Deploy Mock Tokens for testing
  console.log("📦 Step 1: Deploying Mock ERC20 Tokens...");
  console.log("-------------------------------------------");

  // Deploy USDC Mock
  const MockUSDC = await ethers.getContractFactory("MockERC20");
  const usdc = await MockUSDC.deploy(
    "Mock USD Coin",
    "USDC",
    6,  // 6 decimals like real USDC
    1000000  // 1 million initial supply
  );
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("  ✅ USDC deployed to:", usdcAddress);

  // Deploy USDT Mock
  const MockUSDT = await ethers.getContractFactory("MockERC20");
  const usdt = await MockUSDT.deploy(
    "Mock Tether",
    "USDT",
    6,  // 6 decimals
    1000000
  );
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("  ✅ USDT deployed to:", usdtAddress);

  // Deploy DAI Mock
  const MockDAI = await ethers.getContractFactory("MockERC20");
  const dai = await MockDAI.deploy(
    "Mock Dai",
    "DAI",
    18,  // 18 decimals like real DAI
    1000000
  );
  await dai.waitForDeployment();
  const daiAddress = await dai.getAddress();
  console.log("  ✅ DAI deployed to:", daiAddress);

  console.log("");

  // Deploy TradingPlatform
  console.log("📦 Step 2: Deploying TradingPlatform Contract...");
  console.log("--------------------------------------------------");
  
  const TradingPlatform = await ethers.getContractFactory("TradingPlatform");
  const tradingPlatform = await TradingPlatform.deploy();
  await tradingPlatform.waitForDeployment();
  const platformAddress = await tradingPlatform.getAddress();
  console.log("  ✅ TradingPlatform deployed to:", platformAddress);

  console.log("");

  // Create trading pairs
  console.log("📦 Step 3: Creating Trading Pairs...");
  console.log("-------------------------------------");

  // Create USDC/USDT pair
  console.log("  Creating USDC/USDT pair...");
  const tx1 = await tradingPlatform.createTradingPair(
    usdcAddress,
    usdtAddress,
    10,   // 0.1% maker fee (10 basis points)
    20    // 0.2% taker fee (20 basis points)
  );
  await tx1.wait();
  console.log("  ✅ USDC/USDT pair created");

  // Create USDC/DAI pair
  console.log("  Creating USDC/DAI pair...");
  const tx2 = await tradingPlatform.createTradingPair(
    usdcAddress,
    daiAddress,
    10,
    20
  );
  await tx2.wait();
  console.log("  ✅ USDC/DAI pair created");

  // Create USDT/DAI pair
  console.log("  Creating USDT/DAI pair...");
  const tx3 = await tradingPlatform.createTradingPair(
    usdtAddress,
    daiAddress,
    10,
    20
  );
  await tx3.wait();
  console.log("  ✅ USDT/DAI pair created");

  console.log("");

  // Fund deployer with test tokens
  console.log("📦 Step 4: Minting Test Tokens to Deployer...");
  console.log("-----------------------------------------------");
  
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 tokens
  const mintAmountDAI = ethers.parseUnits("10000", 18);

  await usdc.mint(deployer.address, mintAmount);
  console.log("  ✅ Minted 10,000 USDC to deployer");

  await usdt.mint(deployer.address, mintAmount);
  console.log("  ✅ Minted 10,000 USDT to deployer");

  await dai.mint(deployer.address, mintAmountDAI);
  console.log("  ✅ Minted 10,000 DAI to deployer");

  console.log("");

  // Summary
  console.log("🎉 Deployment Complete!");
  console.log("======================");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("  TradingPlatform:", platformAddress);
  console.log("  USDC (Mock):", usdcAddress);
  console.log("  USDT (Mock):", usdtAddress);
  console.log("  DAI (Mock):", daiAddress);
  console.log("");
  console.log("📊 Trading Pairs Created:");
  console.log("  1. USDC/USDT (Pair ID: 1)");
  console.log("  2. USDC/DAI (Pair ID: 2)");
  console.log("  3. USDT/DAI (Pair ID: 3)");
  console.log("");
  console.log("💰 Test Tokens Minted:");
  console.log("  Deployer has 10,000 of each token");
  console.log("");
  console.log("🔍 Verify Contracts:");
  console.log("  Run: npx hardhat verify --network", network.name, platformAddress);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("  1. Update server .env with contract addresses");
  console.log("  2. Test token deposits and trading");
  console.log("  3. Add liquidity to pairs");
  console.log("  4. Verify contracts on Etherscan");
  console.log("");

  // Save deployment info to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TradingPlatform: platformAddress,
      USDC: usdcAddress,
      USDT: usdtAddress,
      DAI: daiAddress
    },
    tradingPairs: [
      { pairId: 1, base: "USDC", quote: "USDT" },
      { pairId: 2, base: "USDC", quote: "DAI" },
      { pairId: 3, base: "USDT", quote: "DAI" }
    ]
  };

  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `deployment-${network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentsDir, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", filename);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

