import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Plus,
  AlertCircle,
  Flag,
  Ban,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Eye,
  AlertTriangle
} from 'lucide-react';
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
  flagged?: boolean;
  flagReason?: string;
  suspensionReason?: string;
}

interface MarketAnalytics {
  totalTrades: number;
  totalParticipants: number;
  activePositions: number;
  volumeByOutcome: Array<{
    outcomeId: string;
    name: string;
    volume: number;
    shares: number;
    price: number;
  }>;
}

const EnhancedMarketsAdmin: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlagged, setShowFlagged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketAnalytics, setMarketAnalytics] = useState<MarketAnalytics | null>(null);
  const [actionModal, setActionModal] = useState<{
    type: 'resolve' | 'suspend' | 'flag' | 'delete' | 'details' | null;
    market: Market | null;
  }>({ type: null, market: null });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, [filter, showFlagged]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('status', filter);
      if (showFlagged) params.append('flagged', 'true');
      params.append('limit', '100');

      const response = await fetch(`${API_BASE_URL}/api/admin/markets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch markets');

      const data = await response.json();
      setMarkets(data.data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
      showMessage('error', 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketDetails = async (marketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch market details');

      const data = await response.json();
      setSelectedMarket(data.data.market);
      setMarketAnalytics(data.data.analytics);
    } catch (error) {
      console.error('Error fetching market details:', error);
      showMessage('error', 'Failed to load market details');
    }
  };

  const suspendMarket = async (marketId: string, suspend: boolean, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suspend, reason }),
      });

      if (!response.ok) throw new Error('Failed to update market');

      const data = await response.json();
      showMessage('success', data.message);
      setActionModal({ type: null, market: null });
      await fetchMarkets();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update market');
    }
  };

  const flagMarket = async (marketId: string, flagged: boolean, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flagged, reason }),
      });

      if (!response.ok) throw new Error('Failed to flag market');

      const data = await response.json();
      showMessage('success', data.message);
      setActionModal({ type: null, market: null });
      await fetchMarkets();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to flag market');
    }
  };

  const deleteMarket = async (marketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete market');
      }

      showMessage('success', 'Market deleted successfully');
      setActionModal({ type: null, market: null });
      await fetchMarkets();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete market');
    }
  };

  const forceResolveMarket = async (marketId: string, outcomeId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}/force-resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ outcomeId, reason }),
      });

      if (!response.ok) throw new Error('Failed to resolve market');

      const data = await response.json();
      showMessage('success', `${data.message} (${data.data.winnersCount} winners paid out)`);
      setActionModal({ type: null, market: null });
      await fetchMarkets();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to resolve market');
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

  const filteredMarkets = markets.filter(market =>
    market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    market.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Markets Administration
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive market management and moderation
          </p>
        </div>
        <button
          onClick={() => (window.location.href = '/markets/create')}
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Markets</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {markets.length}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {markets.filter((m) => m.status === 'active').length}
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
                {markets.filter((m) => m.status === 'resolved').length}
              </div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flagged</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {markets.filter((m) => m.flagged).length}
              </div>
            </div>
            <Flag className="w-8 h-8 text-orange-400" />
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

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
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
            <button
              onClick={() => setShowFlagged(!showFlagged)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                showFlagged
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Flag className="w-4 h-4 mr-2" />
              Flagged Only
            </button>
          </div>
        </div>
      </div>

      {/* Markets Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredMarkets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Creator
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
                {filteredMarkets.map((market) => (
                  <tr key={market._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {market.title}
                          </div>
                          {market.flagged && (
                            <Flag className="w-4 h-4 ml-2 text-orange-500" title={market.flagReason} />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {market.outcomes.length} outcomes • {market.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {market.creatorId?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          market.status
                        )}`}
                      >
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            fetchMarketDetails(market._id);
                            setActionModal({ type: 'details', market });
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'flag', market })}
                          className={`${
                            market.flagged
                              ? 'text-orange-600 hover:text-orange-800'
                              : 'text-gray-600 hover:text-gray-800'
                          } dark:hover:text-gray-300`}
                          title={market.flagged ? 'Unflag' : 'Flag'}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                        {market.status === 'active' && (
                          <button
                            onClick={() => setActionModal({ type: 'suspend', market })}
                            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                            title="Suspend"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        {(market.status === 'active' || market.status === 'closed') && (
                          <button
                            onClick={() => setActionModal({ type: 'resolve', market })}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Force Resolve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setActionModal({ type: 'delete', market })}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Action Modals */}
      {actionModal.type && actionModal.market && (
        <ActionModal
          type={actionModal.type}
          market={actionModal.market}
          analytics={marketAnalytics}
          onClose={() => {
            setActionModal({ type: null, market: null });
            setMarketAnalytics(null);
          }}
          onSuspend={suspendMarket}
          onFlag={flagMarket}
          onDelete={deleteMarket}
          onResolve={forceResolveMarket}
        />
      )}
    </div>
  );
};

