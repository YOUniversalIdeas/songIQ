import axios from 'axios';
import NewsArticle from '../models/NewsArticle';
import UnifiedArtist from '../models/UnifiedArtist';

// NewsAPI configuration
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const NEWSAPI_KEY = process.env.NEWSAPI_KEY;

// Reddit configuration
const REDDIT_BASE_URL = 'https://www.reddit.com';
const REDDIT_USER_AGENT = 'songIQ/1.0 (by /u/songiq)';

// Reddit subreddits for independent music
const REDDIT_SUBREDDITS = [
  'indiemusic',
  'listentothis',
  'WeAreTheMusicMakers',
  'Music',
  'indieheads',
  'hiphopheads',
  'electronicmusic',
  'folk',
  'jazz',
  'metal'
];

// Instagram Graph API configuration (requires Business/Creator account linked to Facebook Page)
// See INSTAGRAM_SETUP.md for detailed setup instructions
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN; // Facebook Page access token
const INSTAGRAM_BUSINESS_ACCOUNT_ID = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID; // Instagram Business Account ID

// SoundCloud API configuration
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const SOUNDCLOUD_API_BASE_URL = 'https://api.soundcloud.com';

// Mastodon configuration (no API key needed for public posts)
// Popular music-focused Mastodon instances
const MASTODON_INSTANCES = [
  'mastodon.social', // General instance
  'mastodon.music', // Music-focused instance
  'mastodon.art', // Arts and music
  'mstdn.social' // General instance
];

// RSS feed sources for independent music
const RSS_FEEDS = [
  {
    name: 'Pitchfork',
    url: 'https://pitchfork.com/feed/feed-news/rss',
    type: 'rss' as const,
    isIndependent: false // Pitchfork covers both major and indie
  },
  {
    name: 'Bandcamp Daily',
    url: 'https://daily.bandcamp.com/feed',
    type: 'rss' as const,
    isIndependent: true
  },
  {
    name: 'Stereogum',
    url: 'https://www.stereogum.com/feed/',
    type: 'rss' as const,
    isIndependent: false
  },
  {
    name: 'Brooklyn Vegan',
    url: 'https://www.brooklynvegan.com/feed/',
    type: 'rss' as const,
    isIndependent: false
  },
  {
    name: 'The Fader',
    url: 'https://www.thefader.com/rss.xml',
    type: 'rss' as const,
    isIndependent: false
  },
  {
    name: 'Consequence',
    url: 'https://consequence.net/feed/',
    type: 'rss' as const,
    isIndependent: false
  },
  {
    name: 'NPR Music',
    url: 'https://www.npr.org/rss/rss.php?id=1039',
    type: 'rss' as const,
    isIndependent: true
  },
  {
    name: 'Tiny Mix Tapes',
    url: 'https://www.tinymixtapes.com/rss.xml',
    type: 'rss' as const,
    isIndependent: true
  }
];

// Keywords that indicate independent music relevance
const INDEPENDENT_KEYWORDS = [
  'independent', 'indie', 'unsigned', 'self-released', 'DIY',
  'bandcamp', 'soundcloud', 'spotify discovery', 'emerging artist',
  'underground', 'alternative', 'new artist', 'breakthrough'
];

// Major label keywords (to filter out)
const MAJOR_LABEL_KEYWORDS = [
  'major label', 'universal music', 'sony music', 'warner music',
  'record deal', 'signing to', 'label deal'
];

// Music-related keywords (required for Mastodon posts)
const MUSIC_KEYWORDS = [
  'music', 'song', 'album', 'track', 'artist', 'musician', 'band', 'singer',
  'indie', 'independent', 'release', 'single', 'ep', 'mixtape', 'playlist',
  'concert', 'tour', 'gig', 'festival', 'live', 'performance', 'show',
  'genre', 'rock', 'pop', 'jazz', 'hip hop', 'rap', 'electronic', 'folk',
  'country', 'blues', 'metal', 'punk', 'alternative', 'r&b', 'soul',
  'producer', 'beat', 'lyrics', 'melody', 'rhythm', 'sound', 'audio',
  'streaming', 'spotify', 'apple music', 'bandcamp', 'soundcloud', 'youtube music',
  'new music', 'latest release', 'music video', 'mv', 'music industry'
];

// Non-music keywords to filter out (politics, news, etc.)
const NON_MUSIC_KEYWORDS = [
  'politics', 'political', 'election', 'vote', 'president', 'government',
  'news', 'breaking', 'update', 'report', 'article', 'journalism',
  'sports', 'football', 'basketball', 'soccer', 'game', 'match',
  'technology', 'tech', 'software', 'hardware', 'computer', 'programming',
  'cooking', 'recipe', 'food', 'restaurant', 'travel', 'trip', 'vacation',
  'fashion', 'clothing', 'style', 'design', 'art' // 'art' is too broad, but we'll check context
];

