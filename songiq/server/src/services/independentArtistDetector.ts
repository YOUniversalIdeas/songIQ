import UnifiedArtist from '../models/UnifiedArtist';

/**
 * Criteria for independent artists (stricter thresholds for current/trending artists):
 * - Spotify followers < 500,000 (500K) - tightened from 1M
 * - Spotify popularity < 65 - tightened from 70
 * - Last.fm listeners < 300,000 (300K) - tightened from 500K
 * - Not on major labels (determined by MusicBrainz or manual flagging)
 * - Must have some momentum (momentumScore > 5) to be considered "current"
 */
const INDEPENDENT_THRESHOLDS = {
  spotifyFollowers: 500000, // 500K followers (tighter for smaller/current artists)
  spotifyPopularity: 65, // Out of 100 (tighter)
  lastfmListeners: 300000, // 300K listeners (tighter)
  compositeScore: 50, // Lower composite score threshold for indie
  minMomentum: 5 // Minimum momentum to be considered "current"
};

/**
 * Major label names to exclude (case-insensitive)
 */
const MAJOR_LABELS = [
  'universal music',
  'sony music',
  'warner music',
  'emi',
  'atlantic records',
  'republic records',
  'interscope',
  'columbia records',
  'capitol records',
  'def jam',
  'island records',
  'motown',
  'epic records',
  'rca records',
  'geffen',
  'polydor',
  'virgin records'
];

/**
 * Determine if an artist is independent based on metrics
 */
export function isIndependentArtist(artist: any): boolean {
  // Check Spotify metrics
  if (artist.metrics?.spotify) {
    const spotify = artist.metrics.spotify;
    
    // If they have too many followers, they're likely mainstream
    if (spotify.followers && spotify.followers >= INDEPENDENT_THRESHOLDS.spotifyFollowers) {
      return false;
    }
    
    // If popularity is too high, likely mainstream
    if (spotify.popularity && spotify.popularity >= INDEPENDENT_THRESHOLDS.spotifyPopularity) {
      return false;
    }
  }
  
  // Check Last.fm metrics
  if (artist.metrics?.lastfm) {
    const lastfm = artist.metrics.lastfm;
    
    // Too many listeners = likely mainstream
    if (lastfm.listeners && lastfm.listeners >= INDEPENDENT_THRESHOLDS.lastfmListeners) {
      return false;
    }
  }
  
  // Check label (if available)
  if (artist.label) {
    const labelLower = artist.label.toLowerCase();
    if (MAJOR_LABELS.some(major => labelLower.includes(major))) {
      return false;
    }
  }
  
  // If composite score is very high, likely mainstream
  if (artist.compositeScore && artist.compositeScore >= INDEPENDENT_THRESHOLDS.compositeScore) {
    // But allow some high-scoring indie artists if they meet other criteria
    const hasLowFollowers = !artist.metrics?.spotify?.followers || 
                           artist.metrics.spotify.followers < INDEPENDENT_THRESHOLDS.spotifyFollowers;
    if (!hasLowFollowers) {
      return false;
    }
  }
  
  // For "current" artists, require minimum momentum
  // This helps filter out legacy/mainstream artists that are no longer trending
  if (artist.momentumScore !== undefined && artist.momentumScore < INDEPENDENT_THRESHOLDS.minMomentum) {
    // Very low momentum suggests the artist is not currently active/trending
    // But we'll still allow them if they're very small (truly independent)
    const isVerySmall = (!artist.metrics?.spotify?.followers || artist.metrics.spotify.followers < 100000) &&
                        (!artist.metrics?.lastfm?.listeners || artist.metrics.lastfm.listeners < 50000);
    if (!isVerySmall) {
      return false; // Not small enough and no momentum = likely legacy/mainstream
    }
  }
  
  // Default to independent if we can't determine otherwise
  return true;
}

/**
 * Update isIndependent flag for an artist
 */
export async function updateIndependentFlag(artistId: string): Promise<void> {
  const artist = await UnifiedArtist.findById(artistId);
  if (!artist) return;
  
  const isIndependent = isIndependentArtist(artist.toObject());
  
  await UnifiedArtist.findByIdAndUpdate(artistId, {
    isIndependent
  });
}

/**
 * Update isIndependent flag for all artists
 */
export async function updateAllIndependentFlags(): Promise<void> {
  const artists = await UnifiedArtist.find({});
  
  for (const artist of artists) {
    try {
      const isIndependent = isIndependentArtist(artist.toObject());
      await UnifiedArtist.findByIdAndUpdate(artist._id, {
        isIndependent
      });
    } catch (error) {
      console.error(`Error updating independent flag for ${artist.name}:`, error);
    }
  }
  
  console.log(`Updated independent flags for ${artists.length} artists`);
}

export default {
  isIndependentArtist,
  updateIndependentFlag,
  updateAllIndependentFlags,
  INDEPENDENT_THRESHOLDS
};

