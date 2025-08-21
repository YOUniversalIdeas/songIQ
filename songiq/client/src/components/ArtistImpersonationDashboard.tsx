import React from 'react';
import { Music, BarChart3, Heart, Settings, User, LogOut } from 'lucide-react';

interface ArtistImpersonationDashboardProps {
  artistData: any;
  onStopPosing: () => void;
}

const ArtistImpersonationDashboard: React.FC<ArtistImpersonationDashboardProps> = ({ 
  artistData, 
  onStopPosing 
}) => {
  if (!artistData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {artistData.artistName}'s Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Band: {artistData.bandName} | Role: {artistData.role}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Impersonating since: {new Date(artistData.impersonationStartTime).toLocaleString()}
              </div>
              <button
                onClick={onStopPosing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Stop Posing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'songs', label: 'My Songs', icon: Music },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <img
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                  src={artistData.artistData.profile.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=96&h=96&fit=crop&crop=face'}
                  alt={artistData.artistName}
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {artistData.artistName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{artistData.bandName}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Email: {artistData.artistData.profile.email}</p>
                  <p>Phone: {artistData.artistData.profile.telephone}</p>
                  <p>Role: {artistData.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Music className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Songs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {artistData.artistData.songs?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {artistData.artistData.favorites?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Analyses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {artistData.artistData.stats?.totalAnalyses || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Songs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Songs</h3>
              {artistData.artistData.songs && artistData.artistData.songs.length > 0 ? (
                <div className="space-y-3">
                  {artistData.artistData.songs.slice(0, 5).map((song: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{song.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        song.analysisStatus === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          : song.analysisStatus === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                      }`}>
                        {song.analysisStatus || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No songs uploaded yet
                </p>
              )}
            </div>

            {/* Subscription Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {artistData.artistData.subscription?.plan || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`font-medium ${
                    artistData.artistData.subscription?.status === 'active' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {artistData.artistData.subscription?.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Songs Analyzed:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {artistData.artistData.subscription?.usage?.songsAnalyzed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistImpersonationDashboard;
