import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RealTimeStats from '../components/RealTimeStats';

interface Plan {
  name: string;
  priceId: string | null;
  price: number;
  songLimit: number;
  features: string[];
}

const PricingPage: React.FC = () => {
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
    confirmPassword: '',
    bandName: '',
    telephone: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      console.log('Fetching plans...');
      const response = await axios.get('/api/payments/plans');
      console.log('Plans response:', response.data);
      if (response.data.success) {
        setPlans(response.data.plans);
        console.log('Plans set:', response.data.plans);
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
          confirmPassword: '',
          bandName: '',
          telephone: ''
        });

        // Show verification message
        if (response.data.emailVerificationSent) {
          alert('Account created successfully! Please check your email to verify your account before you can start using songIQ.');
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        return;
      }

      // For paid plans, show message about Stripe being disabled
      setError('Paid subscriptions are currently being configured. Please contact support for assistance.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Subscription failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Debug info - Keep minimal version */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center py-2 px-4 bg-gray-800 text-xs text-gray-400">
          Plans loaded: {Object.keys(plans).length} | Error: {error || 'none'}
        </div>
      )}
      
      {/* Header */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Unlock the full potential of songIQ with our premium plans
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg max-w-4xl mx-auto">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(plans).map(([planType, plan], index) => {
            console.log(`Rendering plan ${index}:`, planType, plan);
            return (
            <div
              key={planType}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedPlan === planType
                  ? 'border-blue-500 bg-gray-800'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800'
              }`}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-blue-400 mb-3">
                  {plan.price === 0 ? (
                    <span className="text-green-400">Free</span>
                  ) : (
                    <>
                      ${plan.price}
                      <span className="text-lg text-gray-400">/month</span>
                    </>
                  )}
                </div>
                
                <div className="text-sm text-gray-400 mb-4">
                  {plan.songLimit === -1 ? 'Unlimited songs' : `${plan.songLimit} songs${plan.price > 0 ? '/month' : ' total'}`}
                </div>
                
                <ul className="text-left space-y-2 mb-6 text-sm">
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
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {selectedPlan === planType ? 'Selected' : 'Choose Plan'}
                </button>
              </div>
            </div>
          );
          })}
        </div>

        {/* Fallback if no plans */}
        {Object.keys(plans).length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-300 text-lg">No plans available</p>
            <p className="text-gray-400 text-sm">Plans object: {JSON.stringify(plans)}</p>
          </div>
        )}

        {/* Signup Form for Selected Plan */}
        {selectedPlan && (
          <div className="max-w-md mx-auto">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
              <h3 className="text-xl font-bold text-white mb-4 text-center">
                Sign up for {plans[selectedPlan]?.name}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); handleSubscribe(selectedPlan); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                    <input
                      type="text"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Artist/Band/Company Name</label>
                    <input
                      type="text"
                      value={userForm.bandName}
                      onChange={(e) => setUserForm({...userForm, bandName: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                              placeholder="Artist/Band/Company Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={userForm.telephone}
                      onChange={(e) => setUserForm({...userForm, telephone: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      placeholder="Phone Number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Password (min 8 characters)"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Processing...' : `Sign Up for ${plans[selectedPlan]?.name}`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Real-time Statistics */}
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <RealTimeStats />
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 