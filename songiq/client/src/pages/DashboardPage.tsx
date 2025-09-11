import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { TrendingUp, Upload, BarChart3, Target, Users, CheckCircle } from 'lucide-react'
import AnalysisDashboard from '../components/AnalysisDashboard'
import ResultsVisualization from '../components/ResultsVisualization'
import { API_ENDPOINTS, API_BASE_URL } from '../config/api'
import { useAuth } from '../components/AuthProvider'
import { getStoredToken } from '../utils/auth'

const DashboardPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user, refreshUserData } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const [refreshingSubscription, setRefreshingSubscription] = useState(false)

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
        alert('Subscription data refreshed successfully! Please refresh the page to see the updated credits.');
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

  // TODO: Replace with actual API call to fetch song data
  const [songData, setSongData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchMostRecentSong = async () => {
    try {
      // Check if we're in the middle of a payment upgrade - don't redirect during this
      const upgrade = searchParams.get('upgrade');
      const sessionId = searchParams.get('session_id');
      if (upgrade === 'success' && sessionId) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-activity/submissions`, {
        headers: {
          'Authorization': `Bearer ${getStoredToken()}`
        }
      })
      
      if (response.ok) {
        const submissions = await response.json()
        
        // Find the most recent completed analysis
        const mostRecentCompleted = submissions.find((submission: any) => 
          submission.status === 'completed' && submission.analysisId
        )
        
        if (mostRecentCompleted) {
          // Redirect to dashboard with the most recent song ID
          navigate(`/dashboard/${mostRecentCompleted.id}`, { replace: true })
          return
        }
        
        // If no completed analysis found, check if user has any songs at all
        if (submissions.length > 0) {
          // User has songs but no completed analysis, redirect to upload page
          navigate('/upload', { replace: true })
          return
        }
      }
      
      // If no songs at all, show empty state with upload prompt
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching most recent song:', err)
      // On error, show empty state
      setIsLoading(false)
    }
  }

  // Handle upgrade success from Stripe checkout
  useEffect(() => {
    const upgrade = searchParams.get('upgrade');
    const sessionId = searchParams.get('session_id');
    
    if (upgrade === 'success' && sessionId) {
      setUpgradeSuccess(true);
      
      // Update subscription and refresh user data with debouncing
      const updateSubscription = async () => {
        try {
          // Add a delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh user data to get updated subscription info
          // Wrap in try-catch to prevent any errors from affecting the user experience
          try {
            await refreshUserData();
            
            // Also call the manual refresh endpoint to ensure subscription data is updated
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
                // Refresh user data again to get the updated subscription info
                await refreshUserData();
              }
            } catch (manualRefreshError) {
              console.error('Error with manual subscription refresh:', manualRefreshError);
              // Don't show error to user, just log it
            }
          } catch (refreshError) {
            console.error('Error refreshing user data after payment:', refreshError);
            // Don't show error to user, just log it - the payment was successful
          }
          
          // Add another delay to ensure user data is fully processed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Clean up URL parameters
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          
          // Now that payment is complete, show success message instead of redirecting
          setIsLoading(false);
          setUpgradeSuccess(true);
        } catch (error) {
          console.error('Error updating subscription:', error);
          // Don't show error to user, just log it
        }
      };
      
      updateSubscription();
    }
  }, [searchParams, refreshUserData]);

  useEffect(() => {
    // Check if we have analysis results from navigation state first
    if (location.state?.analysisResults) {
      
      // Transform the analysis results to match what AnalysisDashboard expects
      const transformedData = {
        id: songId || 'uploaded-song',
        title: location.state.songInfo?.title || 'Your Uploaded Song',
        artist: location.state.songInfo?.artist || 'Unknown Artist',
        genre: location.state.songInfo?.genre || 'Pop',
        duration: 180, // Default duration
        uploadDate: new Date().toISOString().split('T')[0],
        audioFeatures: location.state.analysisResults.audioFeatures || {},
        waveformData: null,
        successScore: {
          overallScore: location.state.analysisResults.successPrediction?.score || 0,
          confidence: location.state.analysisResults.successPrediction?.confidence || 0,
          breakdown: {
            audioFeatures: location.state.analysisResults.audioFeatures?.energy ? Math.round(location.state.analysisResults.audioFeatures.energy * 100) : 0,
            marketTrends: 75,
            genreAlignment: 85,
            seasonalFactors: 80
          },
          recommendations: location.state.analysisResults.successPrediction?.recommendations?.map((rec: any, index: number) => ({
            category: 'general',
            priority: index === 0 ? 'high' : 'medium',
            title: rec.title || rec,
            description: rec.description || rec,
            impact: 80 - (index * 10),
            implementation: 'Immediate action recommended'
          })) || [],
          riskFactors: ['Market saturation', 'Seasonal timing'],
          marketPotential: location.state.analysisResults.successPrediction?.marketPotential || 0,
          socialScore: location.state.analysisResults.successPrediction?.score ? Math.round(location.state.analysisResults.successPrediction.score * 0.9) : 0
        }
      }
      
      setSongData(transformedData)
      setIsLoading(false)
      return
    }

    // Check for pending analysis results in localStorage (from auth gate flow)
    const pendingAnalysis = localStorage.getItem('songiq_pending_analysis')
    if (pendingAnalysis) {
      try {
        const analysisData = JSON.parse(pendingAnalysis)
        
        // Transform the analysis results to match what AnalysisDashboard expects
        const transformedData = {
          id: analysisData.songId || songId || 'uploaded-song',
          title: analysisData.songInfo?.title || 'Your Uploaded Song',
          artist: analysisData.songInfo?.artist || 'Unknown Artist',
          genre: analysisData.songInfo?.genre || 'Pop',
          duration: 180, // Default duration
          uploadDate: new Date().toISOString().split('T')[0],
          audioFeatures: analysisData.analysisResults.audioFeatures || {},
          waveformData: null,
          successScore: {
            overallScore: analysisData.analysisResults.successPrediction?.score || 0,
            confidence: analysisData.analysisResults.successPrediction?.confidence || 0,
            breakdown: {
              audioFeatures: analysisData.analysisResults.audioFeatures?.energy ? Math.round(analysisData.analysisResults.audioFeatures.energy * 100) : 0,
              marketTrends: 75,
              genreAlignment: 85,
              seasonalFactors: 80
            },
            recommendations: analysisData.analysisResults.successPrediction?.recommendations?.map((rec: any, index: number) => ({
              category: 'general',
              priority: index === 0 ? 'high' : 'medium',
              title: rec.title || rec,
              description: rec.description || rec,
              impact: 80 - (index * 10),
              implementation: 'Immediate action recommended'
            })) || [],
            riskFactors: ['Market saturation', 'Seasonal timing'],
            marketPotential: analysisData.analysisResults.successPrediction?.marketPotential || 0,
            socialScore: analysisData.analysisResults.successPrediction?.score ? Math.round(analysisData.analysisResults.successPrediction.score * 0.9) : 0
          }
        }
        setSongData(transformedData)
        setIsLoading(false)
        
        // Clear the pending analysis data since we've used it
        localStorage.removeItem('songiq_pending_analysis')
        return
      } catch (error) {
        console.error('Error parsing pending analysis data:', error)
        // Clear invalid data
        localStorage.removeItem('songiq_pending_analysis')
      }
    }

    // If no songId is provided, try to get user's most recent song
    // But don't redirect if we're showing upgrade success message
    if (!songId) {
      // Check if we're showing upgrade success - if so, don't fetch songs
      const upgrade = searchParams.get('upgrade');
      const sessionId = searchParams.get('session_id');
      if (upgrade === 'success' && sessionId) {
        setIsLoading(false);
        return;
      }
      
      fetchMostRecentSong()
      return
    }

    const fetchSongData = async () => {
      try {
        // First fetch song metadata (title, artist, duration, etc.)
        const songResponse = await fetch(`${API_BASE_URL}/api/songs/public/${songId}`)
        
        if (!songResponse.ok) {
          const errorText = await songResponse.text()
          console.error('Song API error:', songResponse.status, errorText)
          setError(`Failed to load song information (${songResponse.status}): ${errorText}`)
          setIsLoading(false)
          return
        }
        
        const songData = await songResponse.json()
        if (!songData.success) {
          setError(songData.error || 'Failed to load song information')
          setIsLoading(false)
          return
        }

        // Then fetch analysis results
        const analysisResponse = await fetch(`${API_BASE_URL}/api/analysis/results/${songId}`)
        
        if (!analysisResponse.ok) {
          const errorText = await analysisResponse.text()
          console.error('Analysis API error:', analysisResponse.status, errorText)
          setError(`Failed to load analysis results (${analysisResponse.status}): ${errorText}`)
          setIsLoading(false)
          return
        }
        
        const analysisData = await analysisResponse.json()
        if (!analysisData.success) {
          setError(analysisData.error || 'Failed to load analysis results')
          setIsLoading(false)
          return
        }

        // Transform and combine the data to match what AnalysisDashboard expects
        const transformedData = {
          id: songId,
          title: songData.data.title || `Song ${songId.slice(-6)}`,
          artist: songData.data.artist || 'Unknown Artist',
          genre: songData.data.genre || analysisData.results.genre || 'Unknown',
          duration: songData.data.duration || 180,
          uploadDate: songData.data.uploadDate ? new Date(songData.data.uploadDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          audioFeatures: analysisData.results.audioFeatures || {},
          waveformData: null, // Add missing property
          successScore: {
            overallScore: analysisData.results.successPrediction?.score || 0,
            confidence: analysisData.results.successPrediction?.confidence || 0,
            breakdown: {
              audioFeatures: analysisData.results.audioFeatures?.energy ? Math.round(analysisData.results.audioFeatures.energy * 100) : 0,
              marketTrends: 75,
              genreAlignment: analysisData.results.genre === 'Pop' ? 85 : 70,
              seasonalFactors: 80
            },
            recommendations: analysisData.results.recommendations?.map((rec: string, index: number) => ({
              category: 'general',
              priority: index === 0 ? 'high' : 'medium',
              title: rec,
              description: rec,
              impact: 80 - (index * 10),
              implementation: 'Immediate action recommended'
            })) || [],
            riskFactors: ['Market saturation', 'Seasonal timing'],
            marketPotential: analysisData.results.successPrediction?.score ? Math.round(analysisData.results.successPrediction.score * 0.8) : 0,
            socialScore: analysisData.results.successPrediction?.score ? Math.round(analysisData.results.successPrediction.score * 0.9) : 0
          }
        }
        
        // Validate that we have the minimum required data
        if (!analysisData.results.successPrediction?.score) {
          console.warn('Warning: No success prediction score found in analysis data')
          // Provide fallback data to prevent dashboard crashes
          analysisData.results.successPrediction = {
            score: 75,
            confidence: 0.8,
            factors: ['Good production quality', 'Strong musical elements']
          }
        }
        
        // Validate song metadata
        if (!songData.data.title || !songData.data.artist) {
          console.warn('Warning: Incomplete song metadata found')
        }
        
        // Ensure we have audio features
        if (!analysisData.results.audioFeatures) {
          console.warn('Warning: No audio features found in analysis data')
          analysisData.results.audioFeatures = {
            danceability: 0.7,
            energy: 0.8,
            valence: 0.6,
            acousticness: 0.2,
            instrumentalness: 0.1,
            liveness: 0.3,
            speechiness: 0.05,
            tempo: 120,
            loudness: -8.5,
            key: 5,
            mode: 1
          }
        }
        
        // Ensure we have recommendations
        if (!analysisData.results.recommendations || analysisData.results.recommendations.length === 0) {
          console.warn('Warning: No recommendations found in analysis data')
          analysisData.results.recommendations = [
            'Focus on social media marketing',
            'Consider playlist placement',
            'Target streaming platforms'
          ]
        }
            
        setSongData(transformedData)
        setIsLoading(false)
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(`Failed to load song analysis: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    fetchSongData()
  }, [songId, location.state])

  // Scroll to top when component mounts or when songData changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [songData])

  // Empty state when no song is selected, no songData, and we've checked for recent songs
  if (!songId && !songData && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">🎵 Your Analysis Dashboard</h1>
            <p className="text-xl text-gray-300 mb-6">
              Get detailed insights into your song's potential, industry positioning, and success factors.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Upload a song to unlock your personalized analysis dashboard with AI-powered insights.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Success Score</h3>
                <p className="text-gray-300 text-sm">
                  AI-powered prediction of how well your song will advance your music
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Industry Opportunity</h3>
                <p className="text-gray-300 text-sm">
                  Market analysis showing your song's potential to capture current trends
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Viral Potential</h3>
                <p className="text-gray-300 text-sm">
                  Social media analysis and audience engagement predictions
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload & Analyze Your Song</span>
              </button>
              
              <p className="text-gray-400 text-sm">
                Already have a song? <button 
                  onClick={() => navigate('/')} 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Browse your uploaded songs
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your analysis results...</p>
          {songId && (
            <p className="text-sm text-gray-500">Song ID: {songId}</p>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            {songId && (
              <p className="text-sm text-gray-500 mt-2">Song ID: {songId}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Upload New Song
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!songData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No song data available</p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Upload Song
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Upgrade Success Message */}
      {upgradeSuccess && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-green-300 mb-2">
                🎉 Subscription Upgraded Successfully!
              </h3>
              <p className="text-green-200">
                Your subscription has been upgraded and you now have access to enhanced features. 
                You can continue analyzing songs with your new plan benefits.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mr-4"
                >
                  Analyze New Song
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  View Plan Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Results</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Complete dashboard with charts and visualizations
        </p>
      </div>

      {/* AnalysisDashboard Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <AnalysisDashboard songData={songData} />
      </div>

      {/* ResultsVisualization Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Results Visualization</h2>
        <ResultsVisualization songData={songData} />
      </div>
    </div>
  )
}

export default DashboardPage 