interface RSSFeedItem {
  title: string;
  description?: string;
  content?: string;
  link: string;
  pubDate?: string;
  author?: string;
  image?: string;
  categories?: string[];
}

/**
 * Parse RSS feed XML
 * Simple RSS parser (can be replaced with rss-parser library later)
 */
async function parseRSSFeed(feedUrl: string): Promise<RSSFeedItem[]> {
  try {
    const response = await axios.get(feedUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; songIQ/1.0)'
      }
    });

    const xml = response.data;
    const items: RSSFeedItem[] = [];

    // Simple regex-based parsing (basic RSS 2.0)
    // For production, consider using a proper XML parser
    const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    for (const match of itemMatches) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descriptionMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
      const authorMatch = itemXml.match(/<author[^>]*>([\s\S]*?)<\/author>/i) || 
                         itemXml.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/i);
      const imageMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i) ||
                         itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
                         itemXml.match(/<image[^>]*>[\s\S]*?<url[^>]*>([\s\S]*?)<\/url>/i);

      if (titleMatch && linkMatch) {
        const title = cleanHtml(titleMatch[1]);
        const link = cleanHtml(linkMatch[1]);
        
        items.push({
          title,
          description: descriptionMatch ? cleanHtml(descriptionMatch[1]) : undefined,
          link,
          pubDate: pubDateMatch ? cleanHtml(pubDateMatch[1]) : undefined,
          author: authorMatch ? cleanHtml(authorMatch[1]) : undefined,
          image: imageMatch ? cleanHtml(imageMatch[1]) : undefined
        });
      }
    }

    return items;
  } catch (error: any) {
    console.error(`Error parsing RSS feed ${feedUrl}:`, error.message);
    return [];
  }
}

/**
 * Clean HTML tags and entities from text
 */
function cleanHtml(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .trim();
}

/**
 * Extract artists mentioned in text
 */
