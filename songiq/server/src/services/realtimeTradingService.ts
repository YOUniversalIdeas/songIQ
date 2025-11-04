import TradingPair from '../models/TradingPair';
import Order from '../models/Order';
import matchingEngine from './matchingEngine';

/**
 * Service to handle real-time trading updates via WebSocket
 * This service monitors trading activity and broadcasts updates
 */
class RealtimeTradingService {
  private updateInterval: NodeJS.Timeout | null = null;
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring trading activity
   */
  start() {
    console.log('Starting real-time trading service...');

    // Update orderbooks every 2 seconds
    this.updateInterval = setInterval(async () => {
      await this.broadcastOrderbookUpdates();
    }, 2000);

    // Update prices every 5 seconds
    this.priceUpdateInterval = setInterval(async () => {
      await this.broadcastPriceUpdates();
    }, 5000);

    console.log('✓ Real-time trading service started');
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
    console.log('Real-time trading service stopped');
  }

  /**
   * Broadcast orderbook updates for all active pairs
   */
  private async broadcastOrderbookUpdates() {
    try {
      const activePairs = await TradingPair.find({ isActive: true }).select('_id').lean();

      for (const pair of activePairs) {
        const orderbook = await matchingEngine.getOrderBook(pair._id.toString());
        
        // Only broadcast if WebSocket service is available
        if (global.tradingWS) {
          global.tradingWS.broadcastOrderbookUpdate(pair._id.toString(), orderbook);
        }
      }
    } catch (error) {
      console.error('Error broadcasting orderbook updates:', error);
    }
  }

  /**
   * Broadcast price updates for all active pairs
   */
  private async broadcastPriceUpdates() {
    try {
      const activePairs = await TradingPair.find({ isActive: true })
        .populate('baseCurrencyId quoteCurrencyId')
        .lean();

      for (const pair of activePairs) {
        const priceData = {
          lastPrice: pair.lastPrice,
          price24hHigh: pair.price24hHigh,
          price24hLow: pair.price24hLow,
          price24hChange: pair.price24hChange,
          volume24h: pair.volume24h
        };

        if (global.tradingWS) {
          global.tradingWS.broadcastPriceUpdate(pair._id.toString(), priceData);
        }
      }
    } catch (error) {
      console.error('Error broadcasting price updates:', error);
    }
  }

  /**
   * Notify about new trade execution
   */
  async notifyTradeExecution(
    tradingPairId: string,
    trade: any,
    buyerUserId: string,
    sellerUserId: string
  ) {
    if (global.tradingWS) {
      global.tradingWS.broadcastTradeExecution(tradingPairId, {
        ...trade,
        buyerUserId,
        sellerUserId
      });
    }
  }

  /**
   * Notify user about balance change
   */
  async notifyBalanceUpdate(userId: string, balance: any) {
    if (global.tradingWS) {
      global.tradingWS.broadcastBalanceUpdate(userId, balance);
    }
  }

  /**
   * Notify user about order status change
   */
  async notifyOrderUpdate(userId: string, order: any) {
    if (global.tradingWS) {
      global.tradingWS.broadcastOrderUpdate(userId, order);
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      service: 'RealtimeTradingService',
      status: this.updateInterval ? 'running' : 'stopped',
      intervals: {
        orderbook: this.updateInterval ? '2s' : 'stopped',
        prices: this.priceUpdateInterval ? '5s' : 'stopped'
      }
    };
  }
}

export default new RealtimeTradingService();

