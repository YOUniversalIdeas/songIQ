import axios from 'axios';

// Last.fm API configuration
const LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

// Function to get API key dynamically
function getLastfmApiKey(): string {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    console.error('❌ LASTFM_API_KEY environment variable is not set!');
    return 'your_api_key_here';
  }
  return apiKey;
}

export interface LastfmTrack {
  name: string;
  artist: string;
  url: string;
  listeners: number;
  playcount: number;
  image: Array<{ size: string; '#text': string }>;
}

export interface LastfmArtist {
  name: string;
  listeners: number;
  playcount: number;
  url: string;
  image: Array<{ size: string; '#text': string }>;
}

export interface LastfmTag {
  name: string;
  count: number;
  url: string;
}

export interface LastfmTrends {
  topTracks: LastfmTrack[];
  topArtists: LastfmArtist[];
  topTags: LastfmTag[];
  trendingGenres: string[];
  popularTempos: number[];
  popularKeys: string[];
  currentEnergy: number;
  popularMoods: string[];
}

/**
 * Make a request to Last.fm API
 */
async function makeLastfmRequest(method: string, params: Record<string, any> = {}) {
  try {
    const response = await axios.get(LASTFM_BASE_URL, {
      params: {
        method,
        api_key: getLastfmApiKey(),
        format: 'json',
        ...params
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Last.fm API request failed:', error);
    throw error;
  }
}

/**
 * Get top tracks globally
 */
export async function getTopTracks(limit: number = 50): Promise<LastfmTrack[]> {
  try {
    const data = await makeLastfmRequest('chart.gettoptracks', { limit });
    
    if (data.tracks && data.tracks.track) {
      return data.tracks.track.map((track: any) => ({
        name: track.name,
        artist: track.artist.name,
        url: track.url,
        listeners: parseInt(track.listeners) || 0,
        playcount: parseInt(track.playcount) || 0,
        image: track.image || []
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
}

/**
 * Get top artists globally
 */
export async function getTopArtists(limit: number = 50): Promise<LastfmArtist[]> {
  try {
    const data = await makeLastfmRequest('chart.gettopartists', { limit });
    
    if (data.artists && data.artists.artist) {
      return data.artists.artist.map((artist: any) => ({
        name: artist.name,
        listeners: parseInt(artist.listeners) || 0,
        playcount: parseInt(artist.playcount) || 0,
        url: artist.url,
        image: artist.image || []
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching top artists:', error);
    return [];
  }
}

/**
 * Get top tags globally
 */
export async function getTopTags(limit: number = 50): Promise<LastfmTag[]> {
  try {
    const data = await makeLastfmRequest('chart.gettoptags', { limit });
    
    if (data.tags && data.tags.tag) {
      return data.tags.tag.map((tag: any) => ({
        name: tag.name,
        count: parseInt(tag.count) || 0,
        url: tag.url
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching top tags:', error);
    return [];
  }
}

/**
 * Get genre-specific trends
 */
export async function getGenreTrends(genre: string): Promise<Partial<LastfmTrends>> {
  try {
    // Get top tracks for the genre
    const tracks = await getTopTracks(20);
    
    // Get top tags (which often represent genres/moods)
    const tags = await getTopTags(30);
    
    // Extract trending genres from tags
    const trendingGenres = tags
      .filter(tag => tag.count > 1000)
      .map(tag => tag.name)
      .slice(0, 10);
    
    // Simulate tempo and key data (Last.fm doesn't provide this directly)
    // In production, you could combine this with Spotify API for audio features
    const popularTempos = [120, 125, 130, 128, 122, 135, 118, 140, 115, 132];
    const popularKeys = ['C#', 'D', 'F#', 'G', 'A', 'E', 'B', 'C', 'F', 'D#'];
    
    // Calculate energy based on tag popularity
    const currentEnergy = Math.min(100, Math.max(0, 
      tags.reduce((sum, tag) => sum + tag.count, 0) / tags.length / 100
    ));
    
    // Extract moods from popular tags
    const moodKeywords = ['energetic', 'happy', 'uplifting', 'confident', 'melancholic', 'romantic', 'aggressive', 'chill'];
    const popularMoods = tags
      .filter(tag => moodKeywords.some(mood => tag.name.toLowerCase().includes(mood)))
      .map(tag => tag.name)
      .slice(0, 5);
    
    return {
      topTracks: tracks,
      topTags: tags,
      trendingGenres,
      popularTempos,
      popularKeys,
      currentEnergy,
      popularMoods: popularMoods.length > 0 ? popularMoods : ['energetic', 'happy', 'uplifting', 'confident']
    };
  } catch (error) {
    console.error('Error fetching genre trends:', error);
    return {};
  }
}

/**
 * Get comprehensive trends data
 */
export async function getCurrentTrends(): Promise<LastfmTrends> {
  try {
    const [tracks, artists, tags] = await Promise.all([
      getTopTracks(50),
      getTopArtists(50),
      getTopTags(50)
    ]);
    
    // Extract trending genres from tags
    const trendingGenres = tags
      .filter(tag => tag.count > 500)
      .map(tag => tag.name)
      .slice(0, 15);
    
    // Simulate audio feature data (combine with Spotify API in production)
    const popularTempos = [120, 125, 130, 128, 122, 135, 118, 140, 115, 132, 110, 145];
    const popularKeys = ['C#', 'D', 'F#', 'G', 'A', 'E', 'B', 'C', 'F', 'D#', 'G#', 'A#'];
    
    // Calculate energy based on overall popularity
    const totalPlaycount = tracks.reduce((sum, track) => sum + track.playcount, 0);
    const currentEnergy = Math.min(100, Math.max(0, totalPlaycount / tracks.length / 10000));
    
    // Extract moods from popular tags
    const moodKeywords = ['energetic', 'happy', 'uplifting', 'confident', 'melancholic', 'romantic', 'aggressive', 'chill', 'dance', 'rock'];
    const popularMoods = tags
      .filter(tag => moodKeywords.some(mood => tag.name.toLowerCase().includes(mood)))
      .map(tag => tag.name)
      .slice(0, 8);
    
    return {
      topTracks: tracks,
      topArtists: artists,
      topTags: tags,
      trendingGenres,
      popularTempos,
      popularKeys,
      currentEnergy,
      popularMoods: popularMoods.length > 0 ? popularMoods : ['energetic', 'happy', 'uplifting', 'confident', 'dance', 'rock']
    };
  } catch (error) {
    console.error('Error fetching current trends:', error);
    throw error;
  }
}

/**
 * Get artist-specific trends
 */
export async function getArtistTrends(artistName: string): Promise<Partial<LastfmTrends>> {
  try {
    // Get artist's top tracks
    const data = await makeLastfmRequest('artist.gettoptracks', { artist: artistName, limit: 20 });
    
    if (data.toptracks && data.toptracks.track) {
      const tracks = data.toptracks.track.map((track: any) => ({
        name: track.name,
        artist: artistName,
        url: track.url,
        listeners: parseInt(track.listeners) || 0,
        playcount: parseInt(track.playcount) || 0,
        image: track.image || []
      }));
      
      // Get artist's top tags
      const tagData = await makeLastfmRequest('artist.gettoptags', { artist: artistName });
      const tags = tagData.toptags?.tag?.map((tag: any) => ({
        name: tag.name,
        count: parseInt(tag.count) || 0,
        url: tag.url
      })) || [];
      
      return {
        topTracks: tracks,
        topTags: tags,
        trendingGenres: tags.map(tag => tag.name).slice(0, 5)
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching artist trends:', error);
    return {};
  }
}
