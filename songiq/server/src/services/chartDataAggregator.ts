import UnifiedArtist from '../models/UnifiedArtist';
import UnifiedTrack from '../models/UnifiedTrack';
import * as musicbrainzService from './musicbrainzService';
import * as lastfmService from './lastfmService';
import * as listenbrainzService from './listenbrainzService';
import spotifyService from './spotifyService';
import independentArtistDetector from './independentArtistDetector';

// Rate limiting delays
const DELAY_BETWEEN_REQUESTS = 200; // 200ms between requests

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Find or create UnifiedArtist
 */
async function findOrCreateArtist(name: string, musicbrainzId?: string): Promise<any> {
  let artist = await UnifiedArtist.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

  if (!artist) {
    // Try to find MusicBrainz ID if not provided
    if (!musicbrainzId) {
      const mbid = await musicbrainzService.findOrCreateArtistId(name);
      if (mbid) {
        musicbrainzId = mbid;
      }
    }

    artist = new UnifiedArtist({
      name,
      musicbrainzId,
      compositeScore: 0,
      momentumScore: 0,
      reachScore: 0
    });
    await artist.save();
  }

  return artist;
}

/**
 * Update artist metrics from Spotify
 */
async function updateArtistMetricsFromSpotify(artist: any): Promise<void> {
  if (!artist.externalIds?.spotify) return;

  try {
    await sleep(DELAY_BETWEEN_REQUESTS);
    const spotifyData = await spotifyService.getArtist(artist.externalIds.spotify);

    if (spotifyData) {
      const prevFollowers = artist.metrics?.spotify?.followers || 0;
      const followerGrowth = spotifyData.followers.total - prevFollowers;
      const followerGrowthPct = prevFollowers > 0
        ? (followerGrowth / prevFollowers) * 100
        : 0;

      const updates: any = {
        'metrics.spotify': {
          timestamp: new Date(),
          source: 'spotify',
          followers: spotifyData.followers.total,
          popularity: spotifyData.popularity,
          followersGrowth7d: followerGrowth,
          followersGrowthPct7d: followerGrowthPct
        }
      };

      if (spotifyData.genres?.length) {
        updates.genres = spotifyData.genres;
      }
      if (spotifyData.images?.length) {
        updates.images = spotifyData.images.map((img: any) => ({
          url: img.url,
          source: 'spotify',
          width: img.width,
          height: img.height
        }));
      }

      await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });
    }
  } catch (error: any) {
    console.error(`Spotify fetch failed for ${artist.name}:`, error.message);
  }
}

/**
 * Update artist metrics from Last.fm
 */
async function updateArtistMetricsFromLastfm(artist: any): Promise<void> {
  try {
    await sleep(DELAY_BETWEEN_REQUESTS);
    const lastfmData = await lastfmService.getTopArtists(1000);
    const lastfmArtist = lastfmData.find((a: any) => 
      a.name.toLowerCase() === artist.name.toLowerCase()
    );

    if (lastfmArtist) {
      const prevListeners = artist.metrics?.lastfm?.listeners || 0;
      const prevPlaycount = artist.metrics?.lastfm?.playcount || 0;

      const listenersGrowth = lastfmArtist.listeners - prevListeners;
      const playcountGrowth = lastfmArtist.playcount - prevPlaycount;

      await UnifiedArtist.findByIdAndUpdate(artist._id, {
        $set: {
          'metrics.lastfm': {
            timestamp: new Date(),
            source: 'lastfm',
            listeners: lastfmArtist.listeners,
            playcount: lastfmArtist.playcount,
            listenersGrowth7d: listenersGrowth,
            playcountGrowth7d: playcountGrowth
          },
          'externalIds.lastfm': lastfmArtist.url
        }
      });
    }
  } catch (error: any) {
    console.error(`Last.fm fetch failed for ${artist.name}:`, error.message);
  }
}

/**
 * Update artist metrics from ListenBrainz
 */
async function updateArtistMetricsFromListenBrainz(artist: any): Promise<void> {
  try {
    await sleep(DELAY_BETWEEN_REQUESTS);
    const stats = await listenbrainzService.getArtistStats(
      artist.name,
      artist.musicbrainzId
    );

    if (stats) {
      await UnifiedArtist.findByIdAndUpdate(artist._id, {
        $set: {
          'metrics.listenbrainz': {
            timestamp: new Date(),
            source: 'listenbrainz',
            listeners: stats.listeners,
            listenCount: stats.listen_count
          }
        }
      });
    }
  } catch (error: any) {
    console.error(`ListenBrainz fetch failed for ${artist.name}:`, error.message);
  }
}

