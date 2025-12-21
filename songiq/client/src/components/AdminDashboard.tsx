import React, { useState, useEffect } from 'react';
import ArtistImpersonationDashboard from './ArtistImpersonationDashboard';
import EnhancedMarketsAdmin from './EnhancedMarketsAdmin';
import UsersManagement from './UsersManagement';
import AdminOverview from './AdminOverview';
import PlatformSettings from './PlatformSettings';
import FlaggedContent from './FlaggedContent';
import {
  BarChart3,
  TrendingUp,
  Users,
  Music,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Target,
  Zap,
  Star,
  Upload,
  RefreshCw,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  LineChart,
  Settings,
  Flag
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface AdminMetrics {
  // Core Analytics
  recommendationAccuracy: number;
  clickThroughRate: number;
  averageSessionDuration: number;
  songsPerSession: number;
  skipRate: number;
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  
  // User Analytics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnRate: number;
  retentionRate: number;
  
  // AI Model
  modelVersion: string;
  trainingStatus: string;
  modelAccuracy: number;
  featureImportance: { [key: string]: number };
  
  // Content
  totalSongs: number;
  pendingUploads: number;
  contentModerationFlags: number;
  
  // Business
  revenue: number;
  subscriptionConversions: number;
  featureUsage: { [key: string]: number };
}

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'users' | 'flagged' | 'settings' | 'analytics' | 'ai-models' | 'content' | 'business' | 'artist-management'>('overview');
  const [poseAsArtist, setPoseAsArtist] = useState<any>(null);

  const [metrics, setMetrics] = useState<AdminMetrics>({
    recommendationAccuracy: 0,
    clickThroughRate: 0,
    averageSessionDuration: 0,
    songsPerSession: 0,
    skipRate: 0,
    apiResponseTime: 0,
    errorRate: 0,
    uptime: 0,
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    churnRate: 0,
    retentionRate: 0,
    modelVersion: '',
    trainingStatus: 'pending',
    modelAccuracy: 0,
    featureImportance: {},
    totalSongs: 0,
    pendingUploads: 0,
    contentModerationFlags: 0,
    revenue: 0,
    subscriptionConversions: 0,
    featureUsage: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data when component mounts
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with real API calls
      // const response = await fetch('/api/admin/dashboard-metrics');
      // const data = await response.json();
      // setMetrics(data);
      
      // For now, set loading to false to show empty state
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  // Chart data will be populated from real API calls
  const [performanceData, setPerformanceData] = useState({
    labels: [],
    datasets: []
  });

  const [userEngagementData, setUserEngagementData] = useState({
    labels: [],
    datasets: []
  });

  const [featureImportanceData, setFeatureImportanceData] = useState({
    labels: [],
    datasets: []
  });

  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: []
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'training': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };



  // If posing as an artist, show the artist dashboard
  if (poseAsArtist) {
    return (
      <ArtistImpersonationDashboard
        artistData={poseAsArtist}
        onStopPosing={() => setPoseAsArtist(null)}
      />
    );
  }

  return (
    <div className={`admin-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive oversight and control for songIQ</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'markets', label: 'Markets', icon: LineChart },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'flagged', label: 'Flagged Content', icon: Flag },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'ai-models', label: 'AI Models', icon: Zap },
              { id: 'content', label: 'Content', icon: Music },
              { id: 'business', label: 'Business', icon: DollarSign },
              { id: 'artist-management', label: 'Artist Management', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="mt-2 text-sm text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'markets' && <EnhancedMarketsAdmin />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'flagged' && <FlaggedContent />}
        {activeTab === 'settings' && <PlatformSettings />}

        {/* Legacy tabs - Only show when not loading and no errors */}
        {!isLoading && !error && activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Behavior Analytics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Session Duration</span>
                    <span className="font-semibold">{metrics.averageSessionDuration} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Songs per Session</span>
                    <span className="font-semibold">{metrics.songsPerSession}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Skip Rate</span>
                    <span className="font-semibold">{metrics.skipRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                    <span className="font-semibold">{metrics.retentionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Geographic data will be loaded from real user analytics
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Analytics</h3>
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </div>
        )}

        {activeTab === 'ai-models' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Model Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Current Version</span>
                    <span className="font-semibold">{metrics.modelVersion}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Training Status</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(metrics.trainingStatus)}`}>
                      {metrics.trainingStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Model Accuracy</span>
                    <span className="font-semibold">{metrics.modelAccuracy}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Importance</h3>
                <Radar data={featureImportanceData} options={radarOptions} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">A/B Testing Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Control Group</h4>
                  <p className="text-2xl font-bold text-blue-600">23.1%</p>
                  <p className="text-sm text-blue-600">CTR</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Variant A</h4>
                  <p className="text-2xl font-bold text-green-600">25.7%</p>
                  <p className="text-sm text-green-600">CTR (+11.3%)</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Variant B</h4>
                  <p className="text-2xl font-bold text-purple-600">24.2%</p>
                  <p className="text-sm text-purple-600">CTR (+4.8%)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Music Library</h3>
                  <Music className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Songs</span>
                    <span className="font-semibold">{metrics.totalSongs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending Uploads</span>
                    <span className="font-semibold text-yellow-600">{metrics.pendingUploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moderation Flags</span>
                    <span className="font-semibold text-red-600">{metrics.contentModerationFlags}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Pipeline</h3>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Processing</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Failed</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="font-semibold text-green-600">96.2%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Quality</h3>
                  <Star className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Metadata Complete</span>
                    <span className="font-semibold text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Audio Quality</span>
                    <span className="font-semibold text-green-600">95.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Genre Accuracy</span>
                    <span className="font-semibold text-green-600">92.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Uploads</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Song</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Artist</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Uploaded</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { song: 'Midnight Dreams', artist: 'Sarah Wilson', status: 'Processed', uploaded: '2 hours ago' },
                      { song: 'Electric Soul', artist: 'DJ Max', status: 'Processing', uploaded: '4 hours ago' },
                      { song: 'Ocean Waves', artist: 'The Calm', status: 'Failed', uploaded: '6 hours ago' },
                    ].map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{item.song}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.artist}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            item.status === 'Processed' ? 'text-green-600 bg-green-100 dark:bg-green-900/20' :
                            item.status === 'Processing' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' :
                            'text-red-600 bg-red-100 dark:bg-red-900/20'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.uploaded}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeUsers.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">+{metrics.newUsers}</p>
                  </div>
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.churnRate}%</p>
                  </div>
                  <Minus className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Free Users</h4>
                  <p className="text-3xl font-bold text-blue-600 mb-2">8,420</p>
                  <p className="text-sm text-blue-600">54.6% of total</p>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Pro Users</h4>
                  <p className="text-3xl font-bold text-green-600 mb-2">5,890</p>
                  <p className="text-sm text-green-600">38.2% of total</p>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Enterprise</h4>
                  <p className="text-3xl font-bold text-purple-600 mb-2">1,110</p>
                  <p className="text-sm text-purple-600">7.2% of total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Revenue</span>
                    <span className="font-semibold">${metrics.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subscription Conversions</span>
                    <span className="font-semibold">{metrics.subscriptionConversions}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Average Revenue per User</span>
                    <span className="font-semibold">$8.12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Customer Lifetime Value</span>
                    <span className="font-semibold">$156.80</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Usage</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.featureUsage).map(([feature, usage]) => (
                    <div key={feature} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${usage}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-sm">{usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Market Penetration</h4>
                  <p className="text-2xl font-bold text-blue-600">2.3%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">of target market</p>
                </div>
                <div className="text-center p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Competitive Position</h4>
                  <p className="text-2xl font-bold text-green-600">#3</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">in market share</p>
                </div>
                <div className="text-center p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Growth Rate</h4>
                  <p className="text-2xl font-bold text-purple-600">+34%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">YoY growth</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artist-management' && (
          <ArtistManagementTab onPoseAsArtist={setPoseAsArtist} />
        )}
      </div>
    </div>
  );
};

