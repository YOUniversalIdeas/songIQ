import axios from 'axios';
import { MarketTrends } from './successScoringService';
import YouTubeMusicService from './youtubeMusicService';
import AppleMusicService from './appleMusicService';
import TikTokService from './tiktokService';
import SoundCloudService from './soundcloudService';
import DeezerService from './deezerService';
import AmazonMusicService from './amazonMusicService';
import PandoraService from './pandoraService';

export interface ChartData {
  position: number;
  title: string;
  artist: string;
  genre: string;
  audioFeatures?: {
    tempo: number;
    key: number;
    mode: number;
    energy: number;
    danceability: number;
    valence: number;
  };
  streams?: number;
  peakPosition?: number;
  weeksOnChart?: number;
}

export interface MarketSignal {
  timestamp: Date;
  source: 'billboard' | 'spotify' | 'social' | 'aggregated';
  data: {
    trendingGenres: { [genre: string]: number };
    optimalTempo: { min: number; max: number; peak: number };
    popularKeys: { [key: string]: number };
    energyTrends: { low: number; medium: number; high: number };
    seasonalFactors: { [month: string]: number };
    topSongs: ChartData[];
    genreGrowth: { [genre: string]: number };
    tempoDistribution: { [range: string]: number };
  };
  confidence: number;
}

export interface SocialMediaSignal {
  platform: 'twitter' | 'instagram' | 'youtube';
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  trendingTopics: string[];
  artistMentions: { [artist: string]: number };
  genreMentions: { [genre: string]: number };
  timestamp: Date;
}

// Mock data for development (replace with real API calls)
const MOCK_CHART_DATA: ChartData[] = [
  {
    position: 1,
    title: "Flowers",
    artist: "Miley Cyrus",
    genre: "pop",
    audioFeatures: {
      tempo: 118,
      key: 0,
      mode: 1,
      energy: 0.75,
      danceability: 0.68,
      valence: 0.72
    },
    streams: 2500000,
    peakPosition: 1,
    weeksOnChart: 12
  },
  {
    position: 2,
    title: "Kill Bill",
    artist: "SZA",
    genre: "r&b",
    audioFeatures: {
      tempo: 95,
      key: 7,
      mode: 0,
      energy: 0.65,
      danceability: 0.72,
      valence: 0.45
    },
    streams: 2200000,
    peakPosition: 2,
    weeksOnChart: 8
  },
  {
    position: 3,
    title: "Last Night",
    artist: "Morgan Wallen",
    genre: "country",
    audioFeatures: {
      tempo: 140,
      key: 2,
      mode: 1,
      energy: 0.85,
      danceability: 0.58,
      valence: 0.65
    },
    streams: 2000000,
    peakPosition: 3,
    weeksOnChart: 6
  }
];

/**
 * Fetch Billboard Hot 100 chart data
 */
export async function fetchBillboardCharts(): Promise<ChartData[]> {
  try {
    console.log('Fetching Billboard chart data...');
    
    // TODO: Replace with actual Billboard API when available
    // For now, use Last.fm API as a proxy for chart data
    const response = await fetch('https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=' + process.env.LASTFM_API_KEY + '&format=json&limit=100');
    
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (data.tracks && data.tracks.track) {
      const tracks = data.tracks.track.slice(0, 20);
      const chartData: ChartData[] = [];
      
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const genre = await detectGenreFromArtist(track.artist.name);
        const audioFeatures = await getAudioFeaturesFromLastfm(track.name, track.artist.name);
        
        chartData.push({
          position: i + 1,
          title: track.name,
          artist: track.artist.name,
          genre,
          audioFeatures,
          streams: parseInt(track.listeners) || 0,
          peakPosition: i + 1,
          weeksOnChart: 1
        });
      }
      
      return chartData;
    }
    
    console.warn('No chart data available from Last.fm');
    return [];
  } catch (error) {
    console.error('Error fetching Billboard charts:', error);
    return [];
  }
}

/**
 * Fetch Spotify Charts data
 */
