import UnifiedTrack from '../models/UnifiedTrack';
import UnifiedArtist from '../models/UnifiedArtist';
import * as lastfmService from './lastfmService';
import spotifyService from './spotifyService';
import * as musicbrainzService from './musicbrainzService';
import chartScoringEngine from './chartScoringEngine';
import independentArtistDetector from './independentArtistDetector';
import chartDataAggregator from './chartDataAggregator';

const DELAY_BETWEEN_REQUESTS = 200; // ms - respect rate limits

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Find or create a track
 */
async function findOrCreateTrack(
  trackName: string,
  artistId: string,
  artistName: string
): Promise<any> {
  let track = await UnifiedTrack.findOne({
    name: trackName,
    artistId: artistId
  });

  if (!track) {
    track = new UnifiedTrack({
      name: trackName,
      artistId: artistId,
      artistName: artistName
    });
    await track.save();
  }

  return track;
}

/**
 * Update track metrics from Spotify
 */
async function updateTrackMetricsFromSpotify(track: any, artist: any): Promise<void> {
  // We can search Spotify even without artist Spotify ID
  // Just use track name + artist name for search
  try {
    await sleep(DELAY_BETWEEN_REQUESTS);
    const searchQuery = `track:${track.name} artist:${artist.name}`;
    console.log(`🔍 Searching Spotify: ${searchQuery}`);
    
    const searchResults = await spotifyService.searchTracks(searchQuery, 1);

    if (searchResults.tracks.length > 0) {
      const spotifyTrack = searchResults.tracks[0];
      console.log(`  Found: ${spotifyTrack.name} by ${spotifyTrack.artists.map((a: any) => a.name).join(', ')}`);
      
      // Verify it's the same track by checking artist match
      // Try multiple matching strategies for better matching
      const trackArtists = spotifyTrack.artists.map((a: any) => a.name.toLowerCase());
      const artistNameLower = artist.name.toLowerCase();
      const artistNameNoThe = artistNameLower.replace(/^the /, '');
      
      const artistMatches = trackArtists.includes(artistNameLower) || 
                          trackArtists.some((a: string) => a.replace(/^the /, '') === artistNameNoThe) ||
                          trackArtists.some((a: string) => a.includes(artistNameLower) || artistNameLower.includes(a));
      
      if (artistMatches) {
        const updates: any = {
          'externalIds.spotify': spotifyTrack.id,
          album: spotifyTrack.album.name,
          releaseDate: spotifyTrack.album.release_date ? new Date(spotifyTrack.album.release_date) : undefined,
          duration: spotifyTrack.duration_ms / 1000
        };

        // Always try to get album images - this is the key for album art!
        if (spotifyTrack.album.images?.length) {
          updates.images = spotifyTrack.album.images.map((img: any) => ({
            url: img.url,
            source: 'spotify'
          }));
          console.log(`  ✅ Fetched album art for ${track.name} by ${artist.name}`);
        } else {
          console.log(`  ⚠️ No album images found for ${track.name} by ${artist.name}`);
        }

        // Fetch track audio features and popularity
        await sleep(DELAY_BETWEEN_REQUESTS);
        updates['metrics.spotify'] = {
          timestamp: new Date(),
          source: 'spotify',
          popularity: spotifyTrack.popularity,
          playcount: 0 // Spotify doesn't provide playcount in search results
        };

        // Add genres from artist if available
        if (artist.genres?.length) {
          updates.genres = [...new Set([...(track.genres || []), ...artist.genres])];
        }

        await UnifiedTrack.findByIdAndUpdate(track._id, { $set: updates });
        console.log(`  ✅ Updated track ${track.name} with Spotify ID: ${spotifyTrack.id}`);
      } else {
        console.log(`  ❌ Artist name mismatch: Expected '${artist.name}', found '${spotifyTrack.artists.map((a: any) => a.name).join(', ')}'`);
      }
    } else {
      console.log(`  ❌ No tracks found on Spotify for: ${searchQuery}`);
    }
  } catch (error: any) {
    console.error(`  ❌ Failed to fetch Spotify data for ${track.name} by ${artist.name}:`, error.message);
  }
}

