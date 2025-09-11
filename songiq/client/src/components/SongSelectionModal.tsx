import React, { useState, useEffect } from 'react';
import { X, Search, Music, Clock, User, Tag } from 'lucide-react';
import { getStoredToken } from '../utils/auth';
import { API_ENDPOINTS } from '../config/api';

interface Song {
  _id: string;
  title: string;
  artist: string;
  genre?: string;
  duration?: number;
  createdAt: string;
  analysisResults?: {
    successPrediction?: {
      score: number;
    };
    audioFeatures?: {
      genre: string;
    };
  };
}

interface SongSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSongs: (songs: Song[]) => void;
  selectedSongs: Song[];
  maxSelections?: number;
}

const SongSelectionModal: React.FC<SongSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectSongs,
  selectedSongs,
  maxSelections = 4
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempSelectedSongs, setTempSelectedSongs] = useState<Song[]>(selectedSongs);

  useEffect(() => {
    if (isOpen) {
      loadUserSongs();
      setTempSelectedSongs(selectedSongs);
    }
  }, [isOpen, selectedSongs]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (song.genre && song.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSongs(filtered);
    }
  }, [songs, searchQuery]);

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
      if (result.success) {
        setSongs(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch songs');
      }
    } catch (err) {
      console.error('Failed to load user songs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load songs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongToggle = (song: Song) => {
    const isSelected = tempSelectedSongs.some(s => s._id === song._id);
    
    if (isSelected) {
      setTempSelectedSongs(prev => prev.filter(s => s._id !== song._id));
    } else if (tempSelectedSongs.length < maxSelections) {
      setTempSelectedSongs(prev => [...prev, song]);
    }
  };

  const handleConfirm = () => {
    onSelectSongs(tempSelectedSongs);
    onClose();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Select Songs for Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose up to {maxSelections} songs to compare
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs by title, artist, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Selected Songs Counter */}
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {tempSelectedSongs.length} of {maxSelections} songs selected
              </span>
              {tempSelectedSongs.length > 0 && (
                <button
                  onClick={() => setTempSelectedSongs([])}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading your songs...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  <Music className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {error.includes('log in') ? 'Authentication Required' : 'Failed to load songs'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                {error.includes('log in') ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => window.location.href = '/auth'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Login
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Or try again if you just logged in
                    </p>
                    <button
                      onClick={loadUserSongs}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loadUserSongs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                )}
              </div>
            ) : filteredSongs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Music className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? 'No songs found' : 'No songs available'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search terms'
                    : 'Upload some songs first to use the comparison feature'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSongs.map((song) => {
                  const isSelected = tempSelectedSongs.some(s => s._id === song._id);
                  const isDisabled = !isSelected && tempSelectedSongs.length >= maxSelections;
                  
                  return (
                    <div
                      key={song._id}
                      onClick={() => !isDisabled && handleSongToggle(song)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDisabled
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 cursor-not-allowed opacity-50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-1 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {song.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {song.artist}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {song.genre && (
                              <div className="flex items-center space-x-1">
                                <Tag className="h-3 w-3" />
                                <span>{song.genre}</span>
                              </div>
                            )}
                            {song.duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(song.duration)}</span>
                              </div>
                            )}
                          </div>
                          
                          {song.analysisResults?.successPrediction && (
                            <div className="mt-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Success Score:</span>
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                      width: `${song.analysisResults.successPrediction.score * 100}%`
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {Math.round(song.analysisResults.successPrediction.score * 100)}%
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            Added {formatDate(song.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tempSelectedSongs.length > 0 && (
              <span>
                {tempSelectedSongs.map(song => song.title).join(', ')}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tempSelectedSongs.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Select Songs ({tempSelectedSongs.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongSelectionModal;
