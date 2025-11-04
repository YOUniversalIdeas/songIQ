import React, { useState, useEffect } from 'react';
import {
  Settings,
  DollarSign,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface PlatformSettings {
  fees: {
    platformFee: number;
    withdrawalFee: number;
  };
  limits: {
    maxMarketDuration: number;
    minLiquidity: number;
    maxOutcomes: number;
    minOutcomes: number;
  };
  features: {
    tradingEnabled: boolean;
    marketCreationEnabled: boolean;
    withdrawalsEnabled: boolean;
    maintenanceMode: boolean;
  };
  moderation: {
    autoFlagThreshold: number;
    autoSuspendWarnings: number;
  };
}

const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = () => {
    showMessage('success', 'Settings saved successfully');
    // Note: In production, this would POST to /api/admin/settings
    // For now, settings are read from environment variables
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Failed to load platform settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Platform Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure platform fees, limits, features, and moderation rules
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSettings}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
              : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Configuration Note</p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              These settings are currently configured via environment variables. To modify them, update your
              server's .env file and restart the application. Future versions will support real-time updates
              through this interface.
            </p>
          </div>
        </div>
      </div>

      {/* Fee Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <DollarSign className="w-6 h-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fee Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform Fee (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={(settings.fees.platformFee * 100).toFixed(1)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                step="0.1"
                min="0"
                max="10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fee charged on each trade (currently {(settings.fees.platformFee * 100).toFixed(1)}%)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Withdrawal Fee (%)
            </label>
            <div className="relative">
              <input
                type="number"
                value={(settings.fees.withdrawalFee * 100).toFixed(1)}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                step="0.1"
                min="0"
                max="10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fee charged on withdrawals (currently {(settings.fees.withdrawalFee * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Market Limits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Limits</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Market Duration (days)
            </label>
            <input
              type="number"
              value={settings.limits.maxMarketDuration}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max="365"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum duration for a market (currently {settings.limits.maxMarketDuration} days)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Liquidity
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</div>
              <input
                type="number"
                value={settings.limits.minLiquidity}
                readOnly
                className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum liquidity required to create a market
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Outcomes
            </label>
            <input
              type="number"
              value={settings.limits.minOutcomes}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              min="2"
              max="10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum number of outcomes per market
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Maximum Outcomes
            </label>
            <input
              type="number"
              value={settings.limits.maxOutcomes}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              min="2"
              max="20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Maximum number of outcomes per market
            </p>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Settings className="w-6 h-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Features</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">Trading Enabled</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow users to buy and sell market shares
              </p>
            </div>
            <div
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.features.tradingEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.features.tradingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">Market Creation Enabled</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow users to create new prediction markets
              </p>
            </div>
            <div
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.features.marketCreationEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.features.marketCreationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">Withdrawals Enabled</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow users to withdraw their funds
              </p>
            </div>
            <div
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.features.withdrawalsEnabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.features.withdrawalsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-orange-300 dark:border-orange-600">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                Maintenance Mode
                {settings.features.maintenanceMode && (
                  <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                    ACTIVE
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Disable all platform features for maintenance
              </p>
            </div>
            <div
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                settings.features.maintenanceMode ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  settings.features.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-orange-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moderation Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-Flag Threshold
            </label>
            <input
              type="number"
              value={settings.moderation.autoFlagThreshold}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max="20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of reports before automatic flagging (currently {settings.moderation.autoFlagThreshold})
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto-Suspend Warnings
            </label>
            <input
              type="number"
              value={settings.moderation.autoSuspendWarnings}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              min="1"
              max="10"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of warnings before automatic suspension (currently {settings.moderation.autoSuspendWarnings})
            </p>
          </div>
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Current Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Platform Fee:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {(settings.fees.platformFee * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Withdrawal Fee:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {(settings.fees.withdrawalFee * 100).toFixed(1)}%
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Max Duration:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {settings.limits.maxMarketDuration} days
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Min Liquidity:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              ${settings.limits.minLiquidity}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Outcomes Range:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {settings.limits.minOutcomes}-{settings.limits.maxOutcomes}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">Platform Status:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {settings.features.maintenanceMode ? 'Maintenance' : 'Operational'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;

