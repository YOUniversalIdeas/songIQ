import SpotifyWebApi from 'spotify-web-api-node';
import { IAudioFeatures } from '../models/AudioFeatures';

// Spotify API configuration
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 50,
  requestsPerHour: 1000,
};

class RateLimiter {
  private requests: number[] = [];
  private hourlyRequests: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    // Clean old requests
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    this.hourlyRequests = this.hourlyRequests.filter(time => time > oneHourAgo);

    // Check limits
    if (this.requests.length >= RATE_LIMIT.requestsPerMinute) {
      return false;
    }

    if (this.hourlyRequests.length >= RATE_LIMIT.requestsPerHour) {
      return false;
    }

    return true;
  }

  recordRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.hourlyRequests.push(now);
  }

  getWaitTime(): number {
    if (this.requests.length >= RATE_LIMIT.requestsPerMinute) {
      const oldestRequest = Math.min(...this.requests);
      return Math.max(0, 60000 - (Date.now() - oldestRequest));
    }
    return 0;
  }
}

const rateLimiter = new RateLimiter();

// Token management
let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get or refresh Spotify access token
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // Check if we have a valid token
  if (accessToken && now < tokenExpiry) {
    return accessToken;
  }

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    accessToken = data.body.access_token;
    tokenExpiry = now + (data.body.expires_in * 1000);
    
    spotifyApi.setAccessToken(accessToken);
    console.log('Spotify access token refreshed');
    
    return accessToken;
  } catch (error) {
    console.error('Failed to get Spotify access token:', error);
    throw new Error('Spotify authentication failed');
  }
}

/**
 * Normalize Spotify audio features to match our schema
 */
function normalizeAudioFeatures(spotifyFeatures: SpotifyApi.AudioFeaturesObject): Partial<IAudioFeatures> {
  return {
    acousticness: spotifyFeatures.acousticness,
    danceability: spotifyFeatures.danceability,
    energy: spotifyFeatures.energy,
    instrumentalness: spotifyFeatures.instrumentalness,
    liveness: spotifyFeatures.liveness,
    loudness: spotifyFeatures.loudness,
    speechiness: spotifyFeatures.speechiness,
    tempo: spotifyFeatures.tempo,
    valence: spotifyFeatures.valence,
    key: spotifyFeatures.key,
    mode: spotifyFeatures.mode,
    time_signature: spotifyFeatures.time_signature,
    duration_ms: spotifyFeatures.duration_ms,
  };
}

/**
 * Search for tracks on Spotify
 */
export async function searchTracks(query: string, limit: number = 10): Promise<any[]> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    await getAccessToken();
    rateLimiter.recordRequest();

    const response = await spotifyApi.searchTracks(query, { limit });
    
    return response.body.tracks?.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      album_art: track.album.images[0]?.url,
      release_date: track.album.release_date,
    })) || [];
  } catch (error) {
    console.error('Spotify search error:', error);
    throw new Error('Failed to search Spotify tracks');
  }
}

/**
 * Get audio features for a specific track
 */
export async function getTrackAudioFeatures(trackId: string): Promise<Partial<IAudioFeatures>> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    await getAccessToken();
    rateLimiter.recordRequest();

    const response = await spotifyApi.getAudioFeaturesForTrack(trackId);
    
    if (!response.body) {
      throw new Error('No audio features found for track');
    }

    return normalizeAudioFeatures(response.body);
  } catch (error) {
    console.error('Spotify audio features error:', error);
    throw new Error('Failed to get track audio features');
  }
}

/**
 * Get multiple tracks' audio features
 */
export async function getMultipleTracksAudioFeatures(trackIds: string[]): Promise<Partial<IAudioFeatures>[]> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    await getAccessToken();
    rateLimiter.recordRequest();

    const response = await spotifyApi.getAudioFeaturesForTracks(trackIds);
    
    return response.body.audio_features
      .filter(features => features !== null)
      .map(features => normalizeAudioFeatures(features!));
  } catch (error) {
    console.error('Spotify multiple audio features error:', error);
    throw new Error('Failed to get multiple tracks audio features');
  }
}

/**
 * Get track information
 */
export async function getTrackInfo(trackId: string): Promise<any> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    await getAccessToken();
    rateLimiter.recordRequest();

    const response = await spotifyApi.getTrack(trackId);
    
    return {
      id: response.body.id,
      name: response.body.name,
      artist: response.body.artists.map(artist => artist.name).join(', '),
      album: response.body.album.name,
      duration_ms: response.body.duration_ms,
      popularity: response.body.popularity,
      preview_url: response.body.preview_url,
      external_url: response.body.external_urls.spotify,
      album_art: response.body.album.images[0]?.url,
      release_date: response.body.album.release_date,
      genres: (response.body.album as any).genres || [],
    };
  } catch (error) {
    console.error('Spotify track info error:', error);
    throw new Error('Failed to get track information');
  }
}

/**
 * Get recommendations based on audio features
 */
export async function getRecommendations(seedFeatures: Partial<IAudioFeatures>, limit: number = 20): Promise<any[]> {
  if (!rateLimiter.canMakeRequest()) {
    const waitTime = rateLimiter.getWaitTime();
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  try {
    await getAccessToken();
    rateLimiter.recordRequest();

    const params: any = {
      limit,
      target_acousticness: seedFeatures.acousticness,
      target_danceability: seedFeatures.danceability,
      target_energy: seedFeatures.energy,
      target_instrumentalness: seedFeatures.instrumentalness,
      target_liveness: seedFeatures.liveness,
      target_loudness: seedFeatures.loudness,
      target_speechiness: seedFeatures.speechiness,
      target_tempo: seedFeatures.tempo,
      target_valence: seedFeatures.valence,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    const response = await spotifyApi.getRecommendations(params);
    
    return response.body.tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      album_art: track.album.images[0]?.url,
    }));
  } catch (error) {
    console.error('Spotify recommendations error:', error);
    throw new Error('Failed to get recommendations');
  }
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): { canMakeRequest: boolean; waitTime: number; requestsThisMinute: number; requestsThisHour: number } {
  return {
    canMakeRequest: rateLimiter.canMakeRequest(),
    waitTime: rateLimiter.getWaitTime(),
    requestsThisMinute: rateLimiter['requests'].length,
    requestsThisHour: rateLimiter['hourlyRequests'].length,
  };
}

export default {
  searchTracks,
  getTrackAudioFeatures,
  getMultipleTracksAudioFeatures,
  getTrackInfo,
  getRecommendations,
  getRateLimitStatus,
}; 