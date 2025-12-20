import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../components/AuthProvider';

interface Outcome {
  name: string;
  description: string;
}

const categories = [
  { id: 'chart_position', name: 'Chart Position', icon: '📊' },
  { id: 'streaming_numbers', name: 'Streaming Numbers', icon: '🎵' },
  { id: 'awards', name: 'Awards', icon: '🏆' },
  { id: 'genre_trend', name: 'Genre Trends', icon: '📈' },
  { id: 'artist_popularity', name: 'Artist Popularity', icon: '⭐' },
  { id: 'release_success', name: 'Release Success', icon: '🚀' },
  { id: 'other', name: 'Other', icon: '💡' }
];

const CreateMarketPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    endDate: '',
    relatedSongId: ''
  });

  const [outcomes, setOutcomes] = useState<Outcome[]>([
    { name: '', description: '' },
    { name: '', description: '' }
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only admins can create prediction markets.' });
      setTimeout(() => navigate('/markets'), 2000);
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const addOutcome = () => {
    if (outcomes.length < 10) {
      setOutcomes([...outcomes, { name: '', description: '' }]);
    }
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const updateOutcome = (index: number, field: keyof Outcome, value: string) => {
    const updated = [...outcomes];
    updated[index] = { ...updated[index], [field]: value };
    setOutcomes(updated);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return false;
    }

    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: 'Description is required' });
      return false;
    }

    if (!formData.category) {
      setMessage({ type: 'error', text: 'Please select a category' });
      return false;
    }

    if (!formData.endDate) {
      setMessage({ type: 'error', text: 'End date is required' });
      return false;
    }

    const endDate = new Date(formData.endDate);
    if (endDate <= new Date()) {
      setMessage({ type: 'error', text: 'End date must be in the future' });
      return false;
    }

    const validOutcomes = outcomes.filter(o => o.name.trim());
    if (validOutcomes.length < 2) {
      setMessage({ type: 'error', text: 'At least 2 outcomes are required' });
      return false;
    }

    if (validOutcomes.length > 10) {
      setMessage({ type: 'error', text: 'Maximum 10 outcomes allowed' });
      return false;
    }

    // Check for duplicate outcome names
    const names = validOutcomes.map(o => o.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      setMessage({ type: 'error', text: 'Outcome names must be unique' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const validOutcomes = outcomes.filter(o => o.name.trim());

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        outcomes: validOutcomes.map(o => ({
          name: o.name.trim(),
          description: o.description.trim() || o.name.trim()
        })),
        endDate: new Date(formData.endDate).toISOString(),
        ...(formData.relatedSongId && { relatedSongId: formData.relatedSongId })
      };

      const response = await fetch(`${API_BASE_URL}/api/markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create market');
      }

      const data = await response.json();
      setMessage({ type: 'success', text: 'Market created successfully!' });
      
      // Redirect to the new market after a short delay
      setTimeout(() => {
        navigate(`/markets/${data.market._id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating market:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create market. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
              Access Denied
            </h2>
            <p className="text-red-800 dark:text-red-300">
              Only administrators can create prediction markets.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/markets')}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 flex items-center"
          >
            ← Back to Markets
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Prediction Market
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new prediction market for users to trade on
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Market Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Will 'Summer Vibes 2025' reach Top 10?"
              maxLength={200}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about what this market predicts..."
              rows={4}
              maxLength={1000}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Outcomes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Outcomes * (2-10 required)
              </label>
              {outcomes.length < 10 && (
                <button
                  type="button"
                  onClick={addOutcome}
                  className="flex items-center px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Outcome
                </button>
              )}
            </div>
            <div className="space-y-4">
              {outcomes.map((outcome, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Outcome {index + 1}
                    </span>
                    {outcomes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={outcome.name}
                        onChange={(e) => updateOutcome(index, 'name', e.target.value)}
                        placeholder="Outcome name (e.g., 'Yes, Top 10')"
                        required={index < 2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <textarea
                        value={outcome.description}
                        onChange={(e) => updateOutcome(index, 'description', e.target.value)}
                        placeholder="Optional description for this outcome"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {outcomes.filter(o => o.name.trim()).length} valid outcomes
            </p>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Trading will close on this date
            </p>
          </div>

          {/* Related Song (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Song ID (Optional)
            </label>
            <input
              type="text"
              value={formData.relatedSongId}
              onChange={(e) => setFormData({ ...formData, relatedSongId: e.target.value })}
              placeholder="MongoDB ObjectId of related song"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Link this market to a specific song in the database
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/markets')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Market'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            💡 Tips for Creating Markets
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Make your title clear and specific</li>
            <li>Provide detailed descriptions so traders understand the market</li>
            <li>Ensure outcomes are mutually exclusive and cover all possibilities</li>
            <li>Set an end date that allows enough time for the outcome to be determined</li>
            <li>Markets start with equal probability for all outcomes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketPage;

