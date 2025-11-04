import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Plus,
  CheckCircle,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface ActivityItem {
  type: 'trade' | 'market_created' | 'market_resolved';
  data: any;
  timestamp: string;
}

interface ActivityFeedProps {
  limit?: number;
  type?: 'all' | 'trades' | 'markets' | 'resolutions';
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  limit = 20, 
  type = 'all',
  className = ''
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Auto-refresh every 10 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [limit, type, autoRefresh]);

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/markets/meta/activity?limit=${limit}&type=${type}`
      );

      if (!response.ok) throw new Error('Failed to fetch activity feed');

      const data = await response.json();
      setActivities(data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  const getUserDisplayName = (userData: any) => {
    if (!userData) return 'Unknown';
    if (userData.firstName || userData.lastName) {
      return `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
    }
    return userData.username || userData.email?.split('@')[0] || 'Unknown';
  };

  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'trade':
        return (
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        );
      case 'market_created':
        return (
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
        );
      case 'market_resolved':
        return (
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
        );
    }
  };

  const renderActivityContent = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'trade':
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{getUserDisplayName(activity.data.userId)}</span>
              {' '}
              <span className={activity.data.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
                {activity.data.type === 'buy' ? 'bought' : 'sold'}
              </span>
              {' '}
              <span className="font-semibold">{activity.data.shares.toFixed(0)} shares</span>
              {' '}in{' '}
              <span className="font-medium text-primary-600">
                {activity.data.marketId?.title || 'Unknown Market'}
              </span>
            </p>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                {formatCurrency(activity.data.totalCost)}
              </span>
              <span>{formatRelativeTime(activity.timestamp)}</span>
            </div>
          </div>
        );

      case 'market_created':
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{getUserDisplayName(activity.data.creatorId)}</span>
              {' '}created a new market:{' '}
              <span className="font-medium text-primary-600">{activity.data.title}</span>
            </p>
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                {activity.data.category}
              </span>
              <span>{activity.data.outcomes?.length || 0} outcomes</span>
              <span>{formatRelativeTime(activity.timestamp)}</span>
            </div>
          </div>
        );

      case 'market_resolved':
        const resolvedOutcome = activity.data.outcomes?.find(
          (o: any) => o.id === activity.data.resolvedOutcomeId
        );
        return (
          <div>
            <p className="text-sm text-gray-900 dark:text-white">
              Market resolved:{' '}
              <span className="font-medium text-primary-600">{activity.data.title}</span>
            </p>
            {resolvedOutcome && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                ✓ Winner: <span className="font-semibold">{resolvedOutcome.name}</span>
              </p>
            )}
            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <DollarSign className="w-3 h-3 mr-1" />
                {formatCurrency(activity.data.totalVolume)} volume
              </span>
              <span>{formatRelativeTime(activity.timestamp)}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Recent Activity
        </h3>
        <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span>Auto-refresh</span>
        </label>
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity, index) => (
            <div
              key={`${activity.type}-${index}`}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getActivityIcon(activity)}</div>
                <div className="flex-1 min-w-0">{renderActivityContent(activity)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;

