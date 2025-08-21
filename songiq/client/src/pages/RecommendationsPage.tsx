
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Users, Calendar, Share2, TestTube, Download, TrendingUp, Brain, Info } from 'lucide-react';
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

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [showMLAccuracyTooltip, setShowMLAccuracyTooltip] = useState(false);
  const [showSuccessRateTooltip, setShowSuccessRateTooltip] = useState(false);
  const [showABTestsTooltip, setShowABTestsTooltip] = useState(false);
  const [showAvgImprovementTooltip, setShowAvgImprovementTooltip] = useState(false);

  // Use the custom hook for each tooltip
  const mlAccuracyPosition = useTooltipPosition();
  const successRatePosition = useTooltipPosition();
  const abTestsPosition = useTooltipPosition();
  const avgImprovementPosition = useTooltipPosition();

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Recommendation Engine</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Machine learning-powered suggestions to optimize your music success
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportRecommendations}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">ML Accuracy</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-200" />
                <button
                  ref={mlAccuracyPosition.buttonRef}
                  onClick={handleMLAccuracyInfo}
                  className="p-1 rounded-full bg-blue-400 hover:bg-blue-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-blue-100 text-sm mt-2">Based on 10,000+ songs</p>
            
            {/* Tooltip */}
            {showMLAccuracyTooltip && (
              <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-lg z-[99999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${mlAccuracyPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  mlAccuracyPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
                }`}></div>
                <h4 className="font-semibold mb-2">ML Accuracy</h4>
                <p className="text-sm mb-3">
                  Machine Learning Accuracy represents the reliability of our AI predictions and recommendations. 
                  This percentage indicates how often our model's predictions align with actual outcomes.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Scale Information:</p>
                  <p>• 90-100%: Excellent accuracy, highly reliable predictions</p>
                  <p>• 80-89%: Very good accuracy, reliable for most decisions</p>
                  <p>• 70-79%: Good accuracy, use with some caution</p>
                  <p>• Below 70%: Lower accuracy, consider additional factors</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Color Coding:</p>
                  <p>• Blue gradient: Represents AI/ML technology and trust</p>
                  <p>• Current score (94.2%): Indicates excellent model performance</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Success Rate</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-200" />
                <button
                  ref={successRatePosition.buttonRef}
                  onClick={handleSuccessRateInfo}
                  className="p-1 rounded-full bg-green-400 hover:bg-green-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-green-100 text-sm mt-2">Following recommendations</p>
            
            {/* Tooltip */}
            {showSuccessRateTooltip && (
              <div className={`absolute top-0 w-[300px] bg-green-600 text-white p-4 rounded-lg shadow-lg z-[99999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${successRatePosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  successRatePosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-green-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-green-600'
                }`}></div>
                <h4 className="font-semibold mb-2">Success Rate</h4>
                <p className="text-sm mb-3">
                  Success Rate measures how often artists achieve their goals when following our AI-powered recommendations. 
                  This percentage shows the effectiveness of our suggestion system in real-world applications.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Scale Information:</p>
                  <p>• 90-100%: Exceptional success rate, highly effective recommendations</p>
                  <p>• 80-89%: Very good success rate, reliable guidance system</p>
                  <p>• 70-79%: Good success rate, useful with some discretion</p>
                  <p>• Below 70%: Lower success rate, consider alternative approaches</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Color Coding:</p>
                  <p>• Green gradient: Represents success, growth, and positive outcomes</p>
                  <p>• Current score (87.5%): Indicates very good recommendation effectiveness</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">A/B Tests</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <div className="flex items-center space-x-2">
                <TestTube className="h-8 w-8 text-purple-200" />
                <button
                  ref={abTestsPosition.buttonRef}
                  onClick={handleABTestsInfo}
                  className="p-1 rounded-full bg-purple-400 hover:bg-purple-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-purple-100 text-sm mt-2">Active experiments</p>
            
            {/* Tooltip */}
            {showABTestsTooltip && (
              <div className={`absolute top-0 w-[300px] bg-purple-600 text-white p-4 rounded-lg shadow-lg z-[99999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${abTestsPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  abTestsPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-purple-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-purple-600'
                }`}></div>
                <h4 className="font-semibold mb-2">A/B Tests</h4>
                <p className="text-sm mb-3">
                  A/B Tests represent ongoing experiments that compare different versions of features, 
                  recommendations, or strategies to determine which performs better with your audience.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Scale Information:</p>
                  <p>• 200+: Extensive testing, comprehensive optimization</p>
                  <p>• 100-199: Active testing, good optimization coverage</p>
                  <p>• 50-99: Moderate testing, basic optimization</p>
                  <p>• Below 50: Limited testing, consider expanding experiments</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Color Coding:</p>
                  <p>• Purple gradient: Represents experimentation, innovation, and testing</p>
                  <p>• Current count (156): Indicates active and comprehensive testing program</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Avg. Improvement</p>
                <p className="text-2xl font-bold">+23.4%</p>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-yellow-200" />
                <button
                  ref={avgImprovementPosition.buttonRef}
                  onClick={handleAvgImprovementInfo}
                  className="p-1 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors duration-200"
                  title="Click for more information"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <p className="text-yellow-100 text-sm mt-2">Streaming performance</p>
            
            {/* Tooltip */}
            {showAvgImprovementTooltip && (
              <div className={`absolute top-0 w-[300px] bg-yellow-600 text-white p-4 rounded-lg shadow-lg z-[99999] 
                left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                md:w-[300px] md:left-auto md:right-auto md:mx-auto
                ${avgImprovementPosition.tooltipPosition === 'right' 
                  ? 'md:left-full md:ml-2' 
                  : 'md:right-full md:mr-2'
                }
              `}>
                <div className={`absolute top-4 hidden md:block ${
                  avgImprovementPosition.tooltipPosition === 'right' 
                    ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-yellow-600' 
                    : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-yellow-600'
                }`}></div>
                <h4 className="font-semibold mb-2">Average Improvement</h4>
                <p className="text-sm mb-3">
                  Average Improvement measures the typical performance boost artists experience 
                  when implementing our recommendations, specifically in streaming metrics and audience engagement.
                </p>
                <div className="text-sm mb-3">
                  <p className="font-medium mb-1">Scale Information:</p>
                  <p>• +30%+: Exceptional improvement, outstanding results</p>
                  <p>• +20-29%: Very good improvement, strong performance gains</p>
                  <p>• +10-19%: Good improvement, noticeable positive impact</p>
                  <p>• Below +10%: Lower improvement, may need strategy adjustment</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">Color Coding:</p>
                  <p>• Yellow gradient: Represents growth, optimism, and positive trends</p>
                  <p>• Current score (+23.4%): Indicates very good improvement performance</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Engine */}
        <RecommendationEngine />

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
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">Genre switching</span>
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