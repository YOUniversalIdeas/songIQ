import React from 'react';
import { Trophy, Lock } from 'lucide-react';

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  showLocked?: boolean;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  achievements,
  showLocked = false 
}) => {
  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          border: 'border-purple-300',
          text: 'text-white',
          glow: 'shadow-lg shadow-purple-500/50'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-purple-500',
          border: 'border-blue-300',
          text: 'text-white',
          glow: 'shadow-md shadow-blue-500/30'
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-br from-green-400 to-blue-500',
          border: 'border-green-300',
          text: 'text-white',
          glow: 'shadow-sm shadow-green-500/20'
        };
      case 'common':
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
          border: 'border-gray-300',
          text: 'text-white',
          glow: ''
        };
    }
  };

  const getRarityBadge = (rarity: string) => {
    const colors: { [key: string]: string } = {
      legendary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      epic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rare: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      common: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[rarity] || colors.common;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // All possible achievements (for locked display)
  const allAchievements = [
    { type: 'first_trade', title: 'First Trade', icon: '🎯', rarity: 'common' },
    { type: 'profitable_trader', title: 'Profitable Trader', icon: '💰', rarity: 'rare' },
    { type: 'winning_streak_3', title: 'Hot Streak', icon: '🔥', rarity: 'rare' },
    { type: 'winning_streak_5', title: 'Unstoppable', icon: '⚡', rarity: 'epic' },
    { type: 'whale_trader', title: 'Whale Trader', icon: '🐋', rarity: 'epic' },
    { type: 'market_creator', title: 'Market Maker', icon: '🏗️', rarity: 'common' },
    { type: 'commenter', title: 'Conversationalist', icon: '💬', rarity: 'common' },
    { type: 'social_butterfly', title: 'Social Butterfly', icon: '🦋', rarity: 'epic' },
    { type: 'followed_by_10', title: 'Rising Star', icon: '⭐', rarity: 'rare' },
    { type: 'followed_by_100', title: 'Influencer', icon: '👑', rarity: 'legendary' },
    { type: 'leaderboard_top_10', title: 'Top 10', icon: '🏆', rarity: 'epic' },
    { type: 'leaderboard_top_1', title: 'Champion', icon: '👑', rarity: 'legendary' },
    { type: 'diamond_hands', title: 'Diamond Hands', icon: '💎', rarity: 'rare' },
    { type: 'moonshot', title: 'Moonshot', icon: '🚀', rarity: 'legendary' },
    { type: 'diversified', title: 'Diversified', icon: '📊', rarity: 'rare' },
  ];

  const unlockedTypes = new Set(achievements.map(a => a.type));
  const lockedAchievements = showLocked 
    ? allAchievements.filter(a => !unlockedTypes.has(a.type))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Achievements ({achievements.length})
        </h3>
      </div>

      {/* Unlocked Achievements */}
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const style = getRarityStyle(achievement.rarity);
            return (
              <div
                key={index}
                className={`${style.bg} ${style.glow} rounded-lg p-6 border-2 ${style.border} ${style.text} transform hover:scale-105 transition-all`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h4 className="font-bold text-lg mb-2">{achievement.title}</h4>
                  <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadge(achievement.rarity)}`}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatDate(achievement.unlockedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No achievements yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Start trading and engaging to unlock achievements!
          </p>
        </div>
      )}

      {/* Locked Achievements (if shown) */}
      {showLocked && lockedAchievements.length > 0 && (
        <>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <Lock className="w-5 h-5 mr-2 text-gray-400" />
              Locked Achievements
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-300 dark:border-gray-600 opacity-50"
              >
                <div className="text-center">
                  <div className="text-5xl mb-3 grayscale">{achievement.icon}</div>
                  <h4 className="font-bold text-lg mb-2 text-gray-700 dark:text-gray-300">
                    {achievement.title}
                  </h4>
                  <div className="flex items-center justify-center">
                    <Lock className="w-4 h-4 mr-1 text-gray-500" />
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRarityBadge(achievement.rarity)}`}>
                      {achievement.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AchievementBadges;

