import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Target,
  Zap,
  Music,
  Share2,
  TestTube,
  Info,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';

interface AudioFeature {
  name: string;
  currentValue: number;
  recommendedValue: number;
  impact: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

interface GenreRecommendation {
  genre: string;
  currentGenre: string;
  successProbability: number;
  marketTrend: number;
  audienceOverlap: number;
  transitionDifficulty: 'easy' | 'medium' | 'hard';
  keyFactors: string[];
  estimatedGrowth: number;
}

interface CollaborationSuggestion {
  artist: string;
  genre: string;
  followers: number;
  compatibility: number;
  audienceOverlap: number;
  recentSuccess: number;
  collaborationType: 'feature' | 'remix' | 'duet' | 'production';
  expectedImpact: number;
  contactInfo?: string;
}

interface ReleaseTiming {
  recommendedDate: string;
  confidence: number;
  marketConditions: {
    competition: number;
    seasonalFactor: number;
    trendAlignment: number;
  };
  alternativeDates: Array<{
    date: string;
    score: number;
    reason: string;
  }>;
  riskFactors: string[];
}

interface MarketingStrategy {
  platform: string;
  strategy: string;
  expectedReach: number;
  cost: 'low' | 'medium' | 'high';
  timeline: string;
  successMetrics: string[];
  implementation: string;
}

interface ABTestResult {
  algorithm: string;
  recommendationType: string;
  effectiveness: number;
  userEngagement: number;
  conversionRate: number;
  sampleSize: number;
  confidence: number;
}

interface RecommendationData {
  songId: string;
  songTitle: string;
  artist: string;
  overallScore: number;
  audioFeatureRecommendations: AudioFeature[];
  genreRecommendations: GenreRecommendation[];
  collaborationSuggestions: CollaborationSuggestion[];
  releaseTiming: ReleaseTiming;
  marketingStrategies: MarketingStrategy[];
  abTestResults: ABTestResult[];
  analysis: {
    successScore: number;
    marketPotential: number;
    socialScore: number;
    recommendations: any[];
  };
  marketTrends: any;
  lastUpdated: string;
}

interface RecommendationEngineProps {
  songId?: string;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ songId, className = '' }) => {
  const [activeView, setActiveView] = useState<'features' | 'genre' | 'collaboration' | 'timing' | 'marketing' | 'abtest'>('features');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'ml' | 'hybrid' | 'collaborative'>('ml');
  const [showAlgorithmTooltip, setShowAlgorithmTooltip] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);

  const handleAlgorithmInfo = () => {
    setShowAlgorithmTooltip(true);
    // Auto-dismiss after 4 seconds
    setTimeout(() => setShowAlgorithmTooltip(false), 4000);
  };

  // Fetch recommendations from API
  const fetchRecommendations = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/recommendations/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setRecommendationData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load recommendations when songId changes
  useEffect(() => {
    if (songId) {
      fetchRecommendations(songId);
    } else {
      setRecommendationData(null);
    }
  }, [songId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Recommendations...</h3>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your song and generating personalized insights</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Recommendations</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => songId && fetchRecommendations(songId)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show empty state when no song is selected
  if (!songId || !recommendationData) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="text-center">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Song Selected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Select a song to view personalized recommendations and insights
          </p>
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Song</span>
          </button>
        </div>
      </div>
    );
  }

  // Use real data from API
  const {
    songTitle,
    artist,
    overallScore,
    audioFeatureRecommendations,
    genreRecommendations,
    collaborationSuggestions,
    releaseTiming,
    marketingStrategies,
    abTestResults
  } = recommendationData;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Recommendation Engine
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {songTitle} • {artist} • Overall Score: {overallScore}/100
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Algorithm</div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value as 'ml' | 'hybrid' | 'collaborative')}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="ml">ML-Based</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="collaborative">Collaborative</option>
                </select>
                <button
                  onClick={handleAlgorithmInfo}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsGenerating(true)}
              disabled={isGenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate New</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Algorithm Tooltip */}
        {showAlgorithmTooltip && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Algorithm Information</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>ML-Based:</strong> Machine learning model trained on successful songs</p>
              <p><strong>Hybrid:</strong> Combines ML predictions with market trend analysis</p>
              <p><strong>Collaborative:</strong> Uses similar artist and song patterns</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'features', label: 'Audio Features', icon: Target },
            { id: 'genre', label: 'Genre Strategy', icon: Music },
            { id: 'collaboration', label: 'Collaborations', icon: Users },
            { id: 'timing', label: 'Release Timing', icon: Calendar },
            { id: 'marketing', label: 'Marketing', icon: Share2 },
            { id: 'abtest', label: 'A/B Testing', icon: TestTube }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeView === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Audio Features View */}
        {activeView === 'features' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audio Feature Optimization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {audioFeatureRecommendations.map((feature, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{feature.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      feature.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      feature.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {feature.difficulty}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Current:</span>
                      <span className="font-medium">{feature.currentValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Recommended:</span>
                      <span className="font-medium text-blue-600">{feature.recommendedValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Impact:</span>
                      <span className="font-medium text-green-600">{feature.impact}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Genre Strategy View */}
        {activeView === 'genre' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genre Strategy & Market Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {genreRecommendations.slice(0, 6).map((genre, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{genre.genre}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      genre.transitionDifficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      genre.transitionDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {genre.transitionDifficulty}
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Success:</span>
                      <span className="font-medium text-green-600">{genre.successProbability}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Market Trend:</span>
                      <span className="font-medium">{genre.marketTrend}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Audience Overlap:</span>
                      <span className="font-medium">{genre.audienceOverlap}%</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">Key Factors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {genre.keyFactors.slice(0, 3).map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaboration View */}
        {activeView === 'collaboration' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Artist Collaboration Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collaborationSuggestions.map((collab, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{collab.artist}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{collab.genre}</span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Followers:</span>
                      <span className="font-medium">{collab.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Compatibility:</span>
                      <span className="font-medium text-green-600">{collab.compatibility}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Audience Overlap:</span>
                      <span className="font-medium">{collab.audienceOverlap}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Recent Success:</span>
                      <span className="font-medium">{collab.recentSuccess}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {collab.collaborationType}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {collab.expectedImpact}% impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Release Timing View */}
        {activeView === 'timing' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Release Timing Strategy</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Recommended Release</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="font-medium">{releaseTiming.recommendedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <span className="font-medium text-green-600">{releaseTiming.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Competition:</span>
                    <span className="font-medium">{releaseTiming.marketConditions.competition}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Seasonal Factor:</span>
                    <span className="font-medium">{releaseTiming.marketConditions.seasonalFactor}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trend Alignment:</span>
                    <span className="font-medium">{releaseTiming.marketConditions.trendAlignment}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Alternative Dates</h4>
                <div className="space-y-3">
                  {releaseTiming.alternativeDates.map((alt, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{alt.date}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{alt.reason}</div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{alt.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Risk Factors</h4>
              <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                {releaseTiming.riskFactors.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Marketing View */}
        {activeView === 'marketing' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marketing Strategy & Platform Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketingStrategies.map((strategy, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">{strategy.platform}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      strategy.cost === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      strategy.cost === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {strategy.cost} cost
                    </span>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Expected Reach:</span>
                      <span className="font-medium">{strategy.expectedReach.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                      <span className="font-medium">{strategy.timeline}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">Strategy:</p>
                    <p>{strategy.strategy}</p>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium mb-2">Implementation:</p>
                    <p>{strategy.implementation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* A/B Testing View */}
        {activeView === 'abtest' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Algorithm Performance & A/B Testing Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {abTestResults.map((result, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">{result.algorithm}</h4>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-medium">{result.recommendationType}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Effectiveness:</span>
                      <span className="font-medium text-green-600">{result.effectiveness}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
                      <span className="font-medium">{result.userEngagement}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Conversion:</span>
                      <span className="font-medium">{result.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Sample: {result.sampleSize.toLocaleString()}
                    </span>
                    <span className="font-medium text-blue-600">
                      {result.confidence}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine; 