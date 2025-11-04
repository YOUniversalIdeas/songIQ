import React from 'react';
import { TrendingUp, Star } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  xp: number;
  tier: string;
  size?: 'sm' | 'md' | 'lg';
}

const LevelProgress: React.FC<LevelProgressProps> = ({ level, xp, tier, size = 'md' }) => {
  const XP_PER_LEVEL = 100;
  const XP_MULTIPLIER = 1.5;
  
  const xpForNext = Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
  const progress = (xp / xpForNext) * 100;

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'from-amber-700 to-amber-500',
      silver: 'from-gray-400 to-gray-200',
      gold: 'from-yellow-500 to-yellow-300',
      platinum: 'from-gray-300 to-blue-100',
      diamond: 'from-blue-400 to-cyan-300',
      legend: 'from-purple-500 to-pink-500'
    };
    return colors[tier] || colors.bronze;
  };

  const sizes = {
    sm: { container: 'p-3', text: 'text-sm', level: 'text-2xl', bar: 'h-2' },
    md: { container: 'p-4', text: 'text-base', level: 'text-3xl', bar: 'h-3' },
    lg: { container: 'p-6', text: 'text-lg', level: 'text-4xl', bar: 'h-4' }
  };

  const s = sizes[size];

  return (
    <div className={`bg-gradient-to-br ${getTierColor(tier)} rounded-lg ${s.container} text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Star className="w-6 h-6 fill-current" />
          <div>
            <div className={`font-bold ${s.text}`}>{tier.toUpperCase()}</div>
            <div className={`opacity-90 ${s.text}`}>Level {level}</div>
          </div>
        </div>
        <div className={`font-bold ${s.level}`}>{level}</div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs opacity-90 mb-1">
          <span>XP Progress</span>
          <span>{xp} / {xpForNext}</span>
        </div>
        <div className={`w-full bg-black/20 rounded-full ${s.bar}`}>
          <div
            className={`bg-white rounded-full ${s.bar} transition-all shadow-lg`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs opacity-75">
        <div className="flex items-center">
          <TrendingUp className="w-3 h-3 mr-1" />
          <span>{Math.floor(progress)}% to next level</span>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;