/**
 * Import tracks from Last.fm
 * Imports popular tracks and checks if artist is independent (creates artist if needed)
 */
export async function importFromLastfm(limit: number = 100): Promise<number> {
  try {
    const topTracks = await lastfmService.getTopTracks(limit);
    let imported = 0;

    for (const lastfmTrack of topTracks) {
      try {
        // Find or create the artist
        let artist = await UnifiedArtist.findOne({ name: { $regex: new RegExp(`^${lastfmTrack.artist}$`, 'i') } });
        
        if (!artist) {
          // Artist doesn't exist - create it and check if independent
          console.log(`  Creating artist for track: ${lastfmTrack.artist}`);
          await sleep(DELAY_BETWEEN_REQUESTS);
          
          // Try to create artist manually with basic data
          const mbid = await musicbrainzService.findOrCreateArtistId(lastfmTrack.artist);
          artist = new UnifiedArtist({
            name: lastfmTrack.artist,
            musicbrainzId: mbid,
            compositeScore: 0,
            momentumScore: 0,
            reachScore: 0,
            // Add Last.fm data from the track
            metrics: {
              lastfm: {
                timestamp: new Date(),
                source: 'lastfm',
                listeners: 0, // Will be updated
                playcount: 0
              }
            }
          });
          await artist.save();
          
          // Fetch Spotify data if MusicBrainz has Spotify ID
          if (mbid) {
            await sleep(DELAY_BETWEEN_REQUESTS);
            const mbArtist = await musicbrainzService.getArtistById(mbid);
            if (mbArtist) {
              const externalIds = musicbrainzService.extractExternalIds(mbArtist);
              if (externalIds.spotify) {
                artist.externalIds = externalIds;
                await artist.save();
                
                // Fetch Spotify metrics
                await sleep(DELAY_BETWEEN_REQUESTS);
                try {
                  const spotifyData = await spotifyService.getArtist(externalIds.spotify);
                  if (spotifyData) {
                    artist.metrics = {
                      ...artist.metrics,
                      spotify: {
                        timestamp: new Date(),
                        source: 'spotify',
                        followers: spotifyData.followers.total,
                        popularity: spotifyData.popularity
                      }
                    };
                    artist.genres = spotifyData.genres || [];
                    artist.images = spotifyData.images || [];
                    await artist.save();
                  }
                } catch (error: any) {
                  console.error(`Failed to fetch Spotify data for ${lastfmTrack.artist}:`, error.message);
                }
              }
            }
          }
          
          // Check if independent
          await independentArtistDetector.updateIndependentFlag(artist._id.toString());
          artist = await UnifiedArtist.findById(artist._id);
        }
        
        // Only import tracks from independent artists
        if (!artist || !artist.isIndependent) {
          continue;
        }

        let track = await findOrCreateTrack(
          lastfmTrack.name,
          artist._id.toString(),
          artist.name
        );

        // If Last.fm metrics are 0, try to get detailed track info
        let listeners = lastfmTrack.listeners;
        let playcount = lastfmTrack.playcount;
        
        if (listeners === 0 && playcount === 0) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);
            const trackInfo = await lastfmService.getTrackInfo(lastfmTrack.name, lastfmTrack.artist);
            if (trackInfo) {
              listeners = trackInfo.listeners;
              playcount = trackInfo.playcount;
            }
          } catch (error: any) {
            console.error(`Failed to get track info for ${lastfmTrack.name}:`, error.message);
          }
        }

        // Update Last.fm metrics
        await UnifiedTrack.findByIdAndUpdate(track._id, {
          $set: {
            'metrics.lastfm': {
              timestamp: new Date(),
              source: 'lastfm',
              listeners: listeners,
              playcount: playcount
            },
            'externalIds.lastfm': lastfmTrack.url
          }
        });

        // Always try to get Spotify data (even if artist doesn't have Spotify ID, we can search)
        // This ensures we get album art and Spotify popularity
        if (!track.externalIds?.spotify || !track.images || track.images.length === 0) {
          await updateTrackMetricsFromSpotify(track, artist);
        }

        imported++;
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error: any) {
        console.error(`Error importing track ${lastfmTrack.name}:`, error.message);
      }
    }

    return imported;
  } catch (error: any) {
    console.error('Error importing from Last.fm:', error.message);
    throw error;
  }
}

