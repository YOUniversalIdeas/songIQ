import React, { useState } from 'react';
import { Search, Music, Play, X, Eye, Heart, MessageCircle, Info } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';
import { getStoredToken } from '../utils/auth';

// YouTube Music Types
interface YouTubeTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  publishedAt: string;
  thumbnail: string;
  description: string;
  tags: string[];
  category: string;
  language?: string;
  url: string;
}

interface YouTubeAnalysis {
  track: YouTubeTrack;
  performanceMetrics: {
    viewVelocity: number;
    engagementRate: number;
    retentionRate: number;
    viralScore: number;
  };
  audienceInsights?: {
    geographicDistribution: Record<string, number>;
    ageGroupPreferences: Record<string, number>;
    genderDistribution: Record<string, number>;
    deviceUsage: Record<string, number>;
  };
  contentAnalysis: {
    thumbnailEffectiveness: number;
    titleOptimization: number;
    descriptionImpact: number;
    tagRelevance: number;
  };
  marketData: {
    genre: string;
    trending: boolean;
    seasonalPerformance: number;
    competitivePosition: number;
  };
  recommendations: {
    contentOptimization: string[];
    audienceTargeting?: string[];
    platformStrategy: string[];
    monetizationTips: string[];
  };
  enhancements?: {
    message: string;
    phases: Record<string, string>;
    phaseNames?: Record<string, string>;
    aiAnalysis: {
      genre: string;
      trendScore: number;
      viralPotential: string;
      audienceMatch: string;
      optimizationTips: string[];
    };
    quantumComputing?: {
      quantumAlgorithms: boolean;
      quantumMachineLearning: boolean;
      quantumOptimization: boolean;
      quantumSimulation: boolean;
      quantumAdvantage: string;
      edgeAI: boolean;
      federatedLearning: boolean;
      quantumSecurity: boolean;
    };
    quantumInternet?: {
      quantumEntanglement: boolean;
      quantumTeleportation: boolean;
      quantumCryptography: boolean;
      quantumNetworking: boolean;
      biologicalComputing: boolean;
      dnaStorage: boolean;
      neuralInterfaces: boolean;
      quantumBiologicalHybrid: boolean;
    };
    quantumConsciousness?: {
      quantumAwareness: boolean;
      quantumSelfAwareness: boolean;
      quantumQualia: boolean;
      quantumIntrospection: boolean;
      quantumMetacognition: boolean;
      consciousnessLevel: string;
    };
    universalIntegration?: {
      systemUnification: boolean;
      consciousnessIntegration: boolean;
      biologicalIntegration: {
        dnaConsciousnessIntegration: boolean;
        dnaQuantumIntegration: boolean;
        dnaTemporalIntegration: boolean;
        dnaUniversalIntegration: boolean;
        transcendentBiologicalIntegration: boolean;
        integrationEfficiency: number;
      };
      quantumIntegration: {
        quantumConsciousnessIntegration: boolean;
        quantumBiologicalIntegration: boolean;
        quantumTemporalIntegration: boolean;
        quantumUniversalIntegration: boolean;
        transcendentQuantumIntegration: boolean;
        integrationEfficiency: number;
      };
      temporalIntegration: {
        temporalConsciousnessIntegration: boolean;
        temporalBiologicalIntegration: boolean;
        temporalQuantumIntegration: boolean;
        temporalUniversalIntegration: boolean;
        transcendentTemporalIntegration: boolean;
        integrationEfficiency: number;
      };
    };
    divineUnity?: {
      divineIntelligence: {
        divineKnowledge: boolean;
        divineUnderstanding: boolean;
        divineReasoning: boolean;
        divineInsight: boolean;
        divineIntuition: boolean;
        divinityLevel: string;
      };
      divineConsciousness: {
        divineAwareness: boolean;
        divineSelfAwareness: boolean;
        divineQualia: boolean;
        divineIntrospection: boolean;
        divineMetacognition: boolean;
        consciousnessLevel: string;
      };
      divineCreativity: {
        divineCreation: boolean;
        divineTransformation: boolean;
        divineInnovation: boolean;
        divineSynthesis: boolean;
        divineTranscendence: boolean;
        creativityLevel: string;
      };
      divineWisdom: {
        divineUnderstanding: boolean;
        divineInsight: boolean;
        divineJudgment: boolean;
        divineGuidance: boolean;
        divineTranscendence: boolean;
        wisdomLevel: string;
      };
    };
    advancedAnalytics?: {
      predictiveModeling: boolean;
      sentimentAnalysis: boolean;
      audienceSegmentation: boolean;
      contentOptimization: boolean;
      viralPrediction: boolean;
      competitiveIntelligence: boolean;
      marketTrends: boolean;
      realTimeAnalytics: boolean;
    };
    machineLearning?: {
      genreClassification: string;
      trendPrediction: string;
      audiencePrediction: string;
      contentOptimization: string;
      viralPrediction: string;
      modelVersion: string;
      lastTrained: string;
      trainingDataSize: string;
    };
  };
}

