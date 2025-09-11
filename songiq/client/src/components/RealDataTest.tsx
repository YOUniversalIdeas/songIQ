import React, { useState, useEffect } from 'react';
import { TrendingUp, Music, BarChart3, RefreshCw } from 'lucide-react';

interface ChartData {
  position: number;
  title: string;
  artist: string;
  genre: string;
  audioFeatures: {
    tempo: number;
    key: number;
    mode: number;
    energy: number;
    danceability: number;
    valence: number;
  };
  streams: number | null;
  peakPosition: number;
  weeksOnChart: number;
}

interface TrendsData {
  topTracks: Array<{
    name: string;
    artist: string;
    listeners: number;
    playcount: number;
  }>;
  topArtists: Array<{
    name: string;
    listeners: number;
    playcount: number;
  }>;
  trendingGenres: string[];
}

const RealDataTest: React.FC = () => {
  const [billboardData, setBillboardData] = useState<ChartData[]>([]);
  const [spotifyData, setSpotifyData] = useState<ChartData[]>([]);
  const [spotifyFeaturedData, setSpotifyFeaturedData] = useState<ChartData[]>([]);
  const [spotifyTopTracksData, setSpotifyTopTracksData] = useState<ChartData[]>([]);
  const [spotifyViralData, setSpotifyViralData] = useState<ChartData[]>([]);
  const [youtubeData, setYoutubeData] = useState<ChartData[]>([]);
  const [appleMusicData, setAppleMusicData] = useState<ChartData[]>([]);
  const [tiktokData, setTiktokData] = useState<ChartData[]>([]);
  const [soundcloudData, setSoundcloudData] = useState<ChartData[]>([]);
  const [deezerData, setDeezerData] = useState<ChartData[]>([]);
  const [amazonMusicData, setAmazonMusicData] = useState<ChartData[]>([]);
  const [pandoraData, setPandoraData] = useState<ChartData[]>([]);
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch Billboard Charts
      const billboardResponse = await fetch('/api/market/billboard-charts');
      const billboardResult = await billboardResponse.json();
      if (billboardResult.success) {
        setBillboardData(billboardResult.data);
      }

      // Fetch Spotify Charts
      const spotifyResponse = await fetch('/api/market/spotify-charts');
      const spotifyResult = await spotifyResponse.json();
      if (spotifyResult.success) {
        setSpotifyData(spotifyResult.data);
      }

      // Fetch Spotify Featured Playlists
      const spotifyFeaturedResponse = await fetch('/api/market/spotify-featured-playlists');
      const spotifyFeaturedResult = await spotifyFeaturedResponse.json();
      if (spotifyFeaturedResult.success) {
        setSpotifyFeaturedData(spotifyFeaturedResult.data);
      }

      // Fetch Spotify Top Tracks
      const spotifyTopTracksResponse = await fetch('/api/market/spotify-top-tracks');
      const spotifyTopTracksResult = await spotifyTopTracksResponse.json();
      if (spotifyTopTracksResult.success) {
        setSpotifyTopTracksData(spotifyTopTracksResult.data);
      }

      // Fetch Spotify Viral Tracks
      const spotifyViralResponse = await fetch('/api/market/spotify-viral-tracks');
      const spotifyViralResult = await spotifyViralResponse.json();
      if (spotifyViralResult.success) {
        setSpotifyViralData(spotifyViralResult.data);
      }

      // Fetch YouTube Music Charts
      const youtubeResponse = await fetch('/api/market/youtube-music-charts');
      const youtubeResult = await youtubeResponse.json();
      if (youtubeResult.success) {
        setYoutubeData(youtubeResult.data);
      }

      // Fetch Apple Music Charts
      const appleMusicResponse = await fetch('/api/market/apple-music-charts');
      const appleMusicResult = await appleMusicResponse.json();
      if (appleMusicResult.success) {
        setAppleMusicData(appleMusicResult.data);
      }

      // Fetch TikTok Charts
      const tiktokResponse = await fetch('/api/market/tiktok-charts');
      const tiktokResult = await tiktokResponse.json();
      if (tiktokResult.success) {
        setTiktokData(tiktokResult.data);
      }

      // Fetch SoundCloud Charts
      const soundcloudResponse = await fetch('/api/market/soundcloud-charts');
      const soundcloudResult = await soundcloudResponse.json();
      if (soundcloudResult.success) {
        setSoundcloudData(soundcloudResult.data);
      }

      // Fetch Deezer Charts
      const deezerResponse = await fetch('/api/market/deezer-charts');
      const deezerResult = await deezerResponse.json();
      if (deezerResult.success) {
        setDeezerData(deezerResult.data);
      }

      // Fetch Amazon Music Charts
      const amazonMusicResponse = await fetch('/api/market/amazon-music-charts');
      const amazonMusicResult = await amazonMusicResponse.json();
      if (amazonMusicResult.success) {
        setAmazonMusicData(amazonMusicResult.data);
      }

      // Fetch Pandora Charts
      const pandoraResponse = await fetch('/api/market/pandora-charts');
      const pandoraResult = await pandoraResponse.json();
      if (pandoraResult.success) {
        setPandoraData(pandoraResult.data);
      }

      // Fetch Market Trends
      const trendsResponse = await fetch('/api/market/trends');
      const trendsResult = await trendsResponse.json();
      if (trendsResult.success) {
        setTrendsData(trendsResult.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            Real Data Integration Test
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live chart data from Spotify, Last.fm, and market trends
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {lastUpdated && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 text-sm">
            ✅ Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
        {/* Billboard Charts */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              Billboard Charts (Last.fm)
            </h3>
          </div>
          <div className="space-y-2">
            {billboardData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} streams
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotify Charts */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Spotify New Releases
            </h3>
          </div>
          <div className="space-y-2">
            {spotifyData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-green-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.audioFeatures.tempo} BPM
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotify Featured Playlists */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Spotify Featured Playlists
            </h3>
          </div>
          <div className="space-y-2">
            {spotifyFeaturedData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} followers
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotify Top Tracks */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Spotify Top Tracks
            </h3>
          </div>
          <div className="space-y-2">
            {spotifyTopTracksData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} streams
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotify Viral Tracks */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              Spotify Viral Tracks
            </h3>
          </div>
          <div className="space-y-2">
            {spotifyViralData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} streams
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YouTube Music Charts */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">YT</span>
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              YouTube Music
            </h3>
          </div>
          <div className="space-y-2">
            {youtubeData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-red-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} views
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Apple Music Charts */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">🍎</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Apple Music
            </h3>
          </div>
          <div className="space-y-2">
            {appleMusicData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} plays
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TikTok Charts */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-pink-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-pink-900 dark:text-pink-100">
              TikTok Viral
            </h3>
          </div>
          <div className="space-y-2">
            {tiktokData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-pink-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} viral
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SoundCloud Charts */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">🎵</span>
            </div>
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              SoundCloud
            </h3>
          </div>
          <div className="space-y-2">
            {soundcloudData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} plays
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deezer Charts */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">🎧</span>
            </div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              Deezer
            </h3>
          </div>
          <div className="space-y-2">
            {deezerData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-purple-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} plays
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amazon Music Charts */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-yellow-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">🛒</span>
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Amazon Music
            </h3>
          </div>
          <div className="space-y-2">
            {amazonMusicData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-yellow-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} plays
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pandora Charts */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">📻</span>
            </div>
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
              Pandora
            </h3>
          </div>
          <div className="space-y-2">
            {pandoraData.slice(0, 5).map((track) => (
              <div key={track.position} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-indigo-600 w-6">#{track.position}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">{track.artist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {track.streams?.toLocaleString() || 'N/A'} plays
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{track.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Market Trends
            </h3>
          </div>
          {trendsData ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">Top Tracks</h4>
                <div className="space-y-1">
                  {trendsData.topTracks.slice(0, 3).map((track, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300">{track.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {track.listeners.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">Trending Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {trendsData.trendingGenres.slice(0, 5).map((genre, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">Loading trends data...</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Last.fm API - Real listener data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Spotify API - New releases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">YouTube API - Trending music</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Apple Music - Chart data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">TikTok API - Viral music</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">SoundCloud API - Trending music</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Deezer API - Chart data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Amazon Music API - Chart data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Pandora API - Chart data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Market Trends - Live analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealDataTest;
