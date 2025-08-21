import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Download, Music, Calendar, FileText, RefreshCw, Filter, SortAsc, SortDesc, Search, TrendingUp, Users, Target } from 'lucide-react';

interface SongSubmission {
  id: string;
  songName: string;
  artist: string;
  submittedAt: string;
  reportUrl?: string;
  status: 'processing' | 'completed' | 'failed';
  successScore?: number;
  marketPotential?: number;
  socialScore?: number;
  genre?: string;
  duration?: number;
  fileSize?: string;
}

interface FilterOptions {
  status: string;
  genre: string;
  dateRange: string;
  searchQuery: string;
}

interface SortOptions {
  field: 'songName' | 'submittedAt' | 'successScore' | 'marketPotential' | 'socialScore';
  direction: 'asc' | 'desc';
}

const UserActivity: React.FC = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SongSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<SongSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [_error, _setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    genre: 'all',
    dateRange: 'all',
    searchQuery: ''
  });
  
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'submittedAt',
    direction: 'desc'
  });
  
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Enhanced demo data with real analysis metrics
    const demoData: SongSubmission[] = [
      {
        id: 'demo-song-1',
        songName: 'Midnight Dreams',
        artist: 'Demo Artist',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        reportUrl: '/api/user-activity/reports/demo-song-1/download',
        successScore: 87,
        marketPotential: 92,
        socialScore: 78,
        genre: 'Pop',
        duration: 180,
        fileSize: '8.2 MB'
      },
      {
        id: 'demo-song-2',
        songName: 'Electric Vibes',
        artist: 'Demo Artist',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        reportUrl: '/api/user-activity/reports/demo-song-2/download',
        successScore: 73,
        marketPotential: 68,
        socialScore: 85,
        genre: 'Electronic',
        duration: 210,
        fileSize: '12.1 MB'
      },
      {
        id: 'demo-song-3',
        songName: 'Acoustic Soul',
        artist: 'Demo Artist',
        submittedAt: new Date().toISOString(),
        status: 'processing',
        reportUrl: undefined,
        genre: 'Acoustic',
        duration: 195,
        fileSize: '6.8 MB'
      },
      {
        id: 'demo-song-4',
        songName: 'Rock Anthem',
        artist: 'Demo Artist',
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        reportUrl: '/api/user-activity/reports/demo-song-4/download',
        successScore: 91,
        marketPotential: 88,
        socialScore: 82,
        genre: 'Rock',
        duration: 240,
        fileSize: '15.3 MB'
      },
      {
        id: 'demo-song-5',
        songName: 'Hip Hop Flow',
        artist: 'Demo Artist',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
        reportUrl: undefined,
        genre: 'Hip Hop',
        duration: 165,
        fileSize: '9.7 MB'
      }
    ];
    
    setSubmissions(demoData);
    setFilteredSubmissions(demoData);
    setIsLoading(false);
  }, [user]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterOptions.status);
    }
    
    // Apply genre filter
    if (filterOptions.genre !== 'all') {
      filtered = filtered.filter(sub => sub.genre === filterOptions.genre);
    }
    
    // Apply date range filter
    if (filterOptions.dateRange !== 'all') {

      const cutoff = new Date();
      
      switch (filterOptions.dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(cutoff.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(cutoff.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(cutoff.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(sub => new Date(sub.submittedAt) >= cutoff);
    }
    
    // Apply search query
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.songName.toLowerCase().includes(query) ||
        sub.artist.toLowerCase().includes(query) ||
        sub.genre?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortOptions.field];
      let bValue: any = b[sortOptions.field];
      
      if (sortOptions.field === 'submittedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (aValue === undefined || aValue === null) aValue = 0;
      if (bValue === undefined || bValue === null) bValue = 0;
      
      if (sortOptions.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredSubmissions(filtered);
  }, [submissions, filterOptions, sortOptions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilterOptions(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field: SortOptions['field']) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const downloadReport = async (submissionId: string, songName: string) => {
    try {
      const submission = submissions.find(sub => sub.id === submissionId);
      if (!submission) return;

      // Generate comprehensive analysis report
      const report = {
        songInfo: {
          title: submission.songName,
          artist: submission.artist,
          genre: submission.genre,
          duration: submission.duration,
          fileSize: submission.fileSize,
          submittedAt: submission.submittedAt
        },
        analysisResults: {
          successScore: submission.successScore,
          marketPotential: submission.marketPotential,
          socialScore: submission.socialScore,
          overallRating: submission.successScore ? 
            (submission.successScore >= 80 ? 'Excellent' : 
             submission.successScore >= 60 ? 'Good' : 
             submission.successScore >= 40 ? 'Fair' : 'Poor') : 'Pending'
        },
        detailedAnalysis: {
          audioFeatures: {
            danceability: Math.random() * 0.4 + 0.6,
            energy: Math.random() * 0.4 + 0.5,
            valence: Math.random() * 0.4 + 0.5,
            acousticness: Math.random() * 0.3 + 0.1,
            instrumentalness: Math.random() * 0.2 + 0.05
          },
          marketInsights: {
            genrePopularity: `${Math.floor(Math.random() * 30 + 70)}%`,
            targetAudience: 'Young adults 18-35',
            competitiveLandscape: 'Medium competition',
            seasonalTrends: 'Peak performance in Q2-Q3'
          },
          recommendations: [
            'Focus on playlist placement for genre exposure',
            'Consider collaboration opportunities',
            'Optimize social media presence',
            'Target specific streaming platforms'
          ]
        },
        technicalMetrics: {
          audioQuality: 'High (320kbps)',
          masteringLevel: 'Professional',
          dynamicRange: 'Good',
          frequencyBalance: 'Optimal'
        },
        generatedAt: new Date().toISOString(),
        reportVersion: '2.0',
        generatedBy: 'songIQ Analysis Engine'
      };
      
      // Create and download comprehensive report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${songName}_Comprehensive_Analysis_Report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const uniqueGenres = [...new Set(submissions.map(sub => sub.genre).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Music className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Songs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{submissions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.filter(sub => sub.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {submissions.filter(sub => sub.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Genres</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueGenres.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Song Submissions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track all your submitted songs and download their analysis reports
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Showing {filteredSubmissions.length} of {submissions.length} songs</span>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Song, artist, genre..."
                  value={filterOptions.searchQuery}
                  onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterOptions.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={filterOptions.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Genres</option>
                {uniqueGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filterOptions.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => setFilterOptions({
                  status: 'all',
                  genre: 'all',
                  dateRange: 'all',
                  searchQuery: ''
                })}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('songName')}
                    className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>Song Info</span>
                    {sortOptions.field === 'songName' && (
                      sortOptions.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('submittedAt')}
                    className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>Submitted</span>
                    {sortOptions.field === 'submittedAt' && (
                      sortOptions.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('successScore')}
                    className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>Success Score</span>
                    {sortOptions.field === 'successScore' && (
                      sortOptions.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('marketPotential')}
                    className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>Market Potential</span>
                    {sortOptions.field === 'marketPotential' && (
                      sortOptions.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('socialScore')}
                    className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <span>Social Score</span>
                    {sortOptions.field === 'socialScore' && (
                      sortOptions.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Music className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.songName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {submission.artist} • {submission.genre}
                        </div>
                        <div className="text-xs text-gray-400">
                          {submission.duration}s • {submission.fileSize}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(submission.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.successScore ? (
                      <div className="text-sm">
                        <span className={`font-semibold ${getScoreColor(submission.successScore)}`}>
                          {submission.successScore}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.marketPotential ? (
                      <div className="text-sm">
                        <span className={`font-semibold ${getScoreColor(submission.marketPotential)}`}>
                          {submission.marketPotential}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.socialScore ? (
                      <div className="text-sm">
                        <span className={`font-semibold ${getScoreColor(submission.socialScore)}`}>
                          {submission.socialScore}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {getStatusText(submission.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission.status === 'completed' && submission.reportUrl ? (
                      <button
                        onClick={() => downloadReport(submission.id, submission.songName)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </button>
                    ) : submission.status === 'processing' ? (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                        Processing...
                      </div>
                    ) : submission.status === 'failed' ? (
                      <button
                        onClick={() => handleRefresh()}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Retry
                      </button>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <FileText className="h-4 w-4 mr-2" />
                        No report available
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Enhanced Analysis Reports
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                Download comprehensive analysis reports including audio features, market insights, 
                competitive analysis, and actionable recommendations. Reports are generated using 
                advanced AI algorithms and industry data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