/**
 * Import artists from Last.fm top charts
 */
export async function importFromLastfm(limit: number = 100): Promise<number> {
  try {
    const topArtists = await lastfmService.getTopArtists(limit);
    let imported = 0;

    for (const lastfmArtist of topArtists) {
      try {
        // Find or create artist
        let artist = await findOrCreateArtist(lastfmArtist.name);

        // Update Last.fm metrics
        await UnifiedArtist.findByIdAndUpdate(artist._id, {
          $set: {
            'metrics.lastfm': {
              timestamp: new Date(),
              source: 'lastfm',
              listeners: lastfmArtist.listeners,
              playcount: lastfmArtist.playcount,
              listenersGrowth7d: 0,
              playcountGrowth7d: 0
            },
            'externalIds.lastfm': lastfmArtist.url
          }
        });

        // Try to get MusicBrainz ID and Spotify ID
        let mbid = artist.musicbrainzId;
        if (!mbid) {
          mbid = await musicbrainzService.findOrCreateArtistId(lastfmArtist.name);
        }

        // If we have a MusicBrainz ID but no Spotify ID, try to get it
        if (mbid && !artist.externalIds?.spotify) {
          const mbArtist = await musicbrainzService.getArtistById(mbid);
          if (mbArtist) {
            const externalIds = musicbrainzService.extractExternalIds(mbArtist);
            const updates: any = {};
            
            // Update MusicBrainz ID if we just got it
            if (!artist.musicbrainzId) {
              updates.musicbrainzId = mbid;
              updates.country = mbArtist.country || mbArtist.area?.name;
              updates.type = mbArtist.type;
            }
            
            // Add Spotify ID if we found it
            if (externalIds.spotify) {
              updates['externalIds.spotify'] = externalIds.spotify;
              
              // If we got a Spotify ID, fetch Spotify metrics immediately
              try {
                await sleep(DELAY_BETWEEN_REQUESTS);
                const spotifyData = await spotifyService.getArtist(externalIds.spotify);
                if (spotifyData) {
                  updates['metrics.spotify'] = {
                    timestamp: new Date(),
                    source: 'spotify',
                    followers: spotifyData.followers.total,
                    popularity: spotifyData.popularity,
                    followersGrowth7d: 0,
                    followersGrowthPct7d: 0
                  };
                  
                  if (spotifyData.genres?.length) {
                    updates.genres = spotifyData.genres;
                  }
                  if (spotifyData.images?.length) {
                    updates.images = spotifyData.images.map((img: any) => ({
                      url: img.url,
                      source: 'spotify',
                      width: img.width,
                      height: img.height
                    }));
                  }
                }
              } catch (error: any) {
                console.error(`Failed to fetch Spotify data for ${lastfmArtist.name}:`, error.message);
              }
            }
            
            if (Object.keys(updates).length > 0) {
              await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });
            }
          }
        } else if (artist.externalIds?.spotify && !artist.metrics?.spotify) {
          // Artist has Spotify ID but no metrics - fetch them now
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);
            await updateArtistMetricsFromSpotify(artist);
            
            // Update independent flag
            const updatedArtist = await UnifiedArtist.findById(artist._id);
            if (updatedArtist) {
              const isIndependent = independentArtistDetector.isIndependentArtist(updatedArtist.toObject());
              await UnifiedArtist.findByIdAndUpdate(artist._id, { isIndependent });
            }
          } catch (error: any) {
            console.error(`Failed to fetch Spotify metrics for ${lastfmArtist.name}:`, error.message);
          }
        } else {
          // Update independent flag for existing artist
          const isIndependent = independentArtistDetector.isIndependentArtist(artist.toObject());
          await UnifiedArtist.findByIdAndUpdate(artist._id, { isIndependent });
        }

        imported++;
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error: any) {
        console.error(`Error importing artist ${lastfmArtist.name}:`, error.message);
      }
    }

    return imported;
  } catch (error: any) {
    console.error('Error importing from Last.fm:', error.message);
    throw error;
  }
}

/**
 * Import artists by genre
 */
