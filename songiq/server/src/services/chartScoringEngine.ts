import UnifiedArtist from '../models/UnifiedArtist';
import UnifiedTrack from '../models/UnifiedTrack';

// Scoring weights (can be adjusted via admin API)
export interface ScoringWeights {
  spotifyFollowers: number;
  spotifyPopularity: number;
  lastfmListeners: number;
  lastfmPlaycount: number;
  listenbrainzListeners: number;
  spotifyGrowth7d: number;
  lastfmGrowth7d: number;
  crossPlatformPresence: number;
  playsPerListener: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  spotifyFollowers: 0.15,
  spotifyPopularity: 0.10,
  lastfmListeners: 0.10,
  lastfmPlaycount: 0.08,
  listenbrainzListeners: 0.07,
  spotifyGrowth7d: 0.15,
  lastfmGrowth7d: 0.10,
  crossPlatformPresence: 0.10,
  playsPerListener: 0.08
};

// Normalization caps (indie-optimized)
const NORMALIZATION_CAPS = {
  spotifyFollowers: 1000000, // 1M max
  spotifyPopularity: 100,
  lastfmListeners: 500000,
  lastfmPlaycount: 10000000,
  listenbrainzListeners: 100000
};

/**
 * Normalize a value to 0-100 scale with cap
 */
function normalize(value: number, cap: number): number {
  if (value <= 0) return 0;
  const normalized = Math.min(100, (value / cap) * 100);
  return normalized;
}

/**
 * Calculate momentum score (growth-based, with fallback to engagement metrics)
 */
