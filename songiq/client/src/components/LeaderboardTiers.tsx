import React, { useState, useEffect } from 'react';
import { Crown, Trophy, Award, Medal, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  level: number;
  xp: number;
  tier: string;
}

const LeaderboardTiers: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTier]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/gamification/leaderboard?tier=${selectedTier}&limit=20`
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

  const tiers = [
    { name: 'All', value: 'all', color: 'gray', icon: Trophy },
    { name: 'Bronze', value: 'bronze', color: 'amber', icon: Medal },
    { name: 'Silver', value: 'silver', color: 'gray', icon: Award },
    { name: 'Gold', value: 'gold', color: 'yellow', icon: Star },
    { name: 'Platinum', value: 'platinum', color: 'blue', icon: Sparkles },
    { name: 'Diamond', value: 'diamond', color: 'cyan', icon: Sparkles },
    { name: 'Legend', value: 'legend', color: 'purple', icon: Crown }
  ];

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'text-amber-600 bg-amber-50 border-amber-200',
      silver: 'text-gray-600 bg-gray-50 border-gray-200',
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      platinum: 'text-blue-600 bg-blue-50 border-blue-200',
      diamond: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      legend: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[tier] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getUserDisplayName = (entry: LeaderboardEntry) => {
    if (entry.firstName || entry.lastName) {
      return `${entry.firstName || ''} ${entry.lastName || ''}`.trim();
    }
    return entry.username || 'User';
  };

  return (
    <div className="space-y-4">
      {/* Tier Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <button
              key={tier.value}
              onClick={() => setSelectedTier(tier.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedTier === tier.value
                  ? `bg-${tier.color}-600 text-white shadow-lg`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tier.name}</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              onClick={() => navigate(`/profile/${entry.userId}`)}
              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              {/* Rank & User */}
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                  entry.rank === 1 ? 'bg-yellow-400 text-white text-lg' :
                  entry.rank === 2 ? 'bg-gray-300 text-gray-700 text-lg' :
                  entry.rank === 3 ? 'bg-amber-600 text-white text-lg' :
                  'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {entry.rank === 1 ? '🏆' :
                   entry.rank === 2 ? '🥈' :
                   entry.rank === 3 ? '🥉' :
                   entry.rank}
                </div>

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {getUserDisplayName(entry)}
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getTierColor(entry.tier)}`}>
                      {entry.tier.toUpperCase()}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">Level {entry.level}</span>
                  </div>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">
                  {entry.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No users in this tier yet</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardTiers;

