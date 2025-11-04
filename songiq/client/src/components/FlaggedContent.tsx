import React, { useState, useEffect } from 'react';
import { Flag, AlertCircle, CheckCircle, XCircle, Eye, Ban } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface FlaggedMarket {
  _id: string;
  title: string;
  category: string;
  flagged: boolean;
  flagReason?: string;
  flaggedAt?: string;
  status: string;
  totalVolume: number;
  creatorId: any;
}

const FlaggedContent: React.FC = () => {
  const [flaggedMarkets, setFlaggedMarkets] = useState<FlaggedMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionModal, setActionModal] = useState<{ type: 'unflag' | 'suspend' | 'details' | null; item: any }>({
    type: null,
    item: null,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const fetchFlaggedContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch flagged markets
      const marketsResponse = await fetch(`${API_BASE_URL}/api/admin/markets?flagged=true&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (marketsResponse.ok) {
        const marketsData = await marketsResponse.json();
        setFlaggedMarkets(marketsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      showMessage('error', 'Failed to load flagged content');
    } finally {
      setLoading(false);
    }
  };

  const handleUnflag = async (marketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}/flag`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flagged: false }),
      });

      if (!response.ok) throw new Error('Failed to unflag item');

      showMessage('success', 'Item unflagged successfully');
      setActionModal({ type: null, item: null });
      await fetchFlaggedContent();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to unflag item');
    }
  };

  const handleSuspend = async (marketId: string, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/markets/${marketId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ suspend: true, reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend market');

      showMessage('success', 'Market suspended successfully');
      setActionModal({ type: null, item: null });
      await fetchFlaggedContent();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to suspend market');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Flagged Content</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and moderate flagged markets and content
          </p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Flagged Markets</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {flaggedMarkets.length}
              </div>
            </div>
            <Flag className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Flags</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {flaggedMarkets.filter((m) => m.status === 'active').length}
              </div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(flaggedMarkets.reduce((sum, m) => sum + m.totalVolume, 0))}
              </div>
            </div>
            <Ban className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Flagged Markets */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : flaggedMarkets.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Flagged Markets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Flagged At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {flaggedMarkets.map((market) => (
                  <tr key={market._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                          <Flag className="w-4 h-4 mr-2 text-orange-500" />
                          {market.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{market.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {market.creatorId?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {market.flagReason || 'No reason provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(market.flaggedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          market.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : market.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {market.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActionModal({ type: 'details', item: market })}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'unflag', item: market })}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Remove Flag"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {market.status === 'active' && (
                          <button
                            onClick={() => setActionModal({ type: 'suspend', item: market })}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Suspend Market"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-gray-100 font-medium">No flagged content</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">All content is currently clear</p>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.type && actionModal.item && (
        <ActionModal
          type={actionModal.type}
          item={actionModal.item}
          onClose={() => setActionModal({ type: null, item: null })}
          onUnflag={handleUnflag}
          onSuspend={handleSuspend}
        />
      )}
    </div>
  );
};

// Action Modal Component
interface ActionModalProps {
  type: 'unflag' | 'suspend' | 'details';
  item: FlaggedMarket;
  onClose: () => void;
  onUnflag: (id: string) => void;
  onSuspend: (id: string, reason: string) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ type, item, onClose, onUnflag, onSuspend }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (type === 'unflag') {
      onUnflag(item._id);
    } else if (type === 'suspend' && reason.trim()) {
      onSuspend(item._id, reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {type === 'details' && 'Flagged Item Details'}
            {type === 'unflag' && 'Remove Flag'}
            {type === 'suspend' && 'Suspend Market'}
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Market Title:</p>
              <p className="text-gray-900 dark:text-gray-100">{item.title}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Flag Reason:</p>
              <div className="mt-2 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-900 dark:text-orange-100">
                  {item.flagReason || 'No reason provided'}
                </p>
              </div>
            </div>

            {type === 'suspend' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Suspension Reason:
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Explain why this market is being suspended..."
                  required
                />
              </div>
            )}

            {type === 'unflag' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  This will remove the flag from this item. The item will no longer appear in the flagged content
                  queue.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {type === 'details' ? 'Close' : 'Cancel'}
            </button>
            {type !== 'details' && (
              <button
                onClick={handleSubmit}
                disabled={type === 'suspend' && !reason.trim()}
                className={`px-4 py-2 rounded-lg text-white ${
                  type === 'suspend'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {type === 'unflag' && 'Remove Flag'}
                {type === 'suspend' && 'Suspend Market'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlaggedContent;

