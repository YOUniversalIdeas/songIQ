import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, Eye, CheckCircle } from 'lucide-react';

interface AuthGateProps {
  songId: string;
  tempToken: string;
  onAuthenticated: () => void;
  songTitle?: string;
  artistName?: string;
}

const AuthGate: React.FC<AuthGateProps> = ({ 
  songId, 
  tempToken, 
  onAuthenticated, 
  songTitle = 'Your Song',
  artistName = 'Unknown Artist'
}) => {
  const navigate = useNavigate();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreateAccount = () => {
    setIsCreatingAccount(true);
    // Navigate to registration page with song context
    navigate('/auth?mode=register&songId=' + songId + '&tempToken=' + tempToken);
  };

  const handleSignIn = () => {
    // Navigate to sign in page with song context
    navigate('/auth?mode=login&songId=' + songId + '&tempToken=' + tempToken);
  };

  const handlePreviewResults = () => {
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Analysis is Ready!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We've analyzed <span className="font-semibold text-blue-600">{songTitle}</span> by <span className="font-semibold text-blue-600">{artistName}</span>
          </p>
        </div>

        {/* Song Preview Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {songTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{artistName}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Status</p>
              <p className="font-semibold text-green-600">Analysis Complete</p>
            </div>
            <div className="bg-white dark:bg-gray-600 rounded-lg p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Ready to View</p>
              <p className="font-semibold text-blue-600">Full Results</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleCreateAccount}
            disabled={isCreatingAccount}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isCreatingAccount ? 'Creating Account...' : 'Create Free Account'}</span>
          </button>

          <button
            onClick={handleSignIn}
            className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 flex items-center justify-center space-x-2"
          >
            <Eye className="w-5 h-5" />
            <span>Sign In to View Results</span>
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Why Create an Account?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">🎵</span>
              </div>
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Unlimited Analysis</h5>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Analyze as many songs as you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 text-xl font-bold">📊</span>
              </div>
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Detailed Reports</h5>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Get comprehensive insights and recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 dark:text-green-400 text-xl font-bold">💾</span>
              </div>
              <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Save & Track</h5>
              <p className="text-gray-600 dark:text-gray-400 text-xs">Keep track of all your songs and progress</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your song analysis is securely stored and ready to view
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
