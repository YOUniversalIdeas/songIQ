import express from 'express';
import Transaction from '../models/Transaction';
import Currency from '../models/Currency';
import Wallet from '../models/Wallet';
import blockchainService from '../services/blockchainService';
import fiatIntegrationService from '../services/fiatIntegrationService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/transactions - Get user's transactions (authenticated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, currencyId, limit = 50, offset = 0 } = req.query;

    const filter: any = { userId: req.user!.id };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (currencyId) filter.currencyId = currencyId;

    const transactions = await Transaction.find(filter)
      .populate('currencyId')
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

// GET /api/transactions/:id - Get transaction details (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user!.id
    }).populate('currencyId walletId');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// POST /api/transactions/deposit/crypto - Create crypto deposit (authenticated)
router.post('/deposit/crypto', authenticateToken, async (req, res) => {
  try {
    const { currencyId, amount, txHash, chainId } = req.body;

    if (!currencyId || !amount || !txHash || !chainId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await blockchainService.processDeposit(
      req.user!.id,
      currencyId,
      amount,
      txHash,
      chainId
    );

    res.json({
      message: 'Deposit processed successfully',
      transaction: result.transaction,
      balance: result.balance
    });
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: error.message || 'Failed to process deposit' });
  }
});

// POST /api/transactions/deposit/fiat - Create fiat deposit (authenticated)
router.post('/deposit/fiat', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, provider = 'stripe' } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let result;

    switch (provider) {
      case 'stripe':
        result = await fiatIntegrationService.createStripeDeposit(
          req.user!.id,
          amount,
          currency
        );
        break;
      case 'circle':
        result = await fiatIntegrationService.createCircleDeposit(
          req.user!.id,
          amount
        );
        break;
      case 'coinbase':
        result = await fiatIntegrationService.createCoinbaseDeposit(
          req.user!.id,
          amount,
          currency
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment provider' });
    }

    res.json({
      message: 'Deposit initiated successfully',
      ...result
    });
  } catch (error: any) {
    console.error('Error creating fiat deposit:', error);
    res.status(500).json({ error: error.message || 'Failed to create deposit' });
  }
});

// POST /api/transactions/withdrawal/crypto - Create crypto withdrawal (authenticated)
router.post('/withdrawal/crypto', authenticateToken, async (req, res) => {
  try {
    const { currencyId, amount, toAddress, walletId, chainId } = req.body;

    if (!currencyId || !amount || !toAddress || !walletId || !chainId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify wallet belongs to user
    const wallet = await Wallet.findOne({
      _id: walletId,
      userId: req.user!.id,
      chainId,
      type: 'custodial'
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found or not authorized' });
    }

    const result = await blockchainService.processWithdrawal(
      req.user!.id,
      currencyId,
      amount,
      toAddress,
      walletId,
      chainId
    );

    res.json({
      message: 'Withdrawal processed successfully',
      transaction: result.transaction,
      txHash: result.receipt.hash
    });
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: error.message || 'Failed to process withdrawal' });
  }
});

// POST /api/transactions/withdrawal/fiat - Create fiat withdrawal (authenticated)
router.post('/withdrawal/fiat', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, bankAccountId, provider = 'stripe' } = req.body;

    if (!amount || !currency || !bankAccountId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let result;

    switch (provider) {
      case 'stripe':
        result = await fiatIntegrationService.createStripeWithdrawal(
          req.user!.id,
          amount,
          currency,
          bankAccountId
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment provider' });
    }

    res.json({
      message: 'Withdrawal initiated successfully',
      ...result
    });
  } catch (error: any) {
    console.error('Error creating fiat withdrawal:', error);
    res.status(500).json({ error: error.message || 'Failed to create withdrawal' });
  }
});

// GET /api/transactions/limits/deposit - Get deposit limits (authenticated)
router.get('/limits/deposit', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.query;

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' });
    }

    const limits = await fiatIntegrationService.getDepositLimits(
      req.user!.id,
      currency as string
    );

    res.json(limits);
  } catch (error: any) {
    console.error('Error fetching deposit limits:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch limits' });
  }
});

// GET /api/transactions/limits/withdrawal - Get withdrawal limits (authenticated)
router.get('/limits/withdrawal', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.query;

    if (!currency) {
      return res.status(400).json({ error: 'Currency is required' });
    }

    const limits = await fiatIntegrationService.getWithdrawalLimits(
      req.user!.id,
      currency as string
    );

    res.json(limits);
  } catch (error: any) {
    console.error('Error fetching withdrawal limits:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch limits' });
  }
});

// POST /api/transactions/webhooks/stripe - Stripe webhook handler
router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    // In production, verify the webhook signature
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    const event = req.body; // For development
    await fiatIntegrationService.processStripeWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;

