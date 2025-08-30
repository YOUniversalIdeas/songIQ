import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info } from 'lucide-react';

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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold text-white mb-2">
          Trusted by Musicians Worldwide
        </h2>
        <button
          onMouseEnter={() => setActiveTooltip('overview')}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-blue-400 transition-colors"
        >
          <Info className="h-5 w-5" />
        </button>
        
        {/* Overview Tooltip */}
        {activeTooltip === 'overview' && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 bg-gray-700 text-white p-4 rounded-lg shadow-2xl z-10">
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
            <h4 className="font-semibold mb-2">📊 Platform Statistics Overview</h4>
            <p className="text-sm mb-3">
              Real-time metrics showing how songIQ is helping musicians worldwide. All data is live and updated every 5 minutes.
            </p>
            <div className="text-sm">
              <p className="font-medium mb-1">Key Metrics:</p>
              <p>• <strong>Songs Analyzed:</strong> Total music processed</p>
              <p>• <strong>Prediction Accuracy:</strong> AI confidence level</p>
              <p>• <strong>Happy Artists:</strong> Community size</p>
              <p>• <strong>Recent Activity:</strong> Current engagement</p>
              <p>• <strong>Average Score:</strong> Overall success potential</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Songs Analyzed */}
        <div className="text-center relative">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatNumber(stats.songsAnalyzed)}
          </div>
          <div className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Songs Analyzed
            <button
              onMouseEnter={() => setActiveTooltip('songsAnalyzed')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          {stats.recentActivity > 0 && (
            <div className="text-green-400 text-xs mt-1">
              +{stats.recentActivity} this month
            </div>
          )}
          
          {/* Songs Analyzed Tooltip */}
          {activeTooltip === 'songsAnalyzed' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              <h4 className="font-semibold mb-2">🎵 Songs Analyzed</h4>
              <p className="text-sm mb-3">
                Total number of songs that have been uploaded and analyzed by our AI system.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">How it's calculated:</p>
                <p>• Counts all songs in the database</p>
                <p>• Includes both released and unreleased tracks</p>
                <p>• Updates in real-time as new songs are added</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">What it means:</p>
                <p>• Higher numbers = more music analyzed</p>
                <p>• Shows platform adoption and usage</p>
                <p>• Indicates the size of our music database</p>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Accuracy */}
        <div className="text-center relative">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatPercentage(stats.predictionAccuracy)}
          </div>
          <div className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Prediction Accuracy
            <button
              onMouseEnter={() => setActiveTooltip('predictionAccuracy')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Based on {stats.totalAnalyses} analyses
          </div>
          
          {/* Prediction Accuracy Tooltip */}
          {activeTooltip === 'predictionAccuracy' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              <h4 className="font-semibold mb-2">🎯 Prediction Accuracy</h4>
              <p className="text-sm mb-3">
                How accurately our AI system predicts music success based on analysis confidence scores.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">How it's calculated:</p>
                <p>• Average of genre analysis confidence scores</p>
                <p>• Fallback: Based on success score variance</p>
                <p>• Higher confidence = more accurate predictions</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">What it means:</p>
                <p>• 90%+ = Highly confident predictions</p>
                <p>• 80-89% = Good confidence level</p>
                <p>• Below 80% = Lower confidence, more data needed</p>
              </div>
            </div>
          )}
        </div>

        {/* Happy Artists */}
        <div className="text-center relative">
          <div className="text-4xl font-bold text-blue-400 mb-2">
            {formatNumber(stats.happyArtists)}
          </div>
          <div className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Happy Artists
            <button
              onMouseEnter={() => setActiveTooltip('happyArtists')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Avg Score: {stats.averageSuccessScore}/100
          </div>
          
          {/* Happy Artists Tooltip */}
          {activeTooltip === 'happyArtists' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              <h4 className="font-semibold mb-2">👥 Happy Artists</h4>
              <p className="text-sm mb-3">
                Total number of artists who have registered and used our platform.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">How it's calculated:</p>
                <p>• Counts all registered users in the database</p>
                <p>• Includes both active and inactive accounts</p>
                <p>• Updates when new users register</p>
              </div>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">Avg Score below shows:</p>
                <p>• Average success prediction across all analyzed songs</p>
                <p>• 0-100 scale (100 = perfect success prediction)</p>
                <p>• Based on AI analysis of musical features and trends</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">What it means:</p>
                <p>• Higher numbers = more artists using the platform</p>
                <p>• Shows community growth and adoption</p>
                <p>• Note: This is total users, not satisfaction level</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center relative">
          <div className="text-lg font-semibold text-gray-300 mb-1 flex items-center justify-center gap-2">
            Recent Activity
            <button
              onMouseEnter={() => setActiveTooltip('recentActivity')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {stats.recentActivity > 0 ? `+${stats.recentActivity}` : '0'}
          </div>
          <div className="text-xs text-gray-500">songs this month</div>
          
          {/* Recent Activity Tooltip */}
          {activeTooltip === 'recentActivity' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-green-600 text-white p-4 rounded-lg shadow-2xl z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-green-600"></div>
              <h4 className="font-semibold mb-2">📈 Recent Activity</h4>
              <p className="text-sm mb-3">
                Number of songs uploaded and analyzed in the last 30 days.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">How it's calculated:</p>
                <p>• Counts songs created in the last 30 days</p>
                <p>• Uses database timestamp for accuracy</p>
                <p>• Resets monthly for fresh tracking</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">What it means:</p>
                <p>• Higher numbers = active platform usage</p>
                <p>• Shows current engagement and growth</p>
                <p>• Helps track seasonal trends</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center relative">
          <div className="text-lg font-semibold text-gray-300 mb-1 flex items-center justify-center gap-2">
            Average Score
            <button
              onMouseEnter={() => setActiveTooltip('averageScore')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={(e) => e.stopPropagation()}
              className="text-gray-500 hover:text-blue-400 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {stats.averageSuccessScore}/100
          </div>
          <div className="text-xs text-gray-500">success prediction</div>
          
          {/* Average Score Tooltip */}
          {activeTooltip === 'averageScore' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-10">
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
              <h4 className="font-semibold mb-2">🎯 Average Success Score</h4>
              <p className="text-sm mb-3">
                Average predicted success score across all analyzed songs.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">How it's calculated:</p>
                <p>• Average of all song success scores (0-100)</p>
                <p>• Based on AI analysis of musical features</p>
                <p>• Considers genre, trends, and market factors</p>
              </div>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">Score interpretation:</p>
                <p>• 80-100: High success potential</p>
                <p>• 60-79: Good success potential</p>
                <p>• 40-59: Moderate success potential</p>
                <p>• Below 40: Needs improvement</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">What it means:</p>
                <p>• Higher average = stronger overall song quality</p>
                <p>• Lower average = room for improvement</p>
                <p>• Helps identify platform performance trends</p>
              </div>
            </div>
          )}
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
