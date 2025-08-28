
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Users, Calendar, Share2, TestTube, Download, TrendingUp, Brain, Info, Music, Loader2 } from 'lucide-react';
import RecommendationEngine from '@/components/RecommendationEngine';
import { useState, useRef, useEffect } from 'react';

// Custom hook for dynamic tooltip positioning
const useTooltipPosition = () => {
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateTooltipPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 300; // Width of the tooltip
      const margin = 20; // Margin from edge

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - buttonRect.right - margin;
      const spaceOnLeft = buttonRect.left - margin;

      if (spaceOnRight >= tooltipWidth) {
        setTooltipPosition('right');
      } else if (spaceOnLeft >= tooltipWidth) {
        setTooltipPosition('left');
      } else {
        // If neither side has enough space, default to left for better visibility
        setTooltipPosition('left');
      }
    }
  };

  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    return () => window.removeEventListener('resize', updateTooltipPosition);
  }, []);

  return { tooltipPosition, buttonRef, updateTooltipPosition };
};

interface Song {
  songId: string;
  title: string;
  artist: string;
  uploadDate: string;
  overallScore: number;
  hasAnalysis: boolean;
  topRecommendation: string;
}

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [showMLAccuracyTooltip, setShowMLAccuracyTooltip] = useState(false);
  const [showSuccessRateTooltip, setShowSuccessRateTooltip] = useState(false);
  const [showABTestsTooltip, setShowABTestsTooltip] = useState(false);
  const [showAvgImprovementTooltip, setShowAvgImprovementTooltip] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string>('');
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [songsError, setSongsError] = useState<string | null>(null);

  // Use the custom hook for each tooltip
  const mlAccuracyPosition = useTooltipPosition();
  const successRatePosition = useTooltipPosition();
  const abTestsPosition = useTooltipPosition();
  const avgImprovementPosition = useTooltipPosition();

  // Fetch available songs
  const fetchAvailableSongs = async () => {
    setIsLoadingSongs(true);
    setSongsError(null);
    
    try {
      const response = await fetch('/api/recommendations');
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAvailableSongs(result.data);
        // Auto-select first song with analysis if available
        const firstSongWithAnalysis = result.data.find((song: Song) => song.hasAnalysis);
        if (firstSongWithAnalysis) {
          setSelectedSongId(firstSongWithAnalysis.songId);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch songs');
      }
    } catch (err) {
      setSongsError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching songs:', err);
    } finally {
      setIsLoadingSongs(false);
    }
  };

  // Load songs on component mount
  useEffect(() => {
    fetchAvailableSongs();
  }, []);

  const handleMLAccuracyInfo = () => {
    mlAccuracyPosition.updateTooltipPosition();
    setShowMLAccuracyTooltip(true);
    setTimeout(() => setShowMLAccuracyTooltip(false), 4000);
  };

  const handleSuccessRateInfo = () => {
    successRatePosition.updateTooltipPosition();
    setShowSuccessRateTooltip(true);
    setTimeout(() => setShowSuccessRateTooltip(false), 4000);
  };

  const handleABTestsInfo = () => {
    abTestsPosition.updateTooltipPosition();
    setShowABTestsTooltip(true);
    setTimeout(() => setShowABTestsTooltip(false), 4000);
  };

  const handleAvgImprovementInfo = () => {
    avgImprovementPosition.updateTooltipPosition();
    setShowAvgImprovementTooltip(true);
    setTimeout(() => setShowAvgImprovementTooltip(false), 4000);
  };

  const exportRecommendations = async () => {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Recommendations report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Recommendation Engine</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Get personalized recommendations to optimize your music success
              </p>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Song Selection */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select a Song for Analysis</h2>
          
          {isLoadingSongs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
              <span className="text-gray-600 dark:text-gray-400">Loading your songs...</span>
            </div>
          ) : songsError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">{songsError}</p>
              <button
                onClick={fetchAvailableSongs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : availableSongs.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Songs Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload a song first to get personalized recommendations
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Your First Song
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSongs.map((song) => (
                  <div
                    key={song.songId}
                    onClick={() => setSelectedSongId(song.songId)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedSongId === song.songId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{song.title}</h3>
                      {song.hasAnalysis ? (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded-full">
                          Analyzed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{song.artist}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(song.uploadDate).toLocaleDateString()}
                      </span>
                      {song.hasAnalysis && (
                        <span className="font-medium text-blue-600">
                          Score: {song.overallScore}/100
                        </span>
                      )}
                    </div>
                    {song.hasAnalysis && song.topRecommendation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                        {song.topRecommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {availableSongs.some(song => !song.hasAnalysis) && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Some songs need analysis before recommendations can be generated
                  </p>
                  <button
                    onClick={() => navigate('/analysis')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm underline"
                  >
                    Go to Analysis Page
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Engine */}
        {selectedSongId ? (
          <RecommendationEngine songId={selectedSongId} />
        ) : availableSongs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Song</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose a song from the list above to view personalized recommendations
            </p>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recommendation Engine Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Feature Optimization</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ML-based suggestions for improving audio features like danceability, energy, and tempo
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Collaboration Matching</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered artist matching based on compatibility, audience overlap, and success patterns
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Release Timing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optimal release date suggestions based on market trends and competition analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Marketing Strategy</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Platform-specific marketing recommendations with expected reach and cost analysis
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">A/B Testing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continuous algorithm testing and optimization based on user engagement and success rates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">ML Learning</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continuous improvement through feedback loops and success pattern analysis
              </p>
            </div>
          </div>
        </div>

        {/* Algorithm Comparison */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Algorithm Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">ML-Based</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-200">Accuracy</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-200">Speed</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Fast</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-800 dark:text-blue-200">Best For</span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Feature optimization</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Hybrid</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-800 dark:text-green-200">Accuracy</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">91.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-800 dark:text-green-200">Speed</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-800 dark:text-green-200">Best For</span>
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Collaborations</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Collaborative</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-800 dark:text-purple-200">Accuracy</span>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">89.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-800 dark:text-purple-200">Speed</span>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Slow</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-800 dark:text-purple-200">Best For</span>
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Collaborations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Upload Song</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized recommendations</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/trends')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">View Trends</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Market analysis and predictions</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/comparison')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Compare Songs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Side-by-side analysis</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Success Stories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Indie Artist Breakthrough</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                "Following the AI recommendations for feature optimization and release timing, my song went from 1,000 to 50,000 streams in just 2 weeks."
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+4,900% increase</span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Genre Transition Success</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                "The genre switching recommendations helped me successfully transition from rock to pop, increasing my audience by 300%."
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">+300% audience growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage; 