async function extractArtists(text: string): Promise<string[]> {
  if (!text) return [];
  
  const artists: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Try to match against known artists in database
  const allArtists = await UnifiedArtist.find({ isIndependent: true })
    .select('name')
    .limit(1000); // Limit to avoid performance issues
  
  for (const artist of allArtists) {
    const artistName = artist.name.toLowerCase();
    // Check if artist name appears in text (with word boundaries)
    const regex = new RegExp(`\\b${artistName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      artists.push(artist.name);
    }
  }
  
  return [...new Set(artists)]; // Remove duplicates
}

/**
 * Calculate relevance score for independent music
 */
function calculateRelevanceScore(title: string, description?: string, content?: string): number {
  const text = `${title} ${description || ''} ${content || ''}`.toLowerCase();
  let score = 50; // Base score
  
  // Increase score for independent keywords
  for (const keyword of INDEPENDENT_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score += 10;
    }
  }
  
  // Decrease score for major label keywords
  for (const keyword of MAJOR_LABEL_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      score -= 15;
    }
  }
  
  // Check if it's likely about independent music
  const isIndependent = score >= 60;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Extract genres from text (simple keyword matching)
 */
function extractGenres(text: string): string[] {
  if (!text) return [];
  
  const commonGenres = [
    'indie', 'rock', 'pop', 'electronic', 'hip-hop', 'rap', 'jazz',
    'folk', 'country', 'punk', 'metal', 'alternative', 'r&b', 'soul',
    'blues', 'reggae', 'dance', 'house', 'techno', 'ambient', 'experimental'
  ];
  
  const lowerText = text.toLowerCase();
  const foundGenres: string[] = [];
  
  for (const genre of commonGenres) {
    if (lowerText.includes(genre)) {
      foundGenres.push(genre);
    }
  }
  
  return [...new Set(foundGenres)];
}

/**
 * Fetch and store articles from a single RSS feed
 */
async function fetchFeedArticles(feedConfig: typeof RSS_FEEDS[0]): Promise<number> {
  try {
    console.log(`📰 Fetching articles from ${feedConfig.name}...`);
    
    const items = await parseRSSFeed(feedConfig.url);
    let imported = 0;
    
    for (const item of items) {
      try {
        // Check if article already exists
        const existing = await NewsArticle.findOne({ url: item.link });
        if (existing) {
          continue; // Skip duplicates
        }
        
        // Parse publish date
        let publishedAt = new Date();
        if (item.pubDate) {
          const parsed = new Date(item.pubDate);
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed;
          }
        }
        
        // Only import articles from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (publishedAt < thirtyDaysAgo) {
          continue;
        }
        
        const description = item.description || '';
        const content = item.content || '';
        const fullText = `${item.title} ${description} ${content}`;
        
        // Calculate relevance
        const relevanceScore = calculateRelevanceScore(item.title, description, content);
        const isIndependent = relevanceScore >= 60 || feedConfig.isIndependent;
        
        // Extract metadata
        const genres = extractGenres(fullText);
        const artists = await extractArtists(fullText);
        
        // Create article
        const article = new NewsArticle({
          title: item.title,
          description: description.substring(0, 2000), // Limit description length
          content: content.substring(0, 10000), // Limit content length
          url: item.link,
          imageUrl: item.image,
          author: item.author,
          source: feedConfig.name,
          sourceType: feedConfig.type,
          publishedAt,
          fetchedAt: new Date(),
          genres,
          artists,
          relevanceScore,
          isIndependent,
          language: 'en',
          isActive: true
        });
        
        await article.save();
        imported++;
      } catch (error: any) {
        // Skip individual article errors, continue with next
        console.error(`Error importing article "${item.title}":`, error.message);
      }
    }
    
    console.log(`✅ Imported ${imported} new articles from ${feedConfig.name}`);
    return imported;
  } catch (error: any) {
    console.error(`Error fetching feed ${feedConfig.name}:`, error.message);
    return 0;
  }
}

/**
 * Fetch articles from all RSS feeds
 */
async function fetchAllFeeds(): Promise<{ total: number; bySource: Record<string, number> }> {
  const results: Record<string, number> = {};
  let total = 0;
  
  // Add delay between feeds to avoid rate limiting
  for (const feed of RSS_FEEDS) {
    const count = await fetchFeedArticles(feed);
    results[feed.name] = count;
    total += count;
    
    // Wait 2 seconds between feeds
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Fetch from NewsAPI
  if (NEWSAPI_KEY) {
    const newsApiCount = await fetchNewsAPIArticles();
    results['NewsAPI'] = newsApiCount;
    total += newsApiCount;
  }
  
  // Fetch from Reddit
  const redditCount = await fetchRedditPosts();
  results['Reddit'] = redditCount;
  total += redditCount;
  
  // Fetch from Instagram
  if (INSTAGRAM_ACCESS_TOKEN) {
    const instagramCount = await fetchInstagramPosts();
    results['Instagram'] = instagramCount;
    total += instagramCount;
  }
  
  // Fetch from SoundCloud
  if (SOUNDCLOUD_CLIENT_ID) {
    const soundcloudCount = await fetchSoundCloudTracks();
    results['SoundCloud'] = soundcloudCount;
    total += soundcloudCount;
  }
  
  // Fetch from Mastodon (no API key needed for public posts)
  const mastodonCount = await fetchMastodonPosts();
  results['Mastodon'] = mastodonCount;
  total += mastodonCount;
  
  return { total, bySource: results };
}

/**
 * Get articles with filtering options
 */
async function getArticles(options: {
  limit?: number;
  offset?: number;
  source?: string;
  sourceType?: string;
  isIndependent?: boolean;
  minRelevanceScore?: number;
  genre?: string;
  artist?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'relevanceScore' | 'fetchedAt';
} = {}) {
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
  } = options;
  
  const query: any = { isActive: true };
  
  if (source) {
    query.source = source;
  }
  
  if (sourceType) {
    // Support filtering by sourceType (e.g., 'articles' = rss+api, 'social' = reddit+instagram+twitter+soundcloud+mastodon)
    if (sourceType === 'articles') {
      query.sourceType = { $in: ['rss', 'api'] };
    } else if (sourceType === 'social') {
      query.sourceType = { $in: ['reddit', 'instagram', 'twitter', 'soundcloud', 'mastodon'] };
    } else {
      query.sourceType = sourceType;
    }
  }
  
  if (isIndependent !== undefined) {
    query.isIndependent = isIndependent;
  }
  
  if (minRelevanceScore !== undefined) {
    query.relevanceScore = { $gte: minRelevanceScore };
  }
  
  if (genre) {
    query.genres = { $in: [genre.toLowerCase()] };
  }
  
  if (artist) {
    query.artists = { $in: [new RegExp(artist, 'i')] };
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  // Default: sort by publishedAt (original post date) descending (newest first)
  let sortField: any = { publishedAt: -1 };
  if (sortBy === 'relevanceScore') {
    sortField = { relevanceScore: -1, publishedAt: -1 }; // Secondary sort by publishedAt
  } else if (sortBy === 'fetchedAt') {
    sortField = { fetchedAt: -1 }; // Sort by when we fetched it
  } else {
    // publishedAt is the default - sort by original post date (newest first)
    sortField = { publishedAt: -1 };
  }
  
  const articles = await NewsArticle.find(query)
    .sort(sortField)
    .limit(limit)
    .skip(offset)
    .lean();
  
  const total = await NewsArticle.countDocuments(query);
  
  return {
    articles,
    total,
    hasMore: offset + articles.length < total
  };
}

/**
 * Get trending articles (high relevance, recent)
 */
async function getTrendingArticles(limit: number = 10) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const articles = await NewsArticle.find({
    isActive: true,
    publishedAt: { $gte: sevenDaysAgo },
    relevanceScore: { $gte: 60 }
  })
    .sort({ relevanceScore: -1, publishedAt: -1 })
    .limit(limit)
    .lean();
  
  return articles;
}

/**
 * Fetch articles from NewsAPI
 */
async function fetchNewsAPIArticles(): Promise<number> {
  if (!NEWSAPI_KEY) {
    console.log('⚠️  NewsAPI key not configured, skipping NewsAPI fetch');
    return 0;
  }

  try {
    console.log('📰 Fetching articles from NewsAPI...');
    
    // Music-related keywords for filtering
    const musicKeywords = [
      'music', 'musician', 'artist', 'album', 'song', 'concert', 'tour',
      'indie', 'independent music', 'record label', 'music industry',
      'music festival', 'music streaming', 'spotify', 'apple music',
      'music producer', 'music video', 'music chart', 'billboard'
    ];

    let totalImported = 0;
    const articlesPerRequest = 20; // NewsAPI free tier allows up to 100 results per request
    
    // Fetch articles for each music keyword
    for (const keyword of musicKeywords.slice(0, 5)) { // Limit to 5 keywords to stay within rate limits
      try {
        const response = await axios.get(`${NEWSAPI_BASE_URL}/everything`, {
          params: {
            q: keyword,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: articlesPerRequest,
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
            apiKey: NEWSAPI_KEY
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'songIQ/1.0'
          }
        });

        if (response.data && response.data.articles) {
          const articles = response.data.articles;
          let imported = 0;

          for (const apiArticle of articles) {
            try {
              // Skip if no URL
              if (!apiArticle.url) continue;

              // Check if article already exists
              const existing = await NewsArticle.findOne({ url: apiArticle.url });
              if (existing) {
                continue; // Skip duplicates
              }

              // Parse publish date
              let publishedAt = new Date();
              if (apiArticle.publishedAt) {
                const parsed = new Date(apiArticle.publishedAt);
                if (!isNaN(parsed.getTime())) {
                  publishedAt = parsed;
                }
              }

              // Only import articles from last 7 days
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              if (publishedAt < sevenDaysAgo) {
                continue;
              }

              const title = apiArticle.title || '';
              const description = apiArticle.description || '';
              const content = apiArticle.content || '';
              const fullText = `${title} ${description} ${content}`;

              // Calculate relevance score
              const relevanceScore = calculateRelevanceScore(title, description, content);
              
              // Only import if relevance is above threshold (music-related)
              if (relevanceScore < 40) {
                continue; // Skip low-relevance articles
              }

              const isIndependent = relevanceScore >= 60;

              // Extract metadata
              const genres = extractGenres(fullText);
              const artists = await extractArtists(fullText);

              // Create article
              const article = new NewsArticle({
                title: title.substring(0, 500),
                description: description.substring(0, 2000),
                content: content ? content.substring(0, 10000) : undefined,
                url: apiArticle.url,
                imageUrl: apiArticle.urlToImage,
                author: apiArticle.author || apiArticle.source?.name,
                source: apiArticle.source?.name || 'NewsAPI',
                sourceType: 'api',
                publishedAt,
                fetchedAt: new Date(),
                genres,
                artists,
                relevanceScore,
                isIndependent,
                language: 'en',
                isActive: true
              });

              await article.save();
              imported++;
              totalImported++;
            } catch (error: any) {
              // Skip individual article errors
              console.error(`Error importing NewsAPI article:`, error.message);
            }
          }

          console.log(`✅ Imported ${imported} articles from NewsAPI for keyword "${keyword}"`);
          
          // Rate limiting: wait 1 second between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(`Error fetching NewsAPI articles for keyword "${keyword}":`, error.message);
        // Continue with next keyword
      }
    }

    console.log(`✅ Total NewsAPI articles imported: ${totalImported}`);
    return totalImported;
  } catch (error: any) {
    console.error('Error fetching NewsAPI articles:', error.message);
    return 0;
  }
}

/**
 * Fetch posts from Reddit
 */
async function fetchRedditPosts(): Promise<number> {
  try {
    console.log('📰 Fetching posts from Reddit...');
    
    let totalImported = 0;
    
    // Fetch from each subreddit
    for (const subreddit of REDDIT_SUBREDDITS) {
      try {
        // Reddit JSON API (no auth required for read-only)
        const url = `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=25`;
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': REDDIT_USER_AGENT
          },
          timeout: 10000
        });

        if (response.data && response.data.data && response.data.data.children) {
          const posts = response.data.data.children;
          let imported = 0;

          for (const postData of posts) {
            const post = postData.data;
            
            try {
              // Skip if no URL or if it's a self-post without text
              if (!post.url || post.is_self && !post.selftext) continue;
              
              // Skip stickied posts
              if (post.stickied) continue;

              // Check if post already exists
              const redditUrl = `${REDDIT_BASE_URL}${post.permalink}`;
              const existing = await NewsArticle.findOne({ url: redditUrl });
              if (existing) {
                continue; // Skip duplicates
              }

              // Parse publish date (Reddit uses Unix timestamp)
              const publishedAt = new Date(post.created_utc * 1000);

              // Only import posts from last 7 days
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              if (publishedAt < sevenDaysAgo) {
                continue;
              }

              const title = post.title || '';
              const description = post.selftext || post.url || '';
              const fullText = `${title} ${description}`;

              // Calculate relevance score
              const relevanceScore = calculateRelevanceScore(title, description, '');
              
              // Only import if relevance is above threshold
              if (relevanceScore < 30) {
                continue; // Reddit posts can be lower relevance
              }

              const isIndependent = relevanceScore >= 50;

              // Extract metadata
              const genres = extractGenres(fullText);
              const artists = await extractArtists(fullText);

              // Get image if available
              let imageUrl = post.thumbnail;
              if (post.preview && post.preview.images && post.preview.images[0]) {
                imageUrl = post.preview.images[0].source?.url || post.thumbnail;
              }
              
              // Clean up Reddit image URLs - decode HTML entities and handle Reddit's image format
              if (imageUrl && imageUrl !== 'self' && imageUrl !== 'default' && imageUrl !== 'nsfw' && imageUrl !== 'spoiler') {
                // Decode HTML entities (e.g., &amp; -> &)
                imageUrl = imageUrl
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
                
                // Reddit external preview URLs sometimes need adjustment
                // If it's a redd.it preview URL, use it as-is
                if (imageUrl.includes('external-preview.redd.it') || imageUrl.includes('preview.redd.it')) {
                  // URL is valid
                } else if (imageUrl.startsWith('http')) {
                  // Valid external URL
                } else {
                  // Invalid or relative URL, skip
                  imageUrl = undefined;
                }
              } else {
                imageUrl = undefined;
              }

              // Create article
              const article = new NewsArticle({
                title: title.substring(0, 500),
                description: description.substring(0, 2000),
                url: redditUrl,
                imageUrl: imageUrl,
                author: post.author,
                source: `Reddit: r/${subreddit}`,
                sourceType: 'reddit',
                publishedAt,
                fetchedAt: new Date(),
                genres,
                artists,
                relevanceScore,
                isIndependent,
                language: 'en',
                isActive: true,
                viewCount: post.ups || 0,
                likeCount: post.ups || 0
              });

              await article.save();
              imported++;
              totalImported++;
            } catch (error: any) {
              // Skip individual post errors
              console.error(`Error importing Reddit post:`, error.message);
            }
          }

          console.log(`✅ Imported ${imported} posts from r/${subreddit}`);
          
          // Rate limiting: Reddit allows 60 requests per minute
          // Wait 1.1 seconds between subreddits to stay safe
          await new Promise(resolve => setTimeout(resolve, 1100));
        }
      } catch (error: any) {
        console.error(`Error fetching Reddit subreddit r/${subreddit}:`, error.message);
        // Continue with next subreddit
      }
    }

    console.log(`✅ Total Reddit posts imported: ${totalImported}`);
    return totalImported;
  } catch (error: any) {
    console.error('Error fetching Reddit posts:', error.message);
    return 0;
  }
}

/**
 * Fetch posts from Instagram using Instagram Graph API
 * Requires: Business/Creator Instagram account linked to a Facebook Page
 * Note: Instagram Basic Display API was deprecated on Dec 4, 2024
 */
async function fetchInstagramPosts(): Promise<number> {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    console.log('⚠️  Instagram access token or business account ID not configured, skipping Instagram fetch');
    return 0;
  }

  try {
    console.log('📰 Fetching posts from Instagram (Graph API)...');
    
    // Instagram Graph API endpoint for Business accounts
    // First, get media from the Instagram Business Account
    const url = `https://graph.facebook.com/v21.0/${INSTAGRAM_BUSINESS_ACCOUNT_ID}/media`;
    
    const response = await axios.get(url, {
      params: {
        fields: 'id,caption,media_type,media_url,permalink,timestamp,username,thumbnail_url',
        access_token: INSTAGRAM_ACCESS_TOKEN,
        limit: 25
      },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      const posts = response.data.data;
      let imported = 0;

      for (const post of posts) {
        try {
          // Only process posts with captions
          if (!post.caption) {
            continue;
          }

          // Get permalink if not provided
          let permalink = post.permalink;
          if (!permalink && post.id) {
            // Construct permalink from post ID (format: https://www.instagram.com/p/{shortcode}/)
            // Note: We need the shortcode, but Graph API provides ID. We'll use a workaround.
            try {
              // Try to get the permalink from the media endpoint
              const mediaResponse = await axios.get(`https://graph.facebook.com/v21.0/${post.id}`, {
                params: {
                  fields: 'permalink',
                  access_token: INSTAGRAM_ACCESS_TOKEN
                },
                timeout: 5000
              });
              if (mediaResponse.data && mediaResponse.data.permalink) {
                permalink = mediaResponse.data.permalink;
              }
            } catch (e) {
              // If we can't get permalink, skip this post
              continue;
            }
          }

          if (!permalink) {
            continue;
          }

          // Check if post already exists
          const existing = await NewsArticle.findOne({ url: permalink });
          if (existing) {
            continue; // Skip duplicates
          }

          // Parse publish date
          const publishedAt = new Date(post.timestamp);

          // Only import posts from last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          if (publishedAt < sevenDaysAgo) {
            continue;
          }

          const title = post.caption.substring(0, 200) || 'Instagram Post';
          const description = post.caption || '';
          const fullText = `${title} ${description}`;

          // Calculate relevance score
          const relevanceScore = calculateRelevanceScore(title, description, '');
          
          // Only import if relevance is above threshold
          if (relevanceScore < 30) {
            continue;
          }

          const isIndependent = relevanceScore >= 50;

          // Extract metadata
          const genres = extractGenres(fullText);
          const artists = await extractArtists(fullText);

          // Get image URL - use media_url for images, thumbnail_url for videos
          let imageUrl = undefined;
          if (post.media_type === 'IMAGE' && post.media_url) {
            imageUrl = post.media_url;
          } else if (post.media_type === 'VIDEO' && post.thumbnail_url) {
            imageUrl = post.thumbnail_url;
          } else if (post.media_url) {
            imageUrl = post.media_url;
          }

          // Create article
          const article = new NewsArticle({
            title: title.substring(0, 500),
            description: description.substring(0, 2000),
            url: permalink,
            imageUrl: imageUrl,
            author: post.username || 'Instagram',
            source: 'Instagram',
            sourceType: 'instagram',
            publishedAt,
            fetchedAt: new Date(),
            genres,
            artists,
            relevanceScore,
            isIndependent,
            language: 'en',
            isActive: true
          });

          await article.save();
          imported++;
        } catch (error: any) {
          console.error(`Error importing Instagram post:`, error.message);
        }
      }

      console.log(`✅ Imported ${imported} posts from Instagram`);
      return imported;
    }

    return 0;
  } catch (error: any) {
    if (error.response) {
      console.error(`Error fetching Instagram posts: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
    } else {
      console.error('Error fetching Instagram posts:', error.message);
    }
    return 0;
  }
}

/**
 * Fetch tracks from SoundCloud
 * Requires: SoundCloud Client ID (get from https://developers.soundcloud.com/)
 */
async function fetchSoundCloudTracks(): Promise<number> {
  if (!SOUNDCLOUD_CLIENT_ID) {
    console.log('⚠️  SoundCloud client ID not configured, skipping SoundCloud fetch');
    return 0;
  }

  try {
    console.log('📰 Fetching tracks from SoundCloud...');
    
    // Search for independent music tracks
    // We'll search for tracks with tags related to independent music
    const searchQueries = [
      'indie music',
      'independent artist',
      'underground music',
      'new music',
      'emerging artist'
    ];
    
    let totalImported = 0;
    
    for (const query of searchQueries) {
      try {
        const url = `${SOUNDCLOUD_API_BASE_URL}/tracks`;
        
        const response = await axios.get(url, {
          params: {
            q: query,
            client_id: SOUNDCLOUD_CLIENT_ID,
            limit: 20,
            order: 'created_at',
            filter: 'public' // Only public tracks
          },
          timeout: 10000
        });

        if (response.data && Array.isArray(response.data)) {
          const tracks = response.data;
          let imported = 0;

          for (const track of tracks) {
            try {
              // Skip if no permalink or if it's not a track
              if (!track.permalink_url || track.kind !== 'track') {
                continue;
              }

              // Check if track already exists
              const existing = await NewsArticle.findOne({ url: track.permalink_url });
              if (existing) {
                continue; // Skip duplicates
              }

              // Parse publish date
              const publishedAt = new Date(track.created_at);

              // Only import tracks from last 7 days
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              if (publishedAt < sevenDaysAgo) {
                continue;
              }

              // Skip if no description or title
              if (!track.title && !track.description) {
                continue;
              }

              const title = track.title || 'SoundCloud Track';
              const description = track.description || track.tag_list || '';
              const fullText = `${title} ${description}`;

              // Calculate relevance score
              const relevanceScore = calculateRelevanceScore(title, description, '');
              
              // Only import if relevance is above threshold
              if (relevanceScore < 30) {
                continue;
              }

              const isIndependent = relevanceScore >= 50;

              // Extract metadata
              const genres = extractGenres(fullText);
              const artists = await extractArtists(fullText);

              // Get image URL
              let imageUrl = track.artwork_url;
              if (imageUrl) {
                // Replace default size with larger size
                imageUrl = imageUrl.replace('-large.jpg', '-t500x500.jpg');
              }

              // Create article
              const article = new NewsArticle({
                title: title.substring(0, 500),
                description: description.substring(0, 2000),
                url: track.permalink_url,
                imageUrl: imageUrl,
                author: track.user?.username || 'SoundCloud Artist',
                source: 'SoundCloud',
                sourceType: 'soundcloud',
                publishedAt,
                fetchedAt: new Date(),
                genres,
                artists,
                relevanceScore,
                isIndependent,
                language: 'en',
                isActive: true,
                likeCount: track.likes_count || 0,
                viewCount: track.playback_count || 0
              });

              await article.save();
              imported++;
              totalImported++;
            } catch (error: any) {
              console.error(`Error importing SoundCloud track:`, error.message);
            }
          }

          console.log(`✅ Imported ${imported} tracks from SoundCloud for query "${query}"`);
          
          // Rate limiting: wait 1 second between queries
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.error(`⚠️  SoundCloud API authentication failed. Check your CLIENT_ID.`);
          break; // Don't continue with other queries if auth fails
        } else {
          console.error(`Error fetching SoundCloud tracks for query "${query}":`, error.message);
        }
        // Continue with next query
      }
    }

    console.log(`✅ Total SoundCloud tracks imported: ${totalImported}`);
    return totalImported;
  } catch (error: any) {
    console.error('Error fetching SoundCloud tracks:', error.message);
    return 0;
  }
}

/**
 * Fetch posts from Mastodon
 * No API key needed for public posts - uses public API endpoints
 */
async function fetchMastodonPosts(): Promise<number> {
  try {
    console.log('📰 Fetching posts from Mastodon...');
    
    let totalImported = 0;
    
    // Try each Mastodon instance
    for (const instance of MASTODON_INSTANCES) {
      try {
        const baseUrl = `https://${instance}`;
        
        // Try to fetch from public timeline first (more reliable)
        try {
          const timelineUrl = `${baseUrl}/api/v1/timelines/public`;
          const timelineResponse = await axios.get(timelineUrl, {
            params: {
              limit: 40, // Get more posts to filter
              local: false // Include federated posts
            },
            headers: {
              'User-Agent': 'songIQ/1.0 (Music News Aggregator)'
            },
            timeout: 10000
          });

          if (timelineResponse.data && Array.isArray(timelineResponse.data)) {
            const posts = timelineResponse.data;
            let imported = 0;

            for (const post of posts) {
              try {
                // Skip if no content or if it's a reply
                if (!post.content || !post.url || post.in_reply_to_id) {
                  continue;
                }

                // Extract text content (remove HTML tags)
                const textContent = post.content.replace(/<[^>]*>/g, '').trim();
                if (!textContent || textContent.length < 20) {
                  continue; // Skip very short posts
                }

                // Only import English posts
                // Check language field first, then fall back to content analysis
                const postLanguage = post.language || 'en';
                if (postLanguage && postLanguage !== 'en' && postLanguage !== 'und') {
                  continue; // Skip non-English posts
                }

                // Additional check: if language is 'und' (undetermined) or missing,
                // do a simple heuristic check for common non-English characters
                if (!postLanguage || postLanguage === 'und') {
                  // Check for common non-English character patterns
                  const nonEnglishPattern = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0400-\u04ff\u0600-\u06ff\u0590-\u05ff]/;
                  if (nonEnglishPattern.test(textContent)) {
                    continue; // Skip posts with non-Latin scripts
                  }
                }

                // Check if post already exists
                const existing = await NewsArticle.findOne({ url: post.url });
                if (existing) {
                  continue; // Skip duplicates
                }

                // Parse publish date
                const publishedAt = new Date(post.created_at);

                // Only import posts from last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                if (publishedAt < sevenDaysAgo) {
                  continue;
                }

                // Use post content as title/description
                const title = textContent.substring(0, 200) || 'Mastodon Post';
                const description = textContent.substring(0, 2000) || '';
                const fullText = `${title} ${description}`.toLowerCase();

                // STRICT FILTERING: Must contain music-related keywords
                const hasMusicKeyword = MUSIC_KEYWORDS.some(keyword => 
                  fullText.includes(keyword.toLowerCase())
                );
                
                if (!hasMusicKeyword) {
                  continue; // Skip posts without music keywords
                }

                // FILTER OUT: Skip posts with non-music keywords (politics, news, etc.)
                const hasNonMusicKeyword = NON_MUSIC_KEYWORDS.some(keyword => {
                  // Only filter if the keyword appears prominently (not just in passing)
                  const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
                  return regex.test(fullText);
                });
                
                if (hasNonMusicKeyword) {
                  // Exception: allow "art" if it's clearly about music/artists
                  if (!fullText.includes('artist') && !fullText.includes('music')) {
                    continue; // Skip non-music content
                  }
                }

                // Calculate relevance score
                const relevanceScore = calculateRelevanceScore(title, description, '');
                
                // STRICT THRESHOLD: Only import highly relevant music posts
                // Increased from 30 to 50 for Mastodon to filter out borderline content
                if (relevanceScore < 50) {
                  continue;
                }

                const isIndependent = relevanceScore >= 50;

                // Extract metadata
                const genres = extractGenres(description);
                const artists = await extractArtists(description);

                // Get image if available (from media attachments)
                let imageUrl = undefined;
                if (post.media_attachments && post.media_attachments.length > 0) {
                  const firstMedia = post.media_attachments[0];
                  if (firstMedia.type === 'image' && firstMedia.preview_url) {
                    imageUrl = firstMedia.preview_url;
                  } else if (firstMedia.url) {
                    imageUrl = firstMedia.url;
                  }
                }

                // Create article
                const article = new NewsArticle({
                  title: title.substring(0, 500),
                  description: description.substring(0, 2000),
                  url: post.url,
                  imageUrl: imageUrl,
                  author: post.account?.display_name || post.account?.username || 'Mastodon User',
                  source: `Mastodon: ${instance}`,
                  sourceType: 'mastodon',
                  publishedAt,
                  fetchedAt: new Date(),
                  genres,
                  artists,
                  relevanceScore,
                  isIndependent,
                  language: post.language || 'en',
                  isActive: true,
                  likeCount: post.favourites_count || 0,
                  shareCount: post.reblogs_count || 0
                });

                await article.save();
                imported++;
                totalImported++;
              } catch (error: any) {
                console.error(`Error importing Mastodon post:`, error.message);
              }
            }

            if (imported > 0) {
              console.log(`✅ Imported ${imported} posts from ${instance} public timeline`);
            }
          }
        } catch (error: any) {
          console.log(`⚠️  Could not fetch from ${instance} public timeline:`, error.message);
          // Continue to next instance
        }
        
        // Rate limiting: wait 2 seconds between instances
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error accessing Mastodon instance ${instance}:`, error.message);
        // Continue with next instance
      }
    }

    console.log(`✅ Total Mastodon posts imported: ${totalImported}`);
    return totalImported;
  } catch (error: any) {
    console.error('Error fetching Mastodon posts:', error.message);
    return 0;
  }
}

/**
 * Get available sources
 */
function getSources() {
  const sources: Array<{ name: string; type: string; isIndependent: boolean }> = RSS_FEEDS.map(feed => ({
    name: feed.name,
    type: feed.type,
    isIndependent: feed.isIndependent
  }));

  // Add NewsAPI if configured
  if (NEWSAPI_KEY) {
    sources.push({
      name: 'NewsAPI',
      type: 'api',
      isIndependent: false
    });
  }

  // Add Reddit
  sources.push({
    name: 'Reddit',
    type: 'reddit',
    isIndependent: true
  });

  // Add Instagram if configured (requires Business/Creator account)
  if (INSTAGRAM_ACCESS_TOKEN && INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    sources.push({
      name: 'Instagram',
      type: 'instagram',
      isIndependent: false
    });
  }

  // Add SoundCloud if configured
  if (SOUNDCLOUD_CLIENT_ID) {
    sources.push({
      name: 'SoundCloud',
      type: 'soundcloud',
      isIndependent: true
    });
  }

  // Add Mastodon (always available, no API key needed)
  sources.push({
    name: 'Mastodon',
    type: 'mastodon',
    isIndependent: true
  });

  return sources;
}

/**
 * Get article statistics
 */
async function getStats() {
  const total = await NewsArticle.countDocuments({ isActive: true });
  const independent = await NewsArticle.countDocuments({ isActive: true, isIndependent: true });
  const last7Days = await NewsArticle.countDocuments({
    isActive: true,
    publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  const sources = await NewsArticle.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  return {
    total,
    independent,
    last7Days,
    sources: sources.map(s => ({ name: s._id, count: s.count }))
  };
}

export default {
  fetchAllFeeds,
  fetchFeedArticles,
  fetchNewsAPIArticles,
  fetchRedditPosts,
  fetchInstagramPosts,
  fetchSoundCloudTracks,
  fetchMastodonPosts,
  getArticles,
  getTrendingArticles,
  getSources,
  getStats,
  RSS_FEEDS
};

