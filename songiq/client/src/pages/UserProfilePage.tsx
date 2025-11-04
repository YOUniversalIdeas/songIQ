import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Users,
  MessageCircle,
  BarChart3,
  Calendar,
  Star,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../components/AuthProvider';
import AchievementBadges from '../components/AchievementBadges';
import FollowButton from '../components/FollowButton';

interface UserProfile {
  user: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
    createdAt: string;
  };
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
    isFollowing: boolean;
    reputationScore: number;
  };
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    icon: string;
    rarity: string;
    unlockedAt: string;
  }>;
  recentActivity: any[];
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/social/profile/${userId}`);
      
      if (!response.ok) throw new Error('User not found');
      
      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(value));
    return value >= 0 ? formatted : `-${formatted}`;
  };

  const getUserDisplayName = () => {
    if (!profile) return 'User';
    if (profile.user.firstName || profile.user.lastName) {
      return `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim();
    }
    return profile.user.username || profile.user.email.split('@')[0];
  };

  const getReputationLevel = (score: number) => {
    if (score >= 90) return { label: 'Legendary', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 75) return { label: 'Expert', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50) return { label: 'Advanced', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 25) return { label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Novice', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'This user does not exist'}</p>
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

  const isOwnProfile = currentUser?.id === userId;
  const reputationLevel = getReputationLevel(profile.social.reputationScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {getUserDisplayName()}
                </h1>
                {profile.user.username && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile.user.username}</p>
                )}
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${reputationLevel.bg} ${reputationLevel.color}`}>
                    {reputationLevel.label} • {profile.social.reputationScore} Rep
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Joined {formatDate(profile.user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
              <FollowButton
                userId={userId!}
                initialFollowing={profile.social.isFollowing}
                onFollowChange={fetchProfile}
              />
            )}
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.social.followersCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.social.followingCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.statistics.totalTrades}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Trades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.achievements.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'activity', label: 'Recent Activity', icon: Activity },
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
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Trading Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Trading Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total P&L</span>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className={`text-2xl font-bold ${
                        profile.statistics.totalPnL >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(profile.statistics.totalPnL)}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className={`text-2xl font-bold ${
                        profile.statistics.roi >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {profile.statistics.roi >= 0 ? '+' : ''}{profile.statistics.roi.toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Win Rate</span>
                        <Trophy className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.statistics.winRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {profile.statistics.winningPositions}/{profile.statistics.totalClosedPositions} wins
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Positions</span>
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.statistics.activePositions}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Activity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Trades</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.statistics.totalTrades}
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-blue-500" />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Markets Created</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.statistics.marketsCreated}
                        </div>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-500" />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {profile.statistics.comments}
                        </div>
                      </div>
                      <MessageCircle className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Investment Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Investment Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invested</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(profile.statistics.totalInvested)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Value</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(profile.statistics.totalInvested + profile.statistics.totalPnL)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <AchievementBadges achievements={profile.achievements} />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Trades</h3>
                {profile.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {profile.recentActivity.map((trade, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {trade.marketId?.title || 'Unknown Market'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.shares.toFixed(0)} shares
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${
                              trade.type === 'buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(trade.totalCost)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(trade.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

