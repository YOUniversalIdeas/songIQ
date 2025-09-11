import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, BarChart3, Album, Music, TrendingUp } from 'lucide-react';
import SongComparison from '../components/SongComparison';
import BatchAnalysis from '../components/BatchAnalysis';
import SongSelectionModal from '../components/SongSelectionModal';
import { getStoredToken } from '../utils/auth';
import { API_ENDPOINTS } from '../config/api';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<any[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'comparison' | 'batch'>('comparison');
  const [isSongSelectionOpen, setIsSongSelectionOpen] = useState(false);

  useEffect(() => {
    loadUserSongs();
  }, []);

  const loadUserSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = getStoredToken();
      if (!token) {
        setError('Please log in to view your songs');
        setIsLoading(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.SONGS.LIST, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your songs');
        } else {
          throw new Error(`Failed to fetch songs: ${response.status}`);
        }
        return;
      }

      const result = await response.json();
      console.log('ComparisonPage - API response:', result);
      if (result.success) {
        console.log('ComparisonPage - Songs data:', result.data);
        setSongs(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch songs');
      }
    } catch (err) {
      console.error('Failed to load user songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load songs for comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSong = () => {
    setIsSongSelectionOpen(true);
  };

  const handleUploadAlbum = () => {
    alert('Album upload feature would open here');
  };

  const handleSongSelection = (selectedSongs: any[]) => {
    setSelectedSongs(selectedSongs);
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
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading your songs...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error.includes('log in') ? 'Authentication Required' : 'Error loading songs'}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  <div className="mt-2 flex space-x-2">
                    {error.includes('log in') ? (
                      <>
                        <button
                          onClick={() => navigate('/auth')}
                          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Go to Login
                        </button>
                        <button
                          onClick={loadUserSongs}
                          className="text-sm text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline"
                        >
                          Try again
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={loadUserSongs}
                        className="text-sm text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content - Only show when not loading and no errors */}
          {!isLoading && !error && songs.length === 0 && (
            <div className="text-center">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No songs to compare yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload and analyze some songs first to use the comparison tools
              </p>
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Song
              </button>
            </div>
          )}

          {/* Show song selection prompt when user has songs but none selected */}
          {!isLoading && !error && songs.length > 0 && selectedSongs.length === 0 && (
            <div className="text-center">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Select songs to compare
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose songs from your library to start comparing
              </p>
              <button
                onClick={handleAddSong}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Songs
              </button>
            </div>
          )}

          {!isLoading && !error && songs.length > 0 && selectedSongs.length > 0 && activeMode === 'comparison' && (
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
                <SongComparison songs={selectedSongs} />
              </div>
            </div>
          )}

          {!isLoading && !error && songs.length > 0 && selectedSongs.length > 0 && activeMode === 'batch' && (
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
                <BatchAnalysis songs={selectedSongs} albumTitle="Your Songs" />
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

      {/* Song Selection Modal */}
      <SongSelectionModal
        isOpen={isSongSelectionOpen}
        onClose={() => setIsSongSelectionOpen(false)}
        onSelectSongs={handleSongSelection}
        selectedSongs={selectedSongs}
        maxSelections={4}
      />
    </div>
  );
};

export default ComparisonPage; 