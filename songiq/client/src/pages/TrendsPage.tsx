
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Globe, Calendar, Target, Share2, Download, BarChart3, Info } from 'lucide-react';
import TrendAnalysisDashboard from '../components/TrendAnalysisDashboard';
import { useState, useRef, useEffect } from 'react';

// Custom hook for dynamic tooltip positioning (same as Recommendations page)
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

const TrendsPage = () => {
  const navigate = useNavigate();
  
  // State for tooltips
  const [showMarketGrowthTooltip, setShowMarketGrowthTooltip] = useState(false);
  const [showTopGenreTooltip, setShowTopGenreTooltip] = useState(false);
  const [showSocialSentimentTooltip, setShowSocialSentimentTooltip] = useState(false);
  const [showPredictionAccuracyTooltip, setShowPredictionAccuracyTooltip] = useState(false);

  // Use the custom hook for each tooltip
  const marketGrowthPosition = useTooltipPosition();
  const topGenrePosition = useTooltipPosition();
  const socialSentimentPosition = useTooltipPosition();
  const predictionAccuracyPosition = useTooltipPosition();

  const handleMarketGrowthInfo = () => {
    marketGrowthPosition.updateTooltipPosition();
    setShowMarketGrowthTooltip(true);
    setTimeout(() => setShowMarketGrowthTooltip(false), 4000);
  };

  const handleTopGenreInfo = () => {
    topGenrePosition.updateTooltipPosition();
    setShowTopGenreTooltip(true);
    setTimeout(() => setShowTopGenreTooltip(false), 4000);
  };

  const handleSocialSentimentInfo = () => {
    socialSentimentPosition.updateTooltipPosition();
    setShowSocialSentimentTooltip(true);
    setTimeout(() => setShowSocialSentimentTooltip(false), 4000);
  };

  const handlePredictionAccuracyInfo = () => {
    predictionAccuracyPosition.updateTooltipPosition();
    setShowPredictionAccuracyTooltip(true);
    setTimeout(() => setShowPredictionAccuracyTooltip(false), 4000);
  };

  const exportTrendsReport = async () => {
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Career trends report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🚀 Music Industry Trends & Your Career
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Stay ahead of the curve with real-time industry insights that directly impact your music career
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportTrendsReport}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Career Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Industry Growth</p>
                <p className="text-2xl font-bold">+12.5%</p>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-200" />
                <button
                  ref={marketGrowthPosition.buttonRef}
                  onClick={handleMarketGrowthInfo}
                  className="p-1 rounded-full bg-blue-400 hover:bg-blue-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-blue-100 text-sm mt-2">+2.3% from last month</p>
            
            {/* Tooltip */}
            {showMarketGrowthTooltip && (
              <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${marketGrowthPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  marketGrowthPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
                }`}></div>
                <h4 className="font-semibold mb-2">Industry Growth</h4>
                <p className="text-sm mb-3">
                  Industry Growth shows how the music industry is expanding, creating more opportunities for artists. 
                  This includes streaming revenue, digital sales, and overall market expansion that directly impacts your career potential.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Career Impact:</p>
                  <p>• +12.5% industry growth = more opportunities for you</p>
                  <p>• +2.3% monthly increase = growing demand for music</p>
                  <p>• 6-month positive trend = stable career environment</p>
                  <p>• Above average growth = excellent timing for releases</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Color Coding:</p>
                  <p>• Blue gradient: Represents growth, stability, and positive market trends</p>
                  <p>• Current score (+12.5%): Indicates strong market expansion</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Top Genre</p>
                <p className="text-2xl font-bold">Pop</p>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-green-200" />
                <button
                  ref={topGenrePosition.buttonRef}
                  onClick={handleTopGenreInfo}
                  className="p-1 rounded-full bg-green-400 hover:bg-green-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">85% popularity score</p>
            
            {/* Tooltip */}
            {showTopGenreTooltip && (
              <div className={`absolute top-0 w-[300px] bg-green-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${topGenrePosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  topGenrePosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-green-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-green-600'
                }`}></div>
                <h4 className="font-semibold mb-2">Top Genre</h4>
                <p className="text-sm mb-3">
                  Top Genre shows which music style is currently dominating the market. This helps you understand 
                  audience preferences and decide whether to align with trends or carve your own path.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Career Strategy:</p>
                  <p>• Pop leads with 85% popularity = high audience demand</p>
                  <p>• 12% quarterly increase = growing trend momentum</p>
                  <p>• Global streaming dominance = worldwide reach potential</p>
                  <p>• Strong social presence = viral opportunity</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">What This Means for You:</p>
                  <p>• Green gradient: High demand and opportunity for Pop artists</p>
                  <p>• 85% score: Excellent timing to release Pop music or Pop-influenced tracks</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Audience Mood</p>
                <p className="text-2xl font-bold">Positive</p>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="h-8 w-8 text-purple-200" />
                <button
                  ref={socialSentimentPosition.buttonRef}
                  onClick={handleSocialSentimentInfo}
                  className="p-1 rounded-full bg-purple-400 hover:bg-purple-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-purple-100 text-sm mt-2">78% positive engagement</p>
            
            {/* Tooltip */}
            {showSocialSentimentTooltip && (
              <div className={`absolute top-0 w-[300px] bg-purple-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${socialSentimentPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  socialSentimentPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-purple-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-purple-600'
                }`}></div>
                <h4 className="font-semibold mb-2">Audience Mood</h4>
                <p className="text-sm mb-3">
                  Audience Mood shows how listeners are feeling about music right now. This helps you understand 
                  what emotional content will resonate and whether it's a good time for upbeat or introspective music.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Career Strategy:</p>
                  <p>• 78% positive mood = audience ready for upbeat music</p>
                  <p>• 15% monthly increase = growing positive momentum</p>
                  <p>• Strong viral performance = excellent sharing potential</p>
                  <p>• High social sharing = organic reach opportunity</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">What This Means for You:</p>
                  <p>• Purple gradient: High viral potential and social sharing</p>
                  <p>• 78% score: Perfect time to release positive, shareable content</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">AI Career Predictions</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-yellow-200" />
                <button
                  ref={predictionAccuracyPosition.buttonRef}
                  onClick={handlePredictionAccuracyInfo}
                  className="p-1 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-yellow-100 text-sm mt-2">High confidence model</p>
            
            {/* Tooltip */}
            {showPredictionAccuracyTooltip && (
              <div className={`absolute top-0 w-[300px] bg-yellow-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${predictionAccuracyPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  predictionAccuracyPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-yellow-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-yellow-600'
                }`}></div>
                <h4 className="font-semibold mb-2">AI Career Predictions</h4>
                <p className="text-sm mb-3">
                  AI Career Predictions show how accurately our system forecasts your music's success potential. 
                  This helps you make informed decisions about releases, timing, and career strategy.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Career Planning:</p>
                  <p>• 82% accuracy = reliable career guidance</p>
                  <p>• High confidence = trust our recommendations</p>
                  <p>• 3-month predictions = short-term strategy planning</p>
                  <p>• 6-month predictions = long-term career planning</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">What This Means for You:</p>
                  <p>• Yellow gradient: High confidence in career predictions</p>
                  <p>• 82% score: Trust our AI recommendations for your career decisions</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard */}
        <TrendAnalysisDashboard />

        {/* Feature Highlights */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">🚀 Career-Boosting Trend Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Global Market Insights</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover which regions will love your music and plan your global expansion
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Seasonal Patterns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identify seasonal trends and optimal release timing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Predictive Modeling</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered predictions for 3-6 month market trends
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Genre Analysis</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time genre popularity tracking and growth rates
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tempo & Mood</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track tempo and mood preferences over time
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Social Sentiment</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor social media sentiment and trending topics
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/comparison')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Compare Songs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Side-by-side analysis</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/upload')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Upload Song</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyze your music</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">View Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your analysis results</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Market Insights */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Market Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Pop Music Surge</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Pop music has seen a 12% increase in popularity this quarter, driven by summer festival releases and viral social media trends.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Electronic Growth</h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Electronic music is experiencing 15% growth, particularly in European markets with the return of major festivals.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Tempo Trends</h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Average tempo has increased to 132 BPM this quarter, reflecting a shift toward more energetic, dance-oriented music.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Social Media Impact</h4>
                <p className="text-gray-400 text-sm">
                  Social media continues to drive music discovery with 85% of viral songs achieving chart success within 30 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsPage; 