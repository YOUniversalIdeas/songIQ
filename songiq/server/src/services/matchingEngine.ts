import Order, { IOrder } from '../models/Order';
import TradingPair from '../models/TradingPair';
import Trade from '../models/Trade';
import Balance from '../models/Balance';
import Currency from '../models/Currency';
import mongoose from 'mongoose';

interface OrderBookEntry {
  orderId: string;
  price: number;
  amount: number;
  timestamp: Date;
}

interface OrderBook {
  bids: OrderBookEntry[]; // Buy orders sorted by price descending
  asks: OrderBookEntry[]; // Sell orders sorted by price ascending
}

class MatchingEngine {
  // Get order book for a trading pair
  async getOrderBook(tradingPairId: string): Promise<OrderBook> {
    const orders = await Order.find({
      tradingPairId,
      status: { $in: ['open', 'partially_filled'] }
    }).lean();

    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    orders.forEach((order) => {
      const entry: OrderBookEntry = {
        orderId: order._id.toString(),
        price: order.price || 0,
        amount: order.remaining,
        timestamp: order.createdAt
      };

      if (order.side === 'buy') {
        bids.push(entry);
      } else {
        asks.push(entry);
      }
    });

    // Sort bids by price descending (highest first)
    bids.sort((a, b) => b.price - a.price);
    
    // Sort asks by price ascending (lowest first)
    asks.sort((a, b) => a.price - b.price);

    return { bids, asks };
  }

  // Match a new order against existing orders
  async matchOrder(orderId: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order || order.status === 'filled' || order.status === 'cancelled') {
      return;
    }

    const tradingPair = await TradingPair.findById(order.tradingPairId).populate('baseCurrencyId quoteCurrencyId');
    if (!tradingPair) {
      throw new Error('Trading pair not found');
    }

    // Get opposite side orders
    const oppositeSide = order.side === 'buy' ? 'sell' : 'buy';
    const sortOrder = order.side === 'buy' ? 1 : -1; // Buy matches lowest sells, Sell matches highest buys

    const matchingOrders = await Order.find({
      tradingPairId: order.tradingPairId,
      side: oppositeSide,
      status: { $in: ['open', 'partially_filled'] }
    }).sort({ price: sortOrder, createdAt: 1 });

    for (const matchingOrder of matchingOrders) {
      if (order.remaining === 0) {
        break;
      }

      // Check if prices match
      const canMatch = order.type === 'market' || 
        (order.side === 'buy' && order.price! >= matchingOrder.price!) ||
        (order.side === 'sell' && order.price! <= matchingOrder.price!);

      if (!canMatch) {
        continue;
      }

      // Calculate matched amount
      const matchAmount = Math.min(order.remaining, matchingOrder.remaining);
      const matchPrice = matchingOrder.price!; // Taker gets maker's price

      // Execute the trade
      await this.executeTrade(order, matchingOrder, matchAmount, matchPrice, tradingPair);
    }

    // Update order status
    if (order.remaining === 0) {
      order.status = 'filled';
    } else if (order.filled > 0) {
      order.status = 'partially_filled';
    }