export async function importByGenre(genre: string, limit: number = 50): Promise<number> {
  try {
    // Use Last.fm's tag.gettopartists to get artists tagged with this genre
    const tagArtists = await lastfmService.getTopArtistsByTag(genre, limit * 2); // Get more to filter for independent
    let imported = 0;

    for (const lastfmArtist of tagArtists.slice(0, limit * 2)) {
      try {
        // Find or create artist
        let artist = await findOrCreateArtist(lastfmArtist.name);

        // Update Last.fm metrics
        await UnifiedArtist.findByIdAndUpdate(artist._id, {
          $set: {
            'metrics.lastfm': {
              timestamp: new Date(),
              source: 'lastfm',
              listeners: lastfmArtist.listeners,
              playcount: lastfmArtist.playcount,
              listenersGrowth7d: 0,
              playcountGrowth7d: 0
            },
            'externalIds.lastfm': lastfmArtist.url
          }
        });

        // Try to get MusicBrainz ID and Spotify ID (same as importFromLastfm)
        if (!artist.musicbrainzId) {
          const mbid = await musicbrainzService.findOrCreateArtistId(lastfmArtist.name);
          if (mbid) {
            const mbArtist = await musicbrainzService.getArtistById(mbid);
            if (mbArtist) {
              const externalIds = musicbrainzService.extractExternalIds(mbArtist);
              const updates: any = {
                musicbrainzId: mbid,
                'externalIds.spotify': externalIds.spotify,
                country: mbArtist.country || mbArtist.area?.name,
                type: mbArtist.type
              };
              
              // Fetch Spotify metrics if available
              if (externalIds.spotify) {
                try {
                  await sleep(DELAY_BETWEEN_REQUESTS);
                  const spotifyData = await spotifyService.getArtist(externalIds.spotify);
                  if (spotifyData) {
                    updates['metrics.spotify'] = {
                      timestamp: new Date(),
                      source: 'spotify',
                      followers: spotifyData.followers.total,
                      popularity: spotifyData.popularity,
                      followersGrowth7d: 0,
                      followersGrowthPct7d: 0
                    };
                    
                    if (spotifyData.genres?.length) {
                      updates.genres = spotifyData.genres;
                    }
                    if (spotifyData.images?.length) {
                      updates.images = spotifyData.images.map((img: any) => ({
                        url: img.url,
                        source: 'spotify',
                        width: img.width,
                        height: img.height
                      }));
                    }
                  }
                } catch (error: any) {
                  console.error(`Failed to fetch Spotify data for ${lastfmArtist.name}:`, error.message);
                }
              }
              
              await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });
            }
          }
        }

        // Update independent flag
        const updatedArtist = await UnifiedArtist.findById(artist._id);
        if (updatedArtist) {
          const isIndependent = independentArtistDetector.isIndependentArtist(updatedArtist.toObject());
          await UnifiedArtist.findByIdAndUpdate(artist._id, { isIndependent });
          
          // Only count if it's actually independent
          if (isIndependent) {
            imported++;
          }
        }

        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error: any) {
        console.error(`Error importing genre artist ${lastfmArtist.name}:`, error.message);
      }
    }

    return imported;
  } catch (error: any) {
    console.error(`Error importing genre ${genre}:`, error.message);
    throw error;
  }
}

/**
 * Import from ListenBrainz
 */
export async function importFromListenBrainz(limit: number = 100, range: 'week' | 'month' | 'year' | 'all_time' = 'week'): Promise<number> {
  try {
    const topArtists = await listenbrainzService.getTopArtists(limit, range);
    let imported = 0;

    for (const lbArtist of topArtists) {
      try {
        let artist = await findOrCreateArtist(lbArtist.artist_name, lbArtist.artist_mbid);
        
        const updates: any = {
          'metrics.listenbrainz': {
            timestamp: new Date(),
            source: 'listenbrainz',
            listeners: 0, // ListenBrainz doesn't provide listener count in top artists
            listenCount: lbArtist.listen_count
          },
          musicbrainzId: lbArtist.artist_mbid || artist.musicbrainzId
        };
        
        // Use MusicBrainz ID to get Spotify ID and fetch metrics
        if (lbArtist.artist_mbid && !artist.externalIds?.spotify) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);
            const mbArtist = await musicbrainzService.getArtistById(lbArtist.artist_mbid);
            if (mbArtist) {
              const externalIds = musicbrainzService.extractExternalIds(mbArtist);
              if (externalIds.spotify) {
                updates['externalIds.spotify'] = externalIds.spotify;
                
                // Fetch Spotify metrics
                await sleep(DELAY_BETWEEN_REQUESTS);
                const spotifyData = await spotifyService.getArtist(externalIds.spotify);
                if (spotifyData) {
                  updates['metrics.spotify'] = {
                    timestamp: new Date(),
                    source: 'spotify',
                    followers: spotifyData.followers.total,
                    popularity: spotifyData.popularity,
                    followersGrowth7d: 0,
                    followersGrowthPct7d: 0
                  };
                  
                  if (spotifyData.genres?.length) {
                    updates.genres = spotifyData.genres;
                  }
                  if (spotifyData.images?.length) {
                    updates.images = spotifyData.images.map((img: any) => ({
                      url: img.url,
                      source: 'spotify',
                      width: img.width,
                      height: img.height
                    }));
                  }
                }
              }
            }
          } catch (error: any) {
            console.error(`Failed to fetch MusicBrainz/Spotify data for ${lbArtist.artist_name}:`, error.message);
          }
        } else if (artist.externalIds?.spotify && !artist.metrics?.spotify) {
          // Artist has Spotify ID but no metrics - fetch them now
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);
            await updateArtistMetricsFromSpotify(artist);
          } catch (error: any) {
            console.error(`Failed to fetch Spotify metrics for ${lbArtist.artist_name}:`, error.message);
          }
        }

        await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });

        imported++;
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error: any) {
        console.error(`Error importing ListenBrainz artist ${lbArtist.artist_name}:`, error.message);
      }
    }

    return imported;
  } catch (error: any) {
    console.error('Error importing from ListenBrainz:', error.message);
    throw error;
  }
}

