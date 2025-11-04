import express from 'express';
import Wallet from '../models/Wallet';
import blockchainService from '../services/blockchainService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/wallets - Get user's wallets (authenticated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const wallets = await Wallet.find({ 
      userId: req.user!.id,
      isActive: true
    }).select('-privateKeyEncrypted');

    res.json({ wallets });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// POST /api/wallets - Create new custodial wallet (authenticated)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chainId, label } = req.body;

    if (!chainId) {
      return res.status(400).json({ error: 'Chain ID is required' });
    }

    // Check if user already has a wallet for this chain
    const existingWallet = await Wallet.findOne({
      userId: req.user!.id,
      chainId,
      isActive: true
    });

    if (existingWallet) {
      return res.status(400).json({ 
        error: 'Wallet already exists for this chain',
        wallet: existingWallet
      });
    }

    // Create new custodial wallet
    const result = await blockchainService.createCustodialWallet(
      req.user!.id,
      chainId
    );

    // Add label if provided
    if (label) {
      const wallet = await Wallet.findById(result.walletId);
      if (wallet) {
        wallet.label = label;
        await wallet.save();
      }
    }

    res.status(201).json({ 
      message: 'Wallet created successfully',
      address: result.address,
      walletId: result.walletId
    });
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: error.message || 'Failed to create wallet' });
  }
});

// GET /api/wallets/:id - Get wallet details (authenticated)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user!.id
    }).select('-privateKeyEncrypted');

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ wallet });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// GET /api/wallets/:id/balance - Get wallet balance (authenticated)
router.get('/:id/balance', authenticateToken, async (req, res) => {
  try {
    const { tokenAddress } = req.query;

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    let balance: string;

    if (tokenAddress) {
      // Get ERC20 token balance
      balance = await blockchainService.getTokenBalance(
        wallet.address,
        tokenAddress as string,
        wallet.chainId
      );
    } else {
      // Get native balance
      balance = await blockchainService.getNativeBalance(
        wallet.address,
        wallet.chainId
      );
    }

    res.json({ 
      address: wallet.address,
      balance,
      chainId: wallet.chainId
    });
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch balance' });
  }
});

// PUT /api/wallets/:id - Update wallet (authenticated)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { label, isPrimary } = req.body;

    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (label !== undefined) {
      wallet.label = label;
    }

    if (isPrimary !== undefined) {
      wallet.isPrimary = isPrimary;
    }

    await wallet.save();

    res.json({ 
      message: 'Wallet updated successfully',
      wallet: await Wallet.findById(wallet._id).select('-privateKeyEncrypted')
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

// DELETE /api/wallets/:id - Deactivate wallet (authenticated)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    wallet.isActive = false;
    await wallet.save();

    res.json({ message: 'Wallet deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating wallet:', error);
    res.status(500).json({ error: 'Failed to deactivate wallet' });
  }
});

// POST /api/wallets/connect - Connect non-custodial wallet (authenticated)
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { address, chainId, label } = req.body;

    if (!address || !chainId) {
      return res.status(400).json({ error: 'Address and chain ID are required' });
    }

    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({
      address: address.toLowerCase(),
      chainId
    });

    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet already connected' });
    }

    // Create non-custodial wallet record
    const wallet = new Wallet({
      userId: req.user!.id,
      address: address.toLowerCase(),
      type: 'non-custodial',
      chainId,
      isActive: true,
      isPrimary: false,
      label
    });

    await wallet.save();

    res.status(201).json({ 
      message: 'Wallet connected successfully',
      wallet: await Wallet.findById(wallet._id).select('-privateKeyEncrypted')
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

export default router;

