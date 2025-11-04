import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Filter, Search } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../components/AuthProvider';
import MarketCard from '../components/MarketCard';
import Leaderboard from '../components/Leaderboard';
import ActivityFeed from '../components/ActivityFeed';

interface Market {
  _id: string;
  title: string;
  description: string;
  category: string;
  outcomes: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  endDate: string;
  status: string;
  totalVolume: number;
}

const MarketsHub: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchMarkets();
  }, [statusFilter]);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50');

      const response = await fetch(`${API_BASE_URL}/api/markets?${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch markets');
      
      const data = await response.json();
      setMarkets(data.markets || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🌐' },
    { id: 'chart_position', name: 'Chart Position', icon: '📊' },
    { id: 'streaming_numbers', name: 'Streaming Numbers', icon: '🎵' },
    { id: 'awards', name: 'Awards', icon: '🏆' },
    { id: 'genre_trend', name: 'Genre Trends', icon: '📈' },
    { id: 'artist_popularity', name: 'Artist Popularity', icon: '⭐' },
    { id: 'release_success', name: 'Release Success', icon: '🚀' },
    { id: 'other', name: 'Other', icon: '💡' },
  ];

  const filteredMarkets = markets.filter((market) => {
    const matchesCategory = categoryFilter === 'all' || market.category === categoryFilter;
    const matchesSearch = 
      market.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prediction Markets</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Trade on the future of music
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => navigate('/markets/create')}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Market
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Markets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search markets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setCategoryFilter(category.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        categoryFilter === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex space-x-2">
                  {['active', 'resolved', 'all'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Markets Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredMarkets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredMarkets.map((market) => (
                  <MarketCard
                    key={market._id}
                    market={market}
                    onClick={() => navigate(`/markets/${market._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No markets found</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <Leaderboard />
            </div>

            {/* Activity Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <ActivityFeed limit={10} type="all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsHub;

