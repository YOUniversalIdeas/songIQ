import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Filter, Search, BarChart3, Sparkles, Music, Play } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import ChartCard from '../components/ChartCard';

interface Artist {
  _id: string;
  name: string;
  compositeScore: number;
  momentumScore: number;
  reachScore: number;
  genres?: string[];
  images?: Array<{
    url: string;
    source: string;
  }>;
  metrics?: {
    spotify?: {
      followers: number;
      popularity: number;
    };
    lastfm?: {
      listeners: number;
      playcount: number;
    };
  };
}

interface Genre {
  name?: string;
  genre?: string;
  count: number;
}

interface Track {
  _id: string;
  name: string;
  artistName: string;
  artistId: {
    _id: string;
    name: string;
    images?: Array<{ url: string; source: string }>;
  };
  compositeScore: number;
  momentumScore: number;
  genres?: string[];
  images?: Array<{
    url: string;
    source: string;
  }>;
  album?: string;
  releaseDate?: string;
  duration?: number;
  metrics?: {
    spotify?: {
      popularity: number;
      playcount?: number;
    };
    lastfm?: {
      listeners: number;
      playcount: number;
    };
  };
}

const ChartsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'artists' | 'tracks'>('artists');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'top' | 'rising'>('top');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'composite' | 'momentum' | 'reach'>('composite');
  const [stats, setStats] = useState<any>(null);

  // Debug: Log active tab on render
  useEffect(() => {
    console.log('📄 ChartsPage rendered, activeTab:', activeTab);
    console.log('📊 Current state - artists:', artists.length, 'tracks:', tracks.length);
  }, [activeTab, artists.length, tracks.length]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts/genres`);
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres || []);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTracksStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts/tracks/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setGenres(data.genreDistribution || []);
      }
    } catch (error) {
      console.error('Error fetching track stats:', error);
    }
  };

  const fetchArtists = async () => {
    try {
      setLoading(true);
      let url = '';

      if (selectedGenre === 'all') {
        url = view === 'top'
          ? `${API_BASE_URL}/api/charts/artists/top?limit=50&sortBy=${sortBy}`
          : `${API_BASE_URL}/api/charts/artists/rising?limit=50`;
      } else {
        url = `${API_BASE_URL}/api/charts/artists/genre/${selectedGenre}?limit=50&sortBy=${sortBy}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch artists:', response.status, errorText);
        throw new Error(`Failed to fetch artists: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched artists:', data.artists?.length || 0);
      setArtists(data.artists || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      console.log('🔄 fetchTracks called - activeTab:', activeTab);
      setLoading(true);
      let url = '';

      if (selectedGenre === 'all') {
        url = `${API_BASE_URL}/api/charts/tracks/top?limit=50&sortBy=${sortBy}`;
      } else {
        url = `${API_BASE_URL}/api/charts/tracks/genre/${selectedGenre}?limit=50&sortBy=${sortBy}`;
      }

      console.log('📡 Fetching tracks from:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch tracks:', response.status, errorText);
        throw new Error(`Failed to fetch tracks: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched tracks:', data.tracks?.length || 0, 'tracks');
      console.log('📊 Track data:', data);
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('❌ Error fetching tracks:', error);
      setTracks([]); // Ensure empty array on error
    } finally {
      setLoading(false);
      console.log('✅ fetchTracks completed, loading:', false);
    }
  };

  useEffect(() => {
    if (activeTab === 'artists') {
      fetchGenres();
      fetchStats();
    } else {
      fetchTracksStats();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'artists') {
      fetchArtists();
    } else {
      fetchTracks();
    }
  }, [activeTab, view, selectedGenre, sortBy]);


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchArtists();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/charts/search?q=${encodeURIComponent(searchTerm)}&limit=50`
      );
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setArtists(data.artists || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getMomentumIcon = (momentum: number) => {
    if (momentum < 10) return null;
    if (momentum >= 40) {
      return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    if (momentum >= 20) {
      return <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  const imageUrl = (track: Track) => {
    if (track.images && track.images.length > 0) {
      return track.images[0].url;
    }
    if (track.artistId?.images && track.artistId.images.length > 0) {
      return track.artistId.images[0].url;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Music Charts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover trending artists and tracks across multiple platforms
          </p>
        </div>

        {/* Tabs - Artists and Songs - MUST BE VISIBLE */}
        <div className="mb-8 border-b-2 border-blue-500 dark:border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 shadow-xl" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
          <nav className="flex space-x-4" role="tablist" style={{ minHeight: '60px', display: 'flex' }}>
            <button
              onClick={() => {
                console.log('Switching to artists tab');
                setActiveTab('artists');
              }}
              role="tab"
              aria-selected={activeTab === 'artists'}
              className={`py-3 px-6 border-b-3 font-bold text-lg transition-all rounded-t-lg ${
                activeTab === 'artists'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 shadow-md'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Artists
            </button>
            <button
              onClick={() => {
                console.log('Switching to tracks tab');
                setActiveTab('tracks');
              }}
              role="tab"
              aria-selected={activeTab === 'tracks'}
              className={`py-3 px-6 border-b-3 font-bold text-lg transition-all rounded-t-lg ${
                activeTab === 'tracks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 shadow-md'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <Music className="w-5 h-5 inline mr-2" />
              Songs
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {activeTab === 'artists' ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Artists</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalArtists}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">With Scores</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.artistsWithScores}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageScore?.toFixed(1) || '0.0'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Top Artist</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {stats.topArtist?.name || 'N/A'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTracks || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">With Scores</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.tracksWithScores || 0}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageScore?.toFixed(1) || '0.0'}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Top Track</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {stats.topTrack?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    by {stats.topTrack?.artist || 'N/A'}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View Toggle - Only show for artists */}
            {activeTab === 'artists' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setView('top')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'top'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Top Artists
                </button>
                <button
                  onClick={() => setView('rising')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'rising'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Rising
                </button>
              </div>
            )}

            {/* Genre Filter */}
            <div className="flex-1">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={activeTab === 'artists' ? genre.name : genre.genre} value={activeTab === 'artists' ? genre.name : genre.genre}>
                    {activeTab === 'artists' ? genre.name : genre.genre} ({genre.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {activeTab === 'artists' ? (
                  <>
                    <option value="composite">Composite Score</option>
                    <option value="momentum">Momentum</option>
                    <option value="reach">Reach</option>
                  </>
                ) : (
                  <>
                    <option value="composite">Composite Score</option>
                    <option value="momentum">Momentum</option>
                  </>
                )}
              </select>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={activeTab === 'artists' ? 'Search artists...' : 'Search tracks or artists...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'artists' ? (
          /* Artists Grid */
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading charts...</p>
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No artists found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist, index) => (
                <ChartCard key={artist._id} artist={artist} rank={index + 1} />
              ))}
            </div>
          )
        ) : (
          /* Tracks List */
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tracks...</p>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <Music className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No tracks found
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search' : 'No tracks available'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTracks.map((track, index) => (
                <div
                  key={track._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* Album Art */}
                    {imageUrl(track) ? (
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl(track)!}
                          alt={`${track.name} by ${track.artistName}`}
                          className="w-20 h-20 rounded-lg object-cover shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
                          <Music className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Music className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {track.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by{' '}
                        <button
                          onClick={() => navigate(`/charts/artist/${track.artistId._id}`)}
                          className="hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                        >
                          {track.artistName}
                        </button>
                      </p>

                      {/* Genres */}
                      {track.genres && track.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {track.genres.slice(0, 3).map((genre, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Scores */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-semibold ${getScoreColor(track.compositeScore)}`}>
                            {track.compositeScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Score</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {getMomentumIcon(track.momentumScore)}
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {track.momentumScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Momentum</span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {track.album && (
                          <span>Album: {track.album}</span>
                        )}
                        {track.duration && (
                          <span>Duration: {formatDuration(track.duration)}</span>
                        )}
                        {track.metrics?.spotify?.popularity && (
                          <span>Popularity: {track.metrics.spotify.popularity}</span>
                        )}
                        {track.metrics?.lastfm?.playcount && (
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            <span>{formatNumber(track.metrics.lastfm.playcount)} plays</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChartsPage;

