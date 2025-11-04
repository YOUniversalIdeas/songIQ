import express from 'express';
import Market from '../models/Market';
import Position from '../models/Position';
import Trade from '../models/Trade';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Automated Market Maker (AMM) pricing using constant product formula
function calculatePrice(totalShares: number, liquidityPool: number): number {
  // Simple pricing model: price increases as more shares are bought
  const price = totalShares / (totalShares + liquidityPool);
  return Math.max(0.01, Math.min(0.99, price));
}

function updateMarketPrices(market: any): void {
  market.outcomes.forEach((outcome: any) => {
    outcome.price = calculatePrice(outcome.shares, market.totalLiquidity);
  });
}

// GET /api/markets - Get all active markets
router.get('/', async (req, res) => {
  try {
    const { category, status = 'active', limit = 20, skip = 0 } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const markets = await Market.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('creatorId', 'name email')
      .populate('relatedSongId', 'title artist');

    const total = await Market.countDocuments(filter);

    res.json({
      markets,
      total,
      hasMore: Number(skip) + markets.length < total
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// GET /api/markets/:id - Get market details
router.get('/:id', async (req, res) => {
  try {
    const market = await Market.findById(req.params.id)
      .populate('creatorId', 'name email')
      .populate('relatedSongId', 'title artist');

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // Get recent trades for this market
    const recentTrades = await Trade.find({ marketId: market._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name');

    res.json({ market, recentTrades });
  } catch (error) {
    console.error('Error fetching market:', error);
    res.status(500).json({ error: 'Failed to fetch market' });
  }
});

// POST /api/markets - Create new market (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, outcomes, endDate, relatedSongId } = req.body;

    if (!title || !description || !category || !outcomes || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (outcomes.length < 2 || outcomes.length > 10) {
      return res.status(400).json({ error: 'Must have between 2 and 10 outcomes' });
    }

    // Initialize outcomes with equal probability
    const initialPrice = 1 / outcomes.length;
    const formattedOutcomes = outcomes.map((outcome: any, index: number) => ({
      id: `outcome_${index + 1}`,
      name: outcome.name,
      description: outcome.description || '',
      shares: 100, // Initial shares
      price: initialPrice,
      totalVolume: 0
    }));

    const market = new Market({
      title,
      description,
      category,
      outcomes: formattedOutcomes,
      endDate: new Date(endDate),
      status: 'active',
      creatorId: req.user!.id,
      relatedSongId,
      totalVolume: 0,
      totalLiquidity: 1000,
      fee: 0.02
    });

    await market.save();
    res.status(201).json({ market });
  } catch (error) {
    console.error('Error creating market:', error);
    res.status(500).json({ error: 'Failed to create market' });
  }
});

// POST /api/markets/:id/trade - Buy or sell shares (authenticated)
router.post('/:id/trade', authenticateToken, async (req, res) => {
  try {
    const { outcomeId, type, shares } = req.body;
    const marketId = req.params.id;
    const userId = req.user!.id;

    if (!outcomeId || !type || !shares || shares <= 0) {
      return res.status(400).json({ error: 'Invalid trade parameters' });
    }

    const market = await Market.findById(marketId);
    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    if (market.status !== 'active') {
      return res.status(400).json({ error: 'Market is not active' });
    }

    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }

    // Calculate price and fees
    const currentPrice = outcome.price;
    const tradeCost = shares * currentPrice;
    const fee = tradeCost * market.fee;
    const totalCost = tradeCost + fee;

    if (type === 'sell') {
      // Check if user has enough shares to sell
      const position = await Position.findOne({ userId, marketId, outcomeId });
      if (!position || position.shares < shares) {
        return res.status(400).json({ error: 'Insufficient shares to sell' });
      }
    }

    // Create trade record
    const trade = new Trade({
      userId,
      marketId,
      outcomeId,
      type,
      shares,
      price: currentPrice,
      totalCost,
      fee,
      status: 'completed'
    });

    await trade.save();

    // Update or create position
    let position = await Position.findOne({ userId, marketId, outcomeId });
    
    if (type === 'buy') {
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

      // Update position for buy
      const newTotalShares = position.shares + shares;
      const newTotalInvested = position.totalInvested + totalCost;
      position.shares = newTotalShares;
      position.totalInvested = newTotalInvested;
      position.averageCost = newTotalInvested / newTotalShares;
      
      // Update outcome shares
      outcome.shares += shares;
      outcome.totalVolume += tradeCost;
    } else {
      // Update position for sell
      const saleValue = tradeCost - fee;
      const costBasis = position!.averageCost * shares;
      const profit = saleValue - costBasis;
      
      position!.shares -= shares;
      position!.totalInvested -= costBasis;
      position!.realizedPnL += profit;
      
      // Update outcome shares
      outcome.shares -= shares;
      outcome.totalVolume += tradeCost;
    }

    // Update market prices using AMM
    updateMarketPrices(market);
    market.totalVolume += tradeCost;

    await position!.save();
    await market.save();

    res.json({ 
      trade, 
      position: position!,
      market: {
        id: market._id,
        outcomes: market.outcomes
      }
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

// GET /api/markets/user/positions - Get user's positions (authenticated)
router.get('/user/positions', authenticateToken, async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user!.id })
      .populate({
        path: 'marketId',
        select: 'title status outcomes endDate'
      })
      .sort({ createdAt: -1 });

    // Calculate current values
    for (const position of positions) {
      if (position.marketId && position.shares > 0) {
        const market = position.marketId as any;
        const outcome = market.outcomes.find((o: any) => o.id === position.outcomeId);
        if (outcome) {
          position.currentValue = position.shares * outcome.price;
          position.unrealizedPnL = position.currentValue - (position.totalInvested - position.realizedPnL);
          await position.save();
        }
      }
    }

    res.json({ positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// GET /api/markets/user/trades - Get user's trade history (authenticated)
router.get('/user/trades', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const trades = await Trade.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate('marketId', 'title category');

    const total = await Trade.countDocuments({ userId: req.user!.id });

    res.json({ 
      trades, 
      total,
      hasMore: Number(skip) + trades.length < total
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// POST /api/markets/:id/resolve - Resolve market (admin only)
router.post('/:id/resolve', authenticateToken, async (req, res) => {
  try {
    const { outcomeId } = req.body;
    const market = await Market.findById(req.params.id);

    if (!market) {
      return res.status(404).json({ error: 'Market not found' });
    }

    // TODO: Add admin check
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    if (market.status === 'resolved') {
      return res.status(400).json({ error: 'Market already resolved' });
    }

    const outcome = market.outcomes.find(o => o.id === outcomeId);
    if (!outcome) {
      return res.status(404).json({ error: 'Outcome not found' });
    }

    market.status = 'resolved';
    market.resolvedOutcomeId = outcomeId;
    market.resolutionDate = new Date();

    await market.save();

    // Calculate payouts for winning positions
    const winningPositions = await Position.find({ 
      marketId: market._id, 
      outcomeId,
      shares: { $gt: 0 }
    });

    // Each winning share pays out 1.0 (minus fees already paid)
    for (const position of winningPositions) {
      const payout = position.shares * 1.0;
      const profit = payout - position.totalInvested;
      position.realizedPnL += profit;
      position.currentValue = payout;
      await position.save();
    }

    res.json({ 
      market,
      message: 'Market resolved successfully',
      winningOutcome: outcome,
      winnersCount: winningPositions.length
    });
  } catch (error) {
    console.error('Error resolving market:', error);
    res.status(500).json({ error: 'Failed to resolve market' });
  }
});

// GET /api/markets/categories - Get available categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'chart_position', name: 'Chart Position', icon: '📊' },
      { id: 'streaming_numbers', name: 'Streaming Numbers', icon: '🎵' },
      { id: 'awards', name: 'Awards', icon: '🏆' },
      { id: 'genre_trend', name: 'Genre Trends', icon: '📈' },
      { id: 'artist_popularity', name: 'Artist Popularity', icon: '⭐' },
      { id: 'release_success', name: 'Release Success', icon: '🚀' },
      { id: 'other', name: 'Other', icon: '💡' }
    ];

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;