function calculateMomentum(artist: any): number {
  let momentum = 0;
  let hasGrowthData = false;

  // Spotify follower growth (if available)
  if (artist.metrics?.spotify?.followersGrowthPct7d && artist.metrics.spotify.followersGrowthPct7d !== 0) {
    const growth = Math.min(100, Math.max(0, artist.metrics.spotify.followersGrowthPct7d));
    momentum += growth * 0.5;
    hasGrowthData = true;
  }

  // Last.fm listener growth (if available)
  if (artist.metrics?.lastfm?.listenersGrowth7d && artist.metrics.lastfm.listenersGrowth7d !== 0) {
    const growth = Math.min(100, Math.max(0, 
      (artist.metrics.lastfm.listenersGrowth7d / (artist.metrics.lastfm.listeners || 1)) * 100
    ));
    momentum += growth * 0.3;
    hasGrowthData = true;
  }

  // Playcount growth (if available)
  if (artist.metrics?.lastfm?.playcountGrowth7d && artist.metrics.lastfm.playcountGrowth7d !== 0) {
    const growth = Math.min(100, Math.max(0,
      (artist.metrics.lastfm.playcountGrowth7d / (artist.metrics.lastfm.playcount || 1)) * 100
    ));
    momentum += growth * 0.2;
    hasGrowthData = true;
  }

  // If we have actual growth data, return it
  if (hasGrowthData) {
    return Math.min(100, momentum);
  }

  // Fallback: Calculate momentum based on engagement and activity indicators
  // This gives a "potential momentum" score when historical data isn't available
  
  // 1. Plays per listener ratio (higher = more engaged audience = momentum potential)
  const playsPerListener = calculatePlaysPerListener(artist);
  momentum += playsPerListener * 0.4; // Increased weight

  // 2. Cross-platform presence (more platforms = more momentum potential)
  const crossPlatform = calculateCrossPlatformPresence(artist);
  momentum += (crossPlatform / 100) * 25; // Scale to 0-25

  // 3. Spotify popularity (for independent artists, 40-70 range indicates growth potential)
  if (artist.metrics?.spotify?.popularity) {
    const popularity = artist.metrics.spotify.popularity;
    // Independent artists with 40-70 popularity have momentum potential
    if (popularity >= 40 && popularity <= 70) {
      const momentumBoost = ((popularity - 40) / 30) * 15; // 0-15 points
      momentum += momentumBoost;
    } else if (popularity > 70) {
      // Very high popularity for indie = strong momentum
      momentum += 10;
    } else if (popularity >= 20 && popularity < 40) {
      // Emerging artists (20-40) have growth potential
      momentum += ((popularity - 20) / 20) * 8; // 0-8 points
    }
  }

  // 4. Relative listener count (for Last.fm, moderate listener counts suggest growth)
  if (artist.metrics?.lastfm?.listeners) {
    const listeners = artist.metrics.lastfm.listeners;
    // Sweet spot for indie momentum: 10K - 200K listeners
    if (listeners >= 10000 && listeners <= 200000) {
      const normalized = Math.min(1, (listeners - 10000) / 190000);
      momentum += normalized * 15; // 0-15 points
    } else if (listeners > 200000 && listeners < 500000) {
      // Growing beyond sweet spot = momentum
      momentum += 8;
    } else if (listeners >= 1000 && listeners < 10000) {
      // Emerging artists with 1K-10K listeners have potential
      const normalized = (listeners - 1000) / 9000;
      momentum += normalized * 10; // 0-10 points
    }
  }

  // 5. Playcount relative to listeners (high playcount = engaged audience = momentum)
  if (artist.metrics?.lastfm?.playcount && artist.metrics?.lastfm?.listeners) {
    const playcount = artist.metrics.lastfm.playcount;
    const listeners = artist.metrics.lastfm.listeners;
    if (listeners > 0) {
      const playsPerListener = playcount / listeners;
      // High engagement (50+ plays per listener) indicates momentum
      if (playsPerListener >= 50) {
        momentum += 10;
      } else if (playsPerListener >= 30) {
        momentum += 5;
      } else if (playsPerListener >= 20) {
        momentum += 2;
      }
    }
  }

  // 6. Spotify followers (for indie, moderate follower counts indicate momentum)
  if (artist.metrics?.spotify?.followers) {
    const followers = artist.metrics.spotify.followers;
    // Sweet spot: 10K - 500K followers for indie momentum
    if (followers >= 10000 && followers <= 500000) {
      const normalized = Math.min(1, (followers - 10000) / 490000);
      momentum += normalized * 12; // 0-12 points
    } else if (followers >= 1000 && followers < 10000) {
      // Emerging with 1K-10K followers
      const normalized = (followers - 1000) / 9000;
      momentum += normalized * 8; // 0-8 points
    }
  }

  // 7. Recent activity indicator (if metrics are recent, suggest active momentum)
  const spotifyTimestamp = artist.metrics?.spotify?.timestamp;
  const lastfmTimestamp = artist.metrics?.lastfm?.timestamp;
  if (spotifyTimestamp || lastfmTimestamp) {
    const mostRecent = spotifyTimestamp && lastfmTimestamp
      ? new Date(Math.max(new Date(spotifyTimestamp).getTime(), new Date(lastfmTimestamp).getTime()))
      : spotifyTimestamp ? new Date(spotifyTimestamp) : new Date(lastfmTimestamp);
    
    const daysSinceUpdate = (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24);
    // Recent updates (within 7 days) suggest active momentum
    if (daysSinceUpdate <= 7) {
      momentum += 5; // Bonus for recent data
    } else if (daysSinceUpdate <= 30) {
      momentum += 2; // Small bonus for recent-ish data
    }
  }

  // 8. Add some randomness based on artist name hash for variation when metrics are similar
  // This prevents all artists with similar metrics from having identical scores
  if (momentum > 0 && momentum < 20) {
    const nameHash = artist.name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const variation = (nameHash % 10) * 0.5; // 0-4.5 points variation
    momentum += variation;
  }

  return Math.min(100, Math.max(0, momentum));
}

/**
 * Calculate reach score (total audience)
 */
function calculateReach(artist: any): number {
  let reach = 0;

  // Spotify followers
  if (artist.metrics?.spotify?.followers) {
    reach += normalize(artist.metrics.spotify.followers, NORMALIZATION_CAPS.spotifyFollowers) * 0.4;
  }

  // Last.fm listeners
  if (artist.metrics?.lastfm?.listeners) {
    reach += normalize(artist.metrics.lastfm.listeners, NORMALIZATION_CAPS.lastfmListeners) * 0.3;
  }

  // ListenBrainz listeners
  if (artist.metrics?.listenbrainz?.listeners) {
    reach += normalize(artist.metrics.listenbrainz.listeners, NORMALIZATION_CAPS.listenbrainzListeners) * 0.3;
  }

  return Math.min(100, reach);
}

/**
 * Calculate cross-platform presence bonus
 */
function calculateCrossPlatformPresence(artist: any): number {
  let presence = 0;
  const sources = [];

  if (artist.metrics?.spotify) sources.push('spotify');
  if (artist.metrics?.lastfm) sources.push('lastfm');
  if (artist.metrics?.listenbrainz) sources.push('listenbrainz');

  // Bonus for multiple platforms
  if (sources.length >= 3) return 100;
  if (sources.length === 2) return 60;
  if (sources.length === 1) return 30;
  return 0;
}

