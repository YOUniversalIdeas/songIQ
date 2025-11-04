import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3 } from 'lucide-react';

interface Outcome {
  id: string;
  name: string;
  description: string;
  shares: number;
  price: number;
  totalVolume: number;
}

interface MarketCardProps {
  market: {
    _id: string;
    title: string;
    description: string;
    category: string;
    outcomes: Outcome[];
    endDate: string;
    status: string;
    totalVolume: number;
  };
  onClick?: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onClick }) => {
  const categoryColors: { [key: string]: string } = {
    chart_position: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    streaming_numbers: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    awards: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    genre_trend: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    artist_popularity: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    release_success: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  const categoryIcons: { [key: string]: string } = {
    chart_position: '📊',
    streaming_numbers: '🎵',
    awards: '🏆',
    genre_trend: '📈',
    artist_popularity: '⭐',
    release_success: '🚀',
    other: '💡',
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

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(market.endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Sort outcomes by price (descending)
  const sortedOutcomes = [...market.outcomes].sort((a, b) => b.price - a.price);
  const topOutcome = sortedOutcomes[0];
  const secondOutcome = sortedOutcomes[1];

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[market.category]}`}>
            {categoryIcons[market.category]} {market.category.replace('_', ' ').toUpperCase()}
          </span>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            {getTimeRemaining()}
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
          {market.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {market.description}
        </p>
      </div>

      {/* Market Stats */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
        {/* Top Two Outcomes */}
        <div className="space-y-3 mb-4">
          {/* Leading Outcome */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {topOutcome.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {formatPercentage(topOutcome.price)}
              </span>
              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${topOutcome.price * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Second Outcome */}
          {secondOutcome && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {secondOutcome.name}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {formatPercentage(secondOutcome.price)}
                </span>
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${secondOutcome.price * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span>Volume</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(market.totalVolume)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-100 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {market.outcomes.length} outcomes
          </span>
          <Link
            to={`/markets/${market._id}`}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            Trade →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;

