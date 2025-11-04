import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';

interface StreakDisplayProps {
  loginStreak: number;
  tradingStreak: number;
  longestStreak?: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ 
  loginStreak, 
  tradingStreak,
  longestStreak 
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-500';
    if (streak >= 14) return 'text-orange-500';
    if (streak >= 7) return 'text-yellow-500';
    if (streak >= 3) return 'text-blue-500';
    return 'text-gray-500';
  };

  const getStreakSize = (streak: number) => {
    if (streak >= 30) return 'w-12 h-12';
    if (streak >= 14) return 'w-10 h-10';
    if (streak >= 7) return 'w-8 h-8';
    return 'w-6 h-6';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Login Streak */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Login Streak</div>
            <div className={`text-3xl font-bold ${getStreakColor(loginStreak)}`}>
              {loginStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">consecutive days</div>
          </div>
          <Flame className={`${getStreakSize(loginStreak)} ${getStreakColor(loginStreak)}`} />
        </div>
      </div>

      {/* Trading Streak */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trading Streak</div>
            <div className={`text-3xl font-bold ${getStreakColor(tradingStreak)}`}>
              {tradingStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">consecutive days</div>
          </div>
          <Zap className={`${getStreakSize(tradingStreak)} ${getStreakColor(tradingStreak)}`} />
        </div>
      </div>

      {/* Longest Streak */}
      {longestStreak !== undefined && (
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90 mb-1">Best Streak</div>
              <div className="text-3xl font-bold">{longestStreak}</div>
              <div className="text-xs opacity-75 mt-1">personal record</div>
            </div>
            <Trophy className="w-10 h-10" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakDisplay;

