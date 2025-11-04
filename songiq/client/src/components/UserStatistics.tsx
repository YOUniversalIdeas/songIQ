import React from 'react';
import { TrendingUp, Trophy, BarChart3, MessageCircle, Users, Star } from 'lucide-react';

interface UserStatisticsProps {
  statistics: {
    totalPnL: number;
    totalInvested: number;
    roi: number;
    activePositions: number;
    totalTrades: number;
    marketsCreated: number;
    comments: number;
    winRate: number;
    winningPositions: number;
    totalClosedPositions: number;
  };
  social: {
    followersCount: number;
    followingCount: number;
    reputationScore: number;
  };
  compact?: boolean;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({ 
  statistics, 
  social,
  compact = false 
}) => {
  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
    return value >= 0 ? formatted : `-${formatted}`;
  };

  const getReputationColor = (score: number) => {
    if (score >= 90) return 'text-purple-600 dark:text-purple-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-green-600 dark:text-green-400';
    if (score >= 25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="P&L"
          value={formatCurrency(statistics.totalPnL)}
          color={statistics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <StatCard
          icon={<Trophy className="w-4 h-4" />}
          label="Win Rate"
          value={`${statistics.winRate.toFixed(1)}%`}
          color="text-blue-600"
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4" />}
          label="Trades"
          value={statistics.totalTrades.toString()}
          color="text-gray-600"
        />
        <StatCard
          icon={<Star className="w-4 h-4" />}
          label="Reputation"
          value={social.reputationScore.toString()}
          color={getReputationColor(social.reputationScore)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L</span>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-xl font-bold ${
            statistics.totalPnL >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(statistics.totalPnL)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-xl font-bold ${
            statistics.roi >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {statistics.roi >= 0 ? '+' : ''}{statistics.roi.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
            <Trophy className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {statistics.winRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Reputation</span>
            <Star className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`text-xl font-bold ${getReputationColor(social.reputationScore)}`}>
            {social.reputationScore}
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trades</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statistics.totalTrades}
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Markets</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statistics.marketsCreated}
              </div>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {statistics.comments}
              </div>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {social.followersCount}
              </div>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for compact stats
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}> = ({ icon, label, value, color = 'text-gray-900 dark:text-white' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center space-x-2 mb-1">
      {icon}
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <div className={`text-lg font-bold ${color}`}>{value}</div>
  </div>
);

export default UserStatistics;