/**
 * Import tracks by genre tag
 */
export async function importByGenre(genre: string, limit: number = 50): Promise<number> {
  try {
    const tagTracks = await lastfmService.getTopTracksByTag(genre, limit * 2);
    let imported = 0;

    for (const lastfmTrack of tagTracks.slice(0, limit * 2)) {
      try {
        // Find or create the artist
        let artist = await UnifiedArtist.findOne({ name: { $regex: new RegExp(`^${lastfmTrack.artist}$`, 'i') } });
        
        if (!artist) {
          // Artist doesn't exist - create it and check if independent (same logic as importFromLastfm)
          console.log(`  Creating artist for genre track: ${lastfmTrack.artist}`);
          await sleep(DELAY_BETWEEN_REQUESTS);
          
          const mbid = await musicbrainzService.findOrCreateArtistId(lastfmTrack.artist);
          artist = new UnifiedArtist({
            name: lastfmTrack.artist,
            musicbrainzId: mbid,
            compositeScore: 0,
            momentumScore: 0,
            reachScore: 0,
            metrics: {
              lastfm: {
                timestamp: new Date(),
                source: 'lastfm',
                listeners: 0,
                playcount: 0
              }
            }
          });
          await artist.save();
          
          // Fetch Spotify data if MusicBrainz has Spotify ID
          if (mbid) {
            try {
              await sleep(DELAY_BETWEEN_REQUESTS);
              const mbArtist = await musicbrainzService.getArtistById(mbid);
              if (mbArtist) {
                const externalIds = musicbrainzService.extractExternalIds(mbArtist);
                if (externalIds.spotify) {
                  artist.externalIds = externalIds;
                  await artist.save();
                  
                  await sleep(DELAY_BETWEEN_REQUESTS);
                  try {
                    const spotifyData = await spotifyService.getArtist(externalIds.spotify);
                    if (spotifyData) {
                      artist.metrics = {
                        ...artist.metrics,
                        spotify: {
                          timestamp: new Date(),
                          source: 'spotify',
                          followers: spotifyData.followers.total,
                          popularity: spotifyData.popularity
                        }
                      };
                      artist.genres = spotifyData.genres || [];
                      artist.images = spotifyData.images || [];
                      await artist.save();
                    }
                  } catch (error: any) {
                    console.error(`Failed to fetch Spotify data for ${lastfmTrack.artist}:`, error.message);
                  }
                }
              }
            } catch (error: any) {
              // MusicBrainz error - continue without Spotify data
              console.error(`MusicBrainz error for ${lastfmTrack.artist}, continuing...`);
            }
          }
          
          // Check if independent
          await independentArtistDetector.updateIndependentFlag(artist._id.toString());
          artist = await UnifiedArtist.findById(artist._id);
        }
        
        // Only import tracks from independent artists
        if (!artist || !artist.isIndependent) {
          continue;
        }

        let track = await findOrCreateTrack(
          lastfmTrack.name,
          artist._id.toString(),
          artist.name
        );

        // If Last.fm metrics are 0, try to get detailed track info
        let listeners = lastfmTrack.listeners;
        let playcount = lastfmTrack.playcount;
        
        if (listeners === 0 && playcount === 0) {
          try {
            await sleep(DELAY_BETWEEN_REQUESTS);
            const trackInfo = await lastfmService.getTrackInfo(lastfmTrack.name, lastfmTrack.artist);
            if (trackInfo) {
              listeners = trackInfo.listeners;
              playcount = trackInfo.playcount;
            }
          } catch (error: any) {
            console.error(`Failed to get track info for ${lastfmTrack.name}:`, error.message);
          }
        }

        // Update Last.fm metrics
        await UnifiedTrack.findByIdAndUpdate(track._id, {
          $set: {
            'metrics.lastfm': {
              timestamp: new Date(),
              source: 'lastfm',
              listeners: listeners,
              playcount: playcount
            },
            'externalIds.lastfm': lastfmTrack.url,
            genres: [genre] // Set genre from tag
          }
        });

        // Always try to get Spotify data (even if artist doesn't have Spotify ID, we can search)
        // This ensures we get album art and Spotify popularity
        if (!track.externalIds?.spotify || !track.images || track.images.length === 0) {
          await updateTrackMetricsFromSpotify(track, artist);
        }

        imported++;
        await sleep(DELAY_BETWEEN_REQUESTS);
      } catch (error: any) {
        console.error(`Error importing genre track ${lastfmTrack.name}:`, error.message);
      }
    }

    return imported;
  } catch (error: any) {
    console.error(`Error importing genre ${genre}:`, error.message);
    throw error;
  }
}

