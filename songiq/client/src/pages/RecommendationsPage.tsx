
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Target, Users, Calendar, Share2, TestTube, Download, TrendingUp, Brain } from 'lucide-react';
import RecommendationEngine from '@/components/RecommendationEngine';

const RecommendationsPage = () => {
  const navigate = useNavigate();

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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">ML Accuracy</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <Brain className="h-8 w-8 text-blue-200" />
            </div>
            <p className="text-blue-100 text-sm mt-2">Based on 10,000+ songs</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Success Rate</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
              <Target className="h-8 w-8 text-green-200" />
            </div>
            <p className="text-green-100 text-sm mt-2">Following recommendations</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">A/B Tests</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-purple-100 text-sm mt-2">Active experiments</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Avg. Improvement</p>
                <p className="text-2xl font-bold">+23.4%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-200" />
            </div>
            <p className="text-yellow-100 text-sm mt-2">Streaming performance</p>
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