import React, { useState, useEffect } from 'react';
import ArtistImpersonationDashboard from './ArtistImpersonationDashboard';
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
  Minus
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai-models' | 'content' | 'users' | 'business' | 'artist-management'>('overview');
  const [poseAsArtist, setPoseAsArtist] = useState<any>(null);

  const [metrics] = useState<AdminMetrics>({
    recommendationAccuracy: 87.3,
    clickThroughRate: 23.5,
    averageSessionDuration: 18.5,
    songsPerSession: 12.3,
    skipRate: 34.2,
    apiResponseTime: 245,
    errorRate: 0.8,
    uptime: 99.7,
    totalUsers: 15420,
    activeUsers: 8920,
    newUsers: 234,
    churnRate: 2.1,
    retentionRate: 78.5,
    modelVersion: 'v2.1.4',
    trainingStatus: 'completed',
    modelAccuracy: 89.2,
    featureImportance: {
      'Tempo': 0.23,
      'Energy': 0.19,
      'Danceability': 0.17,
      'Valence': 0.15,
      'Acousticness': 0.12,
      'Instrumentalness': 0.08,
      'Liveness': 0.06
    },
    totalSongs: 125430,
    pendingUploads: 45,
    contentModerationFlags: 12,
    revenue: 125000,
    subscriptionConversions: 8.7,
    featureUsage: {
      'Song Upload': 67,
      'Analysis': 89,
      'Recommendations': 92,
      'Comparison': 45,
      'Trends': 38
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    // Placeholder for future API integration
  }, []);

  // Mock data for charts
  const performanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Recommendation Accuracy',
        data: [85, 87, 86, 89, 88, 90, 87],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Click Through Rate',
        data: [20, 22, 21, 25, 24, 26, 24],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userEngagementData = {
    labels: ['0-5min', '5-15min', '15-30min', '30-60min', '60+min'],
    datasets: [
      {
        label: 'Users',
        data: [1200, 2100, 3400, 2800, 1500],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const featureImportanceData = {
    labels: Object.keys(metrics.featureImportance),
    datasets: [
      {
        label: 'Importance Score',
        data: Object.values(metrics.featureImportance),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [85000, 92000, 88000, 105000, 115000, 125000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
    ],
  };

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
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'ai-models', label: 'AI Models', icon: Zap },
              { id: 'content', label: 'Content', icon: Music },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'business', label: 'Business', icon: DollarSign },
              { id: 'artist-management', label: 'Artist Management', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors duration-200 border-b-2 ${
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recommendation Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.recommendationAccuracy}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 ml-1">+2.3%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.activeUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 ml-1">+5.2%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">API Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.apiResponseTime}ms</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 ml-1">+12ms</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${(metrics.revenue / 1000).toFixed(0)}k</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 ml-1">+8.7%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
                <Line data={performanceData} options={chartOptions} />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Engagement</h3>
                <Doughnut data={userEngagementData} options={doughnutOptions} />
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Uptime</p>
                    <p className="text-lg font-bold text-green-600">{metrics.uptime}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Error Rate</p>
                    <p className="text-lg font-bold text-yellow-600">{metrics.errorRate}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Response Time</p>
                    <p className="text-lg font-bold text-blue-600">{metrics.apiResponseTime}ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
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
                  {[
                    { country: 'United States', users: 45, growth: '+12%' },
                    { country: 'United Kingdom', users: 18, growth: '+8%' },
                    { country: 'Canada', users: 12, growth: '+15%' },
                    { country: 'Australia', users: 10, growth: '+6%' },
                    { country: 'Germany', users: 8, growth: '+9%' },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{item.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{item.users}%</span>
                        <span className="text-green-600 text-sm">{item.growth}</span>
                      </div>
                    </div>
                  ))}
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
      // For now, create CSV from mock data
      const csvHeader = 'Name,Artist/Band/Company Name,Email,Phone,Role,Subscription,Status,Created Date\n';
      const csvRows = artists.map(artist => {
        const name = `${artist.firstName} ${artist.lastName}`;
        const status = artist.isActive ? 'Active' : 'Inactive';
        const subscription = artist.subscriptionPlan ? artist.subscriptionPlan.charAt(0).toUpperCase() + artist.subscriptionPlan.slice(1) : 'Free';
        const createdDate = artist.createdAt.toISOString().split('T')[0];
        return `"${name}","${artist.bandName}","${artist.email}","${artist.telephone}","${artist.role}","${subscription}","${status}","${createdDate}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'artists_data.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Uncomment when API is ready:
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
    } catch (error) {
      console.error('Failed to download CSV:', error);
    }
  };

  // Pose as artist
  const handlePoseAsArtist = async (artistId: string) => {
    try {
      // For now, create mock artist data
      const artist = artists.find(a => a._id === artistId);
      if (artist) {
        const mockArtistData = {
          originalAdminId: 'admin123',
          artistId: artist._id,
          artistEmail: artist.email,
          artistName: `${artist.firstName} ${artist.lastName}`,
          bandName: artist.bandName,
          role: artist.role,
          impersonationStartTime: new Date(),
          artistData: {
            profile: {
              firstName: artist.firstName,
              lastName: artist.lastName,
              bandName: artist.bandName,
              email: artist.email,
              telephone: artist.telephone,
              bio: 'Sample bio for demonstration',
              profilePicture: artist.profilePicture
            },
            songs: [
              { title: 'Sample Song 1', artist: artist.bandName, analysisStatus: 'completed' },
              { title: 'Sample Song 2', artist: artist.bandName, analysisStatus: 'pending' },
              { title: 'Sample Song 3', artist: artist.bandName, analysisStatus: 'completed' }
            ],
            favorites: [
              { title: 'Favorite Song 1', artist: 'Other Artist', genre: 'Rock' },
              { title: 'Favorite Song 2', artist: 'Another Artist', genre: 'Pop' }
            ],
            stats: {
              totalSongs: 3,
              totalAnalyses: 2,
              totalPlays: 150,
              memberSince: new Date('2024-01-01')
            },
            subscription: {
              plan: 'pro',
              status: 'active',
              usage: {
                songsAnalyzed: 2
              }
            }
          }
        };
        
        onPoseAsArtist(mockArtistData);
        alert(`Successfully posing as ${mockArtistData.artistName}. You can now access their dashboard and make edits.`);
      }
      
      // Uncomment when API is ready:
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
    } catch (error) {
      console.error('Failed to pose as artist:', error);
      alert('Failed to pose as artist. Please try again.');
    }
  };

  // Search artists
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    
    if (searchTerm.trim()) {
      const filtered = mockArtists.filter(artist => 
        artist.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.bandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artist.telephone.includes(searchTerm) ||
        artist.subscriptionPlan.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setArtists(filtered);
      setTotalPages(1);
    } else {
      setArtists(mockArtists);
      setTotalPages(1);
    }
    
    // Uncomment when API is ready:
    // loadArtists(1, searchTerm);
  };

  // Mock data for demonstration (remove when real API is connected)
  const mockArtists = [
    {
      _id: '1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      bandName: 'Midnight Dreams',
      email: 'sarah@midnightdreams.com',
      telephone: '+1 (555) 123-4567',
      role: 'artist',
      isActive: true,
      subscriptionPlan: 'pro',
      createdAt: new Date('2024-01-15'),
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      _id: '2',
      firstName: 'DJ',
      lastName: 'Max',
      bandName: 'Electric Soul Collective',
      email: 'max@electricsoul.com',
      telephone: '+1 (555) 234-5678',
      role: 'producer',
      isActive: true,
      subscriptionPlan: 'enterprise',
      createdAt: new Date('2024-02-20'),
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      _id: '3',
      firstName: 'The',
      lastName: 'Calm',
      bandName: 'Ocean Waves',
      email: 'info@oceanswaves.com',
      telephone: '+1 (555) 345-6789',
      role: 'label',
      isActive: true,
      subscriptionPlan: 'basic',
      createdAt: new Date('2024-03-10'),
      profilePicture: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop&crop=face'
    },
    {
      _id: '4',
      firstName: 'Alex',
      lastName: 'Rivers',
      bandName: 'Urban Beats',
      email: 'alex@urbanbeats.com',
      telephone: '+1 (555) 456-7890',
      role: 'artist',
      isActive: false,
      subscriptionPlan: 'free',
      createdAt: new Date('2024-01-05'),
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  // Load artists on component mount
  useEffect(() => {
    // For now, use mock data instead of API call
    setArtists(mockArtists);
    setTotalPages(1);
    setCurrentPage(1);
    
    // Uncomment when API is ready:
    // loadArtists();
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