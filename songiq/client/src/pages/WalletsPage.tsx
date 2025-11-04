import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import { API_ENDPOINTS } from '../config/api';

interface WalletData {
  _id: string;
  address: string;
  type: 'custodial' | 'non-custodial';
  chainId: number;
  isActive: boolean;
  isPrimary: boolean;
  label?: string;
  createdAt: string;
}

const CHAIN_NAMES: { [key: number]: string } = {
  1: 'Ethereum',
  137: 'Polygon',
  56: 'BSC',
  11155111: 'Sepolia Testnet'
};

const EXPLORER_URLS: { [key: number]: string } = {
  1: 'https://etherscan.io',
  137: 'https://polygonscan.com',
  56: 'https://bscscan.com',
  11155111: 'https://sepolia.etherscan.io'
};

const WalletsPage: React.FC = () => {
  const { token } = useAuth();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showAddressIndex, setShowAddressIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Create wallet form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWalletChain, setNewWalletChain] = useState(1);
  const [newWalletLabel, setNewWalletLabel] = useState('');

  useEffect(() => {
    if (token) {
      fetchWallets();
    }
  }, [token]);

  const fetchWallets = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setWallets(data.wallets || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load wallets');
      setLoading(false);
    }
  };

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chainId: newWalletChain,
          label: newWalletLabel || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wallet');
      }

      setSuccess(`Wallet created successfully! Address: ${data.address}`);
      setShowCreateForm(false);
      setNewWalletLabel('');
      fetchWallets();
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (address: string, index: number) => {
    navigator.clipboard.writeText(address);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const maskAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to manage your wallets
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            <Wallet className="inline mr-2" />
            My Wallets
          </h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Wallet
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Create Wallet Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Create New Wallet
              </h2>
              
              <form onSubmit={handleCreateWallet}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blockchain Network
                  </label>
                  <select
                    value={newWalletChain}
                    onChange={(e) => setNewWalletChain(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value={1}>Ethereum Mainnet</option>
                    <option value={137}>Polygon</option>
                    <option value={56}>BSC</option>
                    <option value={11155111}>Sepolia Testnet</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    placeholder="e.g., My Trading Wallet"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewWalletLabel('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Wallets Grid */}
        {wallets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Wallets Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first wallet to start trading
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet, index) => (
              <div
                key={wallet._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {wallet.label || `Wallet ${index + 1}`}
                      </h3>
                      {wallet.isPrimary && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {CHAIN_NAMES[wallet.chainId] || `Chain ${wallet.chainId}`}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${wallet.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>

                {/* Type Badge */}
                <div className="mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    wallet.type === 'custodial'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {wallet.type}
                  </span>
                </div>

                {/* Address */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Address
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-gray-900 dark:text-white">
                      {showAddressIndex === index ? wallet.address : maskAddress(wallet.address)}
                    </code>
                    <button
                      onClick={() =>
                        setShowAddressIndex(showAddressIndex === index ? null : index)
                      }
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showAddressIndex === index ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(wallet.address, index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  {EXPLORER_URLS[wallet.chainId] && (
                    <a
                      href={`${EXPLORER_URLS[wallet.chainId]}/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Created Date */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(wallet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletsPage;

