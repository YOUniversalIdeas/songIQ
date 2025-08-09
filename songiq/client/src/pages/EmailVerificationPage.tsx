import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.get(`/api/auth/verify-email?token=${token}`);
      
      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message);
        setEmail(response.data.user.email);
        
        // Store the verified user data
        localStorage.setItem('songiq_user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address to resend the verification email.');
      return;
    }

    setResending(true);
    try {
      const response = await axios.post('/api/auth/resend-verification', { email });
      
      if (response.data.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setMessage(response.data.message);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-gray-300">Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'success' ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900 mb-4">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-300 mb-2">Your Free Plan Includes:</h3>
                <ul className="text-sm text-green-200 space-y-1">
                  <li>✅ Up to 3 song analyses</li>
                  <li>✅ Basic music insights</li>
                  <li>✅ Standard reports</li>
                  <li>✅ Perfect for trying songIQ</li>
                </ul>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Redirecting to dashboard in 3 seconds...
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Go to Dashboard Now
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900 mb-4">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-300 mb-6">{message}</p>
              
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-200 mb-2">Need a new verification email?</h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-700 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={resendVerification}
                    disabled={resending}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Back to Pricing
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 