import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Stats {
  songsAnalyzed: number;
  predictionAccuracy: number;
  happyArtists: number;
  recentActivity: number;
  totalAnalyses: number;
  averageSuccessScore: number;
  lastUpdated: string;
}

const RealTimeStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/songs/stats');
      if (response.data.success) {
        setStats(response.data.data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh stats every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString() + '+';
  };

  const formatPercentage = (num: number): string => {
    return num.toFixed(0) + '%';
  };

  if (loading && !stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading statistics...</p>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">
        Trusted by Musicians Worldwide
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Songs Analyzed */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatNumber(stats.songsAnalyzed)}
          </div>
          <div className="text-gray-400 text-sm">
            Songs Analyzed
          </div>
          {stats.recentActivity > 0 && (
            <div className="text-green-400 text-xs mt-1">
              +{stats.recentActivity} this month
            </div>
          )}
        </div>

        {/* Prediction Accuracy */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatPercentage(stats.predictionAccuracy)}
          </div>
          <div className="text-gray-400 text-sm">
            Prediction Accuracy
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Based on {stats.totalAnalyses} analyses
          </div>
        </div>

        {/* Happy Artists */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatNumber(stats.happyArtists)}
          </div>
          <div className="text-gray-400 text-sm">
            Happy Artists
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Avg Score: {stats.averageSuccessScore}/100
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-300 mb-1">Recent Activity</div>
          <div className="text-2xl font-bold text-green-400">
            {stats.recentActivity > 0 ? `+${stats.recentActivity}` : '0'}
          </div>
          <div className="text-xs text-gray-500">songs this month</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-300 mb-1">Average Score</div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.averageSuccessScore}/100
          </div>
          <div className="text-xs text-gray-500">success prediction</div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs">
          Last updated: {new Date(stats.lastUpdated).toLocaleString()}
        </p>
        <button 
          onClick={fetchStats}
          className="mt-2 px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default RealTimeStats;
