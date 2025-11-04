import express from 'express';
import TradingPair from '../models/TradingPair';
import Order from '../models/Order';
import matchingEngine from '../services/matchingEngine';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/trading/pairs - Get all trading pairs
router.get('/pairs', async (req, res) => {
  try {
    const { isActive = 'true' } = req.query;

    const pairs = await TradingPair.find({ 
      isActive: isActive === 'true'
    })
    .populate('baseCurrencyId quoteCurrencyId')
    .sort({ displayOrder: 1, symbol: 1 });

    res.json({ pairs });
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    res.status(500).json({ error: 'Failed to fetch trading pairs' });
  }
});

// GET /api/trading/pairs/:id - Get trading pair details
router.get('/pairs/:id', async (req, res) => {
  try {
    const pair = await TradingPair.findById(req.params.id)
      .populate('baseCurrencyId quoteCurrencyId');

    if (!pair) {
      return res.status(404).json({ error: 'Trading pair not found' });
    }

    res.json({ pair });
  } catch (error) {
    console.error('Error fetching trading pair:', error);
    res.status(500).json({ error: 'Failed to fetch trading pair' });
  }
});

// GET /api/trading/pairs/:id/orderbook - Get orderbook for trading pair
router.get('/pairs/:id/orderbook', async (req, res) => {
  try {
    const orderBook = await matchingEngine.getOrderBook(req.params.id);
    res.json({ orderBook });
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
});

// GET /api/trading/pairs/:id/depth - Get depth chart for trading pair
router.get('/pairs/:id/depth', async (req, res) => {
  try {
    const { levels = 20 } = req.query;
    const depthChart = await matchingEngine.getDepthChart(
      req.params.id,
      parseInt(levels as string)
    );
    res.json({ depthChart });
  } catch (error) {
    console.error('Error fetching depth chart:', error);
    res.status(500).json({ error: 'Failed to fetch depth chart' });
  }
});

// GET /api/trading/pairs/:id/spread - Get spread for trading pair
router.get('/pairs/:id/spread', async (req, res) => {
  try {
    const spread = await matchingEngine.getSpread(req.params.id);
    res.json({ spread });
  } catch (error) {
    console.error('Error fetching spread:', error);
    res.status(500).json({ error: 'Failed to fetch spread' });
  }
});

// POST /api/trading/orders/market - Place market order (authenticated)
router.post('/orders/market', authenticateToken, async (req, res) => {
  try {
    const { tradingPairId, side, amount } = req.body;

    if (!tradingPairId || !side || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['buy', 'sell'].includes(side)) {
      return res.status(400).json({ error: 'Invalid side. Must be buy or sell' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const order = await matchingEngine.placeMarketOrder(
      req.user!.id,
      tradingPairId,
      side,
      parseFloat(amount)
    );

    res.status(201).json({
      message: 'Market order placed successfully',
      order
    });
  } catch (error: any) {
    console.error('Error placing market order:', error);
    res.status(500).json({ error: error.message || 'Failed to place market order' });
  }
});

// POST /api/trading/orders/limit - Place limit order (authenticated)
router.post('/orders/limit', authenticateToken, async (req, res) => {
  try {
    const { tradingPairId, side, price, amount, timeInForce = 'GTC' } = req.body;

    if (!tradingPairId || !side || !price || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['buy', 'sell'].includes(side)) {
      return res.status(400).json({ error: 'Invalid side. Must be buy or sell' });
    }

    if (price <= 0 || amount <= 0) {
      return res.status(400).json({ error: 'Price and amount must be greater than 0' });
    }

    if (!['GTC', 'IOC', 'FOK'].includes(timeInForce)) {
      return res.status(400).json({ error: 'Invalid timeInForce. Must be GTC, IOC, or FOK' });
    }

    const order = await matchingEngine.placeLimitOrder(
      req.user!.id,
      tradingPairId,
      side,
      parseFloat(price),
      parseFloat(amount),
      timeInForce
    );

    res.status(201).json({
      message: 'Limit order placed successfully',
      order
    });
  } catch (error: any) {
    console.error('Error placing limit order:', error);
    res.status(500).json({ error: error.message || 'Failed to place limit order' });
  }
});

// GET /api/trading/orders - Get user's orders (authenticated)
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { status, tradingPairId, limit = 50, offset = 0 } = req.query;

    const filter: any = { userId: req.user!.id };
    
    if (status) {
      if (status === 'active') {
        filter.status = { $in: ['open', 'partially_filled'] };
      } else {
        filter.status = status;
      }
    }
    
    if (tradingPairId) filter.tradingPairId = tradingPairId;

    const orders = await Order.find(filter)
      .populate('tradingPairId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await Order.countDocuments(filter);

    res.json({ 
      orders,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/trading/orders/:id - Get order details (authenticated)
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user!.id
    })
    .populate('tradingPairId')
    .populate('trades');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// DELETE /api/trading/orders/:id - Cancel order (authenticated)
router.delete('/orders/:id', authenticateToken, async (req, res) => {
  try {
    await matchingEngine.cancelOrder(req.params.id, req.user!.id);

    res.json({ message: 'Order cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel order' });
  }
});

// GET /api/trading/history - Get user's trade history (authenticated)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { tradingPairId, limit = 50, offset = 0 } = req.query;

    const filter: any = { userId: req.user!.id, status: 'completed' };
    if (tradingPairId) filter.marketId = tradingPairId;

    const trades = await Order.find(filter)
      .populate('tradingPairId')
      .populate('trades')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await Order.countDocuments(filter);

    res.json({ 
      trades,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching trade history:', error);
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
});

export default router;

