import chartDataAggregator from './chartDataAggregator';
import trackDataAggregator from './trackDataAggregator';
import chartScoringEngine, { DEFAULT_WEIGHTS } from './chartScoringEngine';
import independentArtistDetector from './independentArtistDetector';

/**
 * Chart Update Scheduler
 * 
 * Handles automatic updates of chart data:
 * - Daily: Update all artist metrics from all sources
 * - Daily: Recalculate all scores
 * - Weekly: Import new artists from Last.fm
 * - Hourly: Update scores for top artists (lightweight)
 */

interface UpdateSchedule {
  name: string;
  interval: number; // milliseconds
  handler: () => Promise<void>;
  lastRun?: Date;
  isRunning: boolean;
}

class ChartUpdateScheduler {
  private schedules: Map<string, NodeJS.Timeout> = new Map();
  private isEnabled: boolean = false;

  /**
   * Start the scheduler
   */
  start() {
    if (this.isEnabled) {
      console.log('⚠️  Chart update scheduler is already running');
      return;
    }

    this.isEnabled = true;
    console.log('📅 Starting chart update scheduler...');

    // Daily: Full metrics update (runs at 2 AM)
    this.scheduleDaily('full-metrics-update', this.updateAllMetrics, 2);

    // Daily: Score recalculation (runs at 3 AM, after metrics update)
    this.scheduleDaily('score-recalculation', this.recalculateScores, 3);

    // Weekly: Import new artists (runs Sunday at 1 AM)
    this.scheduleWeekly('import-new-artists', this.importNewArtists, 0, 1);

    // Weekly: Import new tracks (runs Sunday at 2 AM)
    this.scheduleWeekly('import-new-tracks', this.importNewTracks, 0, 2);

    // Hourly: Quick score update for top artists (lightweight)
    this.scheduleHourly('top-artists-update', this.updateTopArtists);

    console.log('✅ Chart update scheduler started');
    console.log('   - Daily metrics update: 2:00 AM');
    console.log('   - Daily score recalculation: 3:00 AM');
    console.log('   - Weekly artist import: Sunday 1:00 AM');
    console.log('   - Weekly track import: Sunday 2:00 AM');
    console.log('   - Hourly top artists update: Every hour');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    this.isEnabled = false;
    this.schedules.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`⏹️  Stopped schedule: ${name}`);
    });
    this.schedules.clear();
    console.log('⏹️  Chart update scheduler stopped');
  }

  /**
   * Schedule a daily task at a specific hour
   */
  private scheduleDaily(name: string, handler: () => Promise<void>, hour: number) {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(hour, 0, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const msUntilNext = nextRun.getTime() - now.getTime();

    // Initial delay
    setTimeout(() => {
      handler().catch(err => {
        console.error(`Error in scheduled task ${name}:`, err);
      });

      // Then run daily
      const interval = setInterval(() => {
        handler().catch(err => {
          console.error(`Error in scheduled task ${name}:`, err);
        });
      }, 24 * 60 * 60 * 1000); // 24 hours

      this.schedules.set(name, interval);
    }, msUntilNext);
  }

  /**
   * Schedule a weekly task
   */
  private scheduleWeekly(name: string, handler: () => Promise<void>, dayOfWeek: number, hour: number) {
    const now = new Date();
    const nextRun = new Date();
    nextRun.setDate(now.getDate() + ((dayOfWeek + 7 - now.getDay()) % 7));
    nextRun.setHours(hour, 0, 0, 0);
    nextRun.setSeconds(0, 0);

    // If it's today but the time has passed, schedule for next week
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 7);
    }

    const msUntilNext = nextRun.getTime() - now.getTime();

    setTimeout(() => {
      handler().catch(err => {
        console.error(`Error in scheduled task ${name}:`, err);
      });

      // Then run weekly
      const interval = setInterval(() => {
        handler().catch(err => {
          console.error(`Error in scheduled task ${name}:`, err);
        });
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      this.schedules.set(name, interval);
    }, msUntilNext);
  }

  /**
   * Schedule an hourly task
   */
  private scheduleHourly(name: string, handler: () => Promise<void>) {
    // Run immediately, then every hour
    handler().catch(err => {
      console.error(`Error in scheduled task ${name}:`, err);
    });

    const interval = setInterval(() => {
      handler().catch(err => {
        console.error(`Error in scheduled task ${name}:`, err);
      });
    }, 60 * 60 * 1000); // 1 hour

    this.schedules.set(name, interval);
  }

  /**
   * Update all artist and track metrics from all sources
   */
  private async updateAllMetrics(): Promise<void> {
    console.log('🔄 Starting daily metrics update...');
    const startTime = Date.now();
    
    try {
      // Update artist metrics
      await chartDataAggregator.updateAllArtistMetrics();
      
      // Update track metrics
      await trackDataAggregator.updateAllTrackMetrics();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Daily metrics update completed in ${duration}s`);
    } catch (error: any) {
      console.error('❌ Daily metrics update failed:', error.message);
      throw error;
    }
  }

  /**
   * Recalculate all scores (artists and tracks)
   */
  private async recalculateScores(): Promise<void> {
    console.log('🔄 Starting daily score recalculation...');
    const startTime = Date.now();
    
    try {
      // Update artist scores
      await chartScoringEngine.updateAllArtistScores(DEFAULT_WEIGHTS);
      
      // Update track scores
      await chartScoringEngine.updateAllTrackScores();
      
      // Update independent flags
      await independentArtistDetector.updateAllIndependentFlags();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Daily score recalculation completed in ${duration}s`);
    } catch (error: any) {
      console.error('❌ Daily score recalculation failed:', error.message);
      throw error;
    }
  }

  /**
   * Import new artists from Last.fm
   */
  private async importNewArtists(): Promise<void> {
    console.log('🔄 Starting weekly artist import...');
    const startTime = Date.now();
    
    try {
      // Import top 100 new artists (increased from 50)
      const imported = await chartDataAggregator.importFromLastfm(100);
      
      // Also import by popular indie genres
      const indieGenres = ['indie', 'indie pop', 'indie rock', 'bedroom pop', 'dream pop', 'alternative', 'lo-fi'];
      for (const genre of indieGenres) {
        try {
          await chartDataAggregator.importByGenre(genre, 20);
        } catch (error: any) {
          console.error(`Failed to import artists for genre ${genre}:`, error.message);
        }
      }
      
      // Update scores for new artists
      await chartScoringEngine.updateAllArtistScores(DEFAULT_WEIGHTS);
      await independentArtistDetector.updateAllIndependentFlags();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Weekly artist import completed: ${imported} artists imported in ${duration}s`);
    } catch (error: any) {
      console.error('❌ Weekly artist import failed:', error.message);
      throw error;
    }
  }

  /**
   * Import new tracks from Last.fm
   */
  private async importNewTracks(): Promise<void> {
    console.log('🔄 Starting weekly track import...');
    const startTime = Date.now();
    
    try {
      // Import top 100 tracks (will check/create artists and filter for independent)
      const imported = await trackDataAggregator.importFromLastfm(100);
      
      // Update scores for new tracks
      await chartScoringEngine.updateAllTrackScores();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Weekly track import completed: ${imported} tracks imported in ${duration}s`);
    } catch (error: any) {
      console.error('❌ Weekly track import failed:', error.message);
      throw error;
    }
  }

  /**
   * Quick update for top artists and tracks (lightweight, runs hourly)
   */
  private async updateTopArtists(): Promise<void> {
    console.log('🔄 Starting hourly top artists and tracks update...');
    
    try {
      const UnifiedArtist = (await import('../models/UnifiedArtist')).default;
      const UnifiedTrack = (await import('../models/UnifiedTrack')).default;
      const spotifyService = (await import('./spotifyService')).default;
      
      // Update top 100 artists
      const topArtists = await UnifiedArtist.find({ isIndependent: true })
        .sort({ compositeScore: -1 })
        .limit(100)
        .select('_id name externalIds metrics');

      let artistsUpdated = 0;
      for (const artist of topArtists) {
        try {
          // Quick update: only if we have Spotify ID
          if (artist.externalIds?.spotify) {
            const spotifyData = await spotifyService.getArtist(artist.externalIds.spotify);
            if (spotifyData) {
              const prevFollowers = artist.metrics?.spotify?.followers || 0;
              const followerGrowth = spotifyData.followers.total - prevFollowers;
              const followerGrowthPct = prevFollowers > 0
                ? (followerGrowth / prevFollowers) * 100
                : 0;

              await UnifiedArtist.findByIdAndUpdate(artist._id, {
                $set: {
                  'metrics.spotify': {
                    timestamp: new Date(),
                    source: 'spotify',
                    followers: spotifyData.followers.total,
                    popularity: spotifyData.popularity,
                    followersGrowth7d: followerGrowth,
                    followersGrowthPct7d: followerGrowthPct
                  }
                }
              });

              // Update score for this artist
              await chartScoringEngine.updateArtistScore(artist._id.toString(), DEFAULT_WEIGHTS);
              artistsUpdated++;
            }
          }
        } catch (error: any) {
          // Silently continue if one artist fails
          console.error(`Failed to update ${artist.name}:`, error.message);
        }
      }

      // Update top 50 tracks (lightweight - just scores, not full metrics)
      const topTracks = await UnifiedTrack.find({ 
        artistId: { $in: topArtists.map(a => a._id) },
        compositeScore: { $gt: 0 }
      })
        .sort({ compositeScore: -1 })
        .limit(50)
        .select('_id name');

      let tracksUpdated = 0;
      for (const track of topTracks) {
        try {
          await chartScoringEngine.updateTrackScore(track._id.toString());
          tracksUpdated++;
        } catch (error: any) {
          console.error(`Failed to update track ${track.name}:`, error.message);
        }
      }

      console.log(`✅ Hourly update: ${artistsUpdated} artists, ${tracksUpdated} tracks updated`);
    } catch (error: any) {
      console.error('❌ Hourly top artists and tracks update failed:', error.message);
      // Don't throw - this is a background task
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      activeSchedules: Array.from(this.schedules.keys()),
      scheduleCount: this.schedules.size
    };
  }
}

// Singleton instance
const chartUpdateScheduler = new ChartUpdateScheduler();

export default chartUpdateScheduler;

