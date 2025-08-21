import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import AnalysisDashboard from '../components/AnalysisDashboard'
import ResultsVisualization from '../components/ResultsVisualization'

const DashboardPage = () => {
  const { songId } = useParams<{ songId: string }>()
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Replace with actual API call to fetch song data
  const [songData, _setSongData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSongData = async () => {
      if (!songId) {
        setError('No song ID provided')
        setIsLoading(false)
        return
      }

      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch(`/api/songs/${songId}/analysis`)
        // const data = await response.json()
        // setSongData(data)
        
        // For now, show placeholder
        setError('Song analysis data not yet implemented')
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load song analysis')
        setIsLoading(false)
      }
    }

    fetchSongData()
  }, [songId])



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading your analysis results...</p>
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
          </div>
        </div>
      </div>
    )
  }

  if (!songData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No song data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
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