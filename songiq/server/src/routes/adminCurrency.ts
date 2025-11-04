import express from 'express';
import Currency from '../models/Currency';
import TradingPair from '../models/TradingPair';
import Balance from '../models/Balance';
import Transaction from '../models/Transaction';
import blockchainService from '../services/blockchainService';
import currencyConversionService from '../services/currencyConversionService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// GET /api/admin/currencies - Get all currencies (admin)
router.get('/currencies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const currencies = await Currency.find()
      .sort({ displayOrder: 1, symbol: 1 });

    res.json({ currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// POST /api/admin/currencies - Create new currency (admin)
router.post('/currencies', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      symbol,
      name,
      type,
      decimals = 18,
      contractAddress,
      chainId,
      minDeposit = 0,
      minWithdrawal = 0,
      withdrawalFee = 0,
      depositFee = 0,
      icon,
      description,
      isNative = false,
      fiatProvider,
      fiatCurrency,
      displayOrder = 0
    } = req.body;

    if (!symbol || !name || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if currency already exists
    const existing = await Currency.findOne({ symbol: symbol.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Currency already exists' });
    }

    // If it's a token, fetch info from blockchain
    let tokenInfo: any = {};
    if (type === 'crypto' && contractAddress && chainId) {
      try {
        tokenInfo = await blockchainService.getTokenInfo(contractAddress, chainId);
      } catch (error) {
        console.warn('Could not fetch token info:', error);
      }
    }

    const currency = new Currency({
      symbol: symbol.toUpperCase(),
      name: name || tokenInfo.name,
      type,
      decimals: tokenInfo.decimals || decimals,
      contractAddress: contractAddress?.toLowerCase(),
      chainId,
      minDeposit,
      minWithdrawal,
      withdrawalFee,
      depositFee,
      icon,
      description,
      isNative,
      fiatProvider,
      fiatCurrency,
      displayOrder,
      isActive: true,
      allowDeposits: true,
      allowWithdrawals: true,
      allowTrading: true,
      priceUSD: 0
    });

    await currency.save();

    // Try to update price immediately
    try {
      await currencyConversionService.updateAllPrices();
    } catch (error) {
      console.warn('Could not update price:', error);
    }

    res.status(201).json({
      message: 'Currency created successfully',
      currency
    });
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ error: 'Failed to create currency' });
  }
});

// PUT /api/admin/currencies/:id - Update currency (admin)
router.put('/currencies/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const currency = await Currency.findById(req.params.id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'name', 'isActive', 'minDeposit', 'minWithdrawal', 'withdrawalFee',
      'depositFee', 'icon', 'description', 'allowDeposits', 'allowWithdrawals',
      'allowTrading', 'displayOrder', 'priceUSD'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        (currency as any)[key] = updates[key];
      }
    });

    await currency.save();

    res.json({
      message: 'Currency updated successfully',
      currency
    });
  } catch (error) {
    console.error('Error updating currency:', error);
    res.status(500).json({ error: 'Failed to update currency' });
  }
});

// DELETE /api/admin/currencies/:id - Delete currency (admin)
router.delete('/currencies/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const currency = await Currency.findById(req.params.id);
    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    // Check if currency is used in any trading pairs
    const pairsCount = await TradingPair.countDocuments({
      $or: [
        { baseCurrencyId: currency._id },
        { quoteCurrencyId: currency._id }
      ]
    });

    if (pairsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete currency that is used in trading pairs' 
      });
    }

    // Check if any users have balances
    const balancesCount = await Balance.countDocuments({
      currencyId: currency._id,
      total: { $gt: 0 }
    });

    if (balancesCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete currency with active balances' 
      });
    }

    await currency.deleteOne();

    res.json({ message: 'Currency deleted successfully' });
  } catch (error) {
    console.error('Error deleting currency:', error);
    res.status(500).json({ error: 'Failed to delete currency' });
  }
});

// POST /api/admin/trading-pairs - Create trading pair (admin)
router.post('/trading-pairs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      baseCurrencyId,
      quoteCurrencyId,
      minTradeAmount = 0.001,
      maxTradeAmount = 1000000,
      makerFee = 0.001,
      takerFee = 0.002,
      liquidityPoolEnabled = false,
      displayOrder = 0
    } = req.body;

    if (!baseCurrencyId || !quoteCurrencyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify currencies exist
    const [baseCurrency, quoteCurrency] = await Promise.all([
      Currency.findById(baseCurrencyId),
      Currency.findById(quoteCurrencyId)
    ]);

    if (!baseCurrency || !quoteCurrency) {
      return res.status(404).json({ error: 'One or both currencies not found' });
    }

    // Check if pair already exists
    const existing = await TradingPair.findOne({
      baseCurrencyId,
      quoteCurrencyId
    });

    if (existing) {
      return res.status(400).json({ error: 'Trading pair already exists' });
    }

    const symbol = `${baseCurrency.symbol}/${quoteCurrency.symbol}`;

    const pair = new TradingPair({
      baseCurrencyId,
      quoteCurrencyId,
      symbol,
      isActive: true,
      minTradeAmount,
      maxTradeAmount,
      makerFee,
      takerFee,
      liquidityPoolEnabled,
      displayOrder,
      baseReserve: 0,
      quoteReserve: 0,
      totalLiquidity: 0,
      lastPrice: 0,
      price24hHigh: 0,
      price24hLow: 0,
      price24hChange: 0,
      volume24h: 0
    });

    await pair.save();

    res.status(201).json({
      message: 'Trading pair created successfully',
      pair: await TradingPair.findById(pair._id).populate('baseCurrencyId quoteCurrencyId')
    });
  } catch (error) {
    console.error('Error creating trading pair:', error);
    res.status(500).json({ error: 'Failed to create trading pair' });
  }
});

// PUT /api/admin/trading-pairs/:id - Update trading pair (admin)
router.put('/trading-pairs/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pair = await TradingPair.findById(req.params.id);
    if (!pair) {
      return res.status(404).json({ error: 'Trading pair not found' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'isActive', 'minTradeAmount', 'maxTradeAmount', 'makerFee', 'takerFee',
      'liquidityPoolEnabled', 'displayOrder'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        (pair as any)[key] = updates[key];
      }
    });

    await pair.save();

    res.json({
      message: 'Trading pair updated successfully',
      pair: await TradingPair.findById(pair._id).populate('baseCurrencyId quoteCurrencyId')
    });
  } catch (error) {
    console.error('Error updating trading pair:', error);
    res.status(500).json({ error: 'Failed to update trading pair' });
  }
});

// GET /api/admin/stats - Get platform statistics (admin)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalCurrencies,
      activeCurrencies,
      totalPairs,
      activePairs,
      totalTransactions,
      pendingTransactions,
      totalVolume24h
    ] = await Promise.all([
      Currency.countDocuments(),
      Currency.countDocuments({ isActive: true }),
      TradingPair.countDocuments(),
      TradingPair.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'pending' }),
      TradingPair.aggregate([
        { $group: { _id: null, total: { $sum: '$volume24h' } } }
      ])
    ]);

    const stats = {
      currencies: {
        total: totalCurrencies,
        active: activeCurrencies
      },
      tradingPairs: {
        total: totalPairs,
        active: activePairs
      },
      transactions: {
        total: totalTransactions,
        pending: pendingTransactions
      },
      volume24h: totalVolume24h[0]?.total || 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/transactions - Get all transactions (admin)
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, type, limit = 100, offset = 0 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate('userId currencyId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/admin/prices/update - Force price update (admin)
router.post('/prices/update', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await currencyConversionService.updateAllPrices();
    res.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Failed to update prices' });
  }
});

export default router;

