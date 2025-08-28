import axios from 'axios';
import { MarketTrends } from './successScoringService';

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
    // In production, this would call the Billboard API
    // For now, we'll use mock data
    console.log('Fetching Billboard chart data...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return MOCK_CHART_DATA;
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
    
    // In production, this would call the Spotify Charts API
    // For now, we'll use mock data with slight variations
    const spotifyData = MOCK_CHART_DATA.map(song => ({
      ...song,
      position: song.position + Math.floor(Math.random() * 3) - 1,
      streams: song.streams! + Math.floor(Math.random() * 500000) - 250000
    }));
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return spotifyData;
  } catch (error) {
    console.error('Error fetching Spotify charts:', error);
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

export default {
  fetchBillboardCharts,
  fetchSpotifyCharts,
  fetchSocialMediaSignals,
  aggregateMarketSignals,
  getCurrentMarketTrends,
  updateMarketSignalsJob,
  scheduleMarketSignalsUpdate
}; 