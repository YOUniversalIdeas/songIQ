import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Currency from '../src/models/Currency';
import TradingPair from '../src/models/TradingPair';

// Load environment variables
dotenv.config();

const seedCurrencies = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to preserve existing data)
    // await Currency.deleteMany({});
    // await TradingPair.deleteMany({});
    // console.log('Cleared existing currencies and trading pairs');

    // Define currencies to seed
    const currencies = [
      // Fiat
      {
        symbol: 'USD',
        name: 'US Dollar',
        type: 'fiat',
        decimals: 2,
        isNative: false,
        fiatProvider: 'stripe',
        fiatCurrency: 'USD',
        minDeposit: 10,
        minWithdrawal: 10,
        withdrawalFee: 2.5,
        depositFee: 0,
        priceUSD: 1.0,
        displayOrder: 1,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'United States Dollar'
      },
      // Stablecoins
      {
        symbol: 'USDC',
        name: 'USD Coin',
        type: 'stablecoin',
        decimals: 6,
        contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // Ethereum mainnet
        chainId: 1,
        isNative: false,
        minDeposit: 10,
        minWithdrawal: 10,
        withdrawalFee: 1,
        depositFee: 0,
        priceUSD: 1.0,
        displayOrder: 2,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'Circle USD Coin - Fully reserved stablecoin'
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        type: 'stablecoin',
        decimals: 6,
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Ethereum mainnet
        chainId: 1,
        isNative: false,
        minDeposit: 10,
        minWithdrawal: 10,
        withdrawalFee: 1,
        depositFee: 0,
        priceUSD: 1.0,
        displayOrder: 3,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'Tether USD - Most widely used stablecoin'
      },
      {
        symbol: 'DAI',
        name: 'Dai',
        type: 'stablecoin',
        decimals: 18,
        contractAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // Ethereum mainnet
        chainId: 1,
        isNative: false,
        minDeposit: 10,
        minWithdrawal: 10,
        withdrawalFee: 1,
        depositFee: 0,
        priceUSD: 1.0,
        displayOrder: 4,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'MakerDAO Stablecoin - Decentralized stablecoin'
      },
      // Cryptocurrencies
      {
        symbol: 'ETH',
        name: 'Ethereum',
        type: 'crypto',
        decimals: 18,
        chainId: 1,
        isNative: true,
        minDeposit: 0.001,
        minWithdrawal: 0.001,
        withdrawalFee: 0.0005,
        depositFee: 0,
        priceUSD: 2000, // Initial price, will be updated
        displayOrder: 5,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'Ethereum - Smart contract platform'
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'crypto',
        decimals: 8,
        isNative: true,
        minDeposit: 0.0001,
        minWithdrawal: 0.0001,
        withdrawalFee: 0.00005,
        depositFee: 0,
        priceUSD: 40000, // Initial price, will be updated
        displayOrder: 6,
        allowDeposits: false, // Bitcoin integration requires additional setup
        allowWithdrawals: false,
        allowTrading: true,
        isActive: true,
        description: 'Bitcoin - Digital gold'
      },
      {
        symbol: 'MATIC',
        name: 'Polygon',
        type: 'crypto',
        decimals: 18,
        chainId: 137,
        isNative: true,
        minDeposit: 1,
        minWithdrawal: 1,
        withdrawalFee: 0.1,
        depositFee: 0,
        priceUSD: 0.8, // Initial price, will be updated
        displayOrder: 7,
        allowDeposits: true,
        allowWithdrawals: true,
        allowTrading: true,
        isActive: true,
        description: 'Polygon - Layer 2 scaling solution'
      }
    ];

    // Insert currencies
    const insertedCurrencies = [];
    for (const currencyData of currencies) {
      const existing = await Currency.findOne({ symbol: currencyData.symbol });
      if (!existing) {
        const currency = new Currency(currencyData);
        await currency.save();
        insertedCurrencies.push(currency);
        console.log(`✓ Created currency: ${currency.symbol} (${currency.name})`);
      } else {
        insertedCurrencies.push(existing);
        console.log(`- Currency already exists: ${currencyData.symbol}`);
      }
    }

    // Create trading pairs
    const pairDefinitions = [
      // Major pairs with stablecoins
      { base: 'ETH', quote: 'USDC', makerFee: 0.001, takerFee: 0.002 },
      { base: 'ETH', quote: 'USDT', makerFee: 0.001, takerFee: 0.002 },
      { base: 'ETH', quote: 'DAI', makerFee: 0.001, takerFee: 0.002 },
      { base: 'BTC', quote: 'USDC', makerFee: 0.001, takerFee: 0.002 },
      { base: 'BTC', quote: 'USDT', makerFee: 0.001, takerFee: 0.002 },
      { base: 'MATIC', quote: 'USDC', makerFee: 0.001, takerFee: 0.002 },
      { base: 'MATIC', quote: 'USDT', makerFee: 0.001, takerFee: 0.002 },
      // Crypto pairs
      { base: 'ETH', quote: 'BTC', makerFee: 0.001, takerFee: 0.002 },
      { base: 'MATIC', quote: 'ETH', makerFee: 0.001, takerFee: 0.002 },
      // Stablecoin pairs
      { base: 'USDT', quote: 'USDC', makerFee: 0.0005, takerFee: 0.001 },
      { base: 'DAI', quote: 'USDC', makerFee: 0.0005, takerFee: 0.001 }
    ];

    let displayOrder = 1;
    for (const pairDef of pairDefinitions) {
      const baseCurrency = insertedCurrencies.find(c => c.symbol === pairDef.base);
      const quoteCurrency = insertedCurrencies.find(c => c.symbol === pairDef.quote);

      if (!baseCurrency || !quoteCurrency) {
        console.log(`- Skipping pair ${pairDef.base}/${pairDef.quote}: Currency not found`);
        continue;
      }

      const existing = await TradingPair.findOne({
        baseCurrencyId: baseCurrency._id,
        quoteCurrencyId: quoteCurrency._id
      });

      if (!existing) {
        const pair = new TradingPair({
          baseCurrencyId: baseCurrency._id,
          quoteCurrencyId: quoteCurrency._id,
          symbol: `${baseCurrency.symbol}/${quoteCurrency.symbol}`,
          isActive: true,
          minTradeAmount: 0.001,
          maxTradeAmount: 1000000,
          makerFee: pairDef.makerFee,
          takerFee: pairDef.takerFee,
          liquidityPoolEnabled: false,
          displayOrder: displayOrder++
        });

        await pair.save();
        console.log(`✓ Created trading pair: ${pair.symbol}`);
      } else {
        console.log(`- Trading pair already exists: ${pairDef.base}/${pairDef.quote}`);
      }
    }

    console.log('\n✅ Currency and trading pair seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Currencies: ${insertedCurrencies.length}`);
    console.log(`- Trading Pairs: ${pairDefinitions.length}`);

  } catch (error) {
    console.error('Error seeding currencies:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seed function
seedCurrencies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

