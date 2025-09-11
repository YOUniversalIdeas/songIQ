import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const AuthGateTest: React.FC = () => {
  const navigate = useNavigate();
  const [testState, setTestState] = useState<any>(null);

  const triggerAuthGate = () => {
    console.log('🧪 AuthGateTest: Triggering auth gate');
    const testData = {
      songId: 'test-123',
      tempAccessToken: 'test-token',
      requiresAccount: true,
      song: { title: 'Test Song', artist: 'Test Artist' },
      analysis: {},
      audioFeatures: {}
    };
    setTestState(testData);
    console.log('🧪 AuthGateTest: State set to:', testData);
  };

  const clearState = () => {
    console.log('🧪 AuthGateTest: Clearing state');
    setTestState(null);
  };

  // If we have test state that requires account creation, show the auth gate
  if (testState && 'requiresAccount' in testState && testState.requiresAccount) {
    console.log('🎯 AuthGateTest: Auth gate rendering condition met!');
    console.log('🎯 AuthGateTest: Test state:', testState);
    console.log('🎯 AuthGateTest: requiresAccount value:', testState.requiresAccount);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">🧪 TEST: Auth Gate Working!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your song "{testState.song?.title || 'Your Song'}" by {testState.song?.artist || 'Unknown Artist'} has been analyzed successfully.
          </p>
          <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-6 mb-8">
            <p className="text-blue-300 text-lg">
              Create a free account to view your detailed analysis results, success predictions, and personalized recommendations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-colors duration-200 border border-white/30"
            >
              Sign In to View Results
            </button>
          </div>
          <button
            onClick={clearState}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200"
          >
            Clear State (Go Back to Test)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">🧪 Auth Gate Test Component</h1>
        <p className="text-xl text-gray-300 mb-8">
          This is a simple test to see if the auth gate rendering logic works in isolation.
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Current State</h3>
          <div className="text-left text-sm text-gray-300 space-y-2">
            <p><strong>testState:</strong> {testState ? 'EXISTS' : 'NULL'}</p>
            <p><strong>requiresAccount:</strong> {testState && 'requiresAccount' in testState ? testState.requiresAccount : 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={triggerAuthGate}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors duration-200 shadow-lg block w-full"
          >
            🧪 Trigger Auth Gate
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg block w-full"
          >
            Go Back to Upload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthGateTest;
