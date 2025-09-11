import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { RealAudioFeatures } from '../utils/audioAnalysis'
import { SuccessPrediction } from '../services/mlSuccessPredictor'

const AnalysisPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('Initializing analysis...')
  const [analysisData, setAnalysisData] = useState<{
    audioFeatures: RealAudioFeatures | null
    successPrediction: SuccessPrediction | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progressFlowTriggered, setProgressFlowTriggered] = useState(false)
  const progressFlowRunning = useRef(false)




  const startProgressFlow = (analysisResults: any) => {
    if (progressFlowRunning.current) {
      return
    }
    
    progressFlowRunning.current = true
    setAnalysisStatus('processing')
    setProgress(0)
    setCurrentStep('Initializing analysis...')
    
    // Simulate the progress flow that the user would see
    const progressSteps = [
      { progress: 20, step: 'Extracting audio features...' },
      { progress: 50, step: 'Running machine learning analysis...' },
      { progress: 80, step: 'Finalizing results...' },
      { progress: 100, step: 'Analysis complete!' }
    ]
    
    let stepIndex = 0
    const updateProgress = () => {
      if (stepIndex < progressSteps.length) {
        const { progress: newProgress, step: newStep } = progressSteps[stepIndex]
        setProgress(newProgress)
        setCurrentStep(newStep)
        stepIndex++
        
        if (stepIndex < progressSteps.length) {
          setTimeout(updateProgress, 800) // Faster updates for better UX
        } else {
          // Show final results
          setTimeout(() => {
            // TODO: Replace with real API call to get analysis results
            // const response = await fetch(`/api/analysis/${songId}/results`);
            // const data = await response.json();
            // setAnalysisData(data);
            
            // For now, show empty state to indicate real data needed
            setAnalysisData(null)
            setAnalysisStatus('completed')
            progressFlowRunning.current = false // Reset the running flag
            
            // Automatically redirect to dashboard after a short delay
            setTimeout(() => {
              if (songId) {
                navigate(`/dashboard/${songId}`)
              }
            }, 2000) // 2 second delay to let user see completion
          }, 500)
        }
      }
    }
    
    // Start the progress flow
    setTimeout(updateProgress, 300)
  }

  const startAnalysisProcess = () => {
    
    setAnalysisStatus('processing')
    setProgress(0)
    setCurrentStep('Initializing analysis...')
    
    
    
    // Simulate analysis steps with progress updates
    const steps = [
      { progress: 10, step: 'Initializing audio processing...' },
      { progress: 25, step: 'Extracting audio features...' },
      { progress: 40, step: 'Analyzing waveform patterns...' },
      { progress: 55, step: 'Running AI models...' },
      { progress: 70, step: 'Processing market trends...' },
      { progress: 85, step: 'Generating insights...' },
      { progress: 95, step: 'Finalizing analysis...' },
      { progress: 100, step: 'Analysis complete!' }
    ]
    
    let currentStepIndex = 0
    
    const updateProgress = () => {
      if (currentStepIndex < steps.length) {
        const { progress: newProgress, step: newStep } = steps[currentStepIndex]
        setProgress(newProgress)
        setCurrentStep(newStep)
        currentStepIndex++
        
        if (currentStepIndex < steps.length) {
          setTimeout(updateProgress, 1500) // Update every 1.5 seconds
        } else {
          // Analysis complete, show results
          setTimeout(() => {
            setAnalysisStatus('completed')
            // TODO: Replace with real API call to get analysis results
            // const response = await fetch(`/api/analysis/${songId}/results`);
            // const data = await response.json();
            // setAnalysisData(data);
            
            // For now, show empty state to indicate real data needed
            setAnalysisData(null)
            
            // Automatically redirect to dashboard after a short delay
            setTimeout(() => {
              if (songId) {
                navigate(`/dashboard/${songId}`)
              }
            }, 2000) // 2 second delay to let user see completion
          }, 1000)
        }
      }
    }
    
    // Start the progress updates
    setTimeout(updateProgress, 500)
  }

  // Check if we have analysis results from navigation state
  useEffect(() => {
    
    // Reset progress flow flag when song ID changes
    if (songId && progressFlowTriggered) {
      setProgressFlowTriggered(false)
    }
    
    // Don't override the processing state if we're intentionally showing progress bars
    if (analysisStatus === 'processing') {
      return
    }
    
    if (location.state?.analysisResults) {
      // Check if we should trigger the progress flow
      if (location.state?.triggerProgressFlow && !progressFlowTriggered) {
        
        // Set flag to prevent re-triggering
        setProgressFlowTriggered(true)
        
        // Start progress flow using the dedicated function
        startProgressFlow(location.state.analysisResults)
      } else if (location.state?.triggerProgressFlow && progressFlowTriggered) {
      } else {
        // Direct completion without progress flow
        setAnalysisData(location.state.analysisResults)
        setProgress(100)
        setCurrentStep('Analysis completed')
        setAnalysisStatus('completed')
      }
    } else if (location.state?.isNewUpload) {
      // Start analysis process for new upload
      startAnalysisProcess()
    } else {
      // Try to fetch existing results
      fetchExistingResults()
    }
  }, [location.state, songId])

  // Cleanup effect to reset progress flow flag
  useEffect(() => {
    return () => {
      setProgressFlowTriggered(false)
      progressFlowRunning.current = false
    }
  }, [])

  const fetchExistingResults = async () => {
    if (!songId) {
      // No song ID means we're showing the empty state - this is not a failure
      setAnalysisStatus('pending')
      setCurrentStep('No song selected for analysis')
      return
    }

    try {
      const response = await fetch(`/api/analysis/results/${songId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Transform API data to match expected structure
          const transformedData = {
            audioFeatures: data.results.audioFeatures || null,
            successPrediction: {
              score: data.results.successPrediction?.score || 0,
              confidence: data.results.successPrediction?.confidence || 0,
              factors: data.results.successPrediction?.factors || [],
              marketPotential: 75, // Default value
              socialScore: 80, // Default value
              genreAlignment: 85, // Default value
              seasonalFactors: 70, // Default value
              recommendations: data.results.recommendations?.map((rec: string) => ({
                category: 'marketing' as const,
                title: rec,
                description: rec,
                priority: 'medium' as const,
                impact: 75,
                implementation: 'Consider implementing this recommendation',
                estimatedROI: 2.5
              })) || [],
              riskAssessment: {
                overallRisk: 'low' as const,
                riskScore: 20,
                riskFactors: ['Market competition', 'Genre saturation'],
                mitigationStrategies: ['Focus on unique sound', 'Target niche audience']
              }
            }
          }
          setAnalysisData(transformedData)
          setProgress(100)
          setCurrentStep('Analysis completed')
          setAnalysisStatus('completed')
        } else {
          // If no results, show pending state
          setAnalysisStatus('pending')
          setCurrentStep('No analysis found for this song')
        }
      } else {
        setAnalysisStatus('pending')
        setCurrentStep('No analysis found for this song')
      }
    } catch (err) {
      console.error('Error fetching results:', err)
      setAnalysisStatus('pending')
      setCurrentStep('No analysis found for this song')
    }
  }

  if (analysisStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">🧠 AI-Powered Song Analysis</h1>
            <p className="text-xl text-gray-300 mb-6">
              Get deep insights into your song's potential, audience appeal, and market positioning.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Upload your song to unlock AI analysis that reveals how to maximize your music's success in the industry.
            </p>
            
            {/* Analysis benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">🎯 Industry Insights</h3>
                <p className="text-gray-300 text-sm">
                  Understand how your song fits into current industry trends and audience preferences
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">🚀 Success Strategy</h3>
                <p className="text-gray-300 text-sm">
                  Get actionable recommendations to improve your song's market potential and viral appeal
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
              

              <button
                onClick={startAnalysisProcess}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Demo Analysis Process</span>
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

  if (analysisStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Analyzing Your Song...</h1>
            <p className="text-xl text-gray-300 mb-8">
              Our AI is processing your audio and generating comprehensive insights
            </p>
            
            {/* Progress Bar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Analysis Progress</span>
                  <span className="text-blue-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Current Step */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 bg-white/5 rounded-xl px-6 py-4">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">{currentStep}</span>
                </div>
              </div>
            </div>
            
            {/* Analysis Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 ${
                progress >= 20 ? 'bg-white/20' : 'bg-white/10'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  progress >= 20 ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {progress >= 20 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">1</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Audio Processing</h3>
                <p className="text-gray-300 text-sm">
                  Extracting audio features and analyzing waveform patterns
                </p>
              </div>
              
              <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 ${
                progress >= 60 ? 'bg-white/20' : 'bg-white/10'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  progress >= 60 ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {progress >= 60 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">2</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-gray-300 text-sm">
                  Running machine learning models and trend analysis
                </p>
              </div>
              
              <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 ${
                progress >= 100 ? 'bg-white/20' : 'bg-white/10'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  progress >= 100 ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  {progress >= 100 ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span className="text-white font-bold">3</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Results Generation</h3>
                <p className="text-gray-300 text-sm">
                  Compiling insights and creating your analysis report
                </p>
              </div>
            </div>
            
            {/* Estimated Time */}
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-gray-300">
                Estimated completion time: <span className="text-blue-400 font-semibold">2-3 minutes</span>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This analysis uses advanced AI models to provide comprehensive insights
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (analysisStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Analysis Failed</h1>
            <p className="text-xl text-gray-300 mb-4">{error}</p>
            <p className="text-lg text-gray-400 mb-8">
              Don't worry! Analysis failures are common and usually easy to fix. Let's get your song analyzed so you can unlock your insights.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Loader2 className="w-24 h-24 text-blue-400 animate-spin mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Loading Analysis...</h1>
            <p className="text-xl text-gray-300 mb-4">Please wait while we load your analysis results.</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-white mb-4">Debug Info</h3>
              <div className="text-left text-sm text-gray-300 space-y-2">
                <p>Song ID: {songId || 'undefined'}</p>
                <p>Analysis Status: {analysisStatus}</p>
                <p>Progress: {progress}%</p>
                <p>Current Step: {currentStep}</p>
                <p>Has Location State: {location.state ? 'Yes' : 'No'}</p>
                <p>Location State Keys: {location.state ? Object.keys(location.state).join(', ') : 'None'}</p>
                {location.state?.analysisResults && (
                  <p>Analysis Results Keys: {Object.keys(location.state.analysisResults).join(', ')}</p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Analysis Complete!
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your song has been analyzed using advanced AI and machine learning algorithms
          </p>
        </div>

        {/* Success Score Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Success Prediction</h2>
            <p className="text-gray-300">AI-powered analysis of your song's commercial potential</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {analysisData.successPrediction?.score || 0}%
              </div>
              <div className="text-gray-300">Success Score</div>
              <div className="text-sm text-gray-400 mt-2">
                Confidence: {((analysisData.successPrediction?.confidence || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {analysisData.successPrediction?.marketPotential || 0}%
              </div>
              <div className="text-gray-300">Market Potential</div>
              <div className="text-sm text-gray-400 mt-2">
                Based on genre trends
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {analysisData.successPrediction?.socialScore || 0}%
              </div>
              <div className="text-gray-300">Social Score</div>
              <div className="text-sm text-gray-400 mt-2">
                Viral potential
              </div>
            </div>
          </div>

          {/* Success Factors */}
          {analysisData.successPrediction?.factors && analysisData.successPrediction.factors.length > 0 ? (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Key Success Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisData.successPrediction.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Key Success Factors</h3>
              <p className="text-gray-300 text-center">No specific success factors identified.</p>
            </div>
          )}
        </div>

        {/* Audio Features Analysis */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Audio Features Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Danceability</div>
              <div className="text-2xl font-bold text-blue-400">
                {((analysisData.audioFeatures?.danceability || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Energy</div>
              <div className="text-2xl font-bold text-green-400">
                {((analysisData.audioFeatures?.energy || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Tempo</div>
              <div className="text-2xl font-bold text-purple-400">
                {analysisData.audioFeatures?.tempo ? analysisData.audioFeatures.tempo.toFixed(0) : '0'} BPM
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Key</div>
              <div className="text-2xl font-bold text-yellow-400">
                {analysisData.audioFeatures?.key} {analysisData.audioFeatures?.mode}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Valence</div>
              <div className="text-2xl font-bold text-pink-400">
                {((analysisData.audioFeatures?.valence || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Acousticness</div>
              <div className="text-2xl font-bold text-indigo-400">
                {((analysisData.audioFeatures?.acousticness || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Instrumentalness</div>
              <div className="text-2xl font-bold text-orange-400">
                {((analysisData.audioFeatures?.instrumentalness || 0) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-1">Duration</div>
              <div className="text-2xl font-bold text-red-400">
                {Math.floor((analysisData.audioFeatures?.duration || 0) / 60)}:
                {String((analysisData.audioFeatures?.duration || 0) % 60).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        {analysisData.successPrediction?.riskAssessment ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Risk Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-4 h-4 rounded-full ${
                    (analysisData.successPrediction?.riskAssessment?.overallRisk || 'low') === 'low' ? 'bg-green-400' :
                    (analysisData.successPrediction?.riskAssessment?.overallRisk || 'low') === 'medium' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}></div>
                  <span className="text-lg font-semibold text-white capitalize">
                    {analysisData.successPrediction?.riskAssessment?.overallRisk || 'low'} Risk
                  </span>
                  <span className="text-gray-400">
                    ({analysisData.successPrediction?.riskAssessment?.riskScore || 20}/100)
                  </span>
                </div>
                
                <div className="space-y-2">
                  {analysisData.successPrediction?.riskAssessment?.riskFactors?.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-gray-300">{factor}</span>
                    </div>
                  )) || <span className="text-gray-400">No risk factors identified</span>}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Mitigation Strategies</h3>
                <div className="space-y-2">
                  {analysisData.successPrediction?.riskAssessment?.mitigationStrategies?.map((strategy, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">{strategy}</span>
                    </div>
                  )) || <span className="text-gray-400">No mitigation strategies available</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Risk Assessment</h2>
            <p className="text-gray-300 text-center">Risk assessment not available for this analysis.</p>
          </div>
        )}

        {/* Recommendations */}
        {analysisData.successPrediction?.recommendations && analysisData.successPrediction.recommendations.length > 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">AI Recommendations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisData.successPrediction.recommendations.map((rec, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (rec.priority || 'medium') === 'high' ? 'bg-red-600 text-white' :
                      (rec.priority || 'medium') === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {(rec.priority || 'medium').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      Impact: {rec.impact || 75}%
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{rec.title || 'Recommendation'}</h3>
                  <p className="text-gray-300 text-sm mb-3">{rec.description || 'No description available'}</p>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Implementation:</span>
                      <span className="text-gray-300 ml-2">{rec.implementation || 'Consider implementing this recommendation'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Estimated ROI:</span>
                      <span className="text-green-400 ml-2">{rec.estimatedROI || 2.5}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">AI Recommendations</h2>
            <p className="text-gray-300 text-center">No specific recommendations available at this time.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={() => navigate(`/dashboard/${songId}`)}
            className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl mr-4"
          >
            View Full Dashboard
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Analyze Another Song
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnalysisPage 