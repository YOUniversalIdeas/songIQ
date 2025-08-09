import React, { useState } from 'react';
import {

  Users,
  Calendar,
  Target,
  Zap,
  Music,
  Share2,
  TestTube
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

interface RecommendationEngineProps {
  songData?: any;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({ className = '' }) => {
  const [activeView, setActiveView] = useState<'features' | 'genre' | 'collaboration' | 'timing' | 'marketing' | 'abtest'>('features');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'ml' | 'hybrid' | 'collaborative'>('ml');

  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data for demonstration
  const audioFeatures: AudioFeature[] = [
    {
      name: 'Danceability',
      currentValue: 0.65,
      recommendedValue: 0.78,
      impact: 85,
      difficulty: 'medium',
      description: 'Increase danceability to appeal to club and party audiences'
    },
    {
      name: 'Energy',
      currentValue: 0.72,
      recommendedValue: 0.85,
      impact: 92,
      difficulty: 'easy',
      description: 'Boost energy levels for better streaming performance'
    },
    {
      name: 'Valence',
      currentValue: 0.58,
      recommendedValue: 0.72,
      impact: 78,
      difficulty: 'hard',
      description: 'Increase positive mood to match current market trends'
    },
    {
      name: 'Tempo',
      currentValue: 125,
      recommendedValue: 132,
      impact: 88,
      difficulty: 'medium',
      description: 'Slightly increase tempo for better dance floor appeal'
    }
  ];

  const genreRecommendations: GenreRecommendation[] = [
    {
      genre: 'Pop',
      currentGenre: 'Indie',
      successProbability: 78,
      marketTrend: 85,
      audienceOverlap: 65,
      transitionDifficulty: 'medium',
      keyFactors: ['Strong vocal performance', 'Catchy melodies', 'Radio-friendly structure'],
      estimatedGrowth: 25
    },
    {
      genre: 'Electronic',
      currentGenre: 'Indie',
      successProbability: 72,
      marketTrend: 78,
      audienceOverlap: 45,
      transitionDifficulty: 'hard',
      keyFactors: ['Production quality', 'Beat complexity', 'Sound design'],
      estimatedGrowth: 18
    },
    {
      genre: 'Hip-Hop',
      currentGenre: 'Indie',
      successProbability: 68,
      marketTrend: 82,
      audienceOverlap: 35,
      transitionDifficulty: 'hard',
      keyFactors: ['Lyrical content', 'Beat selection', 'Cultural relevance'],
      estimatedGrowth: 22
    }
  ];

  const collaborationSuggestions: CollaborationSuggestion[] = [
    {
      artist: 'Luna Echo',
      genre: 'Pop',
      followers: 2500000,
      compatibility: 92,
      audienceOverlap: 78,
      recentSuccess: 85,
      collaborationType: 'feature',
      expectedImpact: 88
    },
    {
      artist: 'Neon Pulse',
      genre: 'Electronic',
      followers: 1800000,
      compatibility: 85,
      audienceOverlap: 65,
      recentSuccess: 78,
      collaborationType: 'remix',
      expectedImpact: 82
    },
    {
      artist: 'Urban Flow',
      genre: 'Hip-Hop',
      followers: 3200000,
      compatibility: 78,
      audienceOverlap: 45,
      recentSuccess: 92,
      collaborationType: 'feature',
      expectedImpact: 85
    }
  ];

  const releaseTiming: ReleaseTiming = {
    recommendedDate: '2024-06-15',
    confidence: 85,
    marketConditions: {
      competition: 65,
      seasonalFactor: 88,
      trendAlignment: 92
    },
    alternativeDates: [
      { date: '2024-07-01', score: 82, reason: 'Summer festival season peak' },
      { date: '2024-05-20', score: 78, reason: 'Pre-summer momentum building' },
      { date: '2024-08-15', score: 75, reason: 'Late summer release window' }
    ],
    riskFactors: [
      'Major label releases in same week',
      'Competing with established artists',
      'Seasonal timing could be better'
    ]
  };

  const marketingStrategies: MarketingStrategy[] = [
    {
      platform: 'TikTok',
      strategy: 'Viral Dance Challenge',
      expectedReach: 2500000,
      cost: 'low',
      timeline: '2-3 weeks',
      successMetrics: ['Views', 'Shares', 'User-generated content'],
      implementation: 'Create 15-second dance snippet with trending hashtags'
    },
    {
      platform: 'Instagram',
      strategy: 'Story Series & Reels',
      expectedReach: 1800000,
      cost: 'medium',
      timeline: '4-6 weeks',
      successMetrics: ['Engagement rate', 'Story views', 'Profile visits'],
      implementation: 'Daily story updates and weekly reels with behind-the-scenes content'
    },
    {
      platform: 'YouTube',
      strategy: 'Music Video + Behind the Scenes',
      expectedReach: 1200000,
      cost: 'high',
      timeline: '6-8 weeks',
      successMetrics: ['Views', 'Watch time', 'Subscriptions'],
      implementation: 'Professional music video with behind-the-scenes documentary'
    }
  ];

  const abTestResults: ABTestResult[] = [
    {
      algorithm: 'ML-Based',
      recommendationType: 'Feature Optimization',
      effectiveness: 88,
      userEngagement: 92,
      conversionRate: 15.5,
      sampleSize: 1250,
      confidence: 95
    },
    {
      algorithm: 'Hybrid',
      recommendationType: 'Genre Switching',
      effectiveness: 82,
      userEngagement: 88,
      conversionRate: 12.8,
      sampleSize: 980,
      confidence: 92
    },
    {
      algorithm: 'Collaborative',
      recommendationType: 'Collaboration',
      effectiveness: 85,
      userEngagement: 90,
      conversionRate: 14.2,
      sampleSize: 1100,
      confidence: 94
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 85) return 'text-green-600';
    if (impact >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    // Simulate ML processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendation Engine</h2>
          <p className="text-gray-600 dark:text-gray-400">
            ML-powered suggestions for optimizing your music success
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="ml">ML-Based</option>
            <option value="hybrid">Hybrid</option>
            <option value="collaborative">Collaborative</option>
          </select>
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'features', label: 'Features', icon: Target },
          { id: 'genre', label: 'Genre', icon: Music },
          { id: 'collaboration', label: 'Collaboration', icon: Users },
          { id: 'timing', label: 'Timing', icon: Calendar },
          { id: 'marketing', label: 'Marketing', icon: Share2 },
          { id: 'abtest', label: 'A/B Test', icon: TestTube }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Views */}
      <div className="min-h-96">
        {activeView === 'features' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Optimization Suggestions</h3>
              <div className="space-y-4">
                {audioFeatures.map((feature, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{feature.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(feature.difficulty)}`}>
                        {feature.difficulty}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
                        <p className="font-medium text-gray-900 dark:text-white">{feature.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recommended</p>
                        <p className="font-medium text-blue-600">{feature.recommendedValue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Impact</p>
                        <p className={`font-medium ${getImpactColor(feature.impact)}`}>{feature.impact}%</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'genre' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genre Switching Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {genreRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{rec.genre}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(rec.successProbability)}`}>
                        {rec.successProbability}% success
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Market Trend</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{rec.marketTrend}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Audience Overlap</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{rec.audienceOverlap}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Growth</span>
                        <span className="text-sm font-medium text-green-600">+{rec.estimatedGrowth}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Key Factors</p>
                      <div className="space-y-1">
                        {rec.keyFactors.map((factor, fIndex) => (
                          <div key={fIndex} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.transitionDifficulty)}`}>
                      {rec.transitionDifficulty} transition
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'collaboration' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Collaboration Suggestions</h3>
              <div className="space-y-4">
                {collaborationSuggestions.map((collab, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{collab.artist}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{collab.genre} • {collab.followers.toLocaleString()} followers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getProbabilityColor(collab.compatibility)}`}>
                          {collab.compatibility}% match
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {collab.collaborationType}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Compatibility</p>
                        <p className="font-medium text-gray-900 dark:text-white">{collab.compatibility}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Audience Overlap</p>
                        <p className="font-medium text-gray-900 dark:text-white">{collab.audienceOverlap}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Recent Success</p>
                        <p className="font-medium text-gray-900 dark:text-white">{collab.recentSuccess}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Expected Impact</p>
                        <p className="font-medium text-green-600">{collab.expectedImpact}%</p>
                      </div>
                    </div>
                    
                    <button className="btn-secondary text-sm">
                      Contact Artist
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'timing' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Release Timing Optimization</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Recommended Release Date</h4>
                    <p className="text-2xl font-bold text-green-600">{releaseTiming.recommendedDate}</p>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      {releaseTiming.confidence}% confidence
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Competition Level</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{releaseTiming.marketConditions.competition}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Seasonal Factor</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{releaseTiming.marketConditions.seasonalFactor}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trend Alignment</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{releaseTiming.marketConditions.trendAlignment}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Alternative Dates</h4>
                  <div className="space-y-3">
                    {releaseTiming.alternativeDates.map((alt, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{alt.date}</span>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{alt.score}% score</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Risk Factors</h4>
                <div className="space-y-2">
                  {releaseTiming.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'marketing' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marketing Strategy Recommendations</h3>
              <div className="space-y-4">
                {marketingStrategies.map((strategy, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                          <Share2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{strategy.platform}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.strategy}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {strategy.expectedReach.toLocaleString()} reach
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          strategy.cost === 'low' ? 'text-green-600 bg-green-100 dark:bg-green-900/20' :
                          strategy.cost === 'medium' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' :
                          'text-red-600 bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {strategy.cost} cost
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Timeline</p>
                        <p className="font-medium text-gray-900 dark:text-white">{strategy.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Success Metrics</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.successMetrics.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Implementation</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{strategy.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'abtest' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">A/B Test Results</h3>
              <div className="space-y-4">
                {abTestResults.map((result, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{result.algorithm}</h4>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {result.recommendationType}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Effectiveness</p>
                        <p className="font-medium text-gray-900 dark:text-white">{result.effectiveness}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                        <p className="font-medium text-gray-900 dark:text-white">{result.userEngagement}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Conversion</p>
                        <p className="font-medium text-gray-900 dark:text-white">{result.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                        <p className="font-medium text-gray-900 dark:text-white">{result.confidence}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      Sample size: {result.sampleSize.toLocaleString()} users
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine; 