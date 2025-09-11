import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Music, FileText, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react'
import RealAudioAnalyzer from '../utils/audioAnalysis'
import MLSuccessPredictor from '../services/mlSuccessPredictor'
import { RealAudioFeatures } from '../utils/audioAnalysis'
import { SuccessPrediction } from '../services/mlSuccessPredictor'
import { useAuth } from '../components/AuthProvider'
import { getStoredToken } from '../utils/auth'
import { API_ENDPOINTS } from '../config/api'

const UploadPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, token, refreshUserData, updateSongCount } = useAuth()
  const [uploadType, setUploadType] = useState<'song' | 'lyrics'>('song')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: ''
  })
  const [lyricsText, setLyricsText] = useState('')
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
  } | {
    lyricsAnalysis: any;
    songInfo: {
      title: string;
      artist: string;
      genre: string;
    };
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [refreshingSubscription, setRefreshingSubscription] = useState(false)
  
  // Add a ref to track if we're showing the auth gate
  const authGateActive = useRef(false)

  // Function to manually refresh subscription data
  const handleRefreshSubscription = async () => {
    setRefreshingSubscription(true);
    try {
      const response = await fetch('/api/auth/refresh-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Refresh user data to get the updated subscription info
        await refreshUserData();
        alert('Subscription data refreshed successfully! Your credits should now be updated.');
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Error refreshing subscription:', errorData);
        alert('Error refreshing subscription: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      alert('Error refreshing subscription: ' + error);
    } finally {
      setRefreshingSubscription(false);
    }
  };

  // Handle Stripe checkout return (redirect to dashboard for upgrade success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgrade = urlParams.get('upgrade');
    const sessionId = urlParams.get('session_id');
    
    if (upgrade === 'success' && sessionId) {
      // Redirect to dashboard to handle the upgrade success
      navigate('/dashboard?upgrade=success&session_id=' + sessionId);
    } else if (upgrade === 'cancelled') {
      setError('Payment was cancelled. You can try again anytime.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);
  
  // Add a render counter to prevent infinite loops
  const renderCount = useRef(0)
  
  // Track timeouts for cleanup
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set())

  // Real song ID from the database for testing
  const realSongId = '68a87acf857a02c02211c8de'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const audioAnalyzer = new RealAudioAnalyzer()
  const mlPredictor = new MLSuccessPredictor()

  // Cleanup effect to clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // Helper function to track timeouts
  const createTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeoutRefs.current.delete(timeout);
      callback();
    }, delay);
    timeoutRefs.current.add(timeout);
    return timeout;
  };

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
      
      // Clear lyrics text when file is selected
      if (uploadType === 'lyrics') {
        setLyricsText('')
      }
      
      // Auto-fill title from filename if not already set
      if (!formData.title) {
        setFormData(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '')
        }))
      }
      
      // Validate file type
      if (uploadType === 'song') {
        const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/aac']
        if (!validAudioTypes.includes(file.type)) {
          setError('Please select a valid audio file (MP3, WAV, FLAC, M4A, AAC)')
          setUploadedFile(null)
          return
        }
      } else {
        const validTextTypes = ['text/plain', 'application/pdf', 'text/plain']
        if (!validTextTypes.includes(file.type)) {
          setError('Please select a valid text file (TXT, LRC, SRT)')
          setUploadedFile(null)
          return
        }
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLyricsTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyricsText(event.target.value)
    // Clear file selection when text is entered
    if (event.target.value && uploadedFile) {
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Lyrics analysis function
  const analyzeLyrics = async (text: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        // Basic lyrics analysis
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0)
        const lines = text.split('\n').filter(line => line.trim().length > 0)
        const verses = text.split('\n\n').filter(verse => verse.trim().length > 0)
        
        // Calculate basic metrics
        const wordCount = words.length
        const lineCount = lines.length
        const verseCount = verses.length
        const avgWordsPerLine = wordCount / lineCount
        const avgLinesPerVerse = lineCount / verseCount
        
        // Analyze sentiment (basic keyword-based)
        const positiveWords = ['love', 'happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'great', 'fantastic', 'excellent', 'perfect']
        const negativeWords = ['hate', 'sad', 'pain', 'hurt', 'broken', 'terrible', 'awful', 'horrible', 'bad', 'wrong']
        
        const positiveCount = words.filter(word => positiveWords.includes(word)).length
        const negativeCount = words.filter(word => negativeWords.includes(word)).length
        const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral'
        const sentimentScore = (positiveCount - negativeCount) / wordCount
        
        // Analyze repetition (chorus detection)
        const wordFreq: { [key: string]: number } = {}
        words.forEach(word => {
          wordFreq[word] = (wordFreq[word] || 0) + 1
        })
        
        const repeatedWords = Object.entries(wordFreq)
          .filter(([_, count]) => count > 1)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
        
        // Calculate complexity metrics
        const uniqueWords = new Set(words).size
        const vocabularyDiversity = uniqueWords / wordCount
        
        // Generate analysis results
        const analysis = {
          wordCount,
          lineCount,
          verseCount,
          avgWordsPerLine: Math.round(avgWordsPerLine * 100) / 100,
          avgLinesPerVerse: Math.round(avgLinesPerVerse * 100) / 100,
          sentiment,
          sentimentScore: Math.round(sentimentScore * 100) / 100,
          vocabularyDiversity: Math.round(vocabularyDiversity * 100) / 100,
          repeatedWords: repeatedWords.slice(0, 5),
          complexity: vocabularyDiversity > 0.7 ? 'high' : vocabularyDiversity > 0.4 ? 'medium' : 'low'
        }
        
        resolve(analysis)
      } catch (error) {
        reject(new Error('Failed to analyze lyrics text'))
      }
    })
  }

  const handleUpload = async () => {
    
    // Force re-validate token if it exists
    if (token) {
      try {
        const response = await fetch(API_ENDPOINTS.AUTH.PROFILE, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          // Don't logout on upload errors - just show the error
          console.error('Upload failed with status:', response.status);
          const errorData = await response.json();
          throw new Error(`Server error: ${response.status} ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        // Don't logout on network errors - just show the error
        console.error('Upload request failed:', error);
        throw error;
      }
    }
    
    if (!uploadedFile) {
      setError('Please select a file to upload')
      return
    }

    // Check if user can analyze another song
    if (isAuthenticated && user && user.remainingSongs !== undefined && user.remainingSongs <= 0) {
      setError('You have reached your song analysis limit. Please upgrade your plan to analyze more songs.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisProgress(0)
    setUploadStatus('Starting analysis...')

    try {
      if (uploadType === 'song') {
        // Audio analysis flow
        // Step 1: Real-time audio analysis
        setAnalysisProgress(10)
        setUploadStatus('Analyzing audio features...')
        
        // Longer delay to ensure progress bars are visible
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const audioFeatures = await audioAnalyzer.analyzeAudioFile(uploadedFile);
        
        setAnalysisProgress(30)
        setUploadStatus('Running ML success prediction...')
        
        // Longer delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 2: ML success prediction
        const successScore = await mlPredictor.predictSuccess(audioFeatures, 'Pop');
        
        setAnalysisProgress(60)
        setUploadStatus('Preparing results...')
        
        // Longer delay to ensure progress bars are visible
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Send to server for storage
        setAnalysisProgress(70);
        setUploadStatus('Uploading to server and finalizing analysis...');
        
        const uploadFormData = new FormData();
        uploadFormData.append('audioFile', uploadedFile);
        uploadFormData.append('title', formData.title || uploadedFile.name.replace(/\.[^/.]+$/, ''));
        uploadFormData.append('artist', formData.artist || 'Unknown Artist');
        uploadFormData.append('isReleased', 'false');
        uploadFormData.append('genre', 'Pop'); // Will be detected by analysis
        uploadFormData.append('duration', audioFeatures.duration.toString()); // Add duration from client analysis
        
        // Add user info if available (for song tracking without full auth)
        if (user && user.id) {
          uploadFormData.append('userId', user.id);
        }

        // Use the authenticated upload endpoint
        const endpoint = '/api/songs/upload';

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = createTimeout(() => controller.abort(), 30000); // 30 second timeout

        // Include authentication headers
        const headers: HeadersInit = {
          'Authorization': `Bearer ${getStoredToken()}`
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: uploadFormData,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        setAnalysisProgress(90);
        setUploadStatus('Processing results...');
        
        // Delay to show 90% progress
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Handle authentication flow based on user status
        if (!isAuthenticated) {
          // Unauthenticated user - show auth gate
          if (result.data?.requiresAccount) {
            // Store analysis results in localStorage for after account creation
            const analysisDataToStore = {
              analysisResults: {
                audioFeatures,
                successPrediction: successScore
              },
              songInfo: {
                title: formData.title || uploadedFile.name.replace(/\.[^/.]+$/, ''),
                artist: formData.artist || 'Unknown Artist',
                genre: 'Pop' // Will be detected by analysis
              },
              songId: result.data?.song?.id || result.data?.songId || realSongId
            };
            localStorage.setItem('songiq_pending_analysis', JSON.stringify(analysisDataToStore));
            
            setAnalysisResults(result.data);
            setAnalysisProgress(100);
            setUploadStatus('Analysis complete! Account required to view results.');
          } else {
            throw new Error('Unexpected server response');
          }
        } else if (isAuthenticated) {
          // Authenticated user - navigate to dashboard page
          setAnalysisResults({
            audioFeatures,
            successPrediction: successScore
          });
          
          setAnalysisProgress(100);
          setUploadStatus('Analysis complete!');
          
          // Update song count using the new endpoint
          try {
            if (user && user.id) {
              const response = await fetch(`/api/songs/count?userId=${user.id}`);
              if (response.ok) {
                const data = await response.json();
                
                // Update the song count in the auth state
                updateSongCount(data.count);
              }
            }
          } catch (error) {
          }
          
          // Wait a moment to show completion, then navigate to dashboard
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Scroll to top before navigation for better UX
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          
          // Use the actual song ID from the server response
          const actualSongId = result.data?.song?.id || result.data?.songId || realSongId;
          navigate(`/dashboard/${actualSongId}`, { 
            state: { 
              analysisResults: {
                audioFeatures,
                successPrediction: successScore
              },
              songInfo: {
                title: formData.title || uploadedFile.name.replace(/\.[^/.]+$/, ''),
                artist: formData.artist || 'Unknown Artist',
                genre: 'Pop' // Will be detected by analysis
              },
              triggerProgressFlow: true
            }
          });
        } else {
          // This should not happen since we check !isAuthenticated above
          throw new Error('Unexpected authentication state');
        }
      } else {
        // Lyrics analysis flow
        setAnalysisProgress(10)
        setUploadStatus('Reading lyrics content...')
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAnalysisProgress(30)
        setUploadStatus('Analyzing lyrics content...')
        
        let lyricsContent = '';
        if (uploadedFile) {
          // Read from file
          const reader = new FileReader();
          lyricsContent = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(uploadedFile);
          });
        } else if (lyricsText) {
          // Use text input
          lyricsContent = lyricsText;
        } else {
          throw new Error('Please provide lyrics text or upload a file');
        }
        
        const lyricsAnalysis = await analyzeLyrics(lyricsContent);
        
        setAnalysisProgress(60)
        setUploadStatus('Processing analysis results...')
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setAnalysisProgress(90)
        setUploadStatus('Finalizing results...')
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store lyrics analysis results
        setAnalysisResults({
          lyricsAnalysis,
          songInfo: {
            title: formData.title || uploadedFile?.name.replace(/\.[^/.]+$/, '') || 'Unknown',
            artist: formData.artist || 'Unknown Artist',
            genre: formData.genre || 'Unknown'
          }
        });
        
        setAnalysisProgress(100);
        setUploadStatus('Lyrics analysis complete!');
      }

    } catch (err) {
      let errorMessage = 'Unknown error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timeout: The upload took too long. Please try again.';
        } else if (err.message === 'Failed to fetch') {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
        } else if (err.message.includes('Server error:')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(`Audio analysis failed: ${errorMessage}`);
      setUploadStatus('Analysis failed');
    } finally {
      // Don't set isAnalyzing to false here - let the UI handle it
      // The progress bars should remain visible until results are shown
    }
  }

  const resetUpload = () => {
    // Don't reset if we're showing the auth gate
    if (authGateActive.current || (analysisResults && 'requiresAccount' in analysisResults && analysisResults.requiresAccount)) {
      return;
    }
    
    setUploadedFile(null)
    setFormData({
      title: '',
      artist: '',
      genre: ''
    })
    setLyricsText('')
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-start justify-center pt-4">
        <div className="max-w-2xl mx-auto px-4 text-center">
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
                    // Try React Router first
                    try {
                      navigate('/auth?mode=register');
                    } catch (error) {
                      // Fallback: Force navigation with window.location
                      setTimeout(() => {
                        window.location.href = '/auth?mode=register';
                      }, 100);
                    }
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
      <div className="max-w-6xl mx-auto px-4">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Upload Your Music
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get instant AI-powered analysis and success predictions
          </p>
        </div>

        {/* Main Upload Section - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Side - Upload Type & File Upload */}
          <div className="space-y-6">
            {/* Upload Type Selector */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setUploadType('song')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    uploadType === 'song'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Audio
                </button>
                <button
                  onClick={() => setUploadType('lyrics')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                    uploadType === 'lyrics'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/20 text-gray-300 hover:bg-white/30'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Lyrics
                </button>
              </div>
              <p className="text-gray-300 text-sm">
                {uploadType === 'song' 
                  ? 'Upload audio files for comprehensive analysis'
                  : 'Upload lyrics for text-based analysis'
                }
              </p>
            </div>

            {/* File Upload Area */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                  isDragOver 
                    ? 'border-blue-400 bg-blue-400/10' 
                    : uploadedFile 
                      ? 'border-green-400 bg-green-400/10' 
                      : 'border-gray-400 hover:border-gray-300'
                }`}
              >
                {uploadedFile ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{uploadedFile.name}</p>
                      <p className="text-gray-300 text-xs">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                    >
                      Change File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {uploadType === 'song' ? 'Drop audio file here' : 'Drop lyrics file here'}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {uploadType === 'song' 
                          ? 'MP3, WAV, FLAC, M4A, AAC'
                          : 'TXT, PDF files'
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Song Information & Usage */}
          <div className="space-y-6">
            {/* Usage Warning */}
            {isAuthenticated && user && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold text-sm">Song Analysis Usage</h3>
                    <p className="text-gray-300 text-xs">
                      {user.remainingSongs !== undefined 
                        ? `You have ${user.remainingSongs} song analysis${user.remainingSongs !== 1 ? 'es' : ''} remaining${user.subscription?.plan === 'free' ? '' : ' this month'}`
                        : 'Unlimited song analysis available'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}


            {/* Song Information Form */}
            {uploadedFile && uploadType === 'song' && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Song Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Song Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-200 text-sm"
                      placeholder="Enter song title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Artist *
                    </label>
                    <input
                      type="text"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/20 transition-all duration-200 text-sm"
                      placeholder="Enter artist name"
                      required
                    />
                  </div>
                  
                  {/* Analyze Song Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleUpload}
                      disabled={isAnalyzing || !formData.title || !formData.artist}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                    >
                      {isAnalyzing ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Song'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lyrics Analysis Form */}
            {uploadType === 'lyrics' && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Analysis Form</span>
                  </h3>
                  <p className="text-blue-100 mt-2">Enter your song details and lyrics to begin analysis</p>
                </div>

                {/* Form Content */}
                <div className="p-8 space-y-6">
                  {/* Track and Artist Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Track Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter track name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="artist" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Artist Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="artist"
                          name="artist"
                          value={formData.artist}
                          onChange={handleInputChange}
                          placeholder="Enter artist name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lyrics Text Area */}
                  <div className="space-y-2">
                    <label htmlFor="lyricsText" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Lyrics Text
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <textarea
                        id="lyricsText"
                        value={lyricsText}
                        onChange={handleLyricsTextChange}
                        placeholder="Paste your lyrics here... Let the AI analyze your words and reveal hidden patterns, emotions, and insights."
                        rows={8}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      The AI will analyze sentiment, themes, complexity, and linguistic patterns in your lyrics
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">OR</span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <label htmlFor="lyricsFile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Upload Lyrics File
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <input
                        type="file"
                        id="lyricsFile"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".txt,.lrc,.srt"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Supported formats: .txt, .lrc, .srt (max 5MB)
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={handleUpload}
                      disabled={isAnalyzing || !formData.title || !formData.artist || (!lyricsText && !uploadedFile)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                    >
                      {isAnalyzing ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Lyrics'}</span>
                    </button>

                    <button
                      onClick={() => {/* Export functionality */}}
                      disabled={!analysisResults}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export to PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Why Analyze Your Lyrics Section */}
            {uploadType === 'lyrics' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700/50">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Why Analyze Your Lyrics?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Emotional Impact</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Understand the emotional resonance and sentiment of your lyrics</p>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Theme Detection</h4>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">Identify recurring themes and motifs in your songwriting</p>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Complexity Analysis</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Measure readability and linguistic complexity of your lyrics</p>
                    </div>
                  </div>
                </div>
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



        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div className="flex-1">
                <p className="text-red-300">{error}</p>
                {error.includes('song analysis limit') && (
                  <div className="mt-3">
                    <button
                      onClick={() => navigate('/pricing#pricing-plans')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      View Pricing Plans
                    </button>
                  </div>
                )}
              </div>
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

        {/* Lyrics Analysis Results */}
        {analysisResults && !isAnalyzing && 'lyricsAnalysis' in analysisResults && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Lyrics Analysis Complete!</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-blue-400 mb-2">Basic Metrics</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Word Count: {(analysisResults as any).lyricsAnalysis?.wordCount || 0}</div>
                  <div>Line Count: {(analysisResults as any).lyricsAnalysis?.lineCount || 0}</div>
                  <div>Verse Count: {(analysisResults as any).lyricsAnalysis?.verseCount || 0}</div>
                  <div>Avg Words/Line: {(analysisResults as any).lyricsAnalysis?.avgWordsPerLine || 0}</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-green-400 mb-2">Sentiment Analysis</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Overall Sentiment: <span className={`font-semibold ${
                    (analysisResults as any).lyricsAnalysis?.sentiment === 'positive' ? 'text-green-400' :
                    (analysisResults as any).lyricsAnalysis?.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{(analysisResults as any).lyricsAnalysis?.sentiment || 'neutral'}</span></div>
                  <div>Sentiment Score: {(analysisResults as any).lyricsAnalysis?.sentimentScore || 0}</div>
                  <div>Vocabulary Diversity: {(((analysisResults as any).lyricsAnalysis?.vocabularyDiversity || 0) * 100).toFixed(1)}%</div>
                  <div>Complexity: <span className={`font-semibold ${
                    (analysisResults as any).lyricsAnalysis?.complexity === 'high' ? 'text-green-400' :
                    (analysisResults as any).lyricsAnalysis?.complexity === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{(analysisResults as any).lyricsAnalysis?.complexity || 'low'}</span></div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-semibold text-purple-400 mb-2">Repetition Analysis</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="font-medium mb-2">Most Repeated Words:</div>
                  {(analysisResults as any).lyricsAnalysis?.repeatedWords?.slice(0, 3).map((word: any, index: number) => (
                    <div key={index} className="text-xs">
                      "{word[0]}" ({word[1]} times)
                    </div>
                  )) || <div className="text-xs text-gray-500">No significant repetition</div>}
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <h4 className="font-semibold text-white mb-2">Song Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
                <div><span className="font-medium">Title:</span> {(analysisResults as any).songInfo?.title || 'Unknown'}</div>
                <div><span className="font-medium">Artist:</span> {(analysisResults as any).songInfo?.artist || 'Unknown'}</div>
                <div><span className="font-medium">Genre:</span> {(analysisResults as any).songInfo?.genre || 'Unknown'}</div>
              </div>
            </div>
          </div>
        )}


        {/* Compact Features Highlight */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-white mb-6">Advanced Analysis Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Music className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Real Audio Analysis</h3>
              <p className="text-gray-300 text-xs">
                Extract tempo, key, energy, and more
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">ML Success Prediction</h3>
              <p className="text-gray-300 text-xs">
                Predict success using market data
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Smart Recommendations</h3>
              <p className="text-gray-300 text-xs">
                Get actionable insights to improve
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadPage