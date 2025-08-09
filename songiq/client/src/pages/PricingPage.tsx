import React, { useState } from 'react';
import StripeProvider from '../components/StripeProvider';
import SubscriptionPlans from '../components/SubscriptionPlans';

const PricingPage: React.FC = () => {
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string>('');

  const handleSubscriptionSuccess = () => {
    setSubscriptionSuccess(true);
    setSubscriptionError('');
    // You could redirect to dashboard or show success message
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
  };

  const handleSubscriptionError = (error: string) => {
    setSubscriptionError(error);
    setSubscriptionSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {subscriptionSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-900 border border-green-700 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-green-300 font-medium">Subscription successful! Redirecting...</p>
          </div>
        </div>
      )}

      {subscriptionError && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-900 border border-red-700 rounded-lg shadow-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-300 font-medium">{subscriptionError}</p>
          </div>
        </div>
      )}

      <StripeProvider>
        <SubscriptionPlans
          onSubscriptionSuccess={handleSubscriptionSuccess}
          onSubscriptionError={handleSubscriptionError}
        />
      </StripeProvider>
    </div>
  );
};

export default PricingPage; 