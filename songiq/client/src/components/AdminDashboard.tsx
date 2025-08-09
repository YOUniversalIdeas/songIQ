import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai-models' | 'content' | 'users' | 'business'>('overview');
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
      </div>
    </div>
  );
};

export default AdminDashboard; 