    await order.save();
  }

  // Execute a matched trade
  private async executeTrade(
    takerOrder: IOrder,
    makerOrder: IOrder,
    amount: number,
    price: number,
    tradingPair: any
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const baseCurrency = tradingPair.baseCurrencyId;
      const quoteCurrency = tradingPair.quoteCurrencyId;
      const totalValue = amount * price;

      // Calculate fees
      const takerFee = totalValue * tradingPair.takerFee;
      const makerFee = totalValue * tradingPair.makerFee;

      // Create trade records
      const takerTrade = new Trade({
        userId: takerOrder.userId,
        marketId: tradingPair._id,
        outcomeId: takerOrder.side === 'buy' ? baseCurrency._id : quoteCurrency._id,
        type: takerOrder.side,
        shares: amount,
        price: price,
        totalCost: totalValue,
        fee: takerFee,
        status: 'completed'
      });

      const makerTrade = new Trade({
        userId: makerOrder.userId,
        marketId: tradingPair._id,
        outcomeId: makerOrder.side === 'buy' ? baseCurrency._id : quoteCurrency._id,
        type: makerOrder.side,
        shares: amount,
        price: price,
        totalCost: totalValue,
        fee: makerFee,
        status: 'completed'
      });

      await takerTrade.save({ session });
      await makerTrade.save({ session });

      // Update balances for taker
      if (takerOrder.side === 'buy') {
        // Taker buys base with quote
        const takerBaseBalance = await Balance.findOne({ 
          userId: takerOrder.userId, 
          currencyId: baseCurrency._id 
        });
        const takerQuoteBalance = await Balance.findOne({ 
          userId: takerOrder.userId, 
          currencyId: quoteCurrency._id 
        });

        if (takerBaseBalance) {
          await takerBaseBalance.credit(amount);
        }
        // Quote was already deducted when order was placed
      } else {
        // Taker sells base for quote
        const takerQuoteBalance = await Balance.findOne({ 
          userId: takerOrder.userId, 
          currencyId: quoteCurrency._id 
        });

        if (takerQuoteBalance) {
          await takerQuoteBalance.credit(totalValue - takerFee);
        }
        // Base was already deducted when order was placed
      }

      // Update balances for maker
      if (makerOrder.side === 'buy') {
        // Maker buys base with quote
        const makerBaseBalance = await Balance.findOne({ 
          userId: makerOrder.userId, 
          currencyId: baseCurrency._id 
        });

        if (makerBaseBalance) {
          await makerBaseBalance.credit(amount);
        }
      } else {
        // Maker sells base for quote
        const makerQuoteBalance = await Balance.findOne({ 
          userId: makerOrder.userId, 
          currencyId: quoteCurrency._id 
        });

        if (makerQuoteBalance) {
          await makerQuoteBalance.credit(totalValue - makerFee);
        }
      }

      // Update orders
      takerOrder.filled += amount;
      takerOrder.remaining -= amount;
      takerOrder.trades.push(takerTrade._id);
      
      if (!takerOrder.averagePrice) {
        takerOrder.averagePrice = price;
      } else {
        takerOrder.averagePrice = 
          (takerOrder.averagePrice * (takerOrder.filled - amount) + price * amount) / takerOrder.filled;
      }

      makerOrder.filled += amount;
      makerOrder.remaining -= amount;
      makerOrder.trades.push(makerTrade._id);
      
      if (!makerOrder.averagePrice) {
        makerOrder.averagePrice = price;
      } else {
        makerOrder.averagePrice = 
          (makerOrder.averagePrice * (makerOrder.filled - amount) + price * amount) / makerOrder.filled;
      }

      await takerOrder.save({ session });
      await makerOrder.save({ session });

      // Update trading pair statistics
      tradingPair.lastPrice = price;
      tradingPair.volume24h += totalValue;
      tradingPair.priceLastUpdated = new Date();

      if (price > tradingPair.price24hHigh || tradingPair.price24hHigh === 0) {
        tradingPair.price24hHigh = price;
      }
      if (price < tradingPair.price24hLow || tradingPair.price24hLow === 0) {
        tradingPair.price24hLow = price;
      }

      await tradingPair.save({ session });

      await session.commitTransaction();
      console.log(`Trade executed: ${amount} @ ${price}`);

      // Broadcast WebSocket updates
      if (global.tradingWS) {
        // Notify about trade execution
        global.tradingWS.broadcastTradeExecution(tradingPair._id.toString(), {
          amount,
          price,
          buyerUserId: takerOrder.side === 'buy' ? takerOrder.userId : makerOrder.userId,
          sellerUserId: takerOrder.side === 'sell' ? takerOrder.userId : makerOrder.userId,
          timestamp: new Date()
        });

        // Broadcast updated orderbook
        const updatedOrderBook = await this.getOrderBook(tradingPair._id.toString());
        global.tradingWS.broadcastOrderbookUpdate(tradingPair._id.toString(), updatedOrderBook);

        // Notify users about their updated orders
        global.tradingWS.broadcastOrderUpdate(takerOrder.userId.toString(), takerOrder);
        global.tradingWS.broadcastOrderUpdate(makerOrder.userId.toString(), makerOrder);
      }
    } catch (error) {
      await session.abortTransaction();
      console.error('Trade execution failed:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Place a market order (executes immediately at best available price)
  async placeMarketOrder(
    userId: string,
    tradingPairId: string,
    side: 'buy' | 'sell',
    amount: number
  ): Promise<IOrder> {
    const tradingPair = await TradingPair.findById(tradingPairId).populate('baseCurrencyId quoteCurrencyId');
    if (!tradingPair || !tradingPair.isActive) {
      throw new Error('Trading pair not active');
    }

    // Create market order
    const order = new Order({
      userId,
      tradingPairId,
      type: 'market',
      side,
      amount,
      filled: 0,
      remaining: amount,
      status: 'pending'
    });

    await order.save();

    // Immediately try to match
    await this.matchOrder(order._id.toString());

    // Reload order to get updated status
    const updatedOrder = await Order.findById(order._id);
    
    // Cancel any remaining unfilled amount for market orders
    if (updatedOrder && updatedOrder.remaining > 0) {
      updatedOrder.status = 'cancelled';
      await updatedOrder.save();
    }

    return updatedOrder!;
  }

  // Place a limit order
  async placeLimitOrder(
    userId: string,
    tradingPairId: string,
    side: 'buy' | 'sell',
    price: number,
    amount: number,
    timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC'
  ): Promise<IOrder> {
    const tradingPair = await TradingPair.findById(tradingPairId).populate('baseCurrencyId quoteCurrencyId');
    if (!tradingPair || !tradingPair.isActive) {
      throw new Error('Trading pair not active');
    }

    if (amount < tradingPair.minTradeAmount) {
      throw new Error(`Minimum trade amount is ${tradingPair.minTradeAmount}`);
    }

    const baseCurrency: any = tradingPair.baseCurrencyId;
    const quoteCurrency: any = tradingPair.quoteCurrencyId;

    // Check balance and lock funds
    const currencyToLock = side === 'buy' ? quoteCurrency : baseCurrency;
    const amountToLock = side === 'buy' ? price * amount : amount;

    const balance = await Balance.findOne({ userId, currencyId: currencyToLock._id });
    if (!balance || balance.available < amountToLock) {
      throw new Error('Insufficient balance');
    }

    await balance.lock(amountToLock);

    // Create limit order
    const order = new Order({
      userId,
      tradingPairId,
      type: 'limit',
      side,
      price,
      amount,
      filled: 0,
      remaining: amount,
      status: 'open',
      timeInForce
    });

    await order.save();

    // Try to match immediately
    await this.matchOrder(order._id.toString());

    // Reload order
    const updatedOrder = await Order.findById(order._id);

    // Handle time in force
    if (timeInForce === 'IOC' && updatedOrder && updatedOrder.remaining > 0) {
      // Immediate or Cancel: cancel remaining
      await this.cancelOrder(updatedOrder._id.toString(), userId);
    } else if (timeInForce === 'FOK' && updatedOrder && updatedOrder.filled < amount) {
      // Fill or Kill: cancel entire order if not fully filled
      await this.cancelOrder(updatedOrder._id.toString(), userId);
    }

    return updatedOrder!;
  }

  // Cancel an order
  async cancelOrder(orderId: string, userId: string): Promise<void> {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    if (!['open', 'partially_filled'].includes(order.status)) {
      throw new Error('Order cannot be cancelled');
    }

    const tradingPair = await TradingPair.findById(order.tradingPairId).populate('baseCurrencyId quoteCurrencyId');
    if (!tradingPair) {
      throw new Error('Trading pair not found');
    }

    const baseCurrency: any = tradingPair.baseCurrencyId;
    const quoteCurrency: any = tradingPair.quoteCurrencyId;

    // Unlock remaining funds
    const currencyToUnlock = order.side === 'buy' ? quoteCurrency : baseCurrency;
    const amountToUnlock = order.side === 'buy' 
      ? (order.price || 0) * order.remaining 
      : order.remaining;

    const balance = await Balance.findOne({ userId, currencyId: currencyToUnlock._id });
    if (balance) {
      await balance.unlock(amountToUnlock);
    }

    order.status = 'cancelled';
    await order.save();
  }

  // Get depth chart data
  async getDepthChart(tradingPairId: string, levels: number = 20) {
    const orderBook = await this.getOrderBook(tradingPairId);

    // Aggregate orders by price level
    const bidLevels = new Map<number, number>();
    const askLevels = new Map<number, number>();

    orderBook.bids.forEach(bid => {
      const current = bidLevels.get(bid.price) || 0;
      bidLevels.set(bid.price, current + bid.amount);
    });

    orderBook.asks.forEach(ask => {
      const current = askLevels.get(ask.price) || 0;
      askLevels.set(ask.price, current + ask.amount);
    });

    // Convert to arrays and calculate cumulative amounts
    let cumulativeBidAmount = 0;
    const bids = Array.from(bidLevels.entries())
      .sort((a, b) => b[0] - a[0])
      .slice(0, levels)
      .map(([price, amount]) => {
        cumulativeBidAmount += amount;
        return { price, amount, cumulative: cumulativeBidAmount };
      });

    let cumulativeAskAmount = 0;
    const asks = Array.from(askLevels.entries())
      .sort((a, b) => a[0] - b[0])
      .slice(0, levels)
      .map(([price, amount]) => {
        cumulativeAskAmount += amount;
        return { price, amount, cumulative: cumulativeAskAmount };
      });

    return { bids, asks };
  }

  // Calculate spread
  async getSpread(tradingPairId: string): Promise<{ bid: number; ask: number; spread: number; spreadPercent: number }> {
    const orderBook = await this.getOrderBook(tradingPairId);
    
    const bestBid = orderBook.bids[0]?.price || 0;
    const bestAsk = orderBook.asks[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;
    const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

    return { bid: bestBid, ask: bestAsk, spread, spreadPercent };
  }
}

export default new MatchingEngine();

