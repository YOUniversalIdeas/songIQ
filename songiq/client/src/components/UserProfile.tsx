import React, { useState } from 'react';
import { useAuth, User } from './AuthProvider';
import {
  User as UserIcon,

  Instagram,
  Twitter,
  Youtube,
  Music,
  Crown,
  Calendar,
  TrendingUp,
  Settings,
  Edit,
  Save,
  X,
  Check,
  AlertCircle,
  Star,
  Download,

  BarChart3,
  Target,

} from 'lucide-react';

interface UserProfileProps {
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, updateProfile, isLoading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'analytics' | 'settings'>('profile');

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      bandName: user.bandName,
      telephone: user.telephone,
      profile: { ...user.profile }
    });
    setIsEditing(true);
    clearError();
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    clearError();
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'pro': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise': return <Crown className="h-5 w-5" />;
      case 'pro': return <Star className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
            />
            <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${getSubscriptionColor(user.subscription.plan)}`}>
              {getSubscriptionIcon(user.subscription.plan)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'subscription', label: 'Subscription', icon: Crown },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.firstName || user.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.lastName || user.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Artist/Band/Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.bandName || user.bandName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, bandName: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.bandName || 'No artist/band/company name added.'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username
                  </label>
                  <p className="text-gray-900 dark:text-white">@{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.telephone || user.telephone || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, telephone: e.target.value }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your phone number"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.telephone || 'No phone number added.'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.profile?.bio || user.profile.bio || ''}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        profile: { ...prev.profile, bio: e.target.value }
                      }))}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.profile.bio || 'No bio added yet.'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.profile?.location || user.profile.location || ''}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        profile: { ...prev.profile, location: e.target.value }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your location"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.profile.location || 'No location set.'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.profile?.website || user.profile.website || ''}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        profile: { ...prev.profile, website: e.target.value }
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.profile.website || 'No website added.'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'instagram', icon: Instagram, label: 'Instagram' },
                  { key: 'twitter', icon: Twitter, label: 'Twitter' },
                  { key: 'youtube', icon: Youtube, label: 'YouTube' },
                  { key: 'spotify', icon: Music, label: 'Spotify' }
                ].map((social) => {
                  const Icon = social.icon;
                  const value = user.profile.socialLinks?.[social.key as keyof typeof user.profile.socialLinks] || '';
                  
                  return (
                    <div key={social.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {social.label}
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => setEditData(prev => ({ 
                              ...prev, 
                              profile: { 
                                ...prev.profile, 
                                socialLinks: { 
                                  ...prev.profile?.socialLinks, 
                                  [social.key]: e.target.value 
                                }
                              }
                            }))}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Your ${social.label} handle`}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white">{value || `No ${social.label} link.`}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Subscription</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionColor(user.subscription.plan)}`}>
                  {user.subscription.plan.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Music className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Songs Analyzed</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.subscription.usage?.songsAnalyzed || 0} / {user.songLimit || '∞'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.remainingSongs !== undefined && user.remainingSongs > 0 
                      ? `${user.remainingSongs} remaining`
                      : user.remainingSongs === 0 
                        ? 'Limit reached'
                        : 'Unlimited'
                    }
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.stats.averageScore}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Features Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {user.subscription.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    tier: 'free',
                    name: 'Free',
                    price: '$0',
                    features: ['3 song analyses per month', 'Basic analytics', 'Community support'],
                    current: user.subscription.plan === 'free'
                  },
                  {
                    tier: 'pro',
                    name: 'Pro',
                    price: '$19.99',
                    period: '/month',
                    features: ['100 song analyses per month', 'Advanced analytics', 'AI recommendations', 'Priority support'],
                    current: user.subscription.plan === 'pro'
                  },
                  {
                    tier: 'enterprise',
                    name: 'Enterprise',
                    price: '$99.99',
                    period: '/month',
                    features: ['Unlimited song analyses', 'Team collaboration', 'Custom integrations', 'Dedicated support'],
                    current: user.subscription.plan === 'enterprise'
                  }
                ].map((plan) => (
                  <div
                    key={plan.tier}
                    className={`p-6 rounded-lg border-2 ${
                      plan.current
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                        {plan.period && (
                          <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        plan.current
                          ? 'bg-blue-600 text-white cursor-default'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Songs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.totalSongs}</p>
                  </div>
                  <Music className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Streams</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.totalStreams.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.averageScore}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Date(user.stats.joinDate).getFullYear()}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { action: 'Song uploaded', song: 'Midnight Dreams', date: '2 hours ago', score: 85 },
                  { action: 'Analysis completed', song: 'Electric Nights', date: '1 day ago', score: 92 },
                  { action: 'Song uploaded', song: 'Acoustic Soul', date: '3 days ago', score: 78 },
                  { action: 'Analysis completed', song: 'Urban Groove', date: '1 week ago', score: 88 }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Music className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.song}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.date}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', description: 'Get real-time notifications' },
                  { key: 'marketing', label: 'Marketing Emails', description: 'Receive promotional content' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{setting.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={user.preferences.notifications[setting.key as keyof typeof user.preferences.notifications]}
                        className="sr-only peer"
                        readOnly
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password</p>
                    </div>
                    <Settings className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Export Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download your song data and analytics</p>
                    </div>
                    <Download className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
                <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and data</p>
                    </div>
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 