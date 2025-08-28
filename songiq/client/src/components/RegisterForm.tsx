import React, { useState } from 'react';
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Join songIQ to start analyzing your music
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.firstName 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="First name"
              />
            </div>
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.lastName 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Last name"
              />
            </div>
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.lastName}</p>
            )}
          </div>

          <div>
            <label htmlFor="bandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Role in the Music Industry
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="bandName"
                value={formData.bandName}
                onChange={(e) => handleInputChange('bandName', e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.bandName 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{
                  minWidth: '280px'
                }}
              >
                <option value="">Select your role...</option>
                
                {/* Primary Decision Makers */}
                <optgroup label="Primary Decision Makers">
                  <option value="A&R Representative">A&R Representative</option>
                  <option value="Record Label Executive">Record Label Executive</option>
                  <option value="Music Publisher">Music Publisher</option>
                  <option value="Artist Manager">Artist Manager</option>
                  <option value="Talent Agent/Booking Agent">Talent Agent/Booking Agent</option>
                  <option value="Music Supervisor">Music Supervisor</option>
                  <option value="Playlist Curator">Playlist Curator</option>
                  <option value="Radio Program Director">Radio Program Director</option>
                </optgroup>
                
                {/* Creative & Production */}
                <optgroup label="Creative & Production">
                  <option value="Producer">Producer</option>
                  <option value="Songwriter">Songwriter</option>
                  <option value="Composer">Composer</option>
                  <option value="Artist/Musician">Artist/Musician</option>
                  <option value="Sound Engineer">Sound Engineer</option>
                  <option value="Mixing Engineer">Mixing Engineer</option>
                </optgroup>
                
                {/* Industry Analysts & Tastemakers */}
                <optgroup label="Industry Analysts & Tastemakers">
                  <option value="Music Journalist/Critic">Music Journalist/Critic</option>
                  <option value="Music Blogger/Influencer">Music Blogger/Influencer</option>
                  <option value="DJ/Radio Host">DJ/Radio Host</option>
                  <option value="Concert Promoter">Concert Promoter</option>
                  <option value="Streaming Platform Coordinator">Streaming Platform Coordinator</option>
                </optgroup>
                
                {/* Business & Legal */}
                <optgroup label="Business & Legal">
                  <option value="Entertainment Lawyer">Entertainment Lawyer</option>
                  <option value="Business Manager">Business Manager</option>
                  <option value="Digital Marketing Specialist">Digital Marketing Specialist</option>
                  <option value="Music Distributor">Music Distributor</option>
                </optgroup>
              </select>
            </div>
            {validationErrors.bandName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.bandName}</p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.username 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Choose a username"
            />
          </div>
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.email 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
          )}
        </div>

        {/* Telephone */}
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              required
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.telephone 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Phone number"
            />
          </div>
          {validationErrors.telephone && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.telephone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.password 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              required
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                validationErrors.confirmPassword 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Error Messages */}
        {(error || Object.keys(validationErrors).length > 0) && (
          <div className="space-y-3">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}
            
            {Object.keys(validationErrors).length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                  Please fix the following errors:
                </p>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {Object.values(validationErrors).map((errorMsg, index) => (
                    errorMsg && <li key={index}>• {errorMsg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {isSuccess && Object.keys(validationErrors).length === 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Account Created Successfully! 🎉</span>
            </div>
            
            <div className="space-y-3 text-sm text-green-700 dark:text-green-300">
              <p><strong>Next Step: Verify Your Account</strong></p>
              <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-md">
                <p className="font-medium mb-2">📧 Check Your Email:</p>
                <p>We've sent a 6-digit verification code to <strong>{formData.email}</strong></p>
                
                <p className="font-medium mt-3 mb-2">📱 Check Your Phone:</p>
                <p>We've also sent a 6-digit code to <strong>{formData.telephone}</strong></p>
              </div>
              
              <p className="text-xs opacity-80">
                <strong>Important:</strong> You need to verify both email and phone to access your song analysis results.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/verify'}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Go to Verification Page →
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 