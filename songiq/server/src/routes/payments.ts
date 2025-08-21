import express from 'express';
import { SUBSCRIPTION_PLANS } from '../config/stripe';

const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: SUBSCRIPTION_PLANS
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans'
    });
  }
});

export default router;
