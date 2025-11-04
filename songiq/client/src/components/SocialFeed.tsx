import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  MessageCircle, 
  Trophy, 
  Plus,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

interface SocialActivity {
  type: 'trade' | 'market_created' | 'comment' | 'achievement';
  user: {
    _id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  data: any;
  timestamp: string;
}

const SocialFeed: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFeed();

      // Auto-refresh every 15 seconds if enabled
      if (autoRefresh) {
        const interval = setInterval(fetchFeed, 15000);
        return () => clearInterval(interval);
      }
    }
  }, [isAuthenticated, token, autoRefresh]);

  const fetchFeed = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/social/feed?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch feed');

      const data = await response.json();
      setActivities(data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching social feed:', error);
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: any) => {
    if (!user) return 'Unknown';
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.username || 'User';
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'market_created':
        return <Plus className="w-5 h-5 text-green-600" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-600" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderActivity = (activity: SocialActivity) => {
    const displayName = getUserDisplayName(activity.user);
    
    switch (activity.type) {
      case 'trade':
        return (
          <div>
            <button
              onClick={() => navigate(`/profile/${activity.user._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {displayName}
            </button>
            {' '}
            <span className={activity.data.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
              {activity.data.type === 'buy' ? 'bought' : 'sold'}
            </span>
            {' '}
            <span className="font-semibold">{activity.data.shares.toFixed(0)} shares</span>
            {' '}in{' '}
            <button
              onClick={() => navigate(`/markets/${activity.data.marketId._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {activity.data.marketId?.title}
            </button>
          </div>
        );

      case 'market_created':
        return (
          <div>
            <button
              onClick={() => navigate(`/profile/${activity.user._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {displayName}
            </button>
            {' '}created a new market:{' '}
            <button
              onClick={() => navigate(`/markets/${activity.data._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {activity.data.title}
            </button>
          </div>
        );

      case 'comment':
        return (
          <div>
            <button
              onClick={() => navigate(`/profile/${activity.user._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {displayName}
            </button>
            {' '}commented on{' '}
            <button
              onClick={() => navigate(`/markets/${activity.data.marketId?._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {activity.data.marketId?.title || 'a market'}
            </button>
            {activity.data.content && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                "{activity.data.content.substring(0, 100)}{activity.data.content.length > 100 ? '...' : ''}"
              </p>
            )}
          </div>
        );

      case 'achievement':
        return (
          <div>
            <button
              onClick={() => navigate(`/profile/${activity.user._id}`)}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              {displayName}
            </button>
            {' '}unlocked achievement:{' '}
            <span className="font-semibold">
              {activity.data.icon} {activity.data.title}
            </span>
            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
              activity.data.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
              activity.data.rarity === 'epic' ? 'bg-blue-100 text-blue-800' :
              activity.data.rarity === 'rare' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {activity.data.rarity}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
        <UserPlus className="w-12 h-12 text-blue-500 mx-auto mb-3" />
        <p className="text-blue-800 dark:text-blue-200 mb-3">
          Follow users to see their activity in your social feed!
        </p>
        <button
          onClick={() => navigate('/auth?mode=login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Social Feed
        </h3>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={fetchFeed}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {renderActivity(activity)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">Your social feed is empty</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
            Follow other traders to see their activity here
          </p>
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Discover Traders
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;

