import React, { useState, useEffect, useCallback } from 'react';
import { Newspaper, TrendingUp, Filter, Search, Calendar, ExternalLink, Tag, Music, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface NewsArticle {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  imageUrl?: string;
  author?: string;
  source: string;
  sourceType: 'rss' | 'api' | 'reddit' | 'twitter' | 'instagram' | 'soundcloud' | 'mastodon' | 'manual';
  publishedAt: string;
  fetchedAt: string;
  tags?: string[];
  genres?: string[];
  artists?: string[];
  relevanceScore?: number;
  isIndependent?: boolean;
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  isFeatured?: boolean;
}

interface NewsSource {
  name: string;
  type: string;
  isIndependent: boolean;
}

const NewsPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'social'>('articles');
  
  // Debug: Log when component renders
  useEffect(() => {
    console.log('NewsPage rendered, activeTab:', activeTab);
    console.log('Tabs should be visible between header and stats');
  }, [activeTab]);
  const [view, setView] = useState<'all' | 'trending' | 'independent'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'publishedAt' | 'relevanceScore' | 'fetchedAt'>('publishedAt'); // Default: sort by original post date (newest first)
  const [isIndependent, setIsIndependent] = useState<boolean | undefined>(undefined);
  const [minRelevanceScore, setMinRelevanceScore] = useState<number | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const limit = 20; // Base limit, adjusted in fetchArticles based on activeTab

  const fetchSources = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/sources/list`);
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/stats/overview`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/trending?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setTrendingArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching trending articles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      // Use higher limit for articles tab to ensure we get enough RSS content
      const fetchLimit = activeTab === 'articles' ? 50 : 20;
      
      const params = new URLSearchParams({
        limit: fetchLimit.toString(),
        offset: offset.toString(),
        sortBy: sortBy,
      });

      // Add sourceType filter based on active tab
      if (activeTab === 'articles') {
        params.append('sourceType', 'articles'); // Backend will filter for rss+api
      } else if (activeTab === 'social') {
        params.append('sourceType', 'social'); // Backend will filter for reddit+instagram+twitter+soundcloud+mastodon
      }

      if (selectedSource !== 'all') {
        params.append('source', selectedSource);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (isIndependent !== undefined) {
        params.append('isIndependent', isIndependent.toString());
      }

      if (minRelevanceScore !== undefined) {
        params.append('minRelevanceScore', minRelevanceScore.toString());
      }

      const response = await fetch(`${API_BASE_URL}/api/news?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (offset === 0) {
          setArticles(data.articles || []);
        } else {
          setArticles(prev => [...prev, ...(data.articles || [])]);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [offset, selectedSource, searchTerm, sortBy, isIndependent, minRelevanceScore, activeTab]);

  useEffect(() => {
    fetchSources();
    fetchStats();
  }, [fetchSources, fetchStats]);

  useEffect(() => {
    // Reset filters when switching tabs
    setOffset(0);
    setSelectedSource('all');
    if (activeTab === 'social') {
      setView('all'); // Social tab doesn't have trending/independent views
    }
  }, [activeTab]);

  useEffect(() => {
    if (view === 'trending' && activeTab === 'articles') {
      fetchTrending();
    } else if (view !== 'trending') {
      fetchArticles();
    }
  }, [view, fetchTrending, fetchArticles, activeTab]);

  const handleLoadMore = () => {
    setOffset(prev => prev + limit);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const getRelevanceColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Display articles (backend already filters by sourceType, but we keep this for trending)
  const displayArticles = view === 'trending' ? trendingArticles : articles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Music News</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with the latest news about independent music, emerging artists, and industry insights.
          </p>
        </div>

        {/* Main Tabs: Articles vs Social Media - ALWAYS VISIBLE */}
        <div className="mb-8" style={{ display: 'block', visibility: 'visible', opacity: 1, position: 'relative', zIndex: 100 }}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border-2 border-blue-500 dark:border-blue-400" 
            style={{ display: 'block', width: '100%', boxSizing: 'border-box' }}
          >
            <div className="flex gap-4" style={{ display: 'flex', width: '100%' }}>
              <button
                onClick={() => { 
                  console.log('Articles tab clicked');
                  setActiveTab('articles'); 
                  setOffset(0); 
                }}
                className={`flex-1 px-8 py-5 rounded-xl font-bold text-lg transition-all duration-200 ${
                  activeTab === 'articles'
                    ? 'bg-blue-600 text-white shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px', cursor: 'pointer' }}
              >
                <Newspaper className="w-6 h-6 mr-3" />
                <span>Articles</span>
              </button>
              <button
                onClick={() => { 
                  console.log('Social Media tab clicked');
                  setActiveTab('social'); 
                  setOffset(0); 
                }}
                className={`flex-1 px-8 py-5 rounded-xl font-bold text-lg transition-all duration-200 ${
                  activeTab === 'social'
                    ? 'bg-blue-600 text-white shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60px', cursor: 'pointer' }}
              >
                <MessageSquare className="w-6 h-6 mr-3" />
                <span>Social Media</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">Independent</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.independent || 0}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">Last 7 Days</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.last7Days || 0}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="text-sm text-gray-600 dark:text-gray-400">Sources</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{sources.length}</div>
            </div>
          </div>
        )}

        {/* Filters - Only show for Articles tab */}
        {activeTab === 'articles' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              {/* View Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => { setView('all'); setOffset(0); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All News
                </button>
                <button
                  onClick={() => { setView('trending'); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'trending'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Trending
                </button>
                <button
                  onClick={() => { setView('independent'); setOffset(0); setIsIndependent(true); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'independent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Independent
                </button>
              </div>

              {/* Source Filter */}
              {view !== 'trending' && (
                <select
                  value={selectedSource}
                  onChange={(e) => { setSelectedSource(e.target.value); setOffset(0); }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Sources</option>
                  {sources.filter(s => s.type === 'rss' || s.type === 'api').map(source => (
                    <option key={source.name} value={source.name}>{source.name}</option>
                  ))}
                </select>
              )}

              {/* Sort */}
              {view !== 'trending' && (
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as any); setOffset(0); }}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="publishedAt">Newest (by Post Date)</option>
                  <option value="relevanceScore">Most Relevant</option>
                  <option value="fetchedAt">Recently Added</option>
                </select>
              )}

              {/* Search */}
              {view !== 'trending' && (
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Media Filters - Simplified for social tab */}
        {activeTab === 'social' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={selectedSource}
                onChange={(e) => { setSelectedSource(e.target.value); setOffset(0); }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Platforms</option>
                {sources.filter(s => s.type === 'reddit' || s.type === 'instagram' || s.type === 'twitter').map(source => (
                  <option key={source.name} value={source.name}>{source.name}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value as any); setOffset(0); }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="publishedAt">Newest (by Post Date)</option>
                <option value="relevanceScore">Most Relevant</option>
                <option value="fetchedAt">Recently Added</option>
              </select>
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {loading && offset === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading {activeTab === 'articles' ? 'articles' : 'posts'}...
            </p>
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-12">
            {activeTab === 'articles' ? (
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            ) : (
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            )}
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab === 'articles' ? 'articles' : 'posts'} found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayArticles.map((article) => (
                <article
                  key={article._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {article.imageUrl && (
                    <div className="aspect-video w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img
                        src={article.imageUrl.replace(/&amp;/g, '&')}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          article.sourceType === 'reddit' 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : article.sourceType === 'instagram'
                            ? 'text-pink-600 dark:text-pink-400'
                            : article.sourceType === 'twitter'
                            ? 'text-blue-500 dark:text-blue-400'
                            : article.sourceType === 'soundcloud'
                            ? 'text-orange-500 dark:text-orange-400'
                            : article.sourceType === 'mastodon'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {article.source}
                        </span>
                        {(article.sourceType === 'reddit' || article.sourceType === 'instagram' || article.sourceType === 'twitter' || article.sourceType === 'soundcloud' || article.sourceType === 'mastodon') && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                            {article.sourceType === 'reddit' ? 'Reddit' : article.sourceType === 'instagram' ? 'Instagram' : article.sourceType === 'twitter' ? 'Twitter' : article.sourceType === 'soundcloud' ? 'SoundCloud' : 'Mastodon'}
                          </span>
                        )}
                      </div>
                      {article.relevanceScore !== undefined && (
                        <div className={`w-2 h-2 rounded-full ${getRelevanceColor(article.relevanceScore)}`} title={`Relevance: ${article.relevanceScore}`} />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 overflow-hidden text-ellipsis line-clamp-2">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 overflow-hidden text-ellipsis line-clamp-3">
                        {article.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.genres && article.genres.slice(0, 3).map((genre, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full"
                        >
                          <Music className="w-3 h-3" />
                          {genre}
                        </span>
                      ))}
                      {article.artists && article.artists.slice(0, 2).map((artist, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Read <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More */}
            {view !== 'trending' && hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Showing {displayArticles.length} of {displayArticles.length} {activeTab === 'articles' ? 'articles' : 'posts'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
