import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart3, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const AnalysisPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('processing')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Initializing analysis...')

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
    // If no songId is provided, show a message or redirect
    if (!songId) {
      setAnalysisStatus('failed')
      setCurrentStep('No song selected for analysis')
      return
    }

    // Simulate analysis progress
    let currentStepIndex = 0
    const interval = setInterval(() => {
      if (progress < 100) {
        const newProgress = progress + Math.random() * 15
        setProgress(Math.min(newProgress, 100))
        
        if (newProgress > (currentStepIndex + 1) * 12.5 && currentStepIndex < analysisSteps.length - 1) {
          currentStepIndex++
          setCurrentStep(analysisSteps[currentStepIndex])
        }
      } else {
        setAnalysisStatus('completed')
        clearInterval(interval)
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate(`/dashboard/${currentSongId}`)
        }, 2000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [progress, songId, currentSongId, navigate])

  const getProgressColor = () => {
    if (analysisStatus === 'failed') return 'bg-error-600'
    if (analysisStatus === 'completed') return 'bg-success-600'
    return 'bg-primary-600'
  }

  const getStatusIcon = () => {
    switch (analysisStatus) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-success-600" />
      case 'failed':
        return <AlertCircle className="h-6 w-6 text-error-600" />
      default:
        return <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
    }
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analyzing Your Song</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Our AI is analyzing your music to provide detailed insights and success predictions.
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
                  {analysisStatus === 'completed' ? 'Analysis Complete' : 'Analysis in Progress'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {songId ? `Song ID: ${songId}` : 'No song selected'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white">Current Step</h3>
            <p className="text-gray-600 dark:text-gray-400">{currentStep}</p>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Analysis Steps</h3>
            <div className="space-y-2">
              {analysisSteps.map((step, index) => {
                const stepProgress = (index + 1) * 12.5
                const isCompleted = progress >= stepProgress
                const isCurrent = currentStep === step
                
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

          {/* Estimated Time */}
          {analysisStatus === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-blue-800 font-medium">Estimated time remaining: ~2-3 minutes</span>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {analysisStatus === 'completed' && (
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

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {analysisStatus === 'completed' && (
          <button className="btn-primary">
            View Results
          </button>
        )}
        <button className="btn-secondary">
          Back to Upload
        </button>
      </div>
    </div>
  )
}

export default AnalysisPage 