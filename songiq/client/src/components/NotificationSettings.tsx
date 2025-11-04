import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from './AuthProvider';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  marketing: boolean;
  marketResolution: boolean;
  newComments: boolean;
  positionUpdates: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
}

const NotificationSettings: React.FC = () => {
  const { token, user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    marketing: false,
    marketResolution: true,
    newComments: true,
    positionUpdates: false,
    dailySummary: true,
    weeklySummary: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user?.preferences?.notifications) {
      setPreferences({
        ...preferences,
        email: user.preferences.notifications.email !== false,
        push: user.preferences.notifications.push !== false,
        marketing: user.preferences.notifications.marketing || false
      });
    }
    setLoading(false);
  }, [user]);

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          preferences: {
            notifications: preferences
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save preferences' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-2">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how you want to receive updates about your trading activity
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Channels</h4>
        <div className="space-y-4">
          <NotificationToggle
            icon={<Mail className="w-5 h-5" />}
            label="Email Notifications"
            description="Receive notifications via email"
            enabled={preferences.email}
            onChange={() => togglePreference('email')}
          />
          <NotificationToggle
            icon={<Smartphone className="w-5 h-5" />}
            label="Push Notifications"
            description="Browser push notifications (when available)"
            enabled={preferences.push}
            onChange={() => togglePreference('push')}
          />
          <NotificationToggle
            icon={<Mail className="w-5 h-5" />}
            label="Marketing Emails"
            description="Product updates and special offers"
            enabled={preferences.marketing}
            onChange={() => togglePreference('marketing')}
          />
        </div>
      </div>

      {/* Prediction Markets Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Prediction Markets</h4>
        <div className="space-y-4">
          <NotificationToggle
            icon={<CheckCircle className="w-5 h-5" />}
            label="Market Resolutions"
            description="When markets you're in are resolved"
            enabled={preferences.marketResolution}
            onChange={() => togglePreference('marketResolution')}
            disabled={!preferences.email}
          />
          <NotificationToggle
            icon={<Bell className="w-5 h-5" />}
            label="New Comments"
            description="Comments on markets you're participating in"
            enabled={preferences.newComments}
            onChange={() => togglePreference('newComments')}
            disabled={!preferences.email}
          />
          <NotificationToggle
            icon={<Bell className="w-5 h-5" />}
            label="Position Updates"
            description="Significant price changes in your positions"
            enabled={preferences.positionUpdates}
            onChange={() => togglePreference('positionUpdates')}
            disabled={!preferences.email}
          />
        </div>
      </div>

      {/* Summaries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Summaries</h4>
        <div className="space-y-4">
          <NotificationToggle
            icon={<Mail className="w-5 h-5" />}
            label="Daily Summary"
            description="Daily recap of your trading activity"
            enabled={preferences.dailySummary}
            onChange={() => togglePreference('dailySummary')}
            disabled={!preferences.email}
          />
          <NotificationToggle
            icon={<Mail className="w-5 h-5" />}
            label="Weekly Summary"
            description="Weekly performance report and insights"
            enabled={preferences.weeklySummary}
            onChange={() => togglePreference('weeklySummary')}
            disabled={!preferences.email}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

// Toggle Component
const NotificationToggle: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}> = ({ icon, label, description, enabled, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ${
    disabled ? 'opacity-50' : ''
  }`}>
    <div className="flex items-center space-x-3 flex-1">
      <div className="text-gray-600 dark:text-gray-400">{icon}</div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </div>
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default NotificationSettings;

