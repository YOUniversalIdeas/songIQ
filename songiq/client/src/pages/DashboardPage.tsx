import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import AnalysisDashboard from '@/components/AnalysisDashboard'
import ResultsVisualization from '@/components/ResultsVisualization'

const DashboardPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const [isLoading, setIsLoading] = useState(true)

  // Sample data for demonstration
  const sampleSongData = {
    id: songId || 'demo-song-id',
    title: "Midnight Dreams",
    artist: "Demo Artist",
    genre: "pop",
    duration: 225, // 3:45 in seconds
    audioFeatures: {
      danceability: 0.75,
      energy: 0.68,
      valence: 0.62,
      acousticness: 0.15,
      instrumentalness: 0.08,
      liveness: 0.12,
      speechiness: 0.05,
      tempo: 128,
      loudness: -8.5,
      key: 1, // C#
      mode: 1 // Major
    },
    successScore: {
      overallScore: 78,
      confidence: 0.85, // 85% as decimal (0.0 to 1.0)
      breakdown: {
        audioFeatures: 82,
        marketTrends: 75,
        genreAlignment: 80,
        seasonalFactors: 70
      },
      recommendations: [
        {
          category: "Production",
          priority: "high" as const,
          title: "Enhance Dynamic Range",
          description: "Add more contrast between quiet and loud sections to increase emotional impact",
          impact: 85,
          implementation: "Work with your producer to add build-ups and drops"
        },
        {
          category: "Marketing",
          priority: "medium" as const,
          title: "Target Pop-Rock Audience",
          description: "Focus marketing efforts on listeners who enjoy energetic pop-rock",
          impact: 70,
          implementation: "Create playlists and collaborate with similar artists"
        },
        {
          category: "Release Strategy",
          priority: "low" as const,
          title: "Consider Seasonal Timing",
          description: "Release during peak listening season for maximum exposure",
          impact: 60,
          implementation: "Plan release for spring/summer when energy levels are higher"
        }
      ],
      riskFactors: [
        "Competition from established artists in the same genre",
        "Limited differentiation from current market trends"
      ],
      marketPotential: 75,
      socialScore: 72
    },
    waveformData: Array.from({ length: 1000 }, () => Math.random() * 0.5 + 0.25),
    uploadDate: new Date().toISOString()
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your analysis results...</p>
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
          Detailed insights and predictions for "{sampleSongData.title}"
        </p>
      </div>

      {/* Analysis Dashboard */}
      <AnalysisDashboard songData={sampleSongData} />

      {/* Results Visualization */}
      <ResultsVisualization songData={sampleSongData} />
    </div>
  )
}

export default DashboardPage 