/**
 * Update all track metrics from all sources
 */
export async function updateAllTrackMetrics(): Promise<void> {
  // Get all tracks from independent artists
  const independentArtists = await UnifiedArtist.find({ isIndependent: true }).select('_id externalIds');
  const independentArtistIds = independentArtists.map(a => a._id);
  
  const tracks = await UnifiedTrack.find({
    artistId: { $in: independentArtistIds }
  })
    .populate('artistId')
    .limit(500); // Process in batches

  console.log(`\n🔄 Updating metrics for ${tracks.length} tracks...`);
  console.log(`   Independent artists: ${independentArtists.length}`);
  console.log(`   Tracks to process: ${tracks.length}\n`);

  let updatedCount = 0;
  let spotifyUpdated = 0;
  let lastfmUpdated = 0;
  let errors = 0;

  for (const track of tracks) {
    try {
      const artist = track.artistId as any;
      if (!artist) {
        console.log(`⚠️ Track ${track.name} has no artist, skipping`);
        continue;
      }

      // Update Last.fm metrics if missing or 0
      if (!track.metrics?.lastfm || 
          (track.metrics.lastfm.listeners === 0 && track.metrics.lastfm.playcount === 0)) {
        try {
          await sleep(DELAY_BETWEEN_REQUESTS);
          const trackInfo = await lastfmService.getTrackInfo(track.name, track.artistName);
          if (trackInfo && (trackInfo.listeners > 0 || trackInfo.playcount > 0)) {
            await UnifiedTrack.findByIdAndUpdate(track._id, {
              $set: {
                'metrics.lastfm': {
                  timestamp: new Date(),
                  source: 'lastfm',
                  listeners: trackInfo.listeners,
                  playcount: trackInfo.playcount
                },
                'externalIds.lastfm': trackInfo.url
              }
            });
            lastfmUpdated++;
          }
        } catch (error: any) {
          console.error(`  ❌ Failed to get Last.fm info for ${track.name}:`, error.message);
          errors++;
        }
      }

      // Update from Spotify - try to get album art and Spotify ID
      // We can search Spotify by track name + artist name (no artist Spotify ID needed)
      // Update if:
      // 1. Track has no images (need album art)
      // 2. Track has no Spotify ID (need Spotify ID)
      // 3. Track has images but no Spotify ID (need Spotify ID for future updates)
      if (!track.images || track.images.length === 0 || !track.externalIds?.spotify) {
        try {
          await updateTrackMetricsFromSpotify(track, artist);
          // Check if update was successful
          const updatedTrack = await UnifiedTrack.findById(track._id);
          if (updatedTrack?.externalIds?.spotify) {
            spotifyUpdated++;
          }
          await sleep(DELAY_BETWEEN_REQUESTS);
        } catch (error: any) {
          console.error(`  ❌ Failed to update Spotify data for ${track.name}:`, error.message);
          errors++;
        }
      }
      
      updatedCount++;
    } catch (error: any) {
      console.error(`  ❌ Error updating metrics for ${track.name}:`, error.message);
      errors++;
    }
  }

  console.log(`\n✅ Update complete:`);
  console.log(`   Tracks processed: ${updatedCount}/${tracks.length}`);
  console.log(`   Last.fm updated: ${lastfmUpdated}`);
  console.log(`   Spotify updated: ${spotifyUpdated}`);
  console.log(`   Errors: ${errors}\n`);
}

export default {
  importFromLastfm,
  importByGenre,
  updateAllTrackMetrics
};
