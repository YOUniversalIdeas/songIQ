import { expect } from "chai";
import { ethers } from "hardhat";
import { TradingPlatform, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TradingPlatform", function () {
  let tradingPlatform: TradingPlatform;
  let usdc: MockERC20;
  let usdt: MockERC20;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock tokens
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20Factory.deploy("Mock USDC", "USDC", 6, 1000000);
    usdt = await MockERC20Factory.deploy("Mock USDT", "USDT", 6, 1000000);

    // Deploy TradingPlatform
    const TradingPlatformFactory = await ethers.getContractFactory("TradingPlatform");
    tradingPlatform = await TradingPlatformFactory.deploy();

    // Mint tokens to users
    await usdc.mint(user1.address, ethers.parseUnits("10000", 6));
    await usdt.mint(user2.address, ethers.parseUnits("10000", 6));
  });

  describe("Trading Pair Creation", function () {
    it("Should create a trading pair", async function () {
      await tradingPlatform.createTradingPair(
        await usdc.getAddress(),
        await usdt.getAddress(),
        10, // 0.1% maker fee
        20  // 0.2% taker fee
      );

      const pair = await tradingPlatform.tradingPairs(1);
      expect(pair.isActive).to.be.true;
    });

    it("Should fail if non-owner tries to create pair", async function () {
      await expect(
        tradingPlatform.connect(user1).createTradingPair(
          await usdc.getAddress(),
          await usdt.getAddress(),
          10,
          20
        )
      ).to.be.reverted;
    });
  });

  describe("Deposits", function () {
    beforeEach(async function () {
      await tradingPlatform.createTradingPair(
        await usdc.getAddress(),
        await usdt.getAddress(),
        10,
        20
      );
    });

    it("Should allow users to deposit tokens", async function () {
      const depositAmount = ethers.parseUnits("100", 6);
      
      await usdc.connect(user1).approve(await tradingPlatform.getAddress(), depositAmount);
      await tradingPlatform.connect(user1).deposit(await usdc.getAddress(), depositAmount);

      const balance = await tradingPlatform.balances(user1.address, await usdc.getAddress());
      expect(balance).to.equal(depositAmount);
    });
  });

  describe("Orders", function () {
    const depositAmount = ethers.parseUnits("1000", 6);

    beforeEach(async function () {
      await tradingPlatform.createTradingPair(
        await usdc.getAddress(),
        await usdt.getAddress(),
        10,
        20
      );

      // User1 deposits USDC
      await usdc.connect(user1).approve(await tradingPlatform.getAddress(), depositAmount);
      await tradingPlatform.connect(user1).deposit(await usdc.getAddress(), depositAmount);

      // User2 deposits USDT
      await usdt.connect(user2).approve(await tradingPlatform.getAddress(), depositAmount);
      await tradingPlatform.connect(user2).deposit(await usdt.getAddress(), depositAmount);
    });

    it("Should place a limit order", async function () {
      await tradingPlatform.connect(user1).placeOrder(
        1, // pairId
        true, // isBuy
        ethers.parseUnits("1", 6), // price
        ethers.parseUnits("100", 6) // amount
      );

      const order = await tradingPlatform.orders(1);
      expect(order.isActive).to.be.true;
    });

    it("Should cancel an order", async function () {
      await tradingPlatform.connect(user1).placeOrder(
        1,
        true,
        ethers.parseUnits("1", 6),
        ethers.parseUnits("100", 6)
      );

      await tradingPlatform.connect(user1).cancelOrder(1);

      const order = await tradingPlatform.orders(1);
      expect(order.isActive).to.be.false;
    });
  });

  describe("Liquidity", function () {
    const liquidityAmount = ethers.parseUnits("1000", 6);

    beforeEach(async function () {
      await tradingPlatform.createTradingPair(
        await usdc.getAddress(),
        await usdt.getAddress(),
        10,
        20
      );

      await usdc.connect(user1).approve(await tradingPlatform.getAddress(), liquidityAmount);
      await usdt.connect(user1).approve(await tradingPlatform.getAddress(), liquidityAmount);
      await usdc.mint(user1.address, liquidityAmount);
      await usdt.mint(user1.address, liquidityAmount);

      await tradingPlatform.connect(user1).deposit(await usdc.getAddress(), liquidityAmount);
      await tradingPlatform.connect(user1).deposit(await usdt.getAddress(), liquidityAmount);
    });

    it("Should add liquidity", async function () {
      await tradingPlatform.connect(user1).addLiquidity(
        1,
        ethers.parseUnits("500", 6),
        ethers.parseUnits("500", 6)
      );

      const pair = await tradingPlatform.tradingPairs(1);
      expect(pair.totalLiquidity).to.be.gt(0);
    });
  });
});

