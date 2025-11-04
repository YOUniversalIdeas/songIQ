import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, Users, Plus, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface Market {
  _id: string;
  title: string;
  description: string;
  category: string;
  outcomes: Array<{
    id: string;
    name: string;
    description: string;
    shares: number;
    price: number;
    totalVolume: number;
  }>;
  endDate: string;
  status: 'active' | 'closed' | 'resolved' | 'cancelled';
  totalVolume: number;
  totalLiquidity: number;
  resolvedOutcomeId?: string;
  resolutionDate?: string;
  creatorId: any;
}

const MarketsAdmin: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [resolvingMarketId, setResolvingMarketId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, [filter]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`${API_BASE_URL}/api/markets?${params}&limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Failed to fetch markets');

      const data = await response.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
      showMessage('error', 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  const resolveMarket = async (marketId: string, outcomeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'You must be logged in');
        return;
      }

      setResolvingMarketId(marketId);

      const response = await fetch(`${API_BASE_URL}/api/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ outcomeId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resolve market');
      }

      const data = await response.json();
      showMessage('success', `Market resolved! ${data.winnersCount} positions paid out.`);
      setSelectedMarket(null);
      await fetchMarkets();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to resolve market');
    } finally {
      setResolvingMarketId(null);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Markets Administration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and resolve prediction markets
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/markets/create'}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Market
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Markets</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {markets.length}
              </div>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {markets.filter(m => m.status === 'active').length}
              </div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {markets.filter(m => m.status === 'resolved').length}
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(markets.reduce((sum, m) => sum + m.totalVolume, 0))}
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'active', 'closed', 'resolved', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Markets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : markets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {markets.map((market) => (
                  <tr key={market._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {market.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {market.outcomes.length} outcomes
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(market.status)}`}>
                        {market.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {formatCurrency(market.totalVolume)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(market.endDate)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {market.status === 'active' && new Date(market.endDate) < new Date() ? (
                        <button
                          onClick={() => setSelectedMarket(market)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                        >
                          Resolve
                        </button>
                      ) : market.status === 'resolved' ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No markets found</p>
        </div>
      )}

      {/* Resolution Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Resolve Market
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedMarket.title}
              </p>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select the winning outcome:
                </p>
                {selectedMarket.outcomes.map((outcome) => (
                  <button
                    key={outcome.id}
                    onClick={() => resolveMarket(selectedMarket._id, outcome.id)}
                    disabled={resolvingMarketId === selectedMarket._id}
                    className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {outcome.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {outcome.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {(outcome.price * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {outcome.shares.toFixed(0)} shares
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedMarket(null)}
                  disabled={resolvingMarketId === selectedMarket._id}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsAdmin;

