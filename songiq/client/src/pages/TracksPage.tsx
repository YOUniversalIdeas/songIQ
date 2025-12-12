import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Filter, Search, TrendingUp, Play } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

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

interface Genre {
  genre: string;
  count: number;
}

const TracksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'composite' | 'momentum'>('composite');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [selectedGenre, sortBy]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      let url = '';

      if (selectedGenre === 'all') {
        url = `${API_BASE_URL}/api/charts/tracks/top?limit=50&sortBy=${sortBy}`;
      } else {
        url = `${API_BASE_URL}/api/charts/tracks/genre/${selectedGenre}?limit=50&sortBy=${sortBy}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tracks');

      const data = await response.json();
      setTracks(data.tracks || []);

      // Extract genres from stats if available
      if (data.genre && stats?.genreDistribution) {
        // Genres already loaded from stats
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts/tracks/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setGenres(data.genreDistribution || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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

  const filteredTracks = tracks.filter(track =>
    track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const imageUrl = (track: Track) => {
    // Prefer track album art, then artist image
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Independent Artist Tracks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover trending tracks from independent artists, ranked by genre
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTracks || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">With Scores</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.tracksWithScores || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageScore?.toFixed(1) || '0.0'}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">Top Track</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {stats.topTrack?.name || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                by {stats.topTrack?.artist || 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Genre Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Genres</option>
                {genres.map((g) => (
                  <option key={g.genre} value={g.genre}>
                    {g.genre} ({g.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'composite' | 'momentum')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="composite">Composite Score</option>
                <option value="momentum">Momentum</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracks or artists..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Tracks List */}
        {loading ? (
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
              {searchTerm ? 'Try adjusting your search' : 'No tracks available for this genre'}
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
                          // Fallback to placeholder if image fails to load
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
        )}
      </div>
    </div>
  );
};

export default TracksPage;

