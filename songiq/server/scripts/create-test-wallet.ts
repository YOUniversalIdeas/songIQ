import mongoose from 'mongoose';
import dotenv from 'dotenv';
import blockchainService from '../src/services/blockchainService';
import Currency from '../src/models/Currency';
import Balance from '../src/models/Balance';

dotenv.config();

const createTestWallet = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get a test user ID (you'll need to replace this with an actual user ID)
    const testUserId = process.argv[2];
    
    if (!testUserId) {
      console.error('❌ Please provide a user ID as argument');
      console.log('Usage: npm run create:test-wallet <userId>');
      process.exit(1);
    }

    console.log(`Creating test wallet for user: ${testUserId}\n`);

    // Create Ethereum wallet
    console.log('Creating Ethereum wallet...');
    const ethWallet = await blockchainService.createCustodialWallet(testUserId, 1);
    console.log(`✓ Ethereum wallet created: ${ethWallet.address}`);

    // Create Polygon wallet
    console.log('Creating Polygon wallet...');
    const maticWallet = await blockchainService.createCustodialWallet(testUserId, 137);
    console.log(`✓ Polygon wallet created: ${maticWallet.address}`);

    // Initialize balances with test funds
    console.log('\nInitializing test balances...');
    
    const currencies = await Currency.find({ isActive: true });
    
    for (const currency of currencies) {
      const existingBalance = await Balance.findOne({
        userId: testUserId,
        currencyId: currency._id
      });

      if (!existingBalance) {
        let testAmount = 0;
        
        // Set test amounts based on currency type
        if (currency.type === 'fiat') {
          testAmount = 1000; // $1000 USD
        } else if (currency.type === 'stablecoin') {
          testAmount = 500; // 500 USDC/USDT/DAI
        } else if (currency.symbol === 'ETH') {
          testAmount = 1; // 1 ETH
        } else if (currency.symbol === 'BTC') {
          testAmount = 0.05; // 0.05 BTC
        } else if (currency.symbol === 'MATIC') {
          testAmount = 100; // 100 MATIC
        }

        if (testAmount > 0) {
          const balance = new Balance({
            userId: testUserId,
            currencyId: currency._id,
            available: testAmount,
            locked: 0,
            total: testAmount
          });

          await balance.save();
          console.log(`✓ Added ${testAmount} ${currency.symbol}`);
        }
      }
    }

    console.log('\n✅ Test wallet setup completed successfully!');
    console.log(`\nWallet Addresses:`);
    console.log(`- Ethereum: ${ethWallet.address}`);
    console.log(`- Polygon: ${maticWallet.address}`);
    console.log(`\nBalances initialized with test funds.`);
    console.log(`\nYou can now:`);
    console.log(`- View balances: GET /api/currencies/user/balances`);
    console.log(`- Place orders: POST /api/trading/orders/market`);
    console.log(`- Transfer funds: POST /api/transactions/withdrawal/crypto`);

  } catch (error) {
    console.error('Error creating test wallet:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the function
createTestWallet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

