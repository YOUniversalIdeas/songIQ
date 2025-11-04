import React, { useState, useEffect } from 'react';
import { List, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

interface Order {
  _id: string;
  marketId: any;
  outcomeId: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  price?: number;
  amount: number;
  filled: number;
  remaining: number;
  status: string;
  createdAt: string;
}

interface LimitOrdersPanelProps {
  marketId?: string;
  outcomes?: Array<{ id: string; name: string; price: number }>;
  onOrderPlaced?: () => void;
}

const LimitOrdersPanel: React.FC<LimitOrdersPanelProps> = ({ 
  marketId, 
  outcomes = [],
  onOrderPlaced 
}) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [limitPrice, setLimitPrice] = useState('');
  const [shares, setShares] = useState('');

  useEffect(() => {
    if (token) {
      fetchOrders();
      // Auto-refresh orders every 5 seconds
      const interval = setInterval(fetchOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [token, marketId]);

  const fetchOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', 'open');
      params.append('status', 'partially_filled');
      
      const response = await fetch(`${API_BASE_URL}/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      let fetchedOrders = data.orders || [];
      
      // Filter by market if marketId provided
      if (marketId) {
        fetchedOrders = fetchedOrders.filter((o: Order) => 
          o.marketId?._id === marketId || o.marketId === marketId
        );
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          marketId,
          outcomeId: selectedOutcome,
          type: 'limit',
          side: orderSide,
          price: parseFloat(limitPrice) / 100, // Convert percentage to decimal
          shares: parseFloat(shares),
          timeInForce: 'GTC'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to place order');
      }

      // Reset form
      setShowCreateForm(false);
      setSelectedOutcome('');
      setLimitPrice('');
      setShares('');
      
      await fetchOrders();
      if (onOrderPlaced) onOrderPlaced();
    } catch (error: any) {
      alert(error.message || 'Failed to place order');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token || !window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to cancel order');

      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getOutcomeName = (outcomeId: string) => {
    return outcomes.find(o => o.id === outcomeId)?.name || outcomeId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'partially_filled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'filled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <List className="w-5 h-5 mr-2" />
          Limit Orders ({orders.length})
        </h3>
        {marketId && outcomes.length > 0 && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ Place Limit Order'}
          </button>
        )}
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Outcome
                </label>
                <select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select outcome...</option>
                  {outcomes.map((outcome) => (
                    <option key={outcome.id} value={outcome.id}>
                      {outcome.name} ({(outcome.price * 100).toFixed(1)}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Side
                </label>
                <select
                  value={orderSide}
                  onChange={(e) => setOrderSide(e.target.value as 'buy' | 'sell')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limit Price (%)
                </label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  step="0.1"
                  min="1"
                  max="99"
                  required
                  placeholder="e.g., 55.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shares
                </label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  step="1"
                  min="1"
                  required
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order will execute when price {orderSide === 'buy' ? 'reaches or falls below' : 'reaches or rises above'} {limitPrice}%
              </p>
              <button
                type="submit"
                disabled={!selectedOutcome || !limitPrice || !shares}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Market
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Outcome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Side
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {order.marketId?.title || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {getOutcomeName(order.outcomeId)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.side === 'buy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {order.price ? `${(order.price * 100).toFixed(1)}%` : 'Market'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {order.filled > 0 ? (
                        <span>
                          {order.filled.toFixed(0)} / {order.amount.toFixed(0)}
                        </span>
                      ) : (
                        order.amount.toFixed(0)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {['open', 'partially_filled'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel Order"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No active limit orders</p>
          {marketId && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Place Your First Limit Order
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LimitOrdersPanel;