/**
 * Import fresh releases (recently released tracks)
 */
export async function importFreshReleases(daysBack: number = 14): Promise<number> {
  // This would integrate with Spotify's new releases API
  // For now, return 0 as placeholder
  console.log(`Import fresh releases not yet implemented (daysBack: ${daysBack})`);
  return 0;
}

/**
 * Fetch Spotify IDs for artists that don't have them
 */
export async function fetchSpotifyIdsForArtists(): Promise<number> {
  // Get all artists (both independent and non-independent) that don't have Spotify IDs
  // We'll process independent artists first, but also get others
  const allArtists = await UnifiedArtist.find({}).limit(500);
  
  // Filter for artists without Spotify IDs
  const artists = allArtists.filter(artist => {
    const spotifyId = artist.externalIds?.spotify;
    // Check if spotify field doesn't exist, is null, empty string, or undefined
    const hasSpotifyId = spotifyId && spotifyId !== '' && spotifyId !== null && spotifyId !== undefined;
    return !hasSpotifyId;
  });

  // Sort: independent artists first
  artists.sort((a, b) => {
    if (a.isIndependent && !b.isIndependent) return -1;
    if (!a.isIndependent && b.isIndependent) return 1;
    return 0;
  });

  console.log(`Found ${artists.length} artists without Spotify IDs (out of ${allArtists.length} total artists)...`);
  console.log(`  - Independent artists: ${artists.filter(a => a.isIndependent).length}`);
  console.log(`  - Other artists: ${artists.filter(a => !a.isIndependent).length}`);
  
  if (artists.length === 0 && allArtists.length > 0) {
    // Debug: Check first few artists to see their structure
    console.log('Debug: Checking first 3 artists structure:');
    for (let i = 0; i < Math.min(3, allArtists.length); i++) {
      const a = allArtists[i];
      console.log(`  ${a.name}: externalIds=${JSON.stringify(a.externalIds)}, spotify=${a.externalIds?.spotify}`);
    }
  }
  
  let fetched = 0;

  for (const artist of artists) {
    try {
      // Try to get MusicBrainz ID if we don't have it
      let mbid = artist.musicbrainzId;
      if (!mbid) {
        await sleep(DELAY_BETWEEN_REQUESTS);
        mbid = await musicbrainzService.findOrCreateArtistId(artist.name);
      }

      // If we have a MusicBrainz ID, get Spotify ID from it
      if (mbid) {
        await sleep(DELAY_BETWEEN_REQUESTS);
        const mbArtist = await musicbrainzService.getArtistById(mbid);
        if (mbArtist) {
          const externalIds = musicbrainzService.extractExternalIds(mbArtist);
          if (externalIds.spotify) {
            const updates: any = {
              'externalIds.spotify': externalIds.spotify
            };

            // Update MusicBrainz ID if we just got it
            if (!artist.musicbrainzId) {
              updates.musicbrainzId = mbid;
              updates.country = mbArtist.country || mbArtist.area?.name;
              updates.type = mbArtist.type;
            }

            await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });
            fetched++;

            // Fetch Spotify metrics immediately
            try {
              await sleep(DELAY_BETWEEN_REQUESTS);
              await updateArtistMetricsFromSpotify({ ...artist.toObject(), externalIds: { spotify: externalIds.spotify } });
            } catch (error: any) {
              console.error(`Failed to fetch Spotify metrics for ${artist.name}:`, error.message);
            }
          }
        }
      }

      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error: any) {
      console.error(`Error fetching Spotify ID for ${artist.name}:`, error.message);
    }
  }

  console.log(`Fetched Spotify IDs for ${fetched} artists`);
  return fetched;
}

