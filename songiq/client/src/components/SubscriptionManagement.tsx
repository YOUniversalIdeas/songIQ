import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Subscription {
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  features: string[];
  stripeSubscription?: any;
}

interface SubscriptionManagementProps {
  onSubscriptionUpdate?: () => void;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  onSubscriptionUpdate
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/payments/subscription');
      if (response.data.success) {
        setSubscription(response.data.subscription);
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      setError(error.response?.data?.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await axios.post('/api/payments/cancel-subscription');
      if (response.data.success) {
        await fetchSubscription();
        onSubscriptionUpdate?.();
      }
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      setError(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setActionLoading(true);
      const response = await axios.post('/api/payments/reactivate-subscription');
      if (response.data.success) {
        await fetchSubscription();
        onSubscriptionUpdate?.();
      }
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      setError(error.response?.data?.message || 'Failed to reactivate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'unpaid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">You don't have an active subscription.</p>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
            </h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Started</p>
            <p className="font-medium">{formatDate(subscription.startDate)}</p>
            {subscription.endDate && (
              <>
                <p className="text-sm text-gray-600 mt-2">Ends</p>
                <p className="font-medium">{formatDate(subscription.endDate)}</p>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Features</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            ))}
          </div>
        </div>

        {subscription.stripeSubscription && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Next billing date</p>
                <p className="font-medium">
                  {formatDate(new Date(subscription.stripeSubscription.current_period_end * 1000).toISOString())}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-medium">
                  ${(subscription.stripeSubscription.items.data[0]?.price.unit_amount / 100).toFixed(2)}/month
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          {subscription.status === 'active' && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {actionLoading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
          
          {subscription.status === 'canceled' && (
            <button
              onClick={handleReactivateSubscription}
              disabled={actionLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Change Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement; 