import axios from 'axios';
import Currency from '../models/Currency';

interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  };
}

class CurrencyConversionService {
  private ratesCache: Map<string, ConversionRate> = new Map();
  private cacheExpiry: number = 60000; // 1 minute

  // Get conversion rate between two currencies
  async getConversionRate(fromSymbol: string, toSymbol: string): Promise<number> {
    const cacheKey = `${fromSymbol}_${toSymbol}`;
    const cached = this.ratesCache.get(cacheKey);

    if (cached && Date.now() - cached.lastUpdated.getTime() < this.cacheExpiry) {
      return cached.rate;
    }

    // Get both currencies
    const [fromCurrency, toCurrency] = await Promise.all([
      Currency.findOne({ symbol: fromSymbol.toUpperCase() }),
      Currency.findOne({ symbol: toSymbol.toUpperCase() })
    ]);

    if (!fromCurrency || !toCurrency) {
      throw new Error('Currency not found');
    }

    // Calculate rate through USD
    const rate = fromCurrency.priceUSD / toCurrency.priceUSD;

    // Cache the rate
    this.ratesCache.set(cacheKey, {
      from: fromSymbol,
      to: toSymbol,
      rate,
      lastUpdated: new Date()
    });

    return rate;
  }

  // Convert amount between currencies
  async convert(amount: number, fromSymbol: string, toSymbol: string): Promise<number> {
    if (fromSymbol === toSymbol) {
      return amount;
    }

    const rate = await this.getConversionRate(fromSymbol, toSymbol);
    return amount * rate;
  }

  // Update all currency prices from external APIs
  async updateAllPrices(): Promise<void> {
    try {
      // Update crypto prices from CoinGecko (free tier)
      await this.updateCryptoPrices();

      // Update fiat prices from exchange rate API
      await this.updateFiatPrices();

      console.log('Currency prices updated successfully');
    } catch (error) {
      console.error('Error updating currency prices:', error);
      throw error;
    }
  }

  // Update cryptocurrency prices
  private async updateCryptoPrices(): Promise<void> {
    try {
      const cryptoCurrencies = await Currency.find({ 
        type: { $in: ['crypto', 'stablecoin'] },
        isActive: true 
      });

      if (cryptoCurrencies.length === 0) {
        return;
      }

      // Build list of coin IDs for CoinGecko
      const coinIds = cryptoCurrencies.map(c => this.getCoinGeckoId(c.symbol)).filter(Boolean).join(',');

      if (!coinIds) {
        return;
      }

      // Fetch prices from CoinGecko (free API)
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: coinIds,
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_market_cap: true
          },
          timeout: 10000
        }
      );

      const priceData: PriceData = response.data;

      // Update each currency
      for (const currency of cryptoCurrencies) {
        const coinId = this.getCoinGeckoId(currency.symbol);
        if (!coinId || !priceData[coinId]) {
          continue;
        }

        const data = priceData[coinId];
        currency.priceUSD = data.usd;
        currency.price24hChange = data.usd_24h_change || 0;
        currency.marketCap = data.usd_market_cap || 0;
        currency.priceLastUpdated = new Date();

        await currency.save();
      }
    } catch (error) {
      console.error('Error updating crypto prices:', error);
      // Don't throw - allow fiat updates to proceed
    }
  }

  // Update fiat currency prices
  private async updateFiatPrices(): Promise<void> {
    try {
      const fiatCurrencies = await Currency.find({ 
        type: 'fiat',
        isActive: true 
      });

      if (fiatCurrencies.length === 0) {
        return;
      }

      // Use exchangerate-api.com (free tier)
      const response = await axios.get(
        'https://api.exchangerate-api.com/v4/latest/USD',
        { timeout: 10000 }
      );

      const rates = response.data.rates;

      // Update each fiat currency
      for (const currency of fiatCurrencies) {
        if (currency.symbol === 'USD') {
          currency.priceUSD = 1.0;
        } else if (rates[currency.symbol]) {
          currency.priceUSD = 1.0 / rates[currency.symbol];
        }
        
        currency.priceLastUpdated = new Date();
        await currency.save();
      }
    } catch (error) {
      console.error('Error updating fiat prices:', error);
      // Don't throw - prices may still be usable from cache
    }
  }

  // Map currency symbols to CoinGecko IDs
  private getCoinGeckoId(symbol: string): string | null {
    const mapping: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'DAI': 'dai',
      'BUSD': 'binance-usd',
      'MATIC': 'matic-network',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'AVAX': 'avalanche-2',
      'LINK': 'chainlink',
      'UNI': 'uniswap'
    };

    return mapping[symbol.toUpperCase()] || null;
  }

  // Get multiple conversion rates at once
  async getMultipleRates(fromSymbol: string, toSymbols: string[]): Promise<{ [symbol: string]: number }> {
    const rates: { [symbol: string]: number } = {};

    await Promise.all(
      toSymbols.map(async (toSymbol) => {
        try {
          rates[toSymbol] = await this.getConversionRate(fromSymbol, toSymbol);
        } catch (error) {
          console.error(`Error getting rate for ${fromSymbol}/${toSymbol}:`, error);
          rates[toSymbol] = 0;
        }
      })
    );

    return rates;
  }

  // Calculate value in USD for portfolio tracking
  async calculateUSDValue(amount: number, currencySymbol: string): Promise<number> {
    const currency = await Currency.findOne({ symbol: currencySymbol.toUpperCase() });
    if (!currency) {
      throw new Error('Currency not found');
    }

    return amount * currency.priceUSD;
  }

  // Get total portfolio value in USD
  async calculatePortfolioValue(balances: { currencySymbol: string; amount: number }[]): Promise<number> {
    let totalValue = 0;

    for (const balance of balances) {
      try {
        const value = await this.calculateUSDValue(balance.amount, balance.currencySymbol);
        totalValue += value;
      } catch (error) {
        console.error(`Error calculating value for ${balance.currencySymbol}:`, error);
      }
    }

    return totalValue;
  }

  // Clear cache
  clearCache(): void {
    this.ratesCache.clear();
  }
}

export default new CurrencyConversionService();

