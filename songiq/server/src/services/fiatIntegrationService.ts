import Stripe from 'stripe';
import axios from 'axios';
import Currency from '../models/Currency';
import Transaction from '../models/Transaction';
import Balance from '../models/Balance';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
  : null;

interface FiatDepositResult {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  paymentUrl?: string;
  error?: string;
}

interface FiatWithdrawalResult {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  error?: string;
}

class FiatIntegrationService {
  // Stripe Integration
  async createStripeDeposit(
    userId: string,
    amount: number,
    currency: string
  ): Promise<FiatDepositResult> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const currencyDoc = await Currency.findOne({ 
        symbol: currency.toUpperCase(),
        type: 'fiat'
      });

      if (!currencyDoc) {
        throw new Error('Currency not supported');
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          type: 'deposit'
        }
      });

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId: currencyDoc._id,
        type: 'deposit',
        amount,
        fee: currencyDoc.depositFee,
        netAmount: amount - currencyDoc.depositFee,
        status: 'pending',
        fiatProvider: 'stripe',
        fiatTransactionId: paymentIntent.id
      });

      await transaction.save();

      return {
        transactionId: transaction._id.toString(),
        status: 'pending',
        amount,
        currency,
        paymentUrl: paymentIntent.client_secret || undefined
      };
    } catch (error: any) {
      console.error('Stripe deposit error:', error);
      throw new Error(`Stripe deposit failed: ${error.message}`);
    }
  }

  async processStripeWebhook(event: any): Promise<void> {
    try {
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Find transaction
        const transaction = await Transaction.findOne({
          fiatProvider: 'stripe',
          fiatTransactionId: paymentIntent.id
        });

        if (!transaction) {
          console.error('Transaction not found for payment intent:', paymentIntent.id);
          return;
        }

        // Update transaction
        transaction.status = 'completed';
        await transaction.save();

        // Credit user balance
        const balance = await Balance.findOne({
          userId: transaction.userId,
          currencyId: transaction.currencyId
        });

        if (balance) {
          await balance.credit(transaction.netAmount);
        } else {
          await Balance.create({
            userId: transaction.userId,
            currencyId: transaction.currencyId,
            available: transaction.netAmount,
            locked: 0
          });
        }

        console.log(`Deposit completed: ${transaction._id}`);
      } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        
        const transaction = await Transaction.findOne({
          fiatProvider: 'stripe',
          fiatTransactionId: paymentIntent.id
        });

        if (transaction) {
          transaction.status = 'failed';
          transaction.error = 'Payment failed';
          await transaction.save();
        }
      }
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  // Circle (USDC) Integration
  async createCircleDeposit(
    userId: string,
    amount: number
  ): Promise<FiatDepositResult> {
    const circleApiKey = process.env.CIRCLE_API_KEY;
    if (!circleApiKey) {
      throw new Error('Circle API is not configured');
    }

    try {
      const currencyDoc = await Currency.findOne({ symbol: 'USDC' });
      if (!currencyDoc) {
        throw new Error('USDC not supported');
      }

      // Create Circle payment
      const response = await axios.post(
        'https://api.circle.com/v1/payments',
        {
          amount: { amount: amount.toString(), currency: 'USD' },
          source: { type: 'card' },
          description: 'SongIQ USDC Deposit',
          metadata: { userId }
        },
        {
          headers: {
            'Authorization': `Bearer ${circleApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const payment = response.data.data;

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId: currencyDoc._id,
        type: 'deposit',
        amount,
        fee: currencyDoc.depositFee,
        netAmount: amount - currencyDoc.depositFee,
        status: 'pending',
        fiatProvider: 'circle',
        fiatTransactionId: payment.id
      });

      await transaction.save();

      return {
        transactionId: transaction._id.toString(),
        status: 'pending',
        amount,
        currency: 'USDC',
        paymentUrl: payment.paymentUrl
      };
    } catch (error: any) {
      console.error('Circle deposit error:', error);
      throw new Error(`Circle deposit failed: ${error.message}`);
    }
  }

  // Stripe withdrawal (bank transfer)
  async createStripeWithdrawal(
    userId: string,
    amount: number,
    currency: string,
    bankAccountId: string
  ): Promise<FiatWithdrawalResult> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    try {
      const currencyDoc = await Currency.findOne({ 
        symbol: currency.toUpperCase(),
        type: 'fiat'
      });

      if (!currencyDoc) {
        throw new Error('Currency not supported');
      }

      // Check balance
      const balance = await Balance.findOne({
        userId,
        currencyId: currencyDoc._id
      });

      const totalAmount = amount + currencyDoc.withdrawalFee;
      if (!balance || balance.available < totalAmount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from balance
      await balance.deduct(totalAmount);

      // Create Stripe payout
      const payout = await stripe.payouts.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination: bankAccountId,
        metadata: {
          userId,
          type: 'withdrawal'
        }
      });

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId: currencyDoc._id,
        type: 'withdrawal',
        amount,
        fee: currencyDoc.withdrawalFee,
        netAmount: amount,
        status: 'processing',
        fiatProvider: 'stripe',
        fiatTransactionId: payout.id
      });

      await transaction.save();

      return {
        transactionId: transaction._id.toString(),
        status: 'pending',
        amount,
        currency
      };
    } catch (error: any) {
      console.error('Stripe withdrawal error:', error);
      
      // Rollback balance
      const currencyDoc = await Currency.findOne({ 
        symbol: currency.toUpperCase()
      });
      if (currencyDoc) {
        const balance = await Balance.findOne({ userId, currencyId: currencyDoc._id });
        if (balance) {
          await balance.credit(amount + currencyDoc.withdrawalFee);
        }
      }

      throw new Error(`Stripe withdrawal failed: ${error.message}`);
    }
  }

  // PayPal Integration (placeholder)
  async createPayPalDeposit(
    userId: string,
    amount: number,
    currency: string
  ): Promise<FiatDepositResult> {
    // TODO: Implement PayPal integration
    throw new Error('PayPal integration not yet implemented');
  }

  // Coinbase Commerce (crypto to fiat)
  async createCoinbaseDeposit(
    userId: string,
    amount: number,
    cryptoCurrency: string
  ): Promise<FiatDepositResult> {
    const coinbaseApiKey = process.env.COINBASE_API_KEY;
    if (!coinbaseApiKey) {
      throw new Error('Coinbase API is not configured');
    }

    try {
      const currencyDoc = await Currency.findOne({ 
        symbol: cryptoCurrency.toUpperCase()
      });

      if (!currencyDoc) {
        throw new Error('Currency not supported');
      }

      // Create Coinbase Commerce charge
      const response = await axios.post(
        'https://api.commerce.coinbase.com/charges',
        {
          name: 'SongIQ Deposit',
          description: `Deposit ${amount} ${cryptoCurrency}`,
          pricing_type: 'fixed_price',
          local_price: {
            amount: amount.toString(),
            currency: cryptoCurrency.toUpperCase()
          },
          metadata: { userId }
        },
        {
          headers: {
            'X-CC-Api-Key': coinbaseApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const charge = response.data.data;

      // Create transaction record
      const transaction = new Transaction({
        userId,
        currencyId: currencyDoc._id,
        type: 'deposit',
        amount,
        fee: currencyDoc.depositFee,
        netAmount: amount - currencyDoc.depositFee,
        status: 'pending',
        fiatProvider: 'coinbase',
        fiatTransactionId: charge.id
      });

      await transaction.save();

      return {
        transactionId: transaction._id.toString(),
        status: 'pending',
        amount,
        currency: cryptoCurrency,
        paymentUrl: charge.hosted_url
      };
    } catch (error: any) {
      console.error('Coinbase deposit error:', error);
      throw new Error(`Coinbase deposit failed: ${error.message}`);
    }
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): string[] {
    const methods: string[] = [];
    
    if (stripe) methods.push('stripe');
    if (process.env.CIRCLE_API_KEY) methods.push('circle');
    if (process.env.COINBASE_API_KEY) methods.push('coinbase');
    
    return methods;
  }

  // Get deposit limits
  async getDepositLimits(userId: string, currency: string) {
    const currencyDoc = await Currency.findOne({ 
      symbol: currency.toUpperCase()
    });

    if (!currencyDoc) {
      throw new Error('Currency not supported');
    }

    return {
      min: currencyDoc.minDeposit,
      max: 10000, // Daily limit (can be made dynamic)
      fee: currencyDoc.depositFee,
      currency: currencyDoc.symbol
    };
  }

  // Get withdrawal limits
  async getWithdrawalLimits(userId: string, currency: string) {
    const currencyDoc = await Currency.findOne({ 
      symbol: currency.toUpperCase()
    });

    if (!currencyDoc) {
      throw new Error('Currency not supported');
    }

    return {
      min: currencyDoc.minWithdrawal,
      max: 10000, // Daily limit (can be made dynamic)
      fee: currencyDoc.withdrawalFee,
      currency: currencyDoc.symbol
    };
  }
}

export default new FiatIntegrationService();

