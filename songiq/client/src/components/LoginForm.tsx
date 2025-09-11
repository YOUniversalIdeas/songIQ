import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { getStoredToken } from '../utils/auth';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string, password?: string}>({});

  // Auto-focus email field on mount
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  // Redirect based on user's analysis history
  useEffect(() => {
    if (isAuthenticated) {
      // Check if user has any analysis history
      checkUserHistoryAndRedirect();
    }
  }, [isAuthenticated, navigate]);

  const checkUserHistoryAndRedirect = async () => {
    try {
      const response = await fetch('/api/user-activity/submissions', {
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`
        }
      });
      
      if (response.ok) {
        const submissions = await response.json();
        const hasCompletedAnalyses = submissions.some((submission: any) => 
          submission.status === 'completed' && submission.analysisId
        );
        
        // Check if there are pending analysis results first
        const pendingAnalysis = localStorage.getItem('songiq_pending_analysis');
        if (pendingAnalysis) {
          // Redirect to dashboard to show their analysis results
          navigate('/dashboard');
        } else if (hasCompletedAnalyses) {
          // User has analysis history, redirect to dashboard
          navigate('/dashboard');
        } else {
          // New user, redirect to upload page
          navigate('/upload');
        }
      } else {
        // On error, default to upload page for new users
        navigate('/upload');
      }
    } catch (error) {
      console.error('Error checking user history:', error);
      // On error, default to upload page for new users
      navigate('/upload');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password, rememberMe);
      // Success is handled by the useEffect above when isAuthenticated becomes true
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear field errors
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear field errors
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
    if (error) clearError();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      const form = e.target.closest('form');
      const inputs = Array.from(form?.querySelectorAll('input') || []);
      const currentIndex = inputs.indexOf(e.target);
      
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
      } else {
        form?.requestSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
        <p className="text-sm text-gray-300">
          Sign in to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={emailRef}
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              required
              autoComplete="email"
              className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                fieldErrors.email ? 'border-red-500/50' : 'border-white/20'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              required
              autoComplete="current-password"
              className={`block w-full pl-10 pr-12 py-2.5 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                fieldErrors.password ? 'border-red-500/50' : 'border-white/20'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/5 rounded-r-lg transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-300 font-medium">Sign in failed</p>
              <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </button>


      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-300">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 