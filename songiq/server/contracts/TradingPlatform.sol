// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TradingPlatform
 * @dev Multi-currency trading platform with orderbook and AMM support
 */
contract TradingPlatform is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Trading pair structure
    struct TradingPair {
        address baseToken;
        address quoteToken;
        uint256 baseReserve;
        uint256 quoteReserve;
        uint256 totalLiquidity;
        uint256 makerFee; // In basis points (e.g., 10 = 0.1%)
        uint256 takerFee;
        bool isActive;
    }

    // Order structure
    struct Order {
        address trader;
        uint256 pairId;
        bool isBuy;
        uint256 price;
        uint256 amount;
        uint256 filled;
        uint256 timestamp;
        bool isActive;
    }

    // Liquidity provider position
    struct LiquidityPosition {
        uint256 shares;
        uint256 baseDeposited;
        uint256 quoteDeposited;
    }

    // State variables
    mapping(uint256 => TradingPair) public tradingPairs;
    mapping(uint256 => Order) public orders;
    mapping(address => mapping(address => uint256)) public balances;
    mapping(uint256 => mapping(address => LiquidityPosition)) public liquidityPositions;
    
    uint256 public nextPairId;
    uint256 public nextOrderId;
    uint256 public platformFeeRecipient;
    
    // Events
    event PairCreated(uint256 indexed pairId, address baseToken, address quoteToken);
    event OrderPlaced(uint256 indexed orderId, address indexed trader, uint256 pairId, bool isBuy, uint256 price, uint256 amount);
    event OrderFilled(uint256 indexed orderId, uint256 amount, uint256 price);
    event OrderCancelled(uint256 indexed orderId);
    event LiquidityAdded(uint256 indexed pairId, address indexed provider, uint256 baseAmount, uint256 quoteAmount, uint256 shares);
    event LiquidityRemoved(uint256 indexed pairId, address indexed provider, uint256 baseAmount, uint256 quoteAmount, uint256 shares);
    event Swap(uint256 indexed pairId, address indexed trader, address tokenIn, uint256 amountIn, uint256 amountOut);
    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdrawal(address indexed user, address indexed token, uint256 amount);

    constructor() {
        nextPairId = 1;
        nextOrderId = 1;
    }

    /**
     * @dev Create a new trading pair
     */
    function createTradingPair(
        address _baseToken,
        address _quoteToken,
        uint256 _makerFee,
        uint256 _takerFee
    ) external onlyOwner returns (uint256) {
        require(_baseToken != address(0) && _quoteToken != address(0), "Invalid token addresses");
        require(_baseToken != _quoteToken, "Tokens must be different");
        require(_makerFee <= 100 && _takerFee <= 100, "Fee too high"); // Max 1%

        uint256 pairId = nextPairId++;
        
        tradingPairs[pairId] = TradingPair({
            baseToken: _baseToken,
            quoteToken: _quoteToken,
            baseReserve: 0,
            quoteReserve: 0,
            totalLiquidity: 0,
            makerFee: _makerFee,
            takerFee: _takerFee,
            isActive: true
        });

        emit PairCreated(pairId, _baseToken, _quoteToken);
        return pairId;
    }

    /**
     * @dev Deposit tokens to the platform
     */
    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender][token] += amount;
        
        emit Deposit(msg.sender, token, amount);
    }

    /**
     * @dev Withdraw tokens from the platform
     */
    function withdraw(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        
        balances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit Withdrawal(msg.sender, token, amount);
    }

    /**
     * @dev Place a limit order
     */
    function placeOrder(
        uint256 pairId,
        bool isBuy,
        uint256 price,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (uint256) {
        TradingPair storage pair = tradingPairs[pairId];
        require(pair.isActive, "Trading pair not active");
        require(price > 0 && amount > 0, "Invalid price or amount");

        address tokenToLock = isBuy ? pair.quoteToken : pair.baseToken;
        uint256 amountToLock = isBuy ? (price * amount) / 1e18 : amount;
        
        require(balances[msg.sender][tokenToLock] >= amountToLock, "Insufficient balance");
        balances[msg.sender][tokenToLock] -= amountToLock;

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            trader: msg.sender,
            pairId: pairId,
            isBuy: isBuy,
            price: price,
            amount: amount,
            filled: 0,
            timestamp: block.timestamp,
            isActive: true
        });

        emit OrderPlaced(orderId, msg.sender, pairId, isBuy, price, amount);
        return orderId;
    }

    /**
     * @dev Cancel an order
     */
    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.trader == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");

        TradingPair storage pair = tradingPairs[order.pairId];
        uint256 remainingAmount = order.amount - order.filled;
        
        address tokenToReturn = order.isBuy ? pair.quoteToken : pair.baseToken;
        uint256 amountToReturn = order.isBuy ? (order.price * remainingAmount) / 1e18 : remainingAmount;
        
        balances[msg.sender][tokenToReturn] += amountToReturn;
        order.isActive = false;

        emit OrderCancelled(orderId);
    }

    /**
     * @dev Add liquidity to AMM pool
     */
    function addLiquidity(
        uint256 pairId,
        uint256 baseAmount,
        uint256 quoteAmount
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        TradingPair storage pair = tradingPairs[pairId];
        require(pair.isActive, "Trading pair not active");
        require(baseAmount > 0 && quoteAmount > 0, "Invalid amounts");

        require(balances[msg.sender][pair.baseToken] >= baseAmount, "Insufficient base token");
        require(balances[msg.sender][pair.quoteToken] >= quoteAmount, "Insufficient quote token");

        if (pair.totalLiquidity == 0) {
            shares = sqrt(baseAmount * quoteAmount);
        } else {
            uint256 baseShare = (baseAmount * pair.totalLiquidity) / pair.baseReserve;
            uint256 quoteShare = (quoteAmount * pair.totalLiquidity) / pair.quoteReserve;
            shares = baseShare < quoteShare ? baseShare : quoteShare;
        }

        require(shares > 0, "Insufficient liquidity minted");

        balances[msg.sender][pair.baseToken] -= baseAmount;
        balances[msg.sender][pair.quoteToken] -= quoteAmount;

        pair.baseReserve += baseAmount;
        pair.quoteReserve += quoteAmount;
        pair.totalLiquidity += shares;

        LiquidityPosition storage position = liquidityPositions[pairId][msg.sender];
        position.shares += shares;
        position.baseDeposited += baseAmount;
        position.quoteDeposited += quoteAmount;

        emit LiquidityAdded(pairId, msg.sender, baseAmount, quoteAmount, shares);
        return shares;
    }

    /**
     * @dev Remove liquidity from AMM pool
     */
    function removeLiquidity(
        uint256 pairId,
        uint256 shares
    ) external nonReentrant returns (uint256 baseAmount, uint256 quoteAmount) {
        TradingPair storage pair = tradingPairs[pairId];
        LiquidityPosition storage position = liquidityPositions[pairId][msg.sender];
        
        require(position.shares >= shares, "Insufficient liquidity shares");
        require(shares > 0, "Invalid shares");

        baseAmount = (shares * pair.baseReserve) / pair.totalLiquidity;
        quoteAmount = (shares * pair.quoteReserve) / pair.totalLiquidity;

        position.shares -= shares;
        pair.totalLiquidity -= shares;
        pair.baseReserve -= baseAmount;
        pair.quoteReserve -= quoteAmount;

        balances[msg.sender][pair.baseToken] += baseAmount;
        balances[msg.sender][pair.quoteToken] += quoteAmount;

        emit LiquidityRemoved(pairId, msg.sender, baseAmount, quoteAmount, shares);
    }

    /**
     * @dev Swap tokens using AMM
     */
    function swap(
        uint256 pairId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant whenNotPaused returns (uint256 amountOut) {
        TradingPair storage pair = tradingPairs[pairId];
        require(pair.isActive, "Trading pair not active");
        require(pair.baseReserve > 0 && pair.quoteReserve > 0, "No liquidity");
        require(tokenIn == pair.baseToken || tokenIn == pair.quoteToken, "Invalid token");
        require(amountIn > 0, "Invalid amount");
        require(balances[msg.sender][tokenIn] >= amountIn, "Insufficient balance");

        bool isBaseToQuote = tokenIn == pair.baseToken;
        
        // Calculate output amount using constant product formula (x * y = k)
        uint256 amountInWithFee = (amountIn * (10000 - pair.takerFee)) / 10000;
        
        if (isBaseToQuote) {
            amountOut = (amountInWithFee * pair.quoteReserve) / (pair.baseReserve + amountInWithFee);
            require(amountOut >= minAmountOut, "Slippage too high");
            require(amountOut < pair.quoteReserve, "Insufficient liquidity");
            
            pair.baseReserve += amountIn;
            pair.quoteReserve -= amountOut;
            
            balances[msg.sender][pair.baseToken] -= amountIn;
            balances[msg.sender][pair.quoteToken] += amountOut;
        } else {
            amountOut = (amountInWithFee * pair.baseReserve) / (pair.quoteReserve + amountInWithFee);
            require(amountOut >= minAmountOut, "Slippage too high");
            require(amountOut < pair.baseReserve, "Insufficient liquidity");
            
            pair.quoteReserve += amountIn;
            pair.baseReserve -= amountOut;
            
            balances[msg.sender][pair.quoteToken] -= amountIn;
            balances[msg.sender][pair.baseToken] += amountOut;
        }

        emit Swap(pairId, msg.sender, tokenIn, amountIn, amountOut);
    }

    /**
     * @dev Calculate sqrt for liquidity calculations
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    /**
     * @dev Get current price from AMM
     */
    function getPrice(uint256 pairId) external view returns (uint256) {
        TradingPair storage pair = tradingPairs[pairId];
        if (pair.baseReserve == 0) return 0;
        return (pair.quoteReserve * 1e18) / pair.baseReserve;
    }

    /**
     * @dev Toggle pause
     */
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    /**
     * @dev Emergency withdraw (owner only, when paused)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner whenPaused {
        IERC20(token).safeTransfer(owner(), amount);
    }
}

