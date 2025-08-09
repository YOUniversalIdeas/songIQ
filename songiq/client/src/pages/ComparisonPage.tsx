import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, BarChart3, Album, Music, TrendingUp, FileText } from 'lucide-react';
import SongComparison from '@/components/SongComparison';
import BatchAnalysis from '@/components/BatchAnalysis';

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
    title: "Electric Nights",
    artist: "Demo Artist",
    genre: "electronic",
    duration: 198,
    audioFeatures: {
      danceability: 0.82,
      energy: 0.91,
      valence: 0.45,
      acousticness: 0.05,
      instrumentalness: 0.25,
      liveness: 0.08,
      speechiness: 0.03,
      tempo: 135,
      loudness: -6.2,
      key: 5,
      mode: 1
    },
    successScore: {
      overallScore: 85,
      confidence: 0.92,
      breakdown: {
        audioFeatures: 88,
        marketTrends: 82,
        genreAlignment: 85,
        seasonalFactors: 78
      },
      recommendations: [
        {
          category: "Production",
          priority: "low" as const,
          title: "Fine-tune EQ",
          description: "Minor adjustments to frequency balance",
          impact: 45,
          implementation: "Subtle EQ adjustments in mixing"
        },
        {
          category: "Marketing",
          priority: "medium" as const,
          title: "Target EDM Scene",
          description: "Focus on electronic music communities",
          impact: 75,
          implementation: "Connect with EDM influencers and festivals"
        }
      ],
      riskFactors: [
        "Seasonal timing could be better"
      ],
      marketPotential: 88,
      socialScore: 85
    },
    uploadDate: new Date().toISOString()
  },
  {
    id: 'song-3',
    title: "Acoustic Soul",
    artist: "Demo Artist",
    genre: "folk",
    duration: 245,
    audioFeatures: {
      danceability: 0.45,
      energy: 0.32,
      valence: 0.28,
      acousticness: 0.95,
      instrumentalness: 0.12,
      liveness: 0.18,
      speechiness: 0.08,
      tempo: 95,
      loudness: -12.5,
      key: 8,
      mode: 0
    },
    successScore: {
      overallScore: 72,
      confidence: 0.78,
      breakdown: {
        audioFeatures: 75,
        marketTrends: 68,
        genreAlignment: 70,
        seasonalFactors: 65
      },
      recommendations: [
        {
          category: "Production",
          priority: "medium" as const,
          title: "Improve Vocal Clarity",
          description: "Enhance vocal presence in the mix",
          impact: 60,
          implementation: "Adjust vocal compression and EQ"
        },
        {
          category: "Marketing",
          priority: "high" as const,
          title: "Target Folk Community",
          description: "Connect with folk music enthusiasts",
          impact: 80,
          implementation: "Perform at folk festivals and coffee houses"
        }
      ],
      riskFactors: [
        "Limited mainstream appeal",
        "Seasonal timing affects mood"
      ],
      marketPotential: 68,
      socialScore: 65
    },
    uploadDate: new Date().toISOString()
  },
  {
    id: 'song-4',
    title: "Urban Groove",
    artist: "Demo Artist",
    genre: "hip-hop",
    duration: 187,
    audioFeatures: {
      danceability: 0.88,
      energy: 0.76,
      valence: 0.55,
      acousticness: 0.08,
      instrumentalness: 0.02,
      liveness: 0.15,
      speechiness: 0.25,
      tempo: 95,
      loudness: -7.8,
      key: 3,
      mode: 1
    },
    successScore: {
      overallScore: 81,
      confidence: 0.89,
      breakdown: {
        audioFeatures: 84,
        marketTrends: 79,
        genreAlignment: 82,
        seasonalFactors: 76
      },
      recommendations: [
        {
          category: "Production",
          priority: "low" as const,
          title: "Optimize Bass Levels",
          description: "Fine-tune bass frequencies for clarity",
          impact: 40,
          implementation: "Subtle bass EQ adjustments"
        },
        {
          category: "Marketing",
          priority: "medium" as const,
          title: "Leverage Social Media",
          description: "Use TikTok and Instagram for promotion",
          impact: 85,
          implementation: "Create viral dance challenges and memes"
        }
      ],
      riskFactors: [
        "Competition in hip-hop market"
      ],
      marketPotential: 82,
      socialScore: 88
    },
    uploadDate: new Date().toISOString()
  }
];

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'comparison' | 'batch'>('comparison');


  const handleAddSong = () => {
    // In a real app, this would open a song selection modal
    alert('Song selection feature would open here');
  };

  const handleUploadAlbum = () => {
    // In a real app, this would open an album upload interface
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
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Song Comparison Tool</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Compare songs side-by-side or analyze entire albums
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddSong}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Song</span>
              </button>
              <button
                onClick={handleUploadAlbum}
                className="btn-primary flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Album</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setActiveMode('comparison')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeMode === 'comparison'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Song Comparison</span>
            </button>
            <button
              onClick={() => setActiveMode('batch')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeMode === 'batch'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
                  Compare up to 4 songs with detailed feature analysis and success predictions
                </p>
              </div>
              
              <SongComparison songs={sampleSongs} />
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
              
              <BatchAnalysis 
                songs={sampleSongs} 
                albumTitle="Demo Album - 'Electric Dreams'" 
              />
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
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Upload className="h-5 w-5 text-primary-600" />
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
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Music className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Home</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Return to main page</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Comparison Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Side-by-Side Analysis</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Compare up to 4 songs simultaneously</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Feature Highlighting</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Visual indicators for differences</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Album className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Album Cohesion</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Analyze track flow and consistency</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Export Reports</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generate PDF comparison reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage; 