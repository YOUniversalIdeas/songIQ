import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireAdminOrSuperAdmin } from '../middleware/adminAuth';
import newsService from '../services/newsService';
import NewsArticle from '../models/NewsArticle';

const router = express.Router();

// ==================== PUBLIC ENDPOINTS ====================

/**
 * GET /api/news
 * Get news articles with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      limit = 20,
      offset = 0,
      source,
      sourceType,
      isIndependent,
      minRelevanceScore,
      genre,
      artist,
      search,
      sortBy = 'publishedAt'
    } = req.query;

    const result = await newsService.getArticles({
      limit: Number(limit),
      offset: Number(offset),
      source: source as string,
      sourceType: sourceType as string,
      isIndependent: isIndependent === 'true' ? true : isIndependent === 'false' ? false : undefined,
      minRelevanceScore: minRelevanceScore ? Number(minRelevanceScore) : undefined,
      genre: genre as string,
      artist: artist as string,
      search: search as string,
      sortBy: sortBy as 'publishedAt' | 'relevanceScore' | 'fetchedAt'
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching news articles:', error);
    res.status(500).json({ error: 'Failed to fetch news articles', details: error.message });
  }
});

/**
 * GET /api/news/trending
 * Get trending articles (high relevance, recent)
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const articles = await newsService.getTrendingArticles(Number(limit));
    res.json({ articles });
  } catch (error: any) {
    console.error('Error fetching trending articles:', error);
    res.status(500).json({ error: 'Failed to fetch trending articles' });
  }
});

/**
 * GET /api/news/:id
 * Get single article by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article });
  } catch (error: any) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * GET /api/news/sources/list
 * Get list of available news sources
 */
router.get('/sources/list', async (req, res) => {
  try {
    const sources = newsService.getSources();
    res.json({ sources });
  } catch (error: any) {
    console.error('Error fetching sources:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

/**
 * GET /api/news/stats
 * Get news statistics
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await newsService.getStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching news stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * POST /api/news/admin/fetch
 * Manually trigger fetching articles from all RSS feeds
 */
router.post('/admin/fetch', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    console.log('📰 Admin triggered news fetch...');
    const result = await newsService.fetchAllFeeds();
    
    res.json({
      success: true,
      message: `Fetched ${result.total} new articles`,
      total: result.total,
      bySource: result.bySource
    });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news', details: error.message });
  }
});

/**
 * POST /api/news/admin/fetch/:source
 * Fetch articles from a specific source
 */
router.post('/admin/fetch/:source', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { source } = req.params;
    
    // Check if it's NewsAPI
    if (source.toLowerCase() === 'newsapi') {
      const count = await newsService.fetchNewsAPIArticles();
      res.json({
        success: true,
        message: `Fetched ${count} new articles from NewsAPI`,
        count
      });
      return;
    }
    
    // Check if it's Reddit
    if (source.toLowerCase() === 'reddit') {
      const count = await newsService.fetchRedditPosts();
      res.json({
        success: true,
        message: `Fetched ${count} new posts from Reddit`,
        count
      });
      return;
    }
    
    // Check if it's Instagram
    if (source.toLowerCase() === 'instagram') {
      const count = await newsService.fetchInstagramPosts();
      res.json({
        success: true,
        message: `Fetched ${count} new posts from Instagram`,
        count
      });
      return;
    }
    
    // Check if it's SoundCloud
    if (source.toLowerCase() === 'soundcloud') {
      const count = await newsService.fetchSoundCloudTracks();
      res.json({
        success: true,
        message: `Fetched ${count} new tracks from SoundCloud`,
        count
      });
      return;
    }
    
    // Check if it's Mastodon
    if (source.toLowerCase() === 'mastodon') {
      const count = await newsService.fetchMastodonPosts();
      res.json({
        success: true,
        message: `Fetched ${count} new posts from Mastodon`,
        count
      });
      return;
    }
    
    // Otherwise, check RSS feeds
    const feed = newsService.RSS_FEEDS.find(f => f.name.toLowerCase() === source.toLowerCase());
    
    if (!feed) {
      return res.status(404).json({ error: 'Source not found' });
    }
    
    const count = await newsService.fetchFeedArticles(feed);
    
    res.json({
      success: true,
      message: `Fetched ${count} new articles from ${feed.name}`,
      count
    });
  } catch (error: any) {
    console.error('Error fetching news from source:', error);
    res.status(500).json({ error: 'Failed to fetch news from source', details: error.message });
  }
});

/**
 * PUT /api/news/admin/article/:id
 * Update article (e.g., mark as featured, update relevance)
 */
router.put('/admin/article/:id', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const article = await NewsArticle.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({
      success: true,
      article,
      message: 'Article updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article', details: error.message });
  }
});

/**
 * DELETE /api/news/admin/article/:id
 * Delete/deactivate an article
 */
router.delete('/admin/article/:id', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({
      success: true,
      message: 'Article deactivated successfully'
    });
  } catch (error: any) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

/**
 * POST /api/news/admin/article
 * Manually create an article
 */
router.post('/admin/article', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const articleData = {
      ...req.body,
      sourceType: req.body.sourceType || 'manual',
      fetchedAt: new Date(),
      isActive: true
    };
    
    const article = new NewsArticle(articleData);
    await article.save();
    
    res.json({
      success: true,
      article,
      message: 'Article created successfully'
    });
  } catch (error: any) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article', details: error.message });
  }
});

/**
 * GET /api/news/admin/articles
 * Get all articles (including inactive) for admin
 */
router.get('/admin/articles', requireAdminOrSuperAdmin, async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      source,
      isActive,
      isIndependent
    } = req.query;

    const query: any = {};
    
    if (source) {
      query.source = source;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isIndependent !== undefined) {
      query.isIndependent = isIndependent === 'true';
    }

    const articles = await NewsArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .lean();

    const total = await NewsArticle.countDocuments(query);

    res.json({
      articles,
      total,
      hasMore: Number(offset) + articles.length < total
    });
  } catch (error: any) {
    console.error('Error fetching admin articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

export default router;

