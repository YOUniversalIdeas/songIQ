import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpDown, Activity } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { API_ENDPOINTS } from '../config/api';

interface TradingPair {
  _id: string;
  symbol: string;
  lastPrice: number;
  price24hHigh: number;
  price24hLow: number;
  price24hChange: number;
  volume24h: number;
  baseCurrencyId: {
    symbol: string;
    name: string;
    priceUSD: number;
  };
  quoteCurrencyId: {
    symbol: string;
    name: string;
    priceUSD: number;
  };
}

interface OrderBookEntry {
  price: number;
  amount: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

const TradingPage: React.FC = () => {
  const { token } = useAuth();
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTradingPairs();
  }, []);

  useEffect(() => {
    if (selectedPair) {
      fetchOrderBook();
      const interval = setInterval(fetchOrderBook, 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [selectedPair]);

  const fetchTradingPairs = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/trading/pairs`);
      const data = await response.json();
      setPairs(data.pairs || []);
      if (data.pairs && data.pairs.length > 0) {
        setSelectedPair(data.pairs[0]);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load trading pairs');
      setLoading(false);
    }
  };

  const fetchOrderBook = async () => {
    if (!selectedPair) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.BASE_URL}/trading/pairs/${selectedPair._id}/orderbook`
      );
      const data = await response.json();
      setOrderBook(data.orderBook || { bids: [], asks: [] });
    } catch (err) {
      console.error('Failed to load orderbook:', err);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedPair) {
      setError('Please login to place orders');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const orderData: any = {
        tradingPairId: selectedPair._id,
        side: orderSide,
        amount: parseFloat(amount)
      };

      if (orderType === 'limit') {
        orderData.price = parseFloat(price);
        orderData.timeInForce = 'GTC';
      }

      const endpoint =
        orderType === 'market'
          ? `${API_ENDPOINTS.BASE_URL}/trading/orders/market`
          : `${API_ENDPOINTS.BASE_URL}/trading/orders/limit`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      setSuccess(`Order placed successfully! Order ID: ${data.order._id}`);
      setAmount('');
      setPrice('');
      fetchOrderBook();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <Activity className="inline mr-2" />
          Multi-Currency Trading
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Pairs List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Trading Pairs
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {pairs.map((pair) => (
                  <button
                    key={pair._id}
                    onClick={() => setSelectedPair(pair)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedPair?._id === pair._id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {pair.symbol}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          pair.price24hChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pair.price24hChange >= 0 ? '+' : ''}
                        {pair.price24hChange.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      ${pair.lastPrice > 0 ? pair.lastPrice.toFixed(2) : 'N/A'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Trading Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pair Info */}
            {selectedPair && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPair.symbol}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedPair.baseCurrencyId.name} / {selectedPair.quoteCurrencyId.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${selectedPair.lastPrice > 0 ? selectedPair.lastPrice.toFixed(2) : 'N/A'}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        selectedPair.price24hChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {selectedPair.price24hChange >= 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
                      {' '}{selectedPair.price24hChange >= 0 ? '+' : ''}
                      {selectedPair.price24hChange.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">24h High</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${selectedPair.price24hHigh > 0 ? selectedPair.price24hHigh.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">24h Low</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${selectedPair.price24hLow > 0 ? selectedPair.price24hLow.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">24h Volume</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${selectedPair.volume24h.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Book */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Order Book
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Asks (Sell Orders) */}
                <div>
                  <div className="text-sm font-semibold text-red-600 mb-2">
                    Asks (Sell)
                  </div>
                  <div className="space-y-1">
                    {orderBook.asks.slice(0, 10).map((ask, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm p-1 rounded bg-red-50 dark:bg-red-900/10"
                      >
                        <span className="text-red-600 font-medium">{ask.price.toFixed(2)}</span>
                        <span className="text-gray-600 dark:text-gray-400">{ask.amount.toFixed(4)}</span>
                      </div>
                    ))}
                    {orderBook.asks.length === 0 && (
                      <div className="text-center text-gray-500 py-4">No sell orders</div>
                    )}
                  </div>
                </div>

                {/* Bids (Buy Orders) */}
                <div>
                  <div className="text-sm font-semibold text-green-600 mb-2">
                    Bids (Buy)
                  </div>
                  <div className="space-y-1">
                    {orderBook.bids.slice(0, 10).map((bid, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm p-1 rounded bg-green-50 dark:bg-green-900/10"
                      >
                        <span className="text-green-600 font-medium">{bid.price.toFixed(2)}</span>
                        <span className="text-gray-600 dark:text-gray-400">{bid.amount.toFixed(4)}</span>
                      </div>
                    ))}
                    {orderBook.bids.length === 0 && (
                      <div className="text-center text-gray-500 py-4">No buy orders</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Placement Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Place Order
              </h3>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handlePlaceOrder}>
                {/* Order Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        orderType === 'market'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        orderType === 'limit'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Buy/Sell */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Side
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderSide('buy')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        orderSide === 'buy'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide('sell')}
                      className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                        orderSide === 'sell'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                {/* Price (for limit orders) */}
                {orderType === 'limit' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price ({selectedPair?.quoteCurrencyId.symbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                      required
                    />
                  </div>
                )}

                {/* Amount */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount ({selectedPair?.baseCurrencyId.symbol})
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.0000"
                    required
                  />
                </div>

                {/* Total */}
                {amount && (orderType === 'market' || price) && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {orderType === 'market' 
                          ? '~' 
                          : (parseFloat(price) * parseFloat(amount)).toFixed(2)
                        } {selectedPair?.quoteCurrencyId.symbol}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !selectedPair}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                    orderSide === 'buy'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Placing Order...
                    </span>
                  ) : (
                    `${orderSide.toUpperCase()} ${selectedPair?.baseCurrencyId.symbol || ''}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;