/**
 * Update artist images for artists that don't have them
 * This will search Spotify for artists by name if they don't have a Spotify ID
 */
export async function updateArtistImages(): Promise<void> {
  // Get all independent artists that don't have images
  const independentArtists = await UnifiedArtist.find({ isIndependent: true }).limit(500);
  
  const artists = independentArtists.filter(artist => {
    return !artist.images || artist.images.length === 0;
  });

  console.log(`\n🔄 Updating images for ${artists.length} artists (out of ${independentArtists.length} total)...\n`);

  let updated = 0;
  let errors = 0;

  for (const artist of artists) {
    try {
      // If artist has Spotify ID, use it directly
      if (artist.externalIds?.spotify) {
        await sleep(DELAY_BETWEEN_REQUESTS);
        const spotifyData = await spotifyService.getArtist(artist.externalIds.spotify);
        
        if (spotifyData && spotifyData.images?.length) {
          await UnifiedArtist.findByIdAndUpdate(artist._id, {
            $set: {
              images: spotifyData.images.map((img: any) => ({
                url: img.url,
                source: 'spotify',
                width: img.width,
                height: img.height
              }))
            }
          });
          updated++;
          console.log(`  ✅ Fetched image for ${artist.name} (via Spotify ID)`);
        }
      } else {
        // Search Spotify by artist name
        await sleep(DELAY_BETWEEN_REQUESTS);
        const searchQuery = `artist:${artist.name}`;
        const searchResults = await spotifyService.searchArtists(searchQuery, 1);
        
        if (searchResults.artists.length > 0) {
          const spotifyArtist = searchResults.artists[0];
          
          // Verify it's the same artist by checking name match
          const artistNameLower = artist.name.toLowerCase();
          const spotifyNameLower = spotifyArtist.name.toLowerCase();
          const artistNameNoThe = artistNameLower.replace(/^the /, '');
          const spotifyNameNoThe = spotifyNameLower.replace(/^the /, '');
          
          if (spotifyNameLower === artistNameLower || 
              spotifyNameNoThe === artistNameNoThe ||
              spotifyNameLower.includes(artistNameLower) ||
              artistNameLower.includes(spotifyNameLower)) {
            
            const updates: any = {};
            
            // Update images
            if (spotifyArtist.images?.length) {
              updates.images = spotifyArtist.images.map((img: any) => ({
                url: img.url,
                source: 'spotify',
                width: img.width,
                height: img.height
              }));
            }
            
            // Also update Spotify ID if we found it
            if (spotifyArtist.id) {
              updates['externalIds.spotify'] = spotifyArtist.id;
            }
            
            // Update metrics if we have them
            if (spotifyArtist.followers || spotifyArtist.popularity) {
              updates['metrics.spotify'] = {
                timestamp: new Date(),
                source: 'spotify',
                followers: spotifyArtist.followers?.total || 0,
                popularity: spotifyArtist.popularity || 0
              };
            }
            
            // Update genres if available
            if (spotifyArtist.genres?.length) {
              updates.genres = spotifyArtist.genres;
            }
            
            await UnifiedArtist.findByIdAndUpdate(artist._id, { $set: updates });
            updated++;
            console.log(`  ✅ Fetched image for ${artist.name} (via search)`);
          } else {
            console.log(`  ⚠️ Name mismatch: ${artist.name} vs ${spotifyArtist.name}`);
          }
        } else {
          console.log(`  ❌ No results found for ${artist.name}`);
        }
      }
      
      await sleep(DELAY_BETWEEN_REQUESTS);
    } catch (error: any) {
      console.error(`  ❌ Failed to fetch image for ${artist.name}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✅ Update complete:`);
  console.log(`   Artists processed: ${artists.length}`);
  console.log(`   Images updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
}

/**
 * Update all artist metrics from all sources
 */
export async function updateAllArtistMetrics(): Promise<void> {
  const artists = await UnifiedArtist.find({});

  for (const artist of artists) {
    try {
      // Update from Spotify if we have the ID
      if (artist.externalIds?.spotify) {
        await updateArtistMetricsFromSpotify(artist);
      }

      // Update from Last.fm
      await updateArtistMetricsFromLastfm(artist);

      // Update from ListenBrainz
      await updateArtistMetricsFromListenBrainz(artist);
    } catch (error: any) {
      console.error(`Error updating metrics for ${artist.name}:`, error.message);
    }
  }

  console.log(`Updated metrics for ${artists.length} artists`);
}

export default {
  importFromLastfm,
  importByGenre,
  importFromListenBrainz,
  importFreshReleases,
  updateAllArtistMetrics,
  fetchSpotifyIdsForArtists,
  updateArtistImages
};

