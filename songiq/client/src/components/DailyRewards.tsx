import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Calendar, Coins, Star } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

const DailyRewards: React.FC = () => {
  const { token } = useAuth();
  const [claimed, setClaimed] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [nextReward, setNextReward] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchDailyRewardStatus();
    }
  }, [token]);

  const fetchDailyRewardStatus = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setClaimed(!data.canClaimDailyReward);
      setStreak(data.loginStreak || 0);
      setNextReward(data.nextDailyReward);
    } catch (error) {
      console.error('Error fetching daily reward status:', error);
    }
  };

  const claimReward = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/gamification/daily-reward`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim reward');
      }

      const data = await response.json();
      setReward(data.reward);
      setClaimed(true);
      setStreak(data.streak?.currentStreak || 0);
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      alert(error.message || 'Failed to claim daily reward');
    } finally {
      setLoading(false);
    }
  };

  const rewardDays = [
    { day: 1, xp: 10, coins: 10, bonus: false },
    { day: 2, xp: 15, coins: 15, bonus: false },
    { day: 3, xp: 20, coins: 20, bonus: true },
    { day: 4, xp: 25, coins: 25, bonus: false },
    { day: 5, xp: 30, coins: 30, bonus: false },
    { day: 6, xp: 40, coins: 40, bonus: true },
    { day: 7, xp: 100, coins: 100, bonus: true }
  ];

  const currentDay = (streak % 7) + 1;

  return (
    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg p-6 text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Gift className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Daily Reward</h3>
            <p className="text-sm opacity-90">Login every day to earn rewards!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
          <Calendar className="w-5 h-5" />
          <span className="font-bold text-lg">{streak} Day{streak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Reward Days Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {rewardDays.map((day, index) => {
          const isCompleted = index < currentDay - 1;
          const isCurrent = index === currentDay - 1;

          return (
            <div
              key={day.day}
              className={`relative rounded-lg p-3 text-center transition-all ${
                isCompleted
                  ? 'bg-white/30 border-2 border-white'
                  : isCurrent
                  ? 'bg-white/20 border-2 border-yellow-300 scale-110'
                  : 'bg-white/10 border border-white/30'
              }`}
            >
              {isCompleted && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
              <div className="text-xs opacity-75 mb-1">Day {day.day}</div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center text-xs font-bold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {day.xp}
                </div>
                <div className="flex items-center text-xs font-bold">
                  <Coins className="w-3 h-3 mr-1" />
                  {day.coins}
                </div>
              </div>
              {day.bonus && (
                <div className="mt-1 text-xs bg-yellow-300 text-black rounded px-1 py-0.5 font-bold">
                  BONUS
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Claim Button */}
      {!claimed ? (
        <button
          onClick={claimReward}
          disabled={loading}
          className="w-full bg-white text-purple-600 font-bold py-4 rounded-lg hover:bg-yellow-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Claiming...' : '🎁 Claim Today\'s Reward!'}
        </button>
      ) : reward ? (
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-2 animate-pulse" />
          <h4 className="font-bold text-lg mb-2">Reward Claimed!</h4>
          <div className="flex justify-center space-x-6">
            <div>
              <div className="text-2xl font-bold">+{reward.rewards.xp}</div>
              <div className="text-xs opacity-75">XP</div>
            </div>
            <div>
              <div className="text-2xl font-bold">+{reward.rewards.coins}</div>
              <div className="text-xs opacity-75">Coins</div>
            </div>
          </div>
          {reward.rewards.bonus && (
            <div className="mt-2 text-yellow-300 font-bold">🎉 {reward.rewards.bonus}</div>
          )}
        </div>
      ) : (
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <p className="font-medium">Already claimed today!</p>
          <p className="text-sm opacity-75 mt-1">Come back tomorrow for more rewards</p>
        </div>
      )}
    </div>
  );
};

export default DailyRewards;

