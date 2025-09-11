import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  bandName?: string; // Role in the music industry
  username?: string;
  telephone?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  // Clear success state when error occurs
  useEffect(() => {
    if (error) {
      setIsSuccess(false);
    }
  }, [error]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bandName: '',
    username: '',
    telephone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.bandName) {
      errors.bandName = 'Please select your role in the music industry';
    }
    if (!formData.telephone) {
      errors.telephone = 'Telephone is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSuccess(false); // Reset success state
    
    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
      setIsSuccess(true);
    } catch (error) {
      // Error is handled by the auth context
      setIsSuccess(false); // Ensure success is false on error
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear success state when user starts typing (indicating they're fixing errors)
    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
    if (error) clearError();
    // Clear success state when user starts typing
    if (isSuccess) {
      setIsSuccess(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-sm text-gray-300">
          Join songIQ to start analyzing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-gray-300 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
              className={`block w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                validationErrors.firstName 
                  ? 'border-red-400' 
                  : 'border-white/20'
              }`}
              placeholder="First name"
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-gray-300 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
              className={`block w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                validationErrors.lastName 
                  ? 'border-red-400' 
                  : 'border-white/20'
              }`}
              placeholder="Last name"
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.lastName}</p>
            )}
          </div>

        </div>

        {/* Role in Music Industry */}
        <div>
          <label htmlFor="bandName" className="block text-xs font-medium text-gray-300 mb-1">
            Your Role in Music Industry
          </label>
          <select
            id="bandName"
            value={formData.bandName}
            onChange={(e) => handleInputChange('bandName', e.target.value)}
            required
            className={`block w-full px-3 py-2 border rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
              validationErrors.bandName 
                ? 'border-red-400' 
                : 'border-white/20'
            }`}
          >
            <option value="">Select your role...</option>
            <option value="Artist/Musician">Artist/Musician</option>
            <option value="Producer">Producer</option>
            <option value="Songwriter">Songwriter</option>
            <option value="A&R Representative">A&R Representative</option>
            <option value="Record Label Executive">Record Label Executive</option>
            <option value="Music Publisher">Music Publisher</option>
            <option value="Artist Manager">Artist Manager</option>
            <option value="Sound Engineer">Sound Engineer</option>
            <option value="Music Journalist/Critic">Music Journalist/Critic</option>
            <option value="DJ/Radio Host">DJ/Radio Host</option>
            <option value="Other">Other</option>
          </select>
          {validationErrors.bandName && (
            <p className="mt-1 text-xs text-red-400">{validationErrors.bandName}</p>
          )}
        </div>

        {/* Username & Email */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="username" className="block text-xs font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              className={`block w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                validationErrors.username 
                  ? 'border-red-400' 
                  : 'border-white/20'
              }`}
              placeholder="Choose a username"
            />
            {validationErrors.username && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                  validationErrors.email 
                    ? 'border-red-400' 
                    : 'border-white/20'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.email}</p>
            )}
          </div>
        </div>

        {/* Telephone */}
        <div>
          <label htmlFor="telephone" className="block text-xs font-medium text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            id="telephone"
            type="tel"
            value={formData.telephone}
            onChange={(e) => handleInputChange('telephone', e.target.value)}
            required
            className={`block w-full px-3 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
              validationErrors.telephone 
                ? 'border-red-400' 
                : 'border-white/20'
            }`}
            placeholder="Phone number"
          />
          {validationErrors.telephone && (
            <p className="mt-1 text-xs text-red-400">{validationErrors.telephone}</p>
          )}
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                  validationErrors.password 
                    ? 'border-red-400' 
                    : 'border-white/20'
                }`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                  validationErrors.confirmPassword 
                    ? 'border-red-400' 
                    : 'border-white/20'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">{validationErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Error Messages */}
        {(error || Object.keys(validationErrors).length > 0) && (
          <div className="space-y-2">
            {error && (
              <div className="flex items-center space-x-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-300">
                  {error === 'User with this email already exists' 
                    ? 'An account with this email already exists. Please sign in instead.'
                    : error}
                </span>
              </div>
            )}
            
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-xs font-medium text-red-300 mb-1">
                  Please fix the following errors:
                </p>
                <ul className="text-xs text-red-300 space-y-1">
                  {Object.values(validationErrors).map((errorMsg, index) => (
                    errorMsg && <li key={index}>• {errorMsg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {isSuccess && !error && Object.keys(validationErrors).length === 0 && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Account Created Successfully! 🎉</span>
            </div>
            
            <div className="space-y-2 text-xs text-green-300">
              <p><strong>Next Step: Verify Your Account</strong></p>
              <div className="bg-green-500/20 p-2 rounded-md">
                <p className="font-medium mb-1">📧 Check Your Email:</p>
                <p>We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
                
                <p className="font-medium mt-2 mb-1">📱 Check Your Phone:</p>
                <p>We've also sent a 6-digit code to <strong>{formData.telephone}</strong></p>
              </div>
              
              <p className="text-xs opacity-80">
                <strong>Important:</strong> You need to verify both email and phone to access your song analysis results.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/verify'}
              className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              Go to Verification Page →
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-300">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 