export async function fetchSpotifyCharts(): Promise<ChartData[]> {
  try {
    console.log('Fetching Spotify chart data...');
    
    // Use Spotify Web API to get new releases (more reliable than specific playlists)
    const response = await fetch('https://api.spotify.com/v1/browse/new-releases?limit=20', {
      headers: {
        'Authorization': `Bearer ${await getSpotifyAccessToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    const data = await response.json() as any;
    
    if (data.albums && data.albums.items) {
      const chartData: ChartData[] = [];
      
      for (let i = 0; i < data.albums.items.length; i++) {
        const album = data.albums.items[i];
        const track = album; // Use album as track for now
        
        try {
          const audioFeatures = await getSpotifyAudioFeatures(album.id);
          
          chartData.push({
            position: i + 1,
            title: album.name,
            artist: album.artists[0].name,
            genre: await detectGenreFromSpotify(album.id),
            audioFeatures,
            streams: album.popularity * 10000, // Estimate based on popularity
            peakPosition: i + 1,
            weeksOnChart: 1
          });
        } catch (error) {
          console.warn(`Error processing album ${album.name}:`, error);
          // Continue with next album
        }
      }
      
      return chartData;
    }
    
    console.warn('No chart data available from Spotify');
    return [];
  } catch (error) {
    console.error('Error fetching Spotify charts:', error);
    return [];
  }
}

/**
 * Fetch Spotify Featured Playlists (Top Charts)
 */
export async function fetchSpotifyFeaturedPlaylists(): Promise<ChartData[]> {
  try {
    console.log('Fetching Spotify featured playlists...');
    
    // For now, return demo data while we debug the API issues
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Today\'s Top Hits',
        artist: 'Spotify',
        genre: 'various',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.7, danceability: 0.8, valence: 0.6 },
        streams: 25000000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'RapCaviar',
        artist: 'Spotify',
        genre: 'hip-hop',
        audioFeatures: { tempo: 140, key: 2, mode: 1, energy: 0.9, danceability: 0.9, valence: 0.5 },
        streams: 18000000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Rock Classics',
        artist: 'Spotify',
        genre: 'rock',
        audioFeatures: { tempo: 130, key: 5, mode: 1, energy: 0.8, danceability: 0.6, valence: 0.7 },
        streams: 15000000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Chill Hits',
        artist: 'Spotify',
        genre: 'chill',
        audioFeatures: { tempo: 100, key: 3, mode: 0, energy: 0.4, danceability: 0.5, valence: 0.8 },
        streams: 12000000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Viva Latino',
        artist: 'Spotify',
        genre: 'latin',
        audioFeatures: { tempo: 125, key: 1, mode: 1, energy: 0.8, danceability: 0.9, valence: 0.8 },
        streams: 10000000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Spotify featured playlists:', error);
    return [];
  }
}

/**
 * Fetch Spotify Top Tracks by Genre
 */
export async function fetchSpotifyTopTracks(): Promise<ChartData[]> {
  try {
    console.log('Fetching Spotify top tracks...');
    
    // Demo data for top tracks by genre
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'As It Was',
        artist: 'Harry Styles',
        genre: 'pop',
        audioFeatures: { tempo: 173, key: 0, mode: 1, energy: 0.6, danceability: 0.7, valence: 0.8 },
        streams: 2500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Heat Waves',
        artist: 'Glass Animals',
        genre: 'indie',
        audioFeatures: { tempo: 81, key: 7, mode: 1, energy: 0.5, danceability: 0.6, valence: 0.4 },
        streams: 2200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Stay',
        artist: 'The Kid LAROI & Justin Bieber',
        genre: 'pop',
        audioFeatures: { tempo: 169, key: 0, mode: 1, energy: 0.7, danceability: 0.8, valence: 0.6 },
        streams: 2000000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        genre: 'pop-rock',
        audioFeatures: { tempo: 166, key: 0, mode: 1, energy: 0.8, danceability: 0.6, valence: 0.3 },
        streams: 1800000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Levitating',
        artist: 'Dua Lipa',
        genre: 'pop',
        audioFeatures: { tempo: 103, key: 0, mode: 1, energy: 0.8, danceability: 0.9, valence: 0.8 },
        streams: 1600000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Spotify top tracks:', error);
    return [];
  }
}

/**
 * Fetch Spotify Viral Tracks (Trending)
 */
export async function fetchSpotifyViralTracks(): Promise<ChartData[]> {
  try {
    console.log('Fetching Spotify viral tracks...');
    
    // Demo data for viral/trending tracks
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Unholy',
        artist: 'Sam Smith & Kim Petras',
        genre: 'viral',
        audioFeatures: { tempo: 95, key: 0, mode: 1, energy: 0.7, danceability: 0.8, valence: 0.4 },
        streams: 3500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Anti-Hero',
        artist: 'Taylor Swift',
        genre: 'viral',
        audioFeatures: { tempo: 97, key: 0, mode: 1, energy: 0.6, danceability: 0.7, valence: 0.5 },
        streams: 3200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Lavender Haze',
        artist: 'Taylor Swift',
        genre: 'viral',
        audioFeatures: { tempo: 96, key: 0, mode: 1, energy: 0.5, danceability: 0.6, valence: 0.6 },
        streams: 3000000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Bad Habit',
        artist: 'Steve Lacy',
        genre: 'viral',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.6, danceability: 0.7, valence: 0.7 },
        streams: 2800000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'About Damn Time',
        artist: 'Lizzo',
        genre: 'viral',
        audioFeatures: { tempo: 109, key: 0, mode: 1, energy: 0.8, danceability: 0.9, valence: 0.9 },
        streams: 2600000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Spotify viral tracks:', error);
    return [];
  }
}

/**
 * Fetch YouTube Music trending videos
 */
export async function fetchYouTubeMusicCharts(): Promise<ChartData[]> {
  try {
    console.log('Fetching YouTube Music chart data...');
    
    // Return demo data for YouTube Music charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Vampire',
        artist: 'Olivia Rodrigo',
        genre: 'pop',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.4 },
        streams: 2500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        genre: 'pop',
        audioFeatures: { tempo: 125, key: 2, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 2200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Kill Bill',
        artist: 'SZA',
        genre: 'r&b',
        audioFeatures: { tempo: 95, key: 7, mode: 0, energy: 0.6, danceability: 0.7, valence: 0.4 },
        streams: 1800000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Flowers',
        artist: 'Miley Cyrus',
        genre: 'pop',
        audioFeatures: { tempo: 118, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.7 },
        streams: 1600000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Last Night',
        artist: 'Morgan Wallen',
        genre: 'country',
        audioFeatures: { tempo: 140, key: 2, mode: 1, energy: 0.8, danceability: 0.5, valence: 0.6 },
        streams: 1400000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching YouTube Music charts:', error);
    return [];
  }
}

/**
 * Detect genre from text using keyword matching
 */
function detectGenreFromText(text: string): string {
  const textLower = text.toLowerCase();
  
  const genrePatterns = [
    { genre: 'pop', patterns: [/pop/i, /mainstream/i, /hit/i, /chart/i] },
    { genre: 'hip-hop', patterns: [/hip.?hop/i, /rap/i, /beats/i, /urban/i] },
    { genre: 'rock', patterns: [/rock/i, /guitar/i, /metal/i, /punk/i] },
    { genre: 'electronic', patterns: [/electronic/i, /edm/i, /dance/i, /techno/i] },
    { genre: 'country', patterns: [/country/i, /folk/i, /acoustic/i, /southern/i] },
    { genre: 'r&b', patterns: [/r.?b/i, /soul/i, /blues/i] },
    { genre: 'latin', patterns: [/latin/i, /reggaeton/i, /spanish/i] },
    { genre: 'k-pop', patterns: [/k.?pop/i, /korean/i] }
  ];
  
  for (const { genre, patterns } of genrePatterns) {
    if (patterns.some(pattern => pattern.test(textLower))) {
      return genre;
    }
  }
  
  return 'unknown';
}

/**
 * Fetch Apple Music charts
 */
export async function fetchAppleMusicCharts(): Promise<ChartData[]> {
  try {
    console.log('🍎 Fetching Apple Music chart data...');
    
    // Return demo data for Apple Music charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        genre: 'pop',
        audioFeatures: { tempo: 125, key: 2, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 2500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Vampire',
        artist: 'Olivia Rodrigo',
        genre: 'pop',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.4 },
        streams: 2200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Last Night',
        artist: 'Morgan Wallen',
        genre: 'country',
        audioFeatures: { tempo: 140, key: 2, mode: 1, energy: 0.8, danceability: 0.5, valence: 0.6 },
        streams: 2000000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Kill Bill',
        artist: 'SZA',
        genre: 'r&b',
        audioFeatures: { tempo: 95, key: 7, mode: 0, energy: 0.6, danceability: 0.7, valence: 0.4 },
        streams: 1800000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Flowers',
        artist: 'Miley Cyrus',
        genre: 'pop',
        audioFeatures: { tempo: 118, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.7 },
        streams: 1600000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Apple Music charts:', error);
    return [];
  }
}

/**
 * Fetch TikTok viral music charts
 */
export async function fetchTikTokCharts(): Promise<ChartData[]> {
  try {
    console.log('📱 Fetching TikTok viral music chart data...');
    
    // Return demo data for TikTok viral music charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Vampire',
        artist: 'Olivia Rodrigo',
        genre: 'pop',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.4 },
        streams: 2500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        genre: 'pop',
        audioFeatures: { tempo: 125, key: 2, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 2200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Kill Bill',
        artist: 'SZA',
        genre: 'r&b',
        audioFeatures: { tempo: 95, key: 7, mode: 0, energy: 0.6, danceability: 0.7, valence: 0.4 },
        streams: 1800000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Flowers',
        artist: 'Miley Cyrus',
        genre: 'pop',
        audioFeatures: { tempo: 118, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.7 },
        streams: 1600000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Last Night',
        artist: 'Morgan Wallen',
        genre: 'country',
        audioFeatures: { tempo: 140, key: 2, mode: 1, energy: 0.8, danceability: 0.5, valence: 0.6 },
        streams: 1400000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching TikTok charts:', error);
    return [];
  }
}

/**
 * Fetch SoundCloud trending music charts
 */
export async function fetchSoundCloudCharts(): Promise<ChartData[]> {
  try {
    console.log('🎵 Fetching SoundCloud trending music chart data...');
    
    // Return demo data for SoundCloud charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Midnight City',
        artist: 'M83',
        genre: 'electronic',
        audioFeatures: { tempo: 128, key: 0, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 3500000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Runaway',
        artist: 'Kanye West',
        genre: 'hip-hop',
        audioFeatures: { tempo: 85, key: 7, mode: 0, energy: 0.6, danceability: 0.8, valence: 0.4 },
        streams: 2800000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Teardrop',
        artist: 'Massive Attack',
        genre: 'trip-hop',
        audioFeatures: { tempo: 90, key: 2, mode: 0, energy: 0.5, danceability: 0.6, valence: 0.3 },
        streams: 2200000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Breathe',
        artist: 'The Prodigy',
        genre: 'electronic',
        audioFeatures: { tempo: 140, key: 0, mode: 1, energy: 0.9, danceability: 0.8, valence: 0.7 },
        streams: 1900000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Porcelain',
        artist: 'Moby',
        genre: 'ambient',
        audioFeatures: { tempo: 95, key: 5, mode: 1, energy: 0.4, danceability: 0.5, valence: 0.6 },
        streams: 1600000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching SoundCloud charts:', error);
    return [];
  }
}

/**
 * Fetch Deezer charts
 */
export async function fetchDeezerCharts(): Promise<ChartData[]> {
  try {
    console.log('🎧 Fetching Deezer chart data...');
    
    // Return demo data for Deezer charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        genre: 'pop',
        audioFeatures: { tempo: 171, key: 0, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 4200000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Dance Monkey',
        artist: 'Tones and I',
        genre: 'pop',
        audioFeatures: { tempo: 98, key: 2, mode: 1, energy: 0.7, danceability: 0.8, valence: 0.8 },
        streams: 3800000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        genre: 'pop',
        audioFeatures: { tempo: 96, key: 7, mode: 0, energy: 0.6, danceability: 0.8, valence: 0.7 },
        streams: 3500000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Someone You Loved',
        artist: 'Lewis Capaldi',
        genre: 'pop',
        audioFeatures: { tempo: 110, key: 0, mode: 1, energy: 0.5, danceability: 0.6, valence: 0.4 },
        streams: 3200000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Bad Guy',
        artist: 'Billie Eilish',
        genre: 'pop',
        audioFeatures: { tempo: 135, key: 7, mode: 0, energy: 0.6, danceability: 0.7, valence: 0.3 },
        streams: 3000000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Deezer charts:', error);
    return [];
  }
}

/**
 * Fetch Amazon Music charts
 */
export async function fetchAmazonMusicCharts(): Promise<ChartData[]> {
  try {
    console.log('🛒 Fetching Amazon Music chart data...');
    
    // Return demo data for Amazon Music charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Anti-Hero',
        artist: 'Taylor Swift',
        genre: 'pop',
        audioFeatures: { tempo: 97, key: 0, mode: 1, energy: 0.6, danceability: 0.7, valence: 0.5 },
        streams: 3800000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Unholy',
        artist: 'Sam Smith & Kim Petras',
        genre: 'pop',
        audioFeatures: { tempo: 125, key: 7, mode: 0, energy: 0.7, danceability: 0.8, valence: 0.4 },
        streams: 3200000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Hold Me Closer',
        artist: 'Elton John & Britney Spears',
        genre: 'pop',
        audioFeatures: { tempo: 120, key: 2, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 2800000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Late Night Talking',
        artist: 'Harry Styles',
        genre: 'pop',
        audioFeatures: { tempo: 110, key: 0, mode: 1, energy: 0.6, danceability: 0.7, valence: 0.5 },
        streams: 2600000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'About Damn Time',
        artist: 'Lizzo',
        genre: 'pop',
        audioFeatures: { tempo: 130, key: 5, mode: 1, energy: 0.8, danceability: 0.8, valence: 0.7 },
        streams: 2400000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Amazon Music charts:', error);
    return [];
  }
}

/**
 * Fetch Pandora charts
 */
export async function fetchPandoraCharts(): Promise<ChartData[]> {
  try {
    console.log('📻 Fetching Pandora chart data...');
    
    // Return demo data for Pandora charts
    const demoCharts: ChartData[] = [
      {
        position: 1,
        title: 'Flowers',
        artist: 'Miley Cyrus',
        genre: 'pop',
        audioFeatures: { tempo: 118, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.7 },
        streams: 4200000,
        peakPosition: 1,
        weeksOnChart: 1
      },
      {
        position: 2,
        title: 'Last Night',
        artist: 'Morgan Wallen',
        genre: 'country',
        audioFeatures: { tempo: 140, key: 2, mode: 1, energy: 0.8, danceability: 0.5, valence: 0.6 },
        streams: 3800000,
        peakPosition: 2,
        weeksOnChart: 1
      },
      {
        position: 3,
        title: 'Kill Bill',
        artist: 'SZA',
        genre: 'r&b',
        audioFeatures: { tempo: 95, key: 7, mode: 0, energy: 0.6, danceability: 0.7, valence: 0.4 },
        streams: 3500000,
        peakPosition: 3,
        weeksOnChart: 1
      },
      {
        position: 4,
        title: 'Vampire',
        artist: 'Olivia Rodrigo',
        genre: 'pop',
        audioFeatures: { tempo: 120, key: 0, mode: 1, energy: 0.7, danceability: 0.6, valence: 0.4 },
        streams: 3200000,
        peakPosition: 4,
        weeksOnChart: 1
      },
      {
        position: 5,
        title: 'Cruel Summer',
        artist: 'Taylor Swift',
        genre: 'pop',
        audioFeatures: { tempo: 125, key: 2, mode: 1, energy: 0.8, danceability: 0.7, valence: 0.6 },
        streams: 3000000,
        peakPosition: 5,
        weeksOnChart: 1
      }
    ];
    
    return demoCharts;
  } catch (error) {
    console.error('Error fetching Pandora charts:', error);
    return [];
  }
}

/**
 * Analyze chart data to extract market trends
 */
export function analyzeChartTrends(chartData: ChartData[]): MarketTrends {
  const trends: MarketTrends = {
    trendingGenres: {},
    optimalTempo: { min: 0, max: 0, peak: 0 },
    popularKeys: {},
    energyTrends: { low: 0, medium: 0, high: 0 },
    seasonalFactors: {}
  };
  
  // Analyze genre distribution
  const genreCounts: { [genre: string]: number } = {};
  chartData.forEach(song => {
    genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
  });
  
  const totalSongs = chartData.length;
  Object.keys(genreCounts).forEach(genre => {
    if (genreCounts[genre] !== undefined) {
      const count = genreCounts[genre];
      if (count !== undefined) {
        trends.trendingGenres[genre] = count / totalSongs;
      }
    }
  });
  
  // Analyze tempo distribution
  const tempos = chartData
    .filter(song => song.audioFeatures?.tempo)
    .map(song => song.audioFeatures!.tempo);
  
  if (tempos.length > 0) {
    const sortedTempos = tempos.sort((a, b) => a - b);
    trends.optimalTempo = {
      min: sortedTempos[0] || 100,
      max: sortedTempos[sortedTempos.length - 1] || 140,
      peak: sortedTempos[Math.floor(sortedTempos.length / 2)] || 120
    };
  }
  
  // Analyze key distribution
  const keyCounts: { [key: string]: number } = {};
  const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  chartData.forEach(song => {
    if (song.audioFeatures?.key !== undefined) {
      const keyName = keyNames[song.audioFeatures.key];
      if (keyName) {
        keyCounts[keyName] = (keyCounts[keyName] || 0) + 1;
      }
    }
  });
  
  const totalKeys = Object.values(keyCounts).reduce((sum, count) => sum + count, 0);
  Object.keys(keyCounts).forEach(key => {
    if (keyCounts[key] !== undefined) {
      const count = keyCounts[key];
      if (count !== undefined) {
        trends.popularKeys[key] = count / totalKeys;
      }
    }
  });
  
  // Analyze energy trends
  const energies = chartData
    .filter(song => song.audioFeatures?.energy)
    .map(song => song.audioFeatures!.energy);
  
  if (energies.length > 0) {
    const lowEnergy = energies.filter(e => e < 0.4).length;
    const mediumEnergy = energies.filter(e => e >= 0.4 && e < 0.7).length;
    const highEnergy = energies.filter(e => e >= 0.7).length;
    
    const total = energies.length;
    trends.energyTrends = {
      low: lowEnergy / total,
      medium: mediumEnergy / total,
      high: highEnergy / total
    };
  }
  
  // Generate seasonal factors (mock data for now)
  const currentMonth = new Date().getMonth() + 1;
  for (let month = 1; month <= 12; month++) {
    const distance = Math.abs(month - currentMonth);
    trends.seasonalFactors[month] = Math.max(0.8, 1 - distance * 0.1);
  }
  
  return trends;
}

/**
 * Fetch social media signals
 */
export async function fetchSocialMediaSignals(): Promise<SocialMediaSignal[]> {
  try {
    console.log('Fetching social media signals...');
    
    // Mock social media data
    const signals: SocialMediaSignal[] = [
      {
        platform: 'twitter',
        mentions: 15000,
        sentiment: 'positive',
        trendingTopics: ['#NewMusic', '#PopMusic', '#HipHop'],
        artistMentions: {
          'Miley Cyrus': 5000,
          'SZA': 3000,
          'Morgan Wallen': 2000
        },
        genreMentions: {
          'pop': 0.4,
          'hip_hop': 0.3,
          'country': 0.2,
          'r&b': 0.1
        },
        timestamp: new Date()
      },
      {
        platform: 'instagram',
        mentions: 25000,
        sentiment: 'positive',
        trendingTopics: ['#Music', '#Trending', '#Viral'],
        artistMentions: {
          'Miley Cyrus': 8000,
          'SZA': 5000,
          'Morgan Wallen': 3000
        },
        genreMentions: {
          'pop': 0.45,
          'hip_hop': 0.25,
          'country': 0.2,
          'r&b': 0.1
        },
        timestamp: new Date()
      }
    ];
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return signals;
  } catch (error) {
    console.error('Error fetching social media signals:', error);
    return [];
  }
}

/**
 * Aggregate market signals from multiple sources
 */
export async function aggregateMarketSignals(): Promise<MarketSignal> {
  try {
    console.log('Aggregating market signals...');
    
    // Fetch data from multiple sources
    const [billboardData, spotifyData, socialSignals] = await Promise.all([
      fetchBillboardCharts(),
      fetchSpotifyCharts(),
      fetchSocialMediaSignals()
    ]);
    
    // Combine chart data
    const allChartData = [...billboardData, ...spotifyData];
    
    // Analyze trends
    const trends = analyzeChartTrends(allChartData);
    
    // Incorporate social media signals
    const socialGenreMentions: { [genre: string]: number } = {};
    socialSignals.forEach(signal => {
      Object.keys(signal.genreMentions).forEach(genre => {
        if (signal.genreMentions[genre] !== undefined) {
          const mentionCount = signal.genreMentions[genre];
          if (mentionCount !== undefined) {
            socialGenreMentions[genre] = (socialGenreMentions[genre] || 0) + mentionCount;
          }
        }
      });
    });
    
    // Blend social signals with chart trends
    Object.keys(socialGenreMentions).forEach(genre => {
      const socialWeight = 0.3;
      const chartWeight = 0.7;
      trends.trendingGenres[genre] = 
        (trends.trendingGenres[genre] || 0) * chartWeight + 
        (socialGenreMentions[genre] || 0) * socialWeight;
    });
    
    // Calculate confidence based on data quality
    const confidence = calculateSignalConfidence(allChartData, socialSignals);
    
    return {
      timestamp: new Date(),
      source: 'aggregated',
      data: {
        ...trends,
        topSongs: allChartData.slice(0, 10),
        genreGrowth: calculateGenreGrowth(allChartData),
        tempoDistribution: calculateTempoDistribution(allChartData)
      },
      confidence
    };
    
  } catch (error) {
    console.error('Error aggregating market signals:', error);
    throw new Error('Failed to aggregate market signals');
  }
}

/**
 * Calculate signal confidence based on data quality
 */
function calculateSignalConfidence(chartData: ChartData[], socialSignals: SocialMediaSignal[]): number {
  let confidence = 0.5; // Base confidence
  
  // Chart data quality
  const chartDataWithFeatures = chartData.filter(song => song.audioFeatures);
  confidence += (chartDataWithFeatures.length / chartData.length) * 0.3;
  
  // Social signals quality
  if (socialSignals.length > 0) {
    confidence += 0.2;
  }
  
  // Data recency
  const now = new Date();
  const dataAge = Math.abs(now.getTime() - 0); // Simplified for now, no timestamp in ChartData
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  confidence += Math.max(0, (maxAge - dataAge) / maxAge) * 0.1;
  
  return Math.min(1, confidence);
}

/**
 * Calculate genre growth trends
 */
function calculateGenreGrowth(chartData: ChartData[]): { [genre: string]: number } {
  const genreGrowth: { [genre: string]: number } = {};
  
  // Mock growth calculation (in production, this would compare historical data)
  const genres = [...new Set(chartData.map(song => song.genre))];
  
  genres.forEach(genre => {
    // Simulate growth based on chart position and weeks on chart
    const genreSongs = chartData.filter(song => song.genre === genre);
    const avgPosition = genreSongs.reduce((sum, song) => sum + song.position, 0) / genreSongs.length;
    const avgWeeks = genreSongs.reduce((sum, song) => sum + (song.weeksOnChart || 0), 0) / genreSongs.length;
    
    // Growth formula: lower position = higher growth, more weeks = stability
    const growth = Math.max(0, (50 - avgPosition) / 50) * (avgWeeks / 10);
    genreGrowth[genre] = Math.min(1, growth);
  });
  
  return genreGrowth;
}

/**
 * Calculate tempo distribution
 */
function calculateTempoDistribution(chartData: ChartData[]): { [range: string]: number } {
  const tempos = chartData
    .filter(song => song.audioFeatures?.tempo)
    .map(song => song.audioFeatures!.tempo);
  
  const distribution: { [range: string]: number } = {
    'slow (60-90)': 0,
    'medium (90-120)': 0,
    'fast (120-150)': 0,
    'very_fast (150+)': 0
  };
  
  tempos.forEach(tempo => {
    if (tempo < 90) distribution['slow (60-90)']++;
    else if (tempo < 120) distribution['medium (90-120)']++;
    else if (tempo < 150) distribution['fast (120-150)']++;
    else distribution['very_fast (150+)']++;
  });
  
  const total = tempos.length;
  Object.keys(distribution).forEach(range => {
    if (distribution[range] !== undefined) {
      const currentValue = distribution[range];
      if (currentValue !== undefined) {
        distribution[range] = total > 0 ? currentValue / total : 0;
      }
    }
  });
  
  return distribution;
}

/**
 * Get current market trends
 */
export async function getCurrentMarketTrends(): Promise<MarketTrends> {
  try {
    const marketSignal = await aggregateMarketSignals();
    return marketSignal.data;
  } catch (error) {
    console.error('Error getting current market trends:', error);
    // Return default trends if aggregation fails
    return {
      trendingGenres: { pop: 0.4, hip_hop: 0.3, country: 0.2, 'r&b': 0.1 },
      optimalTempo: { min: 100, max: 140, peak: 120 },
      popularKeys: { C: 0.2, G: 0.2, D: 0.15, A: 0.15, E: 0.1, F: 0.1, B: 0.1 },
      energyTrends: { low: 0.2, medium: 0.5, high: 0.3 },
      seasonalFactors: {}
    };
  }
}

/**
 * Background job to update market signals
 */
export async function updateMarketSignalsJob(): Promise<void> {
  try {
    console.log('Starting market signals update job...');
    
    const marketSignal = await aggregateMarketSignals();
    
    // Store the market signal in database (implement storage logic)
    console.log('Market signals updated successfully:', {
      timestamp: marketSignal.timestamp,
      confidence: marketSignal.confidence,
      trendingGenres: Object.keys(marketSignal.data.trendingGenres).slice(0, 3)
    });
    
  } catch (error) {
    console.error('Market signals update job failed:', error);
  }
}

/**
 * Schedule daily market signals update
 */
export function scheduleMarketSignalsUpdate(): void {
  // In production, this would use a proper job scheduler like node-cron
  console.log('Scheduling daily market signals update...');
  
  // For development, we'll just log the schedule
  setInterval(() => {
    updateMarketSignalsJob();
  }, 24 * 60 * 60 * 1000); // 24 hours
}

// Helper functions for real API integration

/**
 * Get Spotify access token for API calls
 */
async function getSpotifyAccessToken(): Promise<string> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify token error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

/**
 * Get audio features from Spotify for a track
 */
async function getSpotifyAudioFeatures(trackId: string): Promise<any> {
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify audio features error: ${response.status}`);
    }

    const data = await response.json();
          return {
        tempo: (data as any).tempo,
        key: (data as any).key,
        mode: (data as any).mode,
        energy: (data as any).energy,
        danceability: (data as any).danceability,
        valence: (data as any).valence
      };
  } catch (error) {
    console.error('Error getting Spotify audio features:', error);
    return {
      tempo: 120,
      key: 0,
      mode: 1,
      energy: 0.5,
      danceability: 0.5,
      valence: 0.5
    };
  }
}

/**
 * Detect genre from artist using Last.fm API
 */
async function detectGenreFromArtist(artistName: string): Promise<string> {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${process.env.LASTFM_API_KEY}&format=json`
    );

    if (!response.ok) {
      return 'unknown';
    }

    const data = await response.json();
    if ((data as any).artist && (data as any).artist.tags && (data as any).artist.tags.tag) {
      const topTag = (data as any).artist.tags.tag[0];
      return topTag.name || 'unknown';
    }

    return 'unknown';
  } catch (error) {
    console.error('Error detecting genre from artist:', error);
    return 'unknown';
  }
}

/**
 * Get audio features from Last.fm (limited data available)
 */
async function getAudioFeaturesFromLastfm(trackName: string, artistName: string): Promise<any> {
  // Last.fm doesn't provide detailed audio features, so we'll return basic structure
  return {
    tempo: 120,
    key: 0,
    mode: 1,
    energy: 0.5,
    danceability: 0.5,
    valence: 0.5
  };
}

/**
 * Detect genre from Spotify track
 */
async function detectGenreFromSpotify(trackId: string): Promise<string> {
  try {
    const token = await getSpotifyAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return 'unknown';
    }

    const data = await response.json();
    if ((data as any).artists && (data as any).artists[0] && (data as any).artists[0].genres) {
      return (data as any).artists[0].genres[0] || 'unknown';
    }

    return 'unknown';
  } catch (error) {
    console.error('Error detecting genre from Spotify:', error);
    return 'unknown';
  }
}

/**
 * Analyze sentiment from social media data
 */
async function analyzeSentiment(data: any[]): Promise<'positive' | 'negative' | 'neutral'> {
  // TODO: Implement real sentiment analysis using NLP services
  // For now, return neutral as placeholder
  return 'neutral';
}

/**
 * Extract trending topics from social media data
 */
function extractTrendingTopics(data: any[]): string[] {
  const topics: string[] = [];
  
  // Extract hashtags and common terms
  data.forEach(tweet => {
    if (tweet.text) {
      const hashtags = tweet.text.match(/#\w+/g);
      if (hashtags) {
        topics.push(...hashtags);
      }
    }
  });
  
  // Return unique topics, limited to top 5
  return [...new Set(topics)].slice(0, 5);
}

/**
 * Extract artist mentions from social media data
 */
async function extractArtistMentions(data: any[]): Promise<{ [artist: string]: number }> {
  const mentions: { [artist: string]: number } = {};
  
  // TODO: Implement real artist name detection
  // For now, return empty object
  return mentions;
}

/**
 * Extract genre mentions from social media data
 */
async function extractGenreMentions(data: any[]): Promise<{ [genre: string]: number }> {
  const mentions: { [genre: string]: number } = {};
  
  // TODO: Implement real genre detection from text
  // For now, return empty object
  return mentions;
}

export default {
  fetchBillboardCharts,
  fetchSpotifyCharts,
  fetchYouTubeMusicCharts,
  fetchAppleMusicCharts,
  fetchTikTokCharts,
  fetchSoundCloudCharts,
  fetchDeezerCharts,
  fetchAmazonMusicCharts,
  fetchPandoraCharts,
  fetchSocialMediaSignals,
  aggregateMarketSignals,
  getCurrentMarketTrends,
  updateMarketSignalsJob,
  scheduleMarketSignalsUpdate
}; 