import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Medal, Crown, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  totalPnL: number;
  realizedPnL: number;
  totalInvested: number;
  activePositions: number;
  roi: number; // Return on Investment percentage
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/markets/meta/leaderboard?period=${period}&limit=${limit}`
      );

      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
    return value >= 0 ? formatted : `-${formatted}`;
  };

  const getUserDisplayName = (entry: LeaderboardEntry) => {
    if (entry.firstName || entry.lastName) {
      return `${entry.firstName || ''} ${entry.lastName || ''}`.trim();
    }
    return entry.username || entry.email.split('@')[0];
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
            Leaderboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Top performers on the platform</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Time period:</span>
        {[
          { value: 'day', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'all', label: 'All Time' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriod(option.value as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === option.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`rounded-lg p-6 border-2 transition-all hover:shadow-lg ${getRankBadge(
                entry.rank
              )} ${entry.rank <= 3 ? 'border-transparent' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <div className="flex items-center justify-between">
                {/* Left side: Rank and User */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/profile/${entry.userId}`)}
                      className={`text-lg font-semibold hover:underline text-left ${
                        entry.rank <= 3 ? '' : 'text-gray-900 dark:text-white hover:text-primary-600'
                      }`}
                    >
                      {getUserDisplayName(entry)}
                    </button>
                    <p
                      className={`text-sm ${
                        entry.rank <= 3
                          ? entry.rank === 1
                            ? 'text-yellow-100'
                            : entry.rank === 2
                            ? 'text-gray-600'
                            : 'text-amber-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {entry.activePositions} active position{entry.activePositions !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Right side: Stats */}
                <div className="flex items-center space-x-8">
                  {/* Total P&L */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total P&L</p>
                    <p
                      className={`text-xl font-bold flex items-center ${
                        entry.totalPnL >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {entry.totalPnL >= 0 ? (
                        <TrendingUp className="w-5 h-5 mr-1" />
                      ) : (
                        <TrendingDown className="w-5 h-5 mr-1" />
                      )}
                      {formatCurrency(entry.totalPnL)}
                    </p>
                  </div>

                  {/* ROI */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ROI</p>
                    <p
                      className={`text-xl font-bold ${
                        entry.roi >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {entry.roi >= 0 ? '+' : ''}
                      {entry.roi.toFixed(1)}%
                    </p>
                  </div>

                  {/* Total Invested */}
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invested</p>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(entry.totalInvested)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No leaderboard data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Start trading to see your ranking!
          </p>
        </div>
      )}

      {/* Show More Button */}
      {leaderboard.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => setLimit(limit + 10)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

