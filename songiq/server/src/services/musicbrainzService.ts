import axios from 'axios';

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests (MusicBrainz requirement)

let lastRequestTime = 0;

/**
 * Rate-limited request to MusicBrainz API
 */
async function makeMusicBrainzRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  // Enforce rate limiting (max 1 req/sec)
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  try {
    const response = await axios.get(`${MUSICBRAINZ_BASE_URL}/${endpoint}`, {
      params: {
        fmt: 'json',
        ...params
      },
      headers: {
        'User-Agent': 'songIQ/1.0.0 (https://songiq.ai)',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`MusicBrainz API error (${endpoint}):`, error.message);
    throw error;
  }
}

export interface MusicBrainzArtist {
  id: string;
  name: string;
  type?: string;
  'sort-name'?: string;
  country?: string;
  'life-span'?: {
    begin?: string;
    end?: string;
    ended?: boolean;
  };
  'area'?: {
    name: string;
  };
  relations?: Array<{
    type: string;
    url?: {
      resource: string;
    };
  }>;
  'external-ids'?: Array<{
    type: string;
    value: string;
  }>;
}

export interface MusicBrainzRelease {
  id: string;
  title: string;
  'release-date'?: string;
  'first-release-date'?: string;
  'release-group'?: {
    id: string;
    'primary-type'?: string;
    'secondary-types'?: string[];
  };
}

/**
 * Search for an artist by name
 */
export async function searchArtist(query: string, limit: number = 5): Promise<MusicBrainzArtist[]> {
  try {
    const data = await makeMusicBrainzRequest('artist', {
      query: query,
      limit
    });

    if (data.artists && data.artists.length > 0) {
      return data.artists;
    }
    return [];
  } catch (error) {
    console.error('Error searching MusicBrainz artists:', error);
    return [];
  }
}

/**
 * Get artist by MusicBrainz ID
 */
export async function getArtistById(mbid: string): Promise<MusicBrainzArtist | null> {
  try {
    const data = await makeMusicBrainzRequest(`artist/${mbid}`, {
      inc: 'url-rels+external-ids'
    });
    return data;
  } catch (error) {
    console.error(`Error fetching MusicBrainz artist ${mbid}:`, error);
    return null;
  }
}

/**
 * Get artist releases
 */
export async function getArtistReleases(mbid: string, limit: number = 10): Promise<MusicBrainzRelease[]> {
  try {
    const data = await makeMusicBrainzRequest(`release`, {
      artist: mbid,
      limit,
      status: 'official'
    });

    if (data.releases && data.releases.length > 0) {
      return data.releases;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching releases for artist ${mbid}:`, error);
    return [];
  }
}

/**
 * Extract external IDs (Spotify, Last.fm, etc.) from MusicBrainz artist
 */
export function extractExternalIds(artist: MusicBrainzArtist): Record<string, string> {
  const externalIds: Record<string, string> = {};

  if (artist['external-ids']) {
    artist['external-ids'].forEach((extId: any) => {
      externalIds[extId.type] = extId.value;
    });
  }

  // Also check relations for Spotify URLs
  // MusicBrainz uses "free streaming" or "streaming" relation types for Spotify
  if (artist.relations) {
    artist.relations.forEach((rel: any) => {
      if (rel.url?.resource) {
        const spotifyMatch = rel.url.resource.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/);
        if (spotifyMatch) {
          externalIds.spotify = spotifyMatch[1];
        }
      }
    });
  }

  return externalIds;
}

/**
 * Find or create MusicBrainz ID for an artist
 * Returns the MBID if found, null otherwise
 */
export async function findOrCreateArtistId(artistName: string): Promise<string | null> {
  try {
    const results = await searchArtist(artistName, 1);
    if (results.length > 0) {
      return results[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Error finding MusicBrainz ID for ${artistName}:`, error);
    return null;
  }
}

export default {
  searchArtist,
  getArtistById,
  getArtistReleases,
  extractExternalIds,
  findOrCreateArtistId
};

