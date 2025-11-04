import express from 'express';
import Currency from '../models/Currency';
import Balance from '../models/Balance';
import TradingPair from '../models/TradingPair';
import currencyConversionService from '../services/currencyConversionService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/currencies - Get all active currencies
router.get('/', async (req, res) => {
  try {
    const { type, isActive = 'true' } = req.query;
    
    const filter: any = { isActive: isActive === 'true' };
    if (type) {
      filter.type = type;
    }

    const currencies = await Currency.find(filter)
      .sort({ displayOrder: 1, symbol: 1 })
      .select('-abi -privateKeyEncrypted');

    res.json({ currencies });
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ error: 'Failed to fetch currencies' });
  }
});

// GET /api/currencies/convert - Convert between currencies (must be before /:id routes)
router.get('/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const convertedAmount = await currencyConversionService.convert(
      parseFloat(amount as string),
      from as string,
      to as string
    );

    const rate = await currencyConversionService.getConversionRate(
      from as string,
      to as string
    );

    res.json({
      from,
      to,
      amount: parseFloat(amount as string),
      convertedAmount,
      rate
    });
  } catch (error: any) {
    console.error('Error converting currency:', error);
    res.status(500).json({ error: error.message || 'Failed to convert currency' });
  }
});

// POST /api/currencies/prices/update - Trigger price update (can be called by cron)
router.post('/prices/update', async (req, res) => {
  try {
    await currencyConversionService.updateAllPrices();
    res.json({ message: 'Prices updated successfully' });
  } catch (error) {
    console.error('Error updating prices:', error);
    res.status(500).json({ error: 'Failed to update prices' });
  }
});

// GET /api/currencies/symbol/:symbol - Get currency by symbol
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const currency = await Currency.findOne({ 
      symbol: req.params.symbol.toUpperCase() 
    }).select('-abi -privateKeyEncrypted');

    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.json({ currency });
  } catch (error) {
    console.error('Error fetching currency:', error);
    res.status(500).json({ error: 'Failed to fetch currency' });
  }
});

// GET /api/currencies/:id/pairs - Get trading pairs for a currency
router.get('/:id/pairs', async (req, res) => {
  try {
    const pairs = await TradingPair.find({
      $or: [
        { baseCurrencyId: req.params.id },
        { quoteCurrencyId: req.params.id }
      ],
      isActive: true
    })
    .populate('baseCurrencyId quoteCurrencyId')
    .sort({ displayOrder: 1, symbol: 1 });

    res.json({ pairs });
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    res.status(500).json({ error: 'Failed to fetch trading pairs' });
  }
});

// GET /api/currencies/:id - Get currency by ID (must be last to avoid conflicts)
router.get('/:id', async (req, res) => {
  try {
    const currency = await Currency.findById(req.params.id)
      .select('-abi -privateKeyEncrypted');

    if (!currency) {
      return res.status(404).json({ error: 'Currency not found' });
    }

    res.json({ currency });
  } catch (error) {
    console.error('Error fetching currency:', error);
    res.status(500).json({ error: 'Failed to fetch currency' });
  }
});

// GET /api/currencies/user/balances - Get user's balances (authenticated)
router.get('/user/balances', authenticateToken, async (req, res) => {
  try {
    const balances = await Balance.find({ userId: req.user!.id })
      .populate('currencyId')
      .sort({ total: -1 });

    // Calculate USD values
    const balancesWithUSD = await Promise.all(
      balances.map(async (balance: any) => {
        const currency = balance.currencyId;
        const usdValue = balance.total * currency.priceUSD;
        
        return {
          _id: balance._id,
          currency: {
            _id: currency._id,
            symbol: currency.symbol,
            name: currency.name,
            type: currency.type,
            icon: currency.icon,
            priceUSD: currency.priceUSD
          },
          available: balance.available,
          locked: balance.locked,
          total: balance.total,
          usdValue,
          lastUpdated: balance.lastUpdated
        };
      })
    );

    const totalUSDValue = balancesWithUSD.reduce((sum, b) => sum + b.usdValue, 0);

    res.json({ 
      balances: balancesWithUSD,
      totalUSDValue
    });
  } catch (error) {
    console.error('Error fetching user balances:', error);
    res.status(500).json({ error: 'Failed to fetch balances' });
  }
});

// GET /api/currencies/user/portfolio - Get user's portfolio summary (authenticated)
router.get('/user/portfolio', authenticateToken, async (req, res) => {
  try {
    const balances = await Balance.find({ 
      userId: req.user!.id,
      total: { $gt: 0 }
    }).populate('currencyId');

    const portfolio = await Promise.all(
      balances.map(async (balance: any) => {
        const currency = balance.currencyId;
        const usdValue = balance.total * currency.priceUSD;
        
        return {
          currencySymbol: currency.symbol,
          amount: balance.total,
          usdValue
        };
      })
    );

    const totalValue = await currencyConversionService.calculatePortfolioValue(
      portfolio.map(p => ({ currencySymbol: p.currencySymbol, amount: p.amount }))
    );

    const allocation = portfolio.map(p => ({
      ...p,
      percentage: totalValue > 0 ? (p.usdValue / totalValue) * 100 : 0
    }));

    res.json({
      totalValue,
      allocation,
      currencies: portfolio.length
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

export default router;

