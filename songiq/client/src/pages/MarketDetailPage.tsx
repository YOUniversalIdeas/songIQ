import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../components/AuthProvider';
import TradingInterface from '../components/TradingInterface';
import MarketComments from '../components/MarketComments';
import PriceHistoryChart from '../components/PriceHistoryChart';
import ActivityFeed from '../components/ActivityFeed';
import LimitOrdersPanel from '../components/LimitOrdersPanel';

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

const MarketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trade' | 'chart' | 'orders' | 'discussion'>('trade');

  useEffect(() => {
    if (id) {
      fetchMarketDetails();
      if (isAuthenticated) {
        fetchUserPositions();
      }
    }
  }, [id, isAuthenticated]);

  const fetchMarketDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/markets/${id}`);
      
      if (!response.ok) throw new Error('Market not found');
      
      const data = await response.json();
      setMarket(data.market);
    } catch (err: any) {
      setError(err.message || 'Failed to load market');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPositions = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/user/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const marketPositions = data.positions.filter(
          (p: any) => p.marketId._id === id || p.marketId === id
        );
        setUserPositions(marketPositions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleTrade = async (outcomeId: string, type: 'buy' | 'sell', shares: number) => {
    if (!token) {
      alert('Please sign in to trade');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/markets/${id}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ outcomeId, type, shares }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Trade failed');
      }

      // Refresh market data
      await fetchMarketDetails();
      await fetchUserPositions();
    } catch (error: any) {
      throw new Error(error.message || 'Trade failed');
    }
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
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Market Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'This market does not exist'}</p>
          <button
            onClick={() => navigate('/markets')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </button>

        {/* Market Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{market.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(market.status)}`}>
                  {market.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{market.description}</p>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">Total Volume</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(market.totalVolume)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-sm">Liquidity</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(market.totalLiquidity)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">End Date</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(market.endDate)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Outcomes</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {market.outcomes.length}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'trade', label: 'Trade', icon: TrendingUp },
                { id: 'chart', label: 'Price Chart', icon: TrendingUp },
                { id: 'orders', label: 'Limit Orders', icon: Clock },
                { id: 'discussion', label: 'Discussion', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'text-primary-600 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                        : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'trade' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Market Outcomes */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Market Outcomes
                    </h3>
                    {market.outcomes.map((outcome, index) => (
                      <div
                        key={outcome.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-transparent hover:border-primary-500 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {outcome.name}
                            </h4>
                            {outcome.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {outcome.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-primary-600">
                              {(outcome.price * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(outcome.totalVolume)} volume
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trading Panel */}
                <div>
                  {market.status === 'active' ? (
                    <TradingInterface
                      outcomes={market.outcomes}
                      marketId={market._id}
                      onTrade={handleTrade}
                      userPosition={userPositions.map(p => ({
                        outcomeId: p.outcomeId,
                        shares: p.shares,
                        averageCost: p.averageCost,
                      }))}
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        This market is {market.status}
                      </p>
                      {market.status === 'resolved' && market.resolvedOutcomeId && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Winner: {market.outcomes.find(o => o.id === market.resolvedOutcomeId)?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'chart' && (
              <PriceHistoryChart marketId={market._id} outcomes={market.outcomes} />
            )}

            {activeTab === 'orders' && (
              <LimitOrdersPanel 
                marketId={market._id} 
                outcomes={market.outcomes}
                onOrderPlaced={() => {
                  fetchMarketDetails();
                  fetchUserPositions();
                }}
              />
            )}

            {activeTab === 'discussion' && (
              <MarketComments marketId={market._id} />
            )}
          </div>
        </div>

        {/* Sidebar - Activity Feed */}
        <div className="mt-6">
          <ActivityFeed limit={10} type="trades" />
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;

