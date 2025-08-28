import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Music, FileText, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import RealAudioAnalyzer from '../utils/audioAnalysis'
import MLSuccessPredictor from '../services/mlSuccessPredictor'
import { RealAudioFeatures } from '../utils/audioAnalysis'
import { SuccessPrediction } from '../services/mlSuccessPredictor'
import { useAuth } from '../components/AuthProvider'
import { API_ENDPOINTS } from '../config/api'

const UploadPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, token } = useAuth()
  const [uploadType, setUploadType] = useState<'song' | 'lyrics'>('song')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<{
    audioFeatures: RealAudioFeatures | null
    successPrediction: SuccessPrediction | null
  } | {
    songId: string;
    tempAccessToken: string;
    requiresAccount: boolean;
    song: any;
    analysis: any;
    audioFeatures: any;
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Real song ID from the database for testing
  const realSongId = '68a87acf857a02c02211c8de'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const audioAnalyzer = new RealAudioAnalyzer()
  const mlPredictor = new MLSuccessPredictor()

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect({ target: { files } } as any)
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      
      // Validate file type
      if (uploadType === 'song') {
        const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac']
        if (!validAudioTypes.includes(file.type)) {
          setError('Please select a valid audio file (MP3, WAV, FLAC, M4A, AAC)')
          setUploadedFile(null)
          return
        }
      } else {
        const validTextTypes = ['text/plain', 'application/pdf']
        if (!validTextTypes.includes(file.type)) {
          setError('Please select a valid text file (TXT, PDF)')
          setUploadedFile(null)
          return
        }
      }
    }
  }

  const handleUpload = async () => {
    console.log('🎯 handleUpload called!');
    console.log('📁 uploadedFile:', uploadedFile);
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('👤 user:', user);
    
    // Force re-validate token if it exists
    if (token) {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.log('⚠️ Token is invalid, clearing authentication state');
          localStorage.removeItem('songiq_token');
          window.location.reload(); // Force reload to reset auth state
          return;
        }
      } catch (error) {
        console.log('⚠️ Token validation failed, clearing authentication state');
        localStorage.removeItem('songiq_token');
        window.location.reload(); // Force reload to reset auth state
        return;
      }
    }
    
    if (!uploadedFile) {
      console.log('❌ No file selected');
      setError('Please select a file to upload')
      return
    }

    // Check if user can analyze another song
    if (isAuthenticated && user && user.remainingSongs !== undefined && user.remainingSongs <= 0) {
      console.log('❌ User hit song limit');
      setError('You have reached your song analysis limit for this month. Please upgrade your plan to analyze more songs.')
      return
    }

    console.log('🚀 Starting analysis process...');
    console.log('📊 Setting isAnalyzing to true...');
    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)
    setUploadStatus('Starting analysis...')
    console.log('📊 State updated, should show progress bars now');

    try {
      // Step 1: Real-time audio analysis
      console.log('📊 Step 1: Setting progress to 10%');
      setAnalysisProgress(10)
      setUploadStatus('Analyzing audio features...')
      
      // Longer delay to ensure progress bars are visible
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const audioFeatures = await audioAnalyzer.analyzeAudioFile(uploadedFile);
      console.log('✅ Audio analysis completed:', audioFeatures);
      
      console.log('📊 Step 2: Setting progress to 30%');
      setAnalysisProgress(30)
      setUploadStatus('Running ML success prediction...')
      
      // Longer delay to show progress
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: ML success prediction
      const successScore = await mlPredictor.predictSuccess(audioFeatures, 'Pop');
      console.log('✅ ML prediction completed:', successScore);
      
      console.log('📊 Step 3: Setting progress to 60%');
      setAnalysisProgress(60)
      setUploadStatus('Preparing results...')
      
      // Longer delay to ensure progress bars are visible
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Send to server for storage
      console.log('📊 Step 4: Setting progress to 70%');
      setAnalysisProgress(70);
      setUploadStatus('Uploading to server and finalizing analysis...');
      
      const formData = new FormData();
      formData.append('audioFile', uploadedFile);
      formData.append('title', uploadedFile.name.replace(/\.[^/.]+$/, ''));
      formData.append('artist', 'Unknown Artist');
      formData.append('isReleased', 'false');
      formData.append('genre', 'Pop');

      // Force unauthenticated state for upload (temporary fix)
      const forceUnauthenticated = true;
      const endpoint = forceUnauthenticated ? API_ENDPOINTS.SONGS.UPLOAD_TEMP : API_ENDPOINTS.SONGS.UPLOAD;
      
      console.log('🔗 Upload endpoint:', endpoint);
      console.log('🔐 Authentication status:', isAuthenticated);
      console.log('🔑 Token exists:', !!token);
      console.log('👤 User exists:', !!user);
      console.log('🔄 Force unauthenticated:', forceUnauthenticated);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload to server');
      }

      const result = await response.json();
      console.log('✅ Server upload successful:', result);
      
      console.log('📊 Step 5: Setting progress to 90%');
      setAnalysisProgress(90);
      setUploadStatus('Processing results...');
      
      // Delay to show 90% progress
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Force unauthenticated flow for testing
      if (forceUnauthenticated) {
        // Unauthenticated user - show auth gate
        if (result.data.requiresAccount) {
          setAnalysisResults(result.data);
          console.log('📊 Step 6: Setting progress to 100%');
          setAnalysisProgress(100);
          setUploadStatus('Analysis complete! Account required to view results.');
          // Keep progress bars visible for a longer time so user can see them
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 4000);
        } else {
          throw new Error('Unexpected server response');
        }
      } else if (isAuthenticated) {
        // Authenticated user - navigate to analysis page
        setAnalysisResults({
          audioFeatures,
          successPrediction: successScore
        });
        
        setAnalysisProgress(100);
        setUploadStatus('Analysis complete!');
        
        // Wait a moment to show completion, then navigate
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('🚀 Navigating to analysis page with results...');
        navigate(`/analysis/${realSongId}`, { 
          state: { 
            analysisResults: {
              audioFeatures,
              successPrediction: successScore
            },
            triggerProgressFlow: true
          }
        });
      } else {
        // Unauthenticated user - show auth gate
        if (result.data.requiresAccount) {
          setAnalysisResults(result.data);
          console.log('📊 Step 6: Setting progress to 100%');
          setAnalysisProgress(100);
          setUploadStatus('Analysis complete! Account required to view results.');
          // Keep progress bars visible for a longer time so user can see them
          setTimeout(() => {
            setIsAnalyzing(false);
          }, 4000);
        } else {
          throw new Error('Unexpected server response');
        }
      }

    } catch (err) {
      console.error('❌ Audio analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Audio analysis failed: ${errorMessage}. Please try again.`);
      setUploadStatus('Analysis failed');
    } finally {
      // Don't set isAnalyzing to false here - let the UI handle it
      // The progress bars should remain visible until results are shown
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setAnalysisResults(null)
    setError(null)
    setUploadProgress(0)
    setUploadStatus('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // If we have analysis results that require account creation, show the auth gate
  if (analysisResults && 'requiresAccount' in analysisResults && analysisResults.requiresAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Analysis Complete!</h1>
          <p className="text-xl text-gray-300 mb-8">
            Your song "{(analysisResults as any).song?.title || 'Your Song'}" by {(analysisResults as any).song?.artist || 'Unknown Artist'} has been analyzed successfully.
          </p>
          <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-6 mb-8">
            <p className="text-blue-300 text-lg">
              Create a free account to view your detailed analysis results, success predictions, and personalized recommendations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                  onClick={() => {
                    console.log('🔘 Create Free Account button clicked');
                    console.log('📍 Navigating to /auth?mode=register');
                    
                    // Try React Router first
                    try {
                      navigate('/auth?mode=register');
                      console.log('✅ React Router navigation attempted');
                    } catch (error) {
                      console.log('❌ React Router navigation failed:', error);
                    }
                    
                    // Fallback: Force navigation with window.location
                    setTimeout(() => {
                      console.log('🔄 Fallback: Using window.location');
                      window.location.href = '/auth?mode=register';
                    }, 100);
                  }}
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Upload Your Music
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get instant AI-powered analysis and success predictions for your songs
          </p>
        </div>

        {/* Upload Type Selector */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setUploadType('song')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                uploadType === 'song'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              <Music className="w-5 h-5 inline mr-2" />
              Audio File
            </button>
            <button
              onClick={() => setUploadType('lyrics')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                uploadType === 'lyrics'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/20 text-gray-300 hover:bg-white/30'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Lyrics
            </button>
          </div>

          <p className="text-gray-300 text-center">
            {uploadType === 'song' 
              ? 'Upload MP3, WAV, FLAC, M4A, or AAC files for comprehensive audio analysis'
              : 'Upload lyrics for text-based analysis and optimization suggestions'
            }
          </p>
        </div>

        {/* Usage Warning */}
        {isAuthenticated && user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-semibold">Song Analysis Usage</h3>
                  <p className="text-gray-300 text-sm">
                    {user.remainingSongs !== undefined 
                      ? `You have ${user.remainingSongs} song analysis${user.remainingSongs !== 1 ? 'es' : ''} remaining this month`
                      : 'Unlimited song analysis available'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-400/10' 
                : uploadedFile 
                  ? 'border-green-400 bg-green-400/10' 
                  : 'border-gray-400 hover:border-gray-300'
            }`}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{uploadedFile.name}</p>
                  <p className="text-gray-300 text-sm">File size: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">
                    {uploadType === 'song' ? 'Drop your audio file here' : 'Drop your lyrics file here'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {uploadType === 'song' 
                      ? 'or click to browse MP3, WAV, FLAC, M4A, AAC files'
                      : 'or click to browse TXT, PDF files'
                    }
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadType === 'song' ? 'audio/*' : 'text/*,.pdf'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-blue-500">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-white font-semibold">Analyzing your song...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 border border-gray-600">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-300 text-center">{uploadStatus}</p>
              <p className="text-blue-400 text-sm">Progress: {analysisProgress}%</p>
            </div>
          </div>
        )}

        {/* Debug Display */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-8">
          <div className="text-yellow-300 text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>isAnalyzing: {isAnalyzing ? 'true' : 'false'}</p>
            <p>analysisProgress: {analysisProgress}%</p>
            <p>uploadStatus: {uploadStatus}</p>
            <p>hasAnalysisResults: {analysisResults ? 'true' : 'false'}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Analysis Results Preview for Authenticated Users */}
        {analysisResults && !isAnalyzing && 'successPrediction' in analysisResults && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Analysis Complete!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Audio Features</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Danceability: {(((analysisResults as any).audioFeatures?.danceability || 0) * 100).toFixed(0)}%</div>
                  <div>Energy: {(((analysisResults as any).audioFeatures?.energy || 0) * 100).toFixed(0)}%</div>
                  <div>Tempo: {((analysisResults as any).audioFeatures?.tempo || 0).toFixed(0)} BPM</div>
                  <div>Key: {(analysisResults as any).audioFeatures?.key || 'N/A'} {(analysisResults as any).audioFeatures?.mode || ''}</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-green-400 mb-2">Success Prediction</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Success Score: {(analysisResults as any).successPrediction?.score}%</div>
                  <div>Confidence: {(((analysisResults as any).successPrediction?.confidence || 0) * 100).toFixed(0)}%</div>
                  <div>Market Potential: {(analysisResults as any).successPrediction?.marketPotential}%</div>
                  <div>Risk Level: {(analysisResults as any).successPrediction?.riskAssessment.overallRisk}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {uploadedFile && !isUploading && !isAnalyzing && (
          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={isUploading || isAnalyzing}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {uploadType === 'song' ? 'Analyze Song' : 'Upload Lyrics'}
            </button>
          </div>
        )}

        {/* Features Highlight */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Advanced Analysis Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real Audio Analysis</h3>
              <p className="text-gray-300 text-sm">
                Advanced algorithms extract real audio features including tempo, key, energy, and more
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ML Success Prediction</h3>
              <p className="text-gray-300 text-sm">
                Machine learning models predict success probability using market data and trends
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Recommendations</h3>
              <p className="text-gray-300 text-sm">
                Get actionable insights and recommendations to improve your music's success potential
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage