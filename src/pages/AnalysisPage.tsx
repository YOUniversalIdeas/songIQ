import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart3, Loader2, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'

interface AnalysisData {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  startedAt?: string
  completedAt?: string
}

interface AnalysisResults {
  audioFeatures: {
    tempo: number
    key: string
    mode: string
    energy: number
    danceability: number
    valence: number
  }
  genre: string
  successPrediction: number
  insights: string[]
  recommendations: string[]
}

const AnalysisPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Use a default songId if none is provided
  const currentSongId = songId || 'demo-song-id'

  const analysisSteps = [
    'Initializing analysis...',
    'Extracting audio features...',
    'Analyzing musical characteristics...',
    'Processing vocal analysis...',
    'Running genre classification...',
    'Calculating success predictions...',
    'Generating insights...',
    'Finalizing results...'
  ]

  useEffect(() => {
    if (!songId) {
      setError('No song selected for analysis')
      setLoading(false)
      return
    }

    initializeAnalysis()
  }, [songId])

  const initializeAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if analysis already exists
      const statusResponse = await fetch(API_ENDPOINTS.ANALYSIS.STATUS(songId!))
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setAnalysisData(statusData)
        
        if (statusData.status === 'completed') {
          // Get results if analysis is complete
          await fetchResults()
        } else if (statusData.status === 'processing') {
          // Start polling for updates
          startPolling()
        } else {
          // Start new analysis
          await startAnalysis()
        }
      } else {
        // Start new analysis
        await startAnalysis()
      }
    } catch (err) {
      setError('Failed to initialize analysis')
      console.error('Analysis initialization error:', err)
    } finally {
      setLoading(false)
    }
  }

  const startAnalysis = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYSIS.START(songId!), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to start analysis')
      }

      const data = await response.json()
      setAnalysisData({
        status: 'processing',
        progress: 0,
        currentStep: 'Initializing analysis...',
        startedAt: new Date().toISOString()
      })

      // Start polling for updates
      startPolling()
    } catch (err) {
      setError('Failed to start analysis')
      console.error('Start analysis error:', err)
    }
  }

  const startPolling = () => {
    setIsPolling(true)
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ANALYSIS.PROGRESS(songId!))
        
        if (response.ok) {
          const data = await response.json()
          setAnalysisData(prev => ({
            ...prev!,
            progress: data.progress,
            currentStep: data.currentStep,
            status: data.status
          }))

          if (data.status === 'completed') {
            clearInterval(pollInterval)
            setIsPolling(false)
            await fetchResults()
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval)
  }

  const fetchResults = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYSIS.RESULTS(songId!))
      
      if (response.ok) {
        const data = await response.json()
        setResults(data.results)
      }
    } catch (err) {
      console.error('Fetch results error:', err)
    }
  }

  const restartAnalysis = async () => {
    setResults(null)
    setError(null)
    await initializeAnalysis()
  }

  const getProgressColor = () => {
    if (analysisData?.status === 'failed') return 'bg-error-600'
    if (analysisData?.status === 'completed') return 'bg-success-600'
    return 'bg-primary-600'
  }

  const getStatusIcon = () => {
    if (!analysisData) return <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
    
    switch (analysisData.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-success-600" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-error-600" />
      default:
        return <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-primary-100 rounded-full">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loading Analysis...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-error-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-error-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analysis Error</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={restartAnalysis}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {analysisData?.status === 'completed' ? 'Analysis Complete' : 'Analyzing Your Song'}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {analysisData?.status === 'completed' 
            ? 'Your song analysis is ready! Review the insights below.'
            : 'Our AI is analyzing your music to provide detailed insights and success predictions.'
          }
        </p>
      </div>

      {/* Progress Card */}
      <div className="card">
        <div className="space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {analysisData?.status === 'completed' ? 'Analysis Complete' : 'Analysis in Progress'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Song ID: {songId}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {analysisData?.progress || 0}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-600 dark:text-gray-400">{analysisData?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${analysisData?.progress || 0}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-600 dark:text-gray-400">{analysisData?.currentStep || 'Initializing...'}</p>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Analysis Steps</h3>
            <div className="space-y-2">
              {analysisSteps.map((step, index) => {
                const stepProgress = (index + 1) * 12.5
                const isCompleted = (analysisData?.progress || 0) >= stepProgress
                const isCurrent = analysisData?.currentStep === step
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                      ${isCompleted 
                        ? 'bg-success-100 text-success-600' 
                        : isCurrent 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-400'
                      }
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`
                      text-sm
                      ${isCompleted 
                        ? 'text-success-600 font-medium' 
                        : isCurrent 
                          ? 'text-primary-600 font-medium' 
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status Messages */}
          {analysisData?.status === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-medium">
                  {isPolling ? 'Analysis in progress...' : 'Starting analysis...'}
                </span>
              </div>
            </div>
          )}

          {analysisData?.status === 'completed' && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success-600" />
                <span className="text-success-800 font-medium">
                  Analysis completed successfully! Your results are ready.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analysis Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Features</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tempo</span>
                  <span className="font-medium">{results.audioFeatures.tempo} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Key</span>
                  <span className="font-medium">{results.audioFeatures.key} {results.audioFeatures.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Energy</span>
                  <span className="font-medium">{(results.audioFeatures.energy * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Danceability</span>
                  <span className="font-medium">{(results.audioFeatures.danceability * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Valence</span>
                  <span className="font-medium">{(results.audioFeatures.valence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Genre</span>
                  <span className="font-medium">{results.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Success Prediction</span>
                  <span className="font-medium text-success-600">{results.successPrediction}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {analysisData?.status === 'completed' && (
          <button 
            onClick={() => navigate(`/dashboard/${songId}`)}
            className="btn-primary"
          >
            View Dashboard
          </button>
        )}
        <button 
          onClick={() => navigate('/upload')}
          className="btn-secondary"
        >
          Back to Upload
        </button>
        {analysisData?.status === 'completed' && (
          <button 
            onClick={restartAnalysis}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Re-analyze</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default AnalysisPage
