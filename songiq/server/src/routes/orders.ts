import express from 'express';
import Order from '../models/Order';
import Market from '../models/Market';
import Position from '../models/Position';
import Trade from '../models/Trade';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/orders - Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    const userId = req.user!.id;

    const filter: any = { userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('marketId', 'title outcomes status')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      total,
      hasMore: Number(skip) + orders.length < total
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a limit order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { marketId, outcomeId, type, side, price, shares, timeInForce } = req.body;
    const userId = req.user!.id;

    // Validation
    if (!marketId || !outcomeId || !type || !side || !shares) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (shares <= 0) {
      return res.status(400).json({ error: 'Shares must be greater than 0' });
    }

    if (type === 'limit' && (!price || price <= 0 || price >= 1)) {
      return res.status(400).json({ error: 'Limit price must be between 0 and 1' });
    }

    // Verify market exists and is active
    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    if (market.status !== 'active') {
      return res.status(400).json({ error: 'Market is not active' });
    }

    // Verify outcome exists
    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }

    // For sell orders, check if user has enough shares
    if (side === 'sell') {
      const position = await Position.findOne({ userId, marketId, outcomeId });
      if (!position || position.shares < shares) {
        return res.status(400).json({ error: 'Insufficient shares to sell' });
      }
    }

    // Create order
    const order = new Order({
      userId,
      marketId,
      outcomeId,
      type,
      side,
      price: type === 'limit' ? price : undefined,
      amount: shares,
      filled: 0,
      remaining: shares,
      total: type === 'limit' ? shares * price : 0,
      fee: 0,
      status: type === 'market' ? 'pending' : 'open',
      timeInForce: timeInForce || 'GTC'
    });

    await order.save();

    // If market order, execute immediately
    if (type === 'market') {
      // Execute as immediate trade (existing logic)
      const currentPrice = outcome.price;
      const tradeCost = shares * currentPrice;
      const fee = tradeCost * market.fee;
      const totalCost = tradeCost + fee;

      // Create trade record
      const trade = new Trade({
        userId,
        marketId,
        outcomeId,
        type: side,
        shares,
        price: currentPrice,
        totalCost,
        fee,
        status: 'completed'
      });

      await trade.save();

      // Update position
      let position = await Position.findOne({ userId, marketId, outcomeId });
      
      if (side === 'buy') {
        if (!position) {
          position = new Position({
            userId,
            marketId,
            outcomeId,
            shares: 0,
            averageCost: 0,
            totalInvested: 0,
            currentValue: 0,
            realizedPnL: 0,
            unrealizedPnL: 0
          });
        }

        const newTotalShares = position.shares + shares;
        const newTotalInvested = position.totalInvested + totalCost;
        position.shares = newTotalShares;
        position.totalInvested = newTotalInvested;
        position.averageCost = newTotalInvested / newTotalShares;
        
        outcome.shares += shares;
        outcome.totalVolume += tradeCost;
      } else {
        const saleValue = tradeCost - fee;
        const costBasis = position!.averageCost * shares;
        const profit = saleValue - costBasis;
        
        position!.shares -= shares;
        position!.totalInvested -= costBasis;
        position!.realizedPnL += profit;
        
        outcome.shares -= shares;
        outcome.totalVolume += tradeCost;
      }

      await position!.save();
      await market.save();

      order.status = 'filled';
      order.filled = shares;
      order.remaining = 0;
      order.trades = [trade._id];
      await order.save();

      return res.status(201).json({ 
        order,
        trade,
        message: 'Market order executed successfully'
      });
    }

    // For limit orders, return order (will be matched by engine)
    res.status(201).json({ 
      order,
      message: 'Limit order placed successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// DELETE /api/orders/:orderId - Cancel an order
router.delete('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user!.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify ownership
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own orders' });
    }

    // Can only cancel open or partially filled orders
    if (!['open', 'partially_filled', 'pending'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ 
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// GET /api/markets/:marketId/orderbook - Get order book for market
router.get('/markets/:marketId/orderbook', async (req, res) => {
  try {
    const { marketId } = req.params;
    const { outcomeId } = req.query;

    const filter: any = {
      marketId,
      status: { $in: ['open', 'partially_filled'] },
      type: 'limit'
    };

    if (outcomeId) {
      filter.outcomeId = outcomeId;
    }

    const orders = await Order.find(filter)
      .sort({ price: -1, createdAt: 1 }); // Price-time priority

    // Group by outcome and side
    const orderbook: any = {};

    orders.forEach(order => {
      if (!orderbook[order.outcomeId]) {
        orderbook[order.outcomeId] = {
          bids: [],
          asks: []
        };
      }

      const orderInfo = {
        price: order.price,
        shares: order.remaining,
        total: order.remaining * (order.price || 0),
        orderId: order._id
      };

      if (order.side === 'buy') {
        orderbook[order.outcomeId].bids.push(orderInfo);
      } else {
        orderbook[order.outcomeId].asks.push(orderInfo);
      }
    });

    // Sort bids (highest first) and asks (lowest first)
    Object.keys(orderbook).forEach(outcomeId => {
      orderbook[outcomeId].bids.sort((a: any, b: any) => b.price - a.price);
      orderbook[outcomeId].asks.sort((a: any, b: any) => a.price - b.price);
    });

    res.json({ orderbook });
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
});

export default router;

