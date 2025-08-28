import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface VerificationStatus {
  isVerified: boolean;
  emailVerified: boolean;
  smsVerified: boolean;
  hasEmailVerification: boolean;
  hasSMSVerification: boolean;
}

const VerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, markAsVerified } = useAuth();
  
  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    if (!token || !user) {
      navigate('/auth?mode=login');
      return;
    }
    
    // Get verification status
    fetchVerificationStatus();
  }, [token, user, navigate]);

  const fetchVerificationStatus = async () => {
    try {
      console.log('🔍 Fetching verification status...');
      const response = await fetch('/api/verification/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Verification status received:', data);
        setVerificationStatus(data);
        
        // If already verified, redirect to dashboard
        if (data.isVerified) {
          console.log('🎉 User verified, redirecting to dashboard');
          navigate('/dashboard');
        }
      } else {
        console.error('❌ Failed to fetch verification status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching verification status:', error);
    }
  };

  const verifyEmail = async () => {
    if (!emailCode.trim()) {
      setError('Please enter the email verification code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/verification/verify-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: emailCode })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email verified successfully!');
        setEmailCode('');
        fetchVerificationStatus(); // Refresh status
        
        // If both verified, mark as authenticated and redirect to dashboard
        if (data.isVerified) {
          markAsVerified(); // Mark user as verified in auth context
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        setError(data.error || 'Failed to verify email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!smsCode.trim()) {
      setError('Please enter the SMS verification code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/verification/verify-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: smsCode })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('SMS verified successfully!');
        setSmsCode('');
        fetchVerificationStatus(); // Refresh status
        
        // If both verified, mark as authenticated and redirect to dashboard
        if (data.isVerified) {
          markAsVerified(); // Mark user as verified in auth context
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        setError(data.error || 'Failed to verify SMS');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendCodes = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/verification/resend', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification codes resent successfully! Check your email and phone.');
      } else {
        setError(data.error || 'Failed to resend codes');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!verificationStatus) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">songIQ</h1>
          <h2 className="text-2xl font-semibold text-gray-300">🔐 Account Verification Required</h2>
          <p className="text-gray-400 mt-2 mb-4">
            To protect your account and access your song analysis results, please verify both your email and phone number.
          </p>
          
          {/* Important Notice */}
          <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-3 mb-4">
            <p className="text-orange-200 text-sm">
              <strong>⚠️ Important:</strong> You need to verify both email and phone to access your song analysis results.
            </p>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-medium text-white">Verification Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Verification</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                verificationStatus.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {verificationStatus.emailVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS Verification</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                verificationStatus.smsVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {verificationStatus.smsVerified ? '✅ Verified' : '⏳ Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Email Verification */}
        {!verificationStatus.emailVerified && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-white">📧 Email Verification</h3>
            <p className="text-gray-400 text-sm mb-3">
              Enter the 6-digit code sent to your email address
            </p>
            
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-3">
              <p className="text-blue-200 text-xs">
                <strong>📧 Check your inbox:</strong> Look for an email from <strong>admin@songiq.ai</strong> with subject "🎵 songIQ - Verify Your Account"
              </p>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                placeholder="Enter email code"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={6}
              />
              
              <button
                onClick={verifyEmail}
                disabled={loading || !emailCode.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </div>
        )}

        {/* SMS Verification */}
        {!verificationStatus.smsVerified && (
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-white">📱 SMS Verification</h3>
            <p className="text-gray-400 text-sm mb-3">
              Enter the 6-digit code sent to your phone number
            </p>
            
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-3">
              <p className="text-green-200 text-xs">
                <strong>📱 Check your phone:</strong> Look for a text message from <strong>+18888923244</strong> with your 6-digit verification code
              </p>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="Enter SMS code"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                maxLength={6}
              />
              
              <button
                onClick={verifySMS}
                disabled={loading || !smsCode.trim()}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify SMS'}
              </button>
            </div>
          </div>
        )}

        {/* Resend Codes */}
        <div className="text-center space-y-3">
          <button
            onClick={resendCodes}
            disabled={loading}
            className="text-orange-400 hover:text-orange-300 disabled:text-gray-500 text-sm font-medium transition duration-200 disabled:cursor-not-allowed"
          >
            Didn't receive codes? Resend
          </button>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">💡 Verification Tips:</h4>
            <ul className="text-xs text-gray-400 space-y-1 text-left">
              <li>• Check your spam/junk folder for the email</li>
              <li>• Make sure your phone can receive SMS messages</li>
              <li>• Codes expire in 10 minutes for security</li>
              <li>• You can resend codes if needed</li>
            </ul>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-medium">{message}</span>
            </div>
            {message.includes('Email verified') || message.includes('SMS verified') ? (
              <p className="text-sm mt-2 opacity-80">
                Great progress! {verificationStatus?.emailVerified && verificationStatus?.smsVerified 
                  ? 'Both verifications complete! Redirecting to dashboard...' 
                  : 'Continue with the other verification to complete your account setup.'}
              </p>
            ) : null}
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Skip for now (optional) */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-300 text-sm font-medium transition duration-200"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
