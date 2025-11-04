import React, { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle, Zap } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  requirement: {
    action: string;
    count: number;
  };
  rewards: {
    xp: number;
    coins?: number;
    badge?: string;
  };
  endDate: string;
  userProgress: number;
  isCompleted: boolean;
}

const Challenges: React.FC = () => {
  const { token } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchChallenges();
    }
  }, [token, filter]);

  const fetchChallenges = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/gamification/challenges?type=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch challenges');

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500 text-white';
      case 'weekly':
        return 'bg-purple-500 text-white';
      case 'monthly':
        return 'bg-orange-500 text-white';
      case 'special':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Target className="w-7 h-7 mr-2 text-primary-600" />
          Challenges
        </h3>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {['all', 'daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {challenges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((challenge) => {
            const progress = (challenge.userProgress / challenge.requirement.count) * 100;

            return (
              <div
                key={challenge._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
              >
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(challenge.type)}`}>
                    {challenge.type.toUpperCase()}
                  </span>
                  {challenge.isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-500 fill-current" />
                  )}
                </div>

                {/* Title & Description */}
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {challenge.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">
                      {challenge.userProgress} / {challenge.requirement.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        challenge.isCompleted ? 'bg-green-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm">
                      <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-bold text-gray-900 dark:text-white">
                        {challenge.rewards.xp} XP
                      </span>
                    </div>
                    {challenge.rewards.coins && (
                      <div className="flex items-center text-sm">
                        <span className="text-yellow-500 mr-1">🪙</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {challenge.rewards.coins}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {getTimeRemaining(challenge.endDate)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No {filter !== 'all' ? filter : ''} challenges available</p>
        </div>
      )}
    </div>
  );
};

export default Challenges;