// Action Modal Component
interface ActionModalProps {
  type: 'resolve' | 'suspend' | 'flag' | 'delete' | 'details';
  market: Market;
  analytics: MarketAnalytics | null;
  onClose: () => void;
  onSuspend: (marketId: string, suspend: boolean, reason: string) => void;
  onFlag: (marketId: string, flagged: boolean, reason: string) => void;
  onDelete: (marketId: string) => void;
  onResolve: (marketId: string, outcomeId: string, reason: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  type,
  market,
  analytics,
  onClose,
  onSuspend,
  onFlag,
  onDelete,
  onResolve,
}) => {
  const [reason, setReason] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');

  const handleSubmit = () => {
    switch (type) {
      case 'suspend':
        onSuspend(market._id, true, reason);
        break;
      case 'flag':
        onFlag(market._id, !market.flagged, reason);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this market? This action cannot be undone.')) {
          onDelete(market._id);
        }
        break;
      case 'resolve':
        if (selectedOutcome) {
          onResolve(market._id, selectedOutcome, reason);
        }
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {type === 'details' && 'Market Details'}
            {type === 'resolve' && 'Force Resolve Market'}
            {type === 'suspend' && 'Suspend Market'}
            {type === 'flag' && (market.flagged ? 'Unflag Market' : 'Flag Market')}
            {type === 'delete' && 'Delete Market'}
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Title:</p>
              <p className="text-gray-900 dark:text-gray-100">{market.title}</p>
            </div>

            {type === 'details' && analytics && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.totalTrades}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Participants</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.totalParticipants}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Positions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {analytics.activePositions}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(market.totalVolume)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Outcomes Performance:
                  </p>
                  {analytics.volumeByOutcome.map((outcome) => (
                    <div
                      key={outcome.outcomeId}
                      className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{outcome.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary-600">
                          {(outcome.price * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">{formatCurrency(outcome.volume)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {type === 'resolve' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Winning Outcome:
                  </label>
                  <div className="space-y-2">
                    {market.outcomes.map((outcome) => (
                      <button
                        key={outcome.id}
                        onClick={() => setSelectedOutcome(outcome.id)}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedOutcome === outcome.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {outcome.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {outcome.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {(outcome.price * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">{outcome.shares.toFixed(0)} shares</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (optional):
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Explain why this market is being force resolved..."
                  />
                </div>
              </>
            )}

            {(type === 'suspend' || type === 'flag') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder={`Explain why this market is being ${type === 'suspend' ? 'suspended' : 'flagged'}...`}
                  required
                />
              </div>
            )}

            {type === 'delete' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    Warning: This action cannot be undone. The market and all associated data will be permanently
                    deleted.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            {type !== 'details' && (
              <button
                onClick={handleSubmit}
                disabled={type === 'resolve' && !selectedOutcome}
                className={`px-4 py-2 rounded-lg text-white ${
                  type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : type === 'suspend'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {type === 'resolve' && 'Resolve Market'}
                {type === 'suspend' && 'Suspend Market'}
                {type === 'flag' && (market.flagged ? 'Remove Flag' : 'Flag Market')}
                {type === 'delete' && 'Delete Market'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMarketsAdmin;