// Artist Management Tab Component
interface ArtistManagementTabProps {
  onPoseAsArtist: (artistData: any) => void;
}

const ArtistManagementTab: React.FC<ArtistManagementTabProps> = ({ onPoseAsArtist }) => {
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // Load artists data
  const loadArtists = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });
      
      const response = await fetch(`/api/admin/artists?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setArtists(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error('Failed to load artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download artists as CSV
  const downloadArtistsCSV = async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch('/api/admin/artists/download');
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = 'artists_data.csv';
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
      
      // For now, show message that this feature needs API integration
      alert('CSV download requires API integration');
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  // Pose as artist
  const handlePoseAsArtist = async (artistId: string) => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/admin/artists/${artistId}/pose`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
      // 
      // const data = await response.json();
      // 
      // if (data.success) {
      //   onPoseAsArtist(data.data);
      //   alert(`Successfully posing as ${data.data.artistName}. You can now access their dashboard and make edits.`);
      // }
      
      // For now, show message that this feature needs API integration
      alert('Artist impersonation requires API integration');
    } catch (error) {
      console.error('Failed to pose as artist:', error);
      alert('Failed to pose as artist. Please try again.');
    }
  };

  // Search artists
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    // TODO: Replace with real search API call
    // if (searchTerm.trim()) {
    //   loadArtists(1, searchTerm);
    // } else {
    //   loadArtists(1);
    // }
    
    // For now, show message that search needs API integration
    alert('Search functionality requires API integration');
  };

  // Load artists on component mount
  useEffect(() => {
    // TODO: Replace with real API call
    // loadArtists();
    
    // For now, set empty state
    setArtists([]);
    setTotalPages(0);
    setCurrentPage(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Artist Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage artists, producers, and labels</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={downloadArtistsCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Download CSV
          </button>
          <button
            onClick={() => loadArtists()}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1">
                          <input
                type="text"
                placeholder="Search by name, artist/band/company name, email, phone, or subscription plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Artists Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Artist/Band/Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {artists.map((artist) => (
                <tr key={artist._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={artist.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {artist.firstName} {artist.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {artist.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{artist.bandName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{artist.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                      {artist.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      artist.subscriptionPlan === 'enterprise' 
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                        : artist.subscriptionPlan === 'pro'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : artist.subscriptionPlan === 'basic'
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                    }`}>
                      {artist.subscriptionPlan ? artist.subscriptionPlan.charAt(0).toUpperCase() + artist.subscriptionPlan.slice(1) : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      artist.isActive 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {artist.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePoseAsArtist(artist._id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                    >
                      Pose as Artist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => loadArtists(currentPage - 1, searchTerm)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadArtists(currentPage + 1, searchTerm)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => loadArtists(currentPage - 1, searchTerm)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadArtists(currentPage + 1, searchTerm)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 