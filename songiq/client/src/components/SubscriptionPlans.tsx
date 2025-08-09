import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

interface Plan {
  name: string;
  priceId: string;
  price: number;
  features: string[];
}

interface SubscriptionPlansProps {
  onSubscriptionSuccess?: () => void;
  onSubscriptionError?: (error: string) => void;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onSubscriptionSuccess,
  onSubscriptionError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/payments/plans');
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load subscription plans');
    }
  };

  const handleSubscribe = async (planType: string) => {
    setLoading(true);
    setError('');

    try {
      const plan = plans[planType];
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Handle free plan differently (no payment required)
      if (planType === 'free') {
        // Validate form data for free signup
        if (!userForm.email || !userForm.firstName || !userForm.lastName || !userForm.username || !userForm.password) {
          throw new Error('Please fill in all required fields');
        }

        if (userForm.password !== userForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (userForm.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        const response = await axios.post('/api/payments/signup-free', {
          email: userForm.email,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          username: userForm.username,
          password: userForm.password
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to sign up for free plan');
        }

        // Store auth token
        if (response.data.token) {
          localStorage.setItem('songiq_token', response.data.token);
          localStorage.setItem('songiq_user', JSON.stringify(response.data.user));
        }

        setSelectedPlan('');
        setUserForm({
          email: '',
          firstName: '',
          lastName: '',
          username: '',
          password: '',
          confirmPassword: ''
        });

        // Show verification message
        if (response.data.emailVerificationSent) {
          alert('Account created successfully! Please check your email to verify your account before you can start using songIQ.');
        }
        
        onSubscriptionSuccess?.();
        return;
      }

      // Handle paid plans - require Stripe
      if (!stripe || !elements) {
        setError('Stripe has not loaded yet. Please try again.');
        return;
      }

      // Create subscription
      const response = await axios.post('/api/payments/create-test-subscription', {
        priceId: plan.priceId,
        planType: planType
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create subscription');
      }

      const { clientSecret } = response.data;

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed');
      }

      setSelectedPlan('');
      onSubscriptionSuccess?.();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Subscription failed';
      setError(errorMessage);
      onSubscriptionError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-300">Unlock the full potential of songIQ with our premium plans</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Object.entries(plans).map(([planType, plan]) => (
          <div
            key={planType}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedPlan === planType
                ? 'border-primary-500 bg-gray-800'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-primary-400 mb-3">
                {plan.price === 0 ? (
                  <span className="text-green-400">Free</span>
                ) : (
                  <>
                    ${plan.price}
                    <span className="text-lg text-gray-400">/month</span>
                  </>
                )}
              </div>
              
              <ul className="text-left space-y-2 mb-4 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="leading-tight text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(planType)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-200 text-sm ${
                  selectedPlan === planType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {selectedPlan === planType ? 'Selected' : 'Choose Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="max-w-md mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
            {selectedPlan === 'free' ? (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Create Your Free Account</h3>
                <p className="text-gray-300 mb-6">
                  Sign up now and analyze up to 3 songs for free!
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={userForm.firstName}
                        onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={userForm.lastName}
                        onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={userForm.username}
                      onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedPlan('')}
                    className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubscribe(selectedPlan)}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Creating Account...' : 'Create Free Account'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Payment Information</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Details
                  </label>
                  <div className="border border-gray-600 rounded-lg p-3 bg-gray-700">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setSelectedPlan('')}
                    className="flex-1 py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubscribe(selectedPlan)}
                    disabled={loading || !stripe}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Processing...' : `Subscribe to ${plans[selectedPlan]?.name}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans; 