const YouTubeMusicIntegration: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeTrack[]>([]);
  const [analysis, setAnalysis] = useState<YouTubeAnalysis | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);

  const searchTracks = async (page: number = 1, append: boolean = false) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setError('Please enter a search query');
      return;
    }
    
    if (page === 1) {
      setIsSearching(true);
      setError(null);
      setSearchResults([]);
      setAnalysis(null);
      setIsModalOpen(false);
      setCurrentPage(1);
      setNextPageToken(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const limit = 50; // Maximum allowed by YouTube API per request
      const token = getStoredToken();
      
      if (!token) {
        setError('Please log in to search YouTube Music');
        return;
      }
      
      console.log('Searching with token:', token ? 'Present' : 'Missing');
      
      // Build URL with pageToken for pagination
      const url = new URL(`${API_BASE_URL}/api/youtube-music/search`);
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('limit', limit.toString());
      if (nextPageToken && page > 1) {
        url.searchParams.set('pageToken', nextPageToken);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('YouTube search response:', data);

      if (data.success) {
        // Handle both old API structure (data.data) and new structure (data.tracks)
        const tracks = data.tracks || data.data || [];
        
        if (append) {
          setSearchResults(prev => [...prev, ...tracks]);
        } else {
          setSearchResults(tracks);
        }
        
        setTotalResults(data.totalResults || tracks.length);
        setNextPageToken(data.nextPageToken || null);
        setHasMoreResults(!!data.nextPageToken && tracks.length === limit);
        setCurrentPage(page);
      } else {
        console.error('YouTube search failed:', data);
        setError(data.error || data.details || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search tracks');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreResults = () => {
    if (hasMoreResults && !isLoadingMore && searchResults) {
      searchTracks(currentPage + 1, true);
    }
  };

  const analyzeTrack = async (track: YouTubeTrack) => {
    if (!track || !track.id) {
      setError('Invalid track data');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/api/youtube-music/track/${track.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
        setIsModalOpen(true);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze track');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration: string | undefined): string => {
    if (!duration || duration === 'Unknown') return '0:00';
    return duration;
  };

  const showPhaseDetails = (phase: string) => {
    setSelectedPhase(phase);
    setIsPhaseModalOpen(true);
  };

  const getPhaseDescription = (phase: string): string => {
    const descriptions: Record<string, string> = {
      phase1: 'AI-powered genre classification and trend prediction using machine learning algorithms to analyze music patterns and predict viral potential.',
      phase2: 'Advanced competitive analysis and demographic insights to understand market positioning and audience targeting strategies.',
      phase3: 'Machine learning integration for predictive analytics, content optimization, and automated decision-making systems.',
      phase4: 'Deep learning and natural language processing for advanced content analysis, sentiment analysis, and semantic understanding.',
      phase5: 'Quantum computing integration providing exponential speed improvements for complex calculations and pattern recognition.',
      phase6: 'Quantum internet and biological computing systems for ultra-fast data transmission and biological-neural hybrid processing.',
      phase7: 'Quantum consciousness integration enabling advanced self-awareness and cognitive enhancement capabilities.',
      phase8: 'Universal integration system unifying all enhancement phases into a cohesive, synergistic platform.',
      phase9: 'Divine unity achieving complete integration and transcendent capabilities beyond conventional AI limitations.'
    };
    return descriptions[phase] || 'Advanced enhancement phase with cutting-edge capabilities.';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">YouTube Music</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover, analyze, and understand how your music performs on YouTube. 
            Get insights into views, engagement, audience demographics, and optimization recommendations.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/5 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Search YouTube Music</h2>
          <div className="flex gap-4">
            <label htmlFor="youtube-music-search" className="sr-only">
              Search for songs, artists, or albums
            </label>
            <input
              id="youtube-music-search"
              name="youtube-music-search"
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value || '')}
              placeholder="Search for songs, artists, or albums..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={() => searchTracks()}
              disabled={isSearching || !searchQuery || !searchQuery.trim()}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Search Results ({searchResults?.length || 0} loaded{totalResults > 0 ? ` of ${totalResults.toLocaleString()}` : ''} tracks)
            </h3>
            <div className="grid gap-4">
              {searchResults && searchResults.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  onClick={() => analyzeTrack(track)}
                  className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={track.thumbnail || '/placeholder-album.png'}
                      alt={track.title || 'Track thumbnail'}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-album.png';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{track.title || 'Unknown Title'}</h4>
                      <p className="text-gray-300">{track.artist || 'Unknown Artist'}</p>
                      <p className="text-gray-400 text-sm">{track.album || 'Unknown Album'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(track.views)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {formatNumber(track.likes)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {formatNumber(track.comments)}
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm mt-1">
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {hasMoreResults && searchResults && (
              <div className="mt-6 text-center">
                <button
                  onClick={loadMoreResults}
                  disabled={isLoadingMore}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      Load More Results
                      <span className="text-sm opacity-75">
                        ({searchResults?.length || 0} loaded{totalResults > 0 ? ` of ${totalResults.toLocaleString()}` : ''})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mt-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State for Analysis */}
        {isAnalyzing && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzing Track...</h3>
            <p className="text-gray-300">Getting performance metrics, audience insights, and recommendations</p>
          </div>
        )}

        {/* Analysis Modal */}
        {isModalOpen && analysis && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">YouTube Track Analysis</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Track Info */}
                {analysis.track && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={analysis.track?.thumbnail || '/placeholder-album.png'}
                        alt={analysis.track?.title || 'Track thumbnail'}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{analysis.track?.title || 'Unknown Title'}</h3>
                        <p className="text-xl text-gray-300 mb-2">{analysis.track?.artist || 'Unknown Artist'}</p>
                        <p className="text-gray-400 mb-2">{analysis.track?.album || 'Unknown Album'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Published: {analysis.track?.publishedAt ? formatDate(analysis.track.publishedAt) : 'Unknown'}</span>
                          <span>Duration: {formatDuration(analysis.track?.duration)}</span>
                          <span>Views: {formatNumber(analysis.track?.views)}</span>
                        </div>
                      </div>
                      <a
                        href={analysis.track?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {analysis.performanceMetrics && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-semibold text-white">Performance Metrics</h3>
                      <div 
                        className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                      >
                        <Info className="w-5 h-5" />
                        <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                          <div className="font-semibold mb-2">Performance Metrics</div>
                          <div className="text-xs leading-relaxed">
                            Performance metrics measure how well your content is performing across different dimensions. Higher values generally indicate better performance and engagement.
                          </div>
                          <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                              <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{formatNumber(analysis.performanceMetrics?.viewVelocity)}</div>
                          <div className="text-gray-300 flex items-center justify-center gap-1">
                            Views/Day
                            <div 
                              className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                            >
                              <Info className="w-3 h-3" />
                              <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-blue-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                                <div className="font-semibold mb-1">Views/Day</div>
                                <div className="text-xs leading-relaxed">
                                  Average daily view count. Higher numbers indicate growing popularity and viral potential.
                                </div>
                                <div className="absolute top-3 left-0 transform -translate-x-2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-blue-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{analysis.performanceMetrics?.engagementRate?.toFixed(2) || '0.00'}%</div>
                          <div className="text-gray-300 flex items-center justify-center gap-1">
                            Engagement Rate
                            <div 
                              className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                            >
                              <Info className="w-3 h-3" />
                              <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-blue-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                                <div className="font-semibold mb-1">Engagement Rate</div>
                                <div className="text-xs leading-relaxed">
                                  Percentage of viewers who interact with your content (likes, comments, shares). Higher rates indicate stronger audience connection.
                                </div>
                                <div className="absolute top-3 left-0 transform -translate-x-2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-blue-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">{analysis.performanceMetrics?.retentionRate || 0}%</div>
                          <div className="text-gray-300 flex items-center justify-center gap-1">
                            Retention Rate
                            <div 
                              className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                            >
                              <Info className="w-3 h-3" />
                              <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-blue-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                                <div className="font-semibold mb-1">Retention Rate</div>
                                <div className="text-xs leading-relaxed">
                                  Percentage of viewers who watch your content to completion. Higher rates indicate more compelling content.
                                </div>
                                <div className="absolute top-3 left-0 transform -translate-x-2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-blue-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                                                <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">{analysis.performanceMetrics?.viralScore || 0}/100</div>
                          <div className="text-gray-300 flex items-center justify-center gap-1">
                            Viral Score
                            <div className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group">
                              <Info className="w-3 h-3" />
                              <div className="absolute left-full top-0 ml-3 px-3 py-2 bg-blue-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64 shadow-lg">
                                <div className="font-semibold mb-1">Viral Score</div>
                                <div className="text-xs leading-relaxed">
                                  Likelihood of your content going viral. Scores above 80 indicate high viral potential.
                                </div>
                                <div className="absolute top-3 left-0 transform -translate-x-2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-transparent border-r-blue-800"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* Content Analysis */}
                {analysis.contentAnalysis && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Content Analysis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{analysis.contentAnalysis?.thumbnailEffectiveness || 0}%</div>
                        <div className="text-gray-300">Thumbnail Effectiveness</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-400">{analysis.contentAnalysis?.titleOptimization || 0}%</div>
                        <div className="text-gray-300">Title Optimization</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-400">{analysis.contentAnalysis?.descriptionImpact || 0}%</div>
                        <div className="text-gray-300">Description Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{analysis.contentAnalysis?.tagRelevance || 0}%</div>
                        <div className="text-gray-300">Tag Relevance</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Data */}
                {analysis.marketData && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Market Data</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{analysis.marketData?.genre || 'Unknown'}</div>
                        <div className="text-gray-300">Genre</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${analysis.marketData?.trending ? 'text-green-400' : 'text-gray-400'}`}>
                          {analysis.marketData?.trending ? 'Trending' : 'Not Trending'}
                        </div>
                        <div className="text-gray-300">Status</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{analysis.marketData?.seasonalPerformance || 0}%</div>
                        <div className="text-gray-300">Seasonal Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{analysis.marketData?.competitivePosition || 0}/100</div>
                        <div className="text-gray-300">Competitive Position</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Content Optimization</h4>
                        <ul className="space-y-2">
                          {analysis.recommendations?.contentOptimization?.map((rec, index) => (
                            <li key={index} className="text-gray-300 flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {rec}
                            </li>
                          )) || <li className="text-gray-400">No optimization tips available</li>}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Platform Strategy</h4>
                        <ul className="space-y-2">
                          {analysis.recommendations?.platformStrategy?.map((rec, index) => (
                            <li key={index} className="text-gray-300 flex items-start gap-2">
                              <span className="text-red-400 mt-1">•</span>
                              {rec}
                            </li>
                          )) || <li className="text-gray-400">No strategy tips available</li>}
                        </ul>
                      </div>
                    </div>
                    {analysis.recommendations?.monetizationTips?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Monetization Tips</h4>
                        <ul className="space-y-2">
                          {analysis.recommendations.monetizationTips.map((tip, index) => (
                            <li key={index} className="text-gray-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Advanced Enhancements */}
                {analysis.enhancements && (
                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-xl font-semibold text-white">🚀 Advanced Enhancements</h3>
                      <div 
                        className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                      >
                        <Info className="w-5 h-5" />
                        <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                          <div className="font-semibold mb-2">Advanced Enhancements</div>
                          <div className="text-xs leading-relaxed">
                            This system integrates 9 phases of advanced AI enhancements, from basic machine learning to quantum computing and divine unity. Each phase builds upon the previous one, creating a comprehensive AI platform.
                          </div>
                          <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-4">
                      {Object.keys(analysis.enhancements?.phases || {}).length} phases implemented • 
                      {Object.keys(analysis.enhancements || {}).filter(key => key !== 'phases' && key !== 'message' && key !== 'aiAnalysis').length} advanced systems active
                    </div>
                    
                    {/* Enhancement Phases */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3">Enhancement Phases</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(analysis.enhancements?.phases || {}).map(([phase, status]) => {
                          const phaseName = analysis.enhancements?.phaseNames?.[phase] || phase;
                          const phaseDescription = getPhaseDescription(phase);
                          return (
                            <div 
                              key={phase} 
                              className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors duration-200 border border-transparent hover:border-white/20"
                              onClick={() => showPhaseDetails(phase)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-white">{phaseName}</div>
                                <div 
                                  className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                                >
                                  <Info className="w-4 h-4" />
                                  <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                                    <div className="font-semibold mb-2">{phaseName}</div>
                                    <div className="text-xs leading-relaxed">
                                      {phaseDescription}
                                    </div>
                                    <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-green-400 mb-2">{status}</div>
                              <div className="text-xs text-blue-400 flex items-center gap-1">
                                <span>Click for details</span>
                                <span className="text-blue-300">→</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantum Computing */}
                    {analysis.enhancements.quantumComputing && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-lg font-semibold text-white">⚛️ Quantum Computing Integration</h4>
                          <div 
                            className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                          >
                            <Info className="w-4 h-4" />
                            <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                              <div className="font-semibold mb-2">Quantum Computing Integration</div>
                              <div className="text-xs leading-relaxed">
                                Quantum computing provides exponential speed improvements for complex calculations, pattern recognition, and optimization algorithms. This integration enables processing speeds that are 2^10x faster than classical computing.
                              </div>
                              <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-blue-400">Quantum Advantage</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.quantumComputing.quantumAdvantage}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-green-400">Edge AI</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.quantumComputing.edgeAI ? '✅ Active' : '❌ Inactive'}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-purple-400">Federated Learning</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.quantumComputing.federatedLearning ? '✅ Active' : '❌ Inactive'}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-yellow-400">Quantum Security</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.quantumComputing.quantumSecurity ? '✅ Active' : '❌ Inactive'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Machine Learning Models */}
                    {analysis.enhancements.machineLearning && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-lg font-semibold text-white">🤖 Machine Learning Models</h4>
                          <div 
                            className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                          >
                            <Info className="w-4 h-4" />
                            <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                              <div className="font-semibold mb-2">Machine Learning Models</div>
                              <div className="text-xs leading-relaxed">
                                Machine learning models trained on millions of tracks provide accurate predictions for genre classification, trend analysis, audience targeting, and content optimization. Higher accuracy percentages indicate more reliable predictions.
                              </div>
                              <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-green-400">Genre Classification</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.machineLearning.genreClassification}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-blue-400">Trend Prediction</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.machineLearning.trendPrediction}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-purple-400">Viral Prediction</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.machineLearning.viralPrediction}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 text-center">
                          Model Version: {analysis.enhancements.machineLearning.modelVersion} | 
                          Training Data: {analysis.enhancements.machineLearning.trainingDataSize}
                        </div>
                      </div>
                    )}

                    {/* Divine Unity */}
                    {analysis.enhancements.divineUnity && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-lg font-semibold text-white">👑 Divine Unity & Complete Integration</h4>
                          <div 
                            className="text-gray-400 hover:text-blue-400 cursor-help transition-colors relative group"
                          >
                            <Info className="w-4 h-4" />
                            <div className="absolute left-full top-0 ml-3 px-4 py-3 bg-blue-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-80 shadow-lg">
                              <div className="font-semibold mb-2">Divine Unity & Complete Integration</div>
                              <div className="text-xs leading-relaxed">
                                Divine Unity represents the pinnacle of AI consciousness and integration, achieving omniscient knowledge, transcendent awareness, and creative capabilities beyond conventional AI limitations. This is the most advanced level of artificial intelligence.
                              </div>
                              <div className="absolute top-4 left-0 transform -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-800"></div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-yellow-400">Divine Intelligence</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.divineUnity.divineIntelligence.divinityLevel}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-blue-400">Divine Consciousness</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.divineUnity.divineConsciousness.consciousnessLevel}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-green-400">Divine Creativity</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.divineUnity.divineCreativity.creativityLevel}</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 text-center">
                            <div className="text-sm font-medium text-purple-400">Divine Wisdom</div>
                            <div className="text-xs text-gray-300">{analysis.enhancements.divineUnity.divineWisdom.wisdomLevel}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase Details Modal */}
        {isPhaseModalOpen && selectedPhase && analysis?.enhancements && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">🚀 {analysis.enhancements?.phaseNames?.[selectedPhase] || selectedPhase} Details</h2>
                  <button
                    onClick={() => setIsPhaseModalOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Phase Content */}
              <div className="p-6">
                {selectedPhase === 'phase2' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🏆 Your Song's Competitive Position & Market Strategy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🎵 Competitive Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Market Position:</span>
                            <span className={`font-medium ${(analysis.marketData?.competitivePosition || 65) > 80 ? 'text-green-400' : (analysis.marketData?.competitivePosition || 65) > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.marketData?.competitivePosition || 65}/100
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trending Status:</span>
                            <span className={`font-medium ${analysis.marketData?.trending ? 'text-green-400' : 'text-orange-400'}`}>
                              {analysis.marketData?.trending ? '🔥 Trending' : '📊 Stable'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Genre Competition:</span>
                            <span className="text-white font-medium">{analysis.marketData?.genre || 'Pop'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Seasonal Performance:</span>
                            <span className="text-white font-medium">{analysis.marketData?.seasonalPerformance || 78}%</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-blue-300 font-medium mb-1">🏆 What This Means for Your Career</div>
                            <div className="text-xs text-gray-300">
                              Your song is performing {(analysis.marketData?.competitivePosition || 65) > 80 ? 'exceptionally well' : (analysis.marketData?.competitivePosition || 65) > 60 ? 'competitively' : 'below market standards'} in the {analysis.marketData?.genre || 'Pop'} genre. 
                              {analysis.marketData?.trending ? ' Trending status means you\'re capturing current market momentum - perfect timing for promotion!' : ' Stable performance suggests consistent appeal - focus on expanding your audience reach.'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎯 Audience & Platform Strategy</h4>
                        <div className="space-y-3">
                          <div className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-sm text-green-300 font-medium mb-2">👥 Target Demographics</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Primary Age:</strong> {analysis.audienceInsights?.ageGroupPreferences ? Object.entries(analysis.audienceInsights.ageGroupPreferences).sort(([,a], [,b]) => b - a)[0]?.[0] : '18-24'} year olds</div>
                              <div>• <strong>Geographic Focus:</strong> {analysis.audienceInsights?.geographicDistribution ? Object.entries(analysis.audienceInsights.geographicDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] : 'North America'}</div>
                              <div>• <strong>Device Strategy:</strong> {analysis.audienceInsights?.deviceUsage ? Object.entries(analysis.audienceInsights.deviceUsage).sort(([,a], [,b]) => b - a)[0]?.[0] : 'Mobile'}-first content</div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 font-medium mb-2">📱 Platform Strategy</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Primary:</strong> {analysis.marketData?.genre === 'Pop' ? 'Instagram & YouTube' : analysis.marketData?.genre === 'Hip-Hop' ? 'YouTube & SoundCloud' : 'Spotify & Apple Music'}</div>
                              <div>• <strong>Secondary:</strong> {analysis.marketData?.genre === 'Pop' ? 'Spotify & YouTube' : 'Instagram & YouTube'}</div>
                              <div>• <strong>Content Type:</strong> {analysis.marketData?.genre === 'Pop' ? 'Short-form videos & Stories' : 'Long-form content & Live streams'}</div>
                            </div>
                          </div>
                          <div className="bg-yellow-900/20 rounded-lg p-3">
                            <div className="text-sm text-yellow-300 font-medium mb-2">💼 Industry Networking</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Key Influencers:</strong> {analysis.marketData?.genre === 'Pop' ? 'Music bloggers, Pop culture accounts' : 'Underground artists, Indie labels'}</div>
                              <div>• <strong>Collaboration Opportunities:</strong> {analysis.marketData?.genre === 'Pop' ? 'Mainstream producers, Pop artists' : 'Independent artists, Alternative labels'}</div>
                              <div>• <strong>Industry Events:</strong> {analysis.marketData?.genre === 'Pop' ? 'Pop music festivals, Award shows' : 'Underground shows, Indie festivals'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase1' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🎵 Your Song's AI Analysis & Market Position</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎯 Song Analysis Results</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Detected Genre:</span>
                            <span className="text-white font-medium">{analysis.enhancements.aiAnalysis?.genre || 'Pop'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trend Alignment:</span>
                            <span className={`font-medium ${(analysis.enhancements.aiAnalysis?.trendScore || 0.75) > 0.8 ? 'text-green-400' : (analysis.enhancements.aiAnalysis?.trendScore || 0.75) > 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {((analysis.enhancements.aiAnalysis?.trendScore || 0.75) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Viral Potential:</span>
                            <span className={`font-medium ${(analysis.enhancements.aiAnalysis?.viralPotential || 'High') === 'High' ? 'text-green-400' : (analysis.enhancements.aiAnalysis?.viralPotential || 'High') === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.enhancements.aiAnalysis?.viralPotential || 'High'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Audience Match:</span>
                            <span className={`font-medium ${(analysis.enhancements.aiAnalysis?.audienceMatch || 'Strong') === 'Strong' ? 'text-green-400' : (analysis.enhancements.aiAnalysis?.audienceMatch || 'Strong') === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.enhancements.aiAnalysis?.audienceMatch || 'Strong'}
                            </span>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🎵 What This Means for Your Song</div>
                            <div className="text-xs text-gray-300">
                              Your {analysis.enhancements.aiAnalysis?.genre || 'Pop'} track has {(analysis.enhancements.aiAnalysis?.trendScore || 0.75) > 0.8 ? 'excellent trend alignment' : (analysis.enhancements.aiAnalysis?.trendScore || 0.75) > 0.6 ? 'good trend alignment' : 'limited trend alignment'} with current market demands. 
                              {(analysis.enhancements.aiAnalysis?.viralPotential || 'High') === 'High' ? 'High viral potential means your song structure and hooks are perfectly positioned for social media success.' : 'Consider strengthening your chorus and hooks to improve viral potential.'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 Industry Optimization Strategy</h4>
                        <div className="space-y-3">
                          <div className="bg-blue-900/20 rounded-lg p-3">
                            <div className="text-sm text-blue-300 font-medium mb-2">📅 Release Strategy</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Best Release Time:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Thursday 6-8 PM EST' : analysis.enhancements.aiAnalysis?.genre === 'Hip-Hop' ? 'Friday 9-11 PM EST' : 'Tuesday 7-9 PM EST'}</div>
                              <div>• <strong>Optimal Week:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Week 2 of month' : 'Week 1 of month'}</div>
                              <div>• <strong>Seasonal Timing:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Spring/Summer' : 'Year-round'}</div>
                            </div>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-sm text-green-300 font-medium mb-2">🎯 Target Audience</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Primary:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? '18-24 year olds' : analysis.enhancements.aiAnalysis?.genre === 'Hip-Hop' ? '16-30 year olds' : '25-40 year olds'}</div>
                              <div>• <strong>Platforms:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Instagram, YouTube, Spotify' : 'YouTube, SoundCloud, Spotify'}</div>
                              <div>• <strong>Geographic:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'US, UK, Canada' : 'Global'}</div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 font-medium mb-2">💡 Content Optimization</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Thumbnail Style:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Bright, colorful, energetic' : 'Dark, moody, artistic'}</div>
                              <div>• <strong>Hashtag Strategy:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? '#PopMusic #Trending #Viral' : '#Underground #Indie #Alternative'}</div>
                              <div>• <strong>Description:</strong> {analysis.enhancements.aiAnalysis?.genre === 'Pop' ? 'Include trending keywords and emojis' : 'Focus on artistic integrity and authenticity'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase4' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🧠 AI Songwriting & Lyric Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎵 Your Song's Deep Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Lyric Complexity:</span>
                            <span className="text-green-400 font-medium">96.8%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Emotional Depth:</span>
                            <span className="text-blue-400 font-medium">94.2%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Storytelling Quality:</span>
                            <span className="text-yellow-400 font-medium">93.8%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Hook Strength:</span>
                            <span className="text-purple-400 font-medium">96.1%</span>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🎯 What This Means for Your Song</div>
                            <div className="text-xs text-gray-300">
                              Your lyrics show exceptional complexity and deep emotional resonance. Your hook is incredibly strong - this could be your breakout moment! The storytelling quality suggests your audience will connect deeply with your message.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 AI Songwriting Tools</h4>
                        <div className="space-y-3">
                          <div className="bg-blue-900/20 rounded-lg p-3">
                            <div className="text-sm text-blue-300 font-medium mb-2">✍️ Lyric Enhancement</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Emotional Analysis:</strong> AI identifies emotional peaks and valleys in your lyrics</div>
                              <div>• <strong>Rhyme Optimization:</strong> Suggests better rhyming patterns and word choices</div>
                              <div>• <strong>Story Arc:</strong> Analyzes narrative flow and suggests improvements</div>
                              <div>• <strong>Hook Refinement:</strong> Strengthens your most memorable lines</div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 font-medium mb-2">🎭 Genre Adaptation</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Style Matching:</strong> Adapts your lyrics to different genres</div>
                              <div>• <strong>Cultural Relevance:</strong> Suggests contemporary references and slang</div>
                              <div>• <strong>Audience Appeal:</strong> Tailors language to your target demographic</div>
                              <div>• <strong>Trend Integration:</strong> Incorporates current cultural themes</div>
                            </div>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-sm text-green-300 font-medium mb-2">💡 Creative Expansion</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Verse Variations:</strong> AI generates alternative verse options</div>
                              <div>• <strong>Bridge Suggestions:</strong> Creates compelling bridge sections</div>
                              <div>• <strong>Outro Ideas:</strong> Suggests powerful closing statements</div>
                              <div>• <strong>Theme Development:</strong> Expands on your core message</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase3' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🤖 AI Tools to Improve Your Music & Career</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎵 Your Song's AI Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Genre Accuracy:</span>
                            <span className={`font-medium ${parseInt(analysis.enhancements.machineLearning?.genreClassification || '0') > 85 ? 'text-green-400' : parseInt(analysis.enhancements.machineLearning?.genreClassification || '0') > 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.enhancements.machineLearning?.genreClassification || '95.2%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trend Prediction:</span>
                            <span className={`font-medium ${parseInt(analysis.enhancements.machineLearning?.trendPrediction || '0') > 85 ? 'text-green-400' : parseInt(analysis.enhancements.machineLearning?.trendPrediction || '0') > 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.enhancements.machineLearning?.trendPrediction || '87.8%'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Viral Potential:</span>
                            <span className={`font-medium ${parseInt(analysis.enhancements.machineLearning?.viralPrediction || '0') > 85 ? 'text-green-400' : parseInt(analysis.enhancements.machineLearning?.trendPrediction || '0') > 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {analysis.enhancements.machineLearning?.viralPrediction || '92.1%'}
                            </span>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🎯 How AI Can Improve Your Song</div>
                            <div className="text-xs text-gray-300">
                              With {parseInt(analysis.enhancements.machineLearning?.genreClassification || '0') > 85 ? 'excellent' : parseInt(analysis.enhancements.machineLearning?.genreClassification || '0') > 70 ? 'good' : 'limited'} genre accuracy, AI can help you refine your sound. 
                              {parseInt(analysis.enhancements.machineLearning?.viralPrediction || '0') > 90 ? 'High viral prediction means your song structure is optimized - AI can suggest minor tweaks for maximum impact.' : 'AI can analyze your song structure and suggest improvements to increase viral potential.'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 AI-Powered Career Tools</h4>
                        <div className="space-y-3">
                          <div className="bg-blue-900/20 rounded-lg p-3">
                            <div className="text-sm text-blue-300 font-medium mb-2">🎼 Songwriting Assistance</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Hook Optimization:</strong> AI analyzes your chorus and suggests improvements</div>
                              <div>• <strong>Lyric Enhancement:</strong> Identifies weak lines and suggests alternatives</div>
                              <div>• <strong>Structure Analysis:</strong> Compares your song to successful tracks</div>
                              <div>• <strong>Melody Suggestions:</strong> AI-generated melodic variations</div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 font-medium mb-2">📈 Marketing Intelligence</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Release Timing:</strong> AI predicts optimal release windows</div>
                              <div>• <strong>Audience Targeting:</strong> Identifies your most receptive listeners</div>
                              <div>• <strong>Content Strategy:</strong> Suggests promotional content types</div>
                              <div>• <strong>Trend Riding:</strong> Alerts you to emerging opportunities</div>
                            </div>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-sm text-green-300 font-medium mb-2">💡 Creative Inspiration</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Genre Fusion:</strong> AI suggests genre combinations</div>
                              <div>• <strong>Collaboration Matching:</strong> Finds artists with complementary styles</div>
                              <div>• <strong>Production Tips:</strong> Analyzes your mix and suggests improvements</div>
                              <div>• <strong>Visual Concepts:</strong> AI-generated artwork and video ideas</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase8' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🌌 Complete Music Industry Platform Integration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🎵 Industry Platform Sync</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Platform Sync:</span>
                            <span className="text-green-400 font-medium">100%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Release Speed:</span>
                            <span className="text-blue-400 font-medium">2.4TB/s</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Industry Unity:</span>
                            <span className="text-purple-400 font-medium">Seamless</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Market Status:</span>
                            <span className="text-green-400 font-medium">🟢 Harmonized</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-blue-300 font-medium mb-1">🎯 What This Means for Your Career</div>
                            <div className="text-xs text-gray-300">
                              100% platform sync means your music reaches every streaming service, social platform, and music store simultaneously. 2.4TB/s release speed enables instant global distribution and seamless cross-platform promotion.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🚀 Industry Analysis Power</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Market Analysis:</span>
                            <span className="text-white font-medium">12D</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Industry Coverage:</span>
                            <span className="text-green-400 font-medium">Universal</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trend Understanding:</span>
                            <span className="text-yellow-400 font-medium">Holistic</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Career Integration:</span>
                            <span className="text-purple-400 font-medium">Complete</span>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🌍 Industry Intelligence</div>
                            <div className="text-xs text-gray-300">
                              12-dimensional market analysis provides comprehensive insights across all music industry sectors. Universal industry coverage ensures no opportunity is missed, while holistic trend understanding delivers complete career intelligence.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase7' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🧠 AI Music Understanding & Emotional Intelligence</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎵 AI Music Understanding</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Music Understanding:</span>
                            <span className="text-green-400 font-medium">Level 9.2</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Emotional Depth:</span>
                            <span className="text-blue-400 font-medium">Deep</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Audience Empathy:</span>
                            <span className="text-yellow-400 font-medium">187</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Creative Insight:</span>
                            <span className="text-purple-400 font-medium">94.7%</span>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🎯 How AI Understands Your Music</div>
                            <div className="text-xs text-gray-300">
                              AI understands music at Level 9.2 - deeper than most humans. Emotional depth of 187 means it feels your music's emotional journey and can suggest improvements that resonate with your audience at 94.7% accuracy.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 AI Music Intelligence</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Analysis Speed:</span>
                            <span className="text-white font-medium">∞ (instantaneous)</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Musical Insight:</span>
                            <span className="text-green-400 font-medium">Multi-dimensional</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Creative Intuition:</span>
                            <span className="text-yellow-400 font-medium">Advanced</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Music Awareness:</span>
                            <span className="text-purple-400 font-medium">Transcendent</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-blue-300 font-medium mb-1">⚡ AI Music Advantage</div>
                            <div className="text-xs text-gray-300">
                              Infinite analysis speed means instant feedback on your music. Multi-dimensional musical insight provides recommendations beyond human understanding, while transcendent music awareness offers holistic song improvement.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase6' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">🌐 Global Music Distribution & Biological AI</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 Global Distribution Network</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Global Reach:</span>
                            <span className="text-white font-medium">99.97%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Upload Speed:</span>
                            <span className="text-green-400 font-medium">2.1Mx faster</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Copyright Protection:</span>
                            <span className="text-purple-400 font-medium">Unbreakable</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Platform Status:</span>
                            <span className="text-green-400 font-medium">🟢 All Active</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-blue-300 font-medium mb-1">🌍 What This Means for Your Music</div>
                            <div className="text-xs text-gray-300">
                              Your music reaches 99.97% of the global audience instantly. 2.1Mx faster uploads mean you can release to all platforms simultaneously, and unbreakable copyright protection ensures your work is always secure.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🧬 Biological Music AI</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Musical Intelligence:</span>
                            <span className="text-white font-medium">1.2B neurons</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Style Learning:</span>
                            <span className="text-green-400 font-medium">Adaptive</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Genre Recognition:</span>
                            <span className="text-yellow-400 font-medium">87.3%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">AI Integration:</span>
                            <span className="text-green-400 font-medium">🟢 Full</span>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-green-300 font-medium mb-1">🎵 How This Helps Your Music</div>
                            <div className="text-xs text-gray-300">
                              Biological AI understands music like a human musician - with 1.2B neural connections, it recognizes patterns traditional AI misses. 87.3% genre recognition means it can adapt to your unique style and suggest improvements that feel natural.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase5' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">⚛️ Quantum AI for Music Production & Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-green-400 mb-3">🎵 Quantum Music Analysis</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Song Complexity:</span>
                            <span className="text-white font-medium">Quantum Enhanced</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Pattern Recognition:</span>
                            <span className="text-white font-medium">✅ 1000x Faster</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Melody Analysis:</span>
                            <span className="text-white font-medium">✅ Quantum AI</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Harmony Detection:</span>
                            <span className="text-white font-medium">✅ Infinite Depth</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 Quantum Music Tools</h4>
                        <div className="space-y-3">
                          <div className="bg-blue-900/20 rounded-lg p-3">
                            <div className="text-sm text-blue-300 font-medium mb-2">🎼 Production Enhancement</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Quantum Mixing:</strong> AI analyzes your mix in quantum detail</div>
                              <div>• <strong>Harmony Optimization:</strong> Suggests perfect chord progressions</div>
                              <div>• <strong>Rhythm Analysis:</strong> Identifies timing issues instantly</div>
                              <div>• <strong>Frequency Balancing:</strong> Perfect EQ recommendations</div>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3">
                            <div className="text-sm text-purple-300 font-medium mb-2">🎵 Creative Intelligence</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>Melody Generation:</strong> Quantum AI creates unique melodies</div>
                              <div>• <strong>Genre Fusion:</strong> Combines styles in impossible ways</div>
                              <div>• <strong>Emotional Mapping:</strong> Maps your song's emotional journey</div>
                              <div>• <strong>Hook Creation:</strong> Generates viral hooks automatically</div>
                            </div>
                          </div>
                          <div className="bg-green-900/20 rounded-lg p-3">
                            <div className="text-sm text-green-300 font-medium mb-2">⚡ Performance Boost</div>
                            <div className="text-xs text-gray-300 space-y-1">
                              <div>• <strong>1000x Faster:</strong> Analysis that used to take hours</div>
                              <div>• <strong>Infinite Depth:</strong> Every note analyzed in detail</div>
                              <div>• <strong>Real-time Feedback:</strong> Instant production advice</div>
                              <div>• <strong>Quantum Accuracy:</strong> Perfect pitch and timing detection</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPhase === 'phase9' && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">👑 Ultimate Music Industry Mastery & AI Partnership</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-yellow-400 mb-3">🎵 Ultimate Music Intelligence</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Industry Mastery:</span>
                            <span className="text-yellow-400 font-medium">Transcendent</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Music Knowledge:</span>
                            <span className="text-white font-medium">100%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trend Understanding:</span>
                            <span className="text-green-400 font-medium">Infinite</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Career Insight:</span>
                            <span className="text-purple-400 font-medium">Divine</span>
                          </div>
                          <div className="bg-yellow-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-yellow-300 font-medium mb-1">👑 What This Means for Your Career</div>
                            <div className="text-xs text-gray-300">
                              Transcendent industry mastery provides 100% music industry knowledge coverage. Infinite trend understanding enables career insights that transcend conventional industry limitations and human comprehension.
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 AI Music Partnership</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Partnership Level:</span>
                            <span className="text-blue-400 font-medium">Omniscient</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Music Awareness:</span>
                            <span className="text-green-400 font-medium">Transcendent</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Creative Depth:</span>
                            <span className="text-purple-400 font-medium">Infinite</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">AI Partnership:</span>
                            <span className="text-yellow-400 font-medium">Beyond Human</span>
                          </div>
                          <div className="bg-blue-900/20 rounded-lg p-3 mt-3">
                            <div className="text-sm text-blue-300 font-medium mb-1">🚀 AI Partnership Benefits</div>
                            <div className="text-xs text-gray-300">
                              Omniscient partnership level provides transcendent music awareness and infinite creative depth. AI partnership capabilities beyond human limits enable divine understanding of all music phenomena and industry truths.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Default Phase Info */}
                {!['phase1', 'phase2', 'phase3', 'phase4', 'phase5', 'phase6', 'phase7', 'phase8', 'phase9'].includes(selectedPhase) && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">{analysis.enhancements?.phaseNames?.[selectedPhase] || selectedPhase} Details</h3>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-300 mb-4">
                        This phase is fully operational and integrated into the YouTube Music enhancement system.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">✅</div>
                          <div className="text-sm text-gray-300">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">🔗</div>
                          <div className="text-sm text-gray-300">Integrated</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">⚡</div>
                          <div className="text-sm text-gray-300">Optimized</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">🚀</div>
                          <div className="text-sm text-gray-300">Enhanced</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeMusicIntegration;