/**
 * Calculate plays per listener ratio
 */
function calculatePlaysPerListener(artist: any): number {
  const listeners = artist.metrics?.lastfm?.listeners || 0;
  const playcount = artist.metrics?.lastfm?.playcount || 0;

  if (listeners === 0) return 0;

  const ratio = playcount / listeners;
  // Normalize: 0-50 plays per listener = 0-100 score
  return Math.min(100, (ratio / 50) * 100);
}

/**
 * Calculate composite score for an artist
 */
export function calculateArtistScore(artist: any, weights: ScoringWeights = DEFAULT_WEIGHTS): {
  compositeScore: number;
  momentumScore: number;
  reachScore: number;
} {
  let composite = 0;

  // Spotify metrics
  if (artist.metrics?.spotify) {
    if (artist.metrics.spotify.followers) {
      composite += normalize(artist.metrics.spotify.followers, NORMALIZATION_CAPS.spotifyFollowers) * weights.spotifyFollowers;
    }
    if (artist.metrics.spotify.popularity) {
      composite += normalize(artist.metrics.spotify.popularity, NORMALIZATION_CAPS.spotifyPopularity) * weights.spotifyPopularity;
    }
    if (artist.metrics.spotify.followersGrowthPct7d) {
      const growth = Math.min(100, Math.max(0, artist.metrics.spotify.followersGrowthPct7d));
      composite += growth * weights.spotifyGrowth7d;
    }
  }

  // Last.fm metrics
  if (artist.metrics?.lastfm) {
    if (artist.metrics.lastfm.listeners) {
      composite += normalize(artist.metrics.lastfm.listeners, NORMALIZATION_CAPS.lastfmListeners) * weights.lastfmListeners;
    }
    if (artist.metrics.lastfm.playcount) {
      composite += normalize(artist.metrics.lastfm.playcount, NORMALIZATION_CAPS.lastfmPlaycount) * weights.lastfmPlaycount;
    }
    if (artist.metrics.lastfm.listenersGrowth7d) {
      const growth = Math.min(100, Math.max(0,
        (artist.metrics.lastfm.listenersGrowth7d / (artist.metrics.lastfm.listeners || 1)) * 100
      ));
      composite += growth * weights.lastfmGrowth7d;
    }
  }

  // ListenBrainz metrics
  if (artist.metrics?.listenbrainz?.listeners) {
    composite += normalize(artist.metrics.listenbrainz.listeners, NORMALIZATION_CAPS.listenbrainzListeners) * weights.listenbrainzListeners;
  }

  // Cross-platform bonus
  const crossPlatform = calculateCrossPlatformPresence(artist);
  composite += crossPlatform * weights.crossPlatformPresence;

  // Plays per listener
  const playsPerListener = calculatePlaysPerListener(artist);
  composite += playsPerListener * weights.playsPerListener;

  const momentumScore = calculateMomentum(artist);
  const reachScore = calculateReach(artist);

  return {
    compositeScore: Math.min(100, Math.max(0, composite)),
    momentumScore,
    reachScore
  };
}

/**
 * Update score for a single artist
 */
export async function updateArtistScore(artistId: string, weights?: ScoringWeights): Promise<void> {
  const artist = await UnifiedArtist.findById(artistId);
  if (!artist) return;

  const scores = calculateArtistScore(artist.toObject(), weights);

  // Add to history (keep last 30 days)
  const historyEntry = {
    date: new Date(),
    compositeScore: scores.compositeScore,
    momentumScore: scores.momentumScore,
    reachScore: scores.reachScore
  };

  const scoreHistory = artist.scoreHistory || [];
  scoreHistory.push(historyEntry);

  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredHistory = scoreHistory.filter((entry: any) => entry.date >= thirtyDaysAgo);

  await UnifiedArtist.findByIdAndUpdate(artistId, {
    compositeScore: scores.compositeScore,
    momentumScore: scores.momentumScore,
    reachScore: scores.reachScore,
    lastScoreUpdate: new Date(),
    scoreHistory: filteredHistory
  });
}

/**
 * Update scores for all artists
 */
export async function updateAllArtistScores(weights?: ScoringWeights): Promise<void> {
  const artists = await UnifiedArtist.find({});
  
  for (const artist of artists) {
    try {
      await updateArtistScore(artist._id.toString(), weights);
    } catch (error) {
      console.error(`Error updating score for artist ${artist.name}:`, error);
    }
  }

  console.log(`Updated scores for ${artists.length} artists`);
}

