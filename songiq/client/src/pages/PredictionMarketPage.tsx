import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  BarChart3,
  AlertCircle,
  ArrowLeft,
  Activity,
  PieChart
} from 'lucide-react';
import TradingInterface from '../components/TradingInterface';
import { API_BASE_URL } from '../config/api';

interface Outcome {
  id: string;
  name: string;
  description: string;
  shares: number;
  price: number;
  totalVolume: number;
}

interface Market {
  _id: string;
  title: string;
  description: string;
  category: string;
  outcomes: Outcome[];
  endDate: string;
  status: string;
  totalVolume: number;
  totalLiquidity: number;
  creatorId: any;
  relatedSongId?: any;
}

interface Trade {
  _id: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  totalCost: number;
  createdAt: string;
  userId: any;
}

interface Position {
  outcomeId: string;
  shares: number;
  averageCost: number;
  currentValue: number;
  unrealizedPnL: number;
}

const PredictionMarketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [market, setMarket] = useState<Market | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [userPositions, setUserPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchMarketDetails();
      fetchUserPositions();
    }
  }, [id]);

  const fetchMarketDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/markets/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Failed to fetch market');

      const data = await response.json();
      setMarket(data.market);
      setRecentTrades(data.recentTrades || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPositions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/markets/user/positions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const marketPositions = data.positions.filter((p: any) => p.marketId._id === id);
      setUserPositions(marketPositions);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    }
  };

  const handleTrade = async (outcomeId: string, type: 'buy' | 'sell', shares: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login to trade');
    }

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

    // Refresh data after successful trade
    await fetchMarketDetails();
    await fetchUserPositions();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = () => {
    if (!market) return '';
    const now = new Date();
    const end = new Date(market.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Market has ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                Error Loading Market
              </h3>
              <p className="text-red-700 dark:text-red-300">{error || 'Market not found'}</p>
            </div>
          </div>
          <Link
            to="/markets"
            className="mt-4 inline-flex items-center text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const sortedOutcomes = [...market.outcomes].sort((a, b) => b.price - a.price);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/markets"
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Markets
      </Link>

      {/* Market Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {market.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {market.description}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            market.status === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
          }`}>
            {market.status.toUpperCase()}
          </span>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Time Remaining</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {getTimeRemaining()}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="text-sm">Total Volume</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(market.totalVolume)}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="text-sm">Liquidity</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(market.totalLiquidity)}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <PieChart className="w-4 h-4 mr-2" />
              <span className="text-sm">Outcomes</span>
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {market.outcomes.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcomes & Trading */}
        <div className="lg:col-span-2 space-y-6">
          {/* Outcomes List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Outcomes
            </h2>
            <div className="space-y-4">
              {sortedOutcomes.map((outcome, index) => (
                <div
                  key={outcome.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-600 mr-3">
                          #{index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {outcome.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {outcome.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatPercentage(outcome.price)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${outcome.price.toFixed(2)}/share
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${outcome.price * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      Volume: {formatCurrency(outcome.totalVolume)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Shares: {outcome.shares.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Trades
            </h2>
            {recentTrades.length > 0 ? (
              <div className="space-y-2">
                {recentTrades.slice(0, 10).map((trade) => {
                  const outcome = market.outcomes.find(o => o.id === (trade as any).outcomeId);
                  return (
                    <div
                      key={trade._id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.type === 'buy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {outcome?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(trade.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {trade.shares.toFixed(2)} shares
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          @ {formatCurrency(trade.price)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No trades yet. Be the first to trade!
              </p>
            )}
          </div>
        </div>

        {/* Trading Interface */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <TradingInterface
              outcomes={market.outcomes}
              marketId={market._id}
              onTrade={handleTrade}
              userPosition={userPositions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionMarketPage;

