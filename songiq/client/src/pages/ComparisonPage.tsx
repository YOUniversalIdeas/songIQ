import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, BarChart3, Album, Music, TrendingUp } from 'lucide-react';
import SongComparison from '../components/SongComparison';
import BatchAnalysis from '../components/BatchAnalysis';

// Sample data for demonstration
const sampleSongs = [
  {
    id: 'song-1',
    title: "Midnight Dreams",
    artist: "Demo Artist",
    genre: "pop",
    duration: 225,
    audioFeatures: {
      danceability: 0.75,
      energy: 0.68,
      valence: 0.62,
      acousticness: 0.15,
      instrumentalness: 0.08,
      liveness: 0.12,
      speechiness: 0.05,
      tempo: 128,
      loudness: -8.5,
      key: 1,
      mode: 1
    },
    successScore: {
      overallScore: 78,
      confidence: 0.85,
      breakdown: {
        audioFeatures: 82,
        marketTrends: 75,
        genreAlignment: 80,
        seasonalFactors: 70
      },
      recommendations: [
        {
          category: "Production",
          priority: "high" as const,
          title: "Enhance Dynamic Range",
          description: "Add more contrast between quiet and loud sections",
          impact: 85,
          implementation: "Work with your producer to add build-ups and drops"
        },
        {
          category: "Marketing",
          priority: "medium" as const,
          title: "Target Pop Audience",
          description: "Focus marketing efforts on pop listeners",
          impact: 70,
          implementation: "Create playlists and collaborate with similar artists"
        }
      ],
      riskFactors: [
        "Competition from established artists",
        "Limited differentiation from trends"
      ],
      marketPotential: 75,
      socialScore: 72
    },
    uploadDate: new Date().toISOString()
  },
  {
    id: 'song-2',
    title: "Summer Vibes",
    artist: "Demo Artist",
    genre: "pop",
    duration: 198,
    audioFeatures: {
      danceability: 0.82,
      energy: 0.75,
      valence: 0.78,
      acousticness: 0.08,
      instrumentalness: 0.05,
      liveness: 0.15,
      speechiness: 0.04,
      tempo: 132,
      loudness: -7.8,
      key: 5,
      mode: 1
    },
    successScore: {
      overallScore: 85,
      confidence: 0.90,
      breakdown: {
        audioFeatures: 88,
        marketTrends: 82,
        genreAlignment: 85,
        seasonalFactors: 88
      },
      recommendations: [
        {
          category: "Production",
          priority: "low" as const,
          title: "Minor Mix Adjustments",
          description: "Fine-tune the bass frequencies for better club sound",
          impact: 45,
          implementation: "Work with your engineer on EQ settings"
        }
      ],
      riskFactors: [
        "Seasonal timing dependency"
      ],
      marketPotential: 88,
      socialScore: 85
    },
    uploadDate: new Date().toISOString()
  }
];

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'comparison' | 'batch'>('comparison');

  const handleAddSong = () => {
    alert('Song selection feature would open here');
  };

  const handleUploadAlbum = () => {
    alert('Album upload feature would open here');
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
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Song Comparison Tool</h1>
                <p className="text-gray-600">
                  Compare songs side-by-side or analyze entire albums
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddSong}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Song</span>
              </button>
              <button
                onClick={handleUploadAlbum}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Album</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setActiveMode('comparison')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeMode === 'comparison'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Song Comparison</span>
            </button>
            <button
              onClick={() => setActiveMode('batch')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeMode === 'batch'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Album className="w-4 h-4" />
              <span>Album Analysis</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeMode === 'comparison' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Side-by-Side Song Comparison
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Compare songs with detailed feature analysis and success predictions
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <SongComparison songs={sampleSongs} />
              </div>
            </div>
          )}

          {activeMode === 'batch' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Album & EP Analysis
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Analyze entire albums for cohesion, track progression, and overall success potential
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <BatchAnalysis songs={sampleSongs} albumTitle="Demo Album" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Upload New Song</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add a song to your library</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">View Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">See all your analyses</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Home</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Return to main page</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage; 