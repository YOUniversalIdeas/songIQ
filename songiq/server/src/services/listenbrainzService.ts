import axios from 'axios';

const LISTENBRAINZ_BASE_URL = 'https://api.listenbrainz.org/1';

export interface ListenBrainzArtist {
  artist_name: string;
  artist_mbid?: string;
  listen_count: number;
}

export interface ListenBrainzStats {
  artist_name: string;
  artist_mbid?: string;
  listen_count: number;
  listeners: number;
}

/**
 * Get top artists from ListenBrainz
 */
export async function getTopArtists(limit: number = 100, range: 'week' | 'month' | 'year' | 'all_time' = 'week'): Promise<ListenBrainzArtist[]> {
  try {
    const response = await axios.get(`${LISTENBRAINZ_BASE_URL}/stats/user/listenbrainz/top-artists`, {
      params: {
        count: limit,
        range: range === 'all_time' ? 'all_time' : range
      }
    });

    if (response.data.payload?.artists) {
      return response.data.payload.artists.map((artist: any) => ({
        artist_name: artist.artist_name,
        artist_mbid: artist.artist_mbid,
        listen_count: artist.listen_count || 0
      }));
    }

    return [];
  } catch (error: any) {
    // ListenBrainz may not have data for all time ranges
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching ListenBrainz top artists:', error.message);
    return [];
  }
}

/**
 * Get artist stats from ListenBrainz
 */
export async function getArtistStats(artistName: string, artistMbid?: string): Promise<ListenBrainzStats | null> {
  try {
    const params: any = { artist_name: artistName };
    if (artistMbid) {
      params.artist_mbid = artistMbid;
    }

    const response = await axios.get(`${LISTENBRAINZ_BASE_URL}/stats/artist/listeners`, {
      params
    });

    if (response.data.payload) {
      return {
        artist_name: response.data.payload.artist_name || artistName,
        artist_mbid: response.data.payload.artist_mbid || artistMbid,
        listen_count: response.data.payload.listen_count || 0,
        listeners: response.data.payload.listeners || 0
      };
    }

    return null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error(`Error fetching ListenBrainz stats for ${artistName}:`, error.message);
    return null;
  }
}

/**
 * Search for artists in ListenBrainz
 */
export async function searchArtists(query: string, limit: number = 20): Promise<ListenBrainzArtist[]> {
  try {
    const response = await axios.get(`${LISTENBRAINZ_BASE_URL}/search/artist`, {
      params: {
        q: query,
        count: limit
      }
    });

    if (response.data.artists) {
      return response.data.artists.map((artist: any) => ({
        artist_name: artist.name,
        artist_mbid: artist.mbid,
        listen_count: artist.listen_count || 0
      }));
    }

    return [];
  } catch (error: any) {
    console.error('Error searching ListenBrainz artists:', error.message);
    return [];
  }
}

export default {
  getTopArtists,
  getArtistStats,
  searchArtists
};

