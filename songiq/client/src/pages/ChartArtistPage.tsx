import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Music, Users, Play, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
      timestamp: string;
      followers: number;
      popularity: number;
      followersGrowth7d?: number;
      followersGrowthPct7d?: number;
    };
    lastfm?: {
      timestamp: string;
      listeners: number;
      playcount: number;
      listenersGrowth7d?: number;
      playcountGrowth7d?: number;
    };
    listenbrainz?: {
      timestamp: string;
      listeners: number;
      listenCount: number;
    };
  };
  externalIds?: {
    spotify?: string;
    lastfm?: string;
  };
  country?: string;
  type?: string;
}

interface ScoreHistory {
  date: string;
  compositeScore: number;
  momentumScore: number;
  reachScore: number;
}

const ChartArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArtist();
      fetchHistory();
    }
  }, [id]);

  const fetchArtist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/charts/artists/${id}`);
      if (!response.ok) throw new Error('Failed to fetch artist');

      const data = await response.json();
      setArtist(data.artist);
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/charts/artists/${id}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading artist...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Artist not found</p>
          <button
            onClick={() => navigate('/charts')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Charts
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = artist.images?.[0]?.url || artist.images?.[1]?.url;
  const chartData = history.map((entry) => ({
    date: formatDate(entry.date),
    composite: entry.compositeScore,
    momentum: entry.momentumScore,
    reach: entry.reachScore
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/charts')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Charts
        </button>

        {/* Artist Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Music className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {artist.name}
              </h1>

              {artist.genres && artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {artist.genres.map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {artist.country && <span>📍 {artist.country}</span>}
                {artist.type && <span>🎤 {artist.type}</span>}
              </div>

              {/* External Links */}
              <div className="flex gap-4 mt-4">
                {artist.externalIds?.spotify && (
                  <a
                    href={`https://open.spotify.com/artist/${artist.externalIds.spotify}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-green-600 dark:text-green-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Spotify
                  </a>
                )}
                {artist.externalIds?.lastfm && (
                  <a
                    href={artist.externalIds.lastfm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 dark:text-red-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Last.fm
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Composite Score</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {artist.compositeScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Overall performance across all platforms
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
              {artist.momentumScore >= 50 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              Momentum Score
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {artist.momentumScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Growth rate over the past 7 days
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reach Score</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {artist.reachScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Total audience size across platforms
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {artist.metrics?.spotify && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Spotify
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Followers
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(artist.metrics.spotify.followers)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Popularity</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {artist.metrics.spotify.popularity}/100
                    </span>
                  </div>
                  {artist.metrics.spotify.followersGrowthPct7d !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">7d Growth</span>
                      <span className={`font-semibold ${
                        artist.metrics.spotify.followersGrowthPct7d >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {artist.metrics.spotify.followersGrowthPct7d >= 0 ? '+' : ''}
                        {artist.metrics.spotify.followersGrowthPct7d.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {artist.metrics?.lastfm && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Last.fm
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Listeners
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(artist.metrics.lastfm.listeners)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Playcount
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(artist.metrics.lastfm.playcount)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {artist.metrics?.listenbrainz && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  ListenBrainz
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Listeners
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(artist.metrics.listenbrainz.listeners)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      Listen Count
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(artist.metrics.listenbrainz.listenCount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score History Chart */}
        {chartData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Score History</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="composite" stroke="#3b82f6" name="Composite" />
                <Line type="monotone" dataKey="momentum" stroke="#10b981" name="Momentum" />
                <Line type="monotone" dataKey="reach" stroke="#f59e0b" name="Reach" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartArtistPage;

