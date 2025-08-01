import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TrendingUp, BarChart3, Music, Target, Users, Globe } from 'lucide-react'

const DashboardPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  const mockAnalysisResults = {
    song: {
      title: "Demo Song",
      artist: "Demo Artist",
      duration: "3:45"
    },
    successPrediction: {
      score: 78,
      ranking: "good",
      confidence: 85,
      insights: [
        "Strong vocal performance with clear articulation",
        "Tempo aligns well with current pop trends",
        "Energy level matches successful songs in this genre",
        "Consider adding more dynamic range for impact"
      ]
    },
    audioFeatures: {
      genre: "Pop",
      subGenre: "Pop Rock",
      tempo: 128,
      key: "C#",
      mood: "energetic",
      energy: 75,
      duration: 225
    },
    marketComparison: {
      similarSongs: [
        { title: "Similar Hit 1", artist: "Artist A", similarity: 87, streams: 15000000 },
        { title: "Similar Hit 2", artist: "Artist B", similarity: 82, streams: 12000000 },
        { title: "Similar Hit 3", artist: "Artist C", similarity: 79, streams: 9000000 }
      ]
    }
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const getSuccessColor = (score: number) => {
    if (score >= 80) return 'text-success-600'
    if (score >= 60) return 'text-warning-600'
    return 'text-error-600'
  }

  const getSuccessClass = (score: number) => {
    if (score >= 80) return 'success-score high'
    if (score >= 60) return 'success-score medium'
    return 'success-score low'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600">Loading your analysis results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary-100 rounded-full">
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
        <p className="text-lg text-gray-600">
          Detailed insights and predictions for "{mockAnalysisResults.song.title}"
        </p>
      </div>

      {/* Success Score Overview */}
      <div className="card">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Success Prediction</h2>
          
          <div className="space-y-4">
            <div className={`text-6xl font-bold ${getSuccessClass(mockAnalysisResults.successPrediction.score)}`}>
              {mockAnalysisResults.successPrediction.score}%
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {mockAnalysisResults.successPrediction.ranking} Potential
              </p>
              <p className="text-gray-600">
                Confidence: {mockAnalysisResults.successPrediction.confidence}%
              </p>
            </div>
          </div>

          {/* Success Meter */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Low</span>
              <span>High</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getSuccessColor(mockAnalysisResults.successPrediction.score).replace('text-', 'bg-')}`}
                style={{ width: `${mockAnalysisResults.successPrediction.score}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Key Insights */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Key Insights</h3>
          </div>
          
          <div className="space-y-4">
            {mockAnalysisResults.successPrediction.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Features */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Music className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Audio Features</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Genre</p>
                <p className="font-medium">{mockAnalysisResults.audioFeatures.genre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sub-Genre</p>
                <p className="font-medium">{mockAnalysisResults.audioFeatures.subGenre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo</p>
                <p className="font-medium">{mockAnalysisResults.audioFeatures.tempo} BPM</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Key</p>
                <p className="font-medium">{mockAnalysisResults.audioFeatures.key}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mood</p>
                <p className="font-medium capitalize">{mockAnalysisResults.audioFeatures.mood}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Energy</p>
                <p className="font-medium">{mockAnalysisResults.audioFeatures.energy}/100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Comparison */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Globe className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Market Comparison</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Your song compares favorably to these successful tracks in the same genre:
          </p>
          
          <div className="space-y-3">
            {mockAnalysisResults.marketComparison.similarSongs.map((song, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{song.title}</p>
                  <p className="text-sm text-gray-600">{song.artist}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary-600">{song.similarity}% similar</p>
                  <p className="text-sm text-gray-600">
                    {song.streams.toLocaleString()} streams
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button className="btn-primary">
          Download Report
        </button>
        <button className="btn-secondary">
          Share Results
        </button>
      </div>
    </div>
  )
}

export default DashboardPage 