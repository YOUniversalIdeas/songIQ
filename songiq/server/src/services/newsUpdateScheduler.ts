import newsService from './newsService';

/**
 * News Update Scheduler
 * 
 * Handles automatic updates of news articles:
 * - Every 4 hours: Fetch new articles from all RSS feeds
 * - Daily: Clean up old articles (optional)
 */

class NewsUpdateScheduler {
  private schedules: Map<string, NodeJS.Timeout> = new Map();
  private isEnabled: boolean = false;

  /**
   * Start the scheduler
   */
  start() {
    if (this.isEnabled) {
      console.log('⚠️  News update scheduler is already running');
      return;
    }

    this.isEnabled = true;
    console.log('📰 Starting news update scheduler...');

    // Every 4 hours: Fetch new articles
    this.scheduleInterval('fetch-news', this.fetchAllNews, 4 * 60 * 60 * 1000);

    // Daily: Optional cleanup (runs at 4 AM)
    this.scheduleDaily('cleanup-old-articles', this.cleanupOldArticles, 4);

    console.log('✅ News update scheduler started');
    console.log('   - Fetch news: Every 4 hours');
    console.log('   - Cleanup old articles: Daily at 4:00 AM');
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
    console.log('⏹️  News update scheduler stopped');
  }

  /**
   * Schedule an interval-based task
   */
  private scheduleInterval(name: string, handler: () => Promise<void>, intervalMs: number) {
    // Run immediately on start, then at interval
    handler().catch(err => {
      console.error(`Error in scheduled task ${name}:`, err);
    });

    const interval = setInterval(() => {
      handler().catch(err => {
        console.error(`Error in scheduled task ${name}:`, err);
      });
    }, intervalMs);

    this.schedules.set(name, interval);
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
   * Fetch all news from RSS feeds
   */
  private async fetchAllNews(): Promise<void> {
    console.log('📰 Starting news fetch from all RSS feeds...');
    const startTime = Date.now();
    
    try {
      const result = await newsService.fetchAllFeeds();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ News fetch completed: ${result.total} new articles in ${duration}s`);
      
      if (Object.keys(result.bySource).length > 0) {
        console.log('   Sources:', Object.entries(result.bySource)
          .map(([source, count]) => `${source}: ${count}`)
          .join(', '));
      }
    } catch (error: any) {
      console.error('❌ News fetch failed:', error.message);
      // Don't throw - this is a background task
    }
  }

  /**
   * Clean up old articles (older than 90 days, inactive)
   */
  private async cleanupOldArticles(): Promise<void> {
    console.log('🧹 Starting cleanup of old articles...');
    const startTime = Date.now();
    
    try {
      const NewsArticle = (await import('../models/NewsArticle')).default;
      
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      // Deactivate articles older than 90 days that are inactive
      const result = await NewsArticle.updateMany(
        {
          publishedAt: { $lt: ninetyDaysAgo },
          isActive: true,
          relevanceScore: { $lt: 50 } // Low relevance articles
        },
        {
          isActive: false
        }
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Cleanup completed: ${result.modifiedCount} articles deactivated in ${duration}s`);
    } catch (error: any) {
      console.error('❌ Cleanup failed:', error.message);
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
const newsUpdateScheduler = new NewsUpdateScheduler();

export default newsUpdateScheduler;