/**
 * Calculate momentum score for a track
 */
function calculateTrackMomentum(track: any): number {
  let momentum = 0;

  // Spotify popularity growth (if we had historical data)
  // For now, use current popularity as momentum indicator
  if (track.metrics?.spotify?.popularity) {
    const popularity = track.metrics.spotify.popularity;
    // Independent tracks with 30-70 popularity have momentum potential
    if (popularity >= 30 && popularity <= 70) {
      momentum += ((popularity - 30) / 40) * 40; // 0-40 points
    } else if (popularity > 70) {
      momentum += 30; // High popularity = momentum
    }
  }

  // Last.fm playcount relative to listeners
  if (track.metrics?.lastfm?.playcount && track.metrics?.lastfm?.listeners) {
    const playcount = track.metrics.lastfm.playcount;
    const listeners = track.metrics.lastfm.listeners;
    if (listeners > 0) {
      const playsPerListener = playcount / listeners;
      // High engagement (30+ plays per listener) indicates momentum
      if (playsPerListener >= 30) {
        momentum += 30;
      } else if (playsPerListener >= 20) {
        momentum += 20;
      } else if (playsPerListener >= 10) {
        momentum += 10;
      }
    }
  }

  // Recent release bonus (within last 90 days)
  if (track.releaseDate) {
    const daysSinceRelease = (Date.now() - new Date(track.releaseDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRelease <= 90) {
      momentum += 10; // Bonus for recent releases
    }
  }

  return Math.min(100, Math.max(0, momentum));
}

/**
 * Update score for a single track
 */
export async function updateTrackScore(trackId: string): Promise<void> {
  const track = await UnifiedTrack.findById(trackId).populate('artistId');
  if (!track) return;

  // Only score tracks from independent artists
  const artist = track.artistId as any;
  if (!artist || !artist.isIndependent) {
    return;
  }

  let composite = 0;

  // Spotify metrics
  if (track.metrics?.spotify) {
    if (track.metrics.spotify.popularity) {
      composite += normalize(track.metrics.spotify.popularity, 100) * 0.5;
    }
    if (track.metrics.spotify.playcount) {
      composite += normalize(track.metrics.spotify.playcount, 10000000) * 0.1;
    }
  }

  // Last.fm metrics
  if (track.metrics?.lastfm) {
    if (track.metrics.lastfm.listeners) {
      // Independent tracks typically have 100K-3M listeners
      composite += normalize(track.metrics.lastfm.listeners, 3000000) * 0.3;
    }
    if (track.metrics.lastfm.playcount) {
      // Independent tracks typically have 1M-30M plays
      composite += normalize(track.metrics.lastfm.playcount, 30000000) * 0.2;
    }
  }

  // Always calculate momentum and save score, even if 0
  // This ensures tracks with metrics get scored properly
  const momentumScore = calculateTrackMomentum(track);

  const scoreHistory = track.scoreHistory || [];
  scoreHistory.push({
    date: new Date(),
    compositeScore: composite,
    momentumScore: momentumScore
  });

  // Keep only last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredHistory = scoreHistory.filter((entry: any) => entry.date >= thirtyDaysAgo);

  await UnifiedTrack.findByIdAndUpdate(trackId, {
    compositeScore: composite,
    momentumScore: momentumScore,
    lastScoreUpdate: new Date(),
    scoreHistory: filteredHistory
  });
}

/**
 * Update scores for all tracks
 */
export async function updateAllTrackScores(): Promise<void> {
  // Only update tracks from independent artists
  const independentArtists = await UnifiedArtist.find({ isIndependent: true }).select('_id');
  const independentArtistIds = independentArtists.map(a => a._id);
  
  const tracks = await UnifiedTrack.find({
    artistId: { $in: independentArtistIds }
  });
  
  console.log(`Updating scores for ${tracks.length} tracks from ${independentArtistIds.length} independent artists`);
  
  for (const track of tracks) {
    try {
      await updateTrackScore(track._id.toString());
    } catch (error) {
      console.error(`Error updating score for track ${track.name}:`, error);
    }
  }

  console.log(`Updated scores for ${tracks.length} tracks`);
}

export default {
  calculateArtistScore,
  updateArtistScore,
  updateAllArtistScores,
  updateTrackScore,
  updateAllTrackScores,
  DEFAULT_WEIGHTS
};

