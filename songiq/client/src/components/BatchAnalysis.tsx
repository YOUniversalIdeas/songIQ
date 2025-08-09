import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {

  Award,
  Download,
  Music,

  BarChart3,




  Album,
  AlertCircle,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo: number;
  loudness: number;
  key: number;
  mode: number;
}

interface SuccessScore {
  overallScore: number;
  confidence: number;
  breakdown: {
    audioFeatures: number;
    marketTrends: number;
    genreAlignment: number;
    seasonalFactors: number;
  };
  recommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number;
    implementation: string;
  }>;
  riskFactors: string[];
  marketPotential: number;
  socialScore: number;
}

interface SongData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  audioFeatures: AudioFeatures;
  successScore: SuccessScore;
  uploadDate: string;
  trackNumber?: number;
}

interface BatchAnalysisProps {
  songs: SongData[];
  albumTitle?: string;
  className?: string;
}

const BatchAnalysis: React.FC<BatchAnalysisProps> = ({ songs, albumTitle = "Album Analysis", className = '' }) => {
  const [activeView, setActiveView] = useState<'overview' | 'tracks' | 'cohesion' | 'recommendations'>('overview');
  const [isExporting, setIsExporting] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };



  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate album statistics
  const albumStats = {
    totalDuration: songs.reduce((sum, song) => sum + song.duration, 0),
    averageScore: songs.reduce((sum, song) => sum + song.successScore.overallScore, 0) / songs.length,
    averageConfidence: songs.reduce((sum, song) => sum + song.successScore.confidence, 0) / songs.length,
    averageMarketPotential: songs.reduce((sum, song) => sum + song.successScore.marketPotential, 0) / songs.length,
    averageSocialScore: songs.reduce((sum, song) => sum + song.successScore.socialScore, 0) / songs.length,
    genreDistribution: songs.reduce((acc, song) => {
      acc[song.genre] = (acc[song.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    totalRiskFactors: songs.reduce((sum, song) => sum + song.successScore.riskFactors.length, 0)
  };

  // Track progression chart data
  const trackProgressionData = {
    labels: songs.map((song, index) => `Track ${index + 1}: ${song.title}`),
    datasets: [
      {
        label: 'Success Score',
        data: songs.map(song => song.successScore.overallScore),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1
      },
      {
        label: 'Market Potential',
        data: songs.map(song => song.successScore.marketPotential),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }
    ]
  };

  const trackProgressionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: (value: any) => `${value}%`
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Genre distribution chart
  const genreDistributionData = {
    labels: Object.keys(albumStats.genreDistribution),
    datasets: [
      {
        data: Object.values(albumStats.genreDistribution),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 1
      }
    ]
  };

  const genreDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed} tracks`
        }
      }
    }
  };

  // Calculate album cohesion score
  const calculateCohesionScore = () => {
    const tempoVariance = calculateVariance(songs.map(s => s.audioFeatures.tempo));
    const energyVariance = calculateVariance(songs.map(s => s.audioFeatures.energy));
    const valenceVariance = calculateVariance(songs.map(s => s.audioFeatures.valence));
    
    // Lower variance = higher cohesion
    const tempoCohesion = Math.max(0, 100 - (tempoVariance / 100));
    const energyCohesion = Math.max(0, 100 - (energyVariance * 100));
    const valenceCohesion = Math.max(0, 100 - (valenceVariance * 100));
    
    return Math.round((tempoCohesion + energyCohesion + valenceCohesion) / 3);
  };

  const calculateVariance = (values: number[]) => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const cohesionScore = calculateCohesionScore();

  // Synthesize album-level recommendations
  const synthesizeAlbumRecommendations = () => {
    const allRecommendations = songs.flatMap(song => 
      song.successScore.recommendations.map(rec => ({
        ...rec,
        songTitle: song.title
      }))
    );

    // Find common themes across tracks
    const recommendationsByCategory = allRecommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, typeof allRecommendations>);

    // Generate album-level recommendations
    const albumRecommendations = Object.entries(recommendationsByCategory)
      .filter(([_, recs]) => recs.length >= Math.ceil(songs.length * 0.5)) // At least 50% of tracks
      .map(([category, recs]) => ({
        category,
        title: `Album-wide ${category} Improvement`,
        description: `${recs.length} out of ${songs.length} tracks show ${category.toLowerCase()} concerns`,
        priority: recs.length >= Math.ceil(songs.length * 0.7) ? 'high' as const : 'medium' as const,
        impact: Math.max(...recs.map(r => r.impact)),
        affectedTracks: recs.map(r => r.songTitle),
        count: recs.length
      }));

    return albumRecommendations;
  };

  const exportAlbumReport = async () => {
    setIsExporting(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    // In a real implementation, this would generate and download a PDF
    alert('Album analysis report exported successfully!');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{albumTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {songs.length} tracks • {formatDuration(albumStats.totalDuration)} total duration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportAlbumReport}
            disabled={isExporting}
            className="btn-secondary flex items-center space-x-2"
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* Album Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{albumStats.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{cohesionScore}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cohesion Score</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{albumStats.averageMarketPotential.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Market Potential</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{albumStats.totalRiskFactors}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Risk Factors</div>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'tracks', label: 'Track Analysis', icon: Music },
          { id: 'cohesion', label: 'Cohesion', icon: Album },
          { id: 'recommendations', label: 'Recommendations', icon: Award }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{view.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Views */}
      <div className="min-h-96">
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Track Progression Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Track Progression</h3>
              <div className="h-80">
                <Line data={trackProgressionData} options={trackProgressionOptions} />
              </div>
            </div>

            {/* Genre Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genre Distribution</h3>
                <div className="h-64">
                  <Doughnut data={genreDistributionData} options={genreDistributionOptions} />
                </div>
              </div>

              {/* Album Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Strongest Track</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {songs.reduce((max, song) => 
                        song.successScore.overallScore > max.successScore.overallScore ? song : max
                      ).title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Most Consistent</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {songs.reduce((min, song) => 
                        song.successScore.confidence > min.successScore.confidence ? song : min
                      ).title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Market Leader</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {songs.reduce((max, song) => 
                        song.successScore.marketPotential > max.successScore.marketPotential ? song : max
                      ).title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'tracks' && (
          <div className="space-y-4">
            {songs.map((song, index) => (
              <div key={song.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{song.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{song.artist}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(song.successScore.overallScore)}`}>
                      {song.successScore.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{formatDuration(song.duration)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{song.successScore.marketPotential}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Market Potential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{song.successScore.socialScore}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Social Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-600">{song.successScore.confidence}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{song.successScore.riskFactors.length}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Risk Factors</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'cohesion' && (
          <div className="space-y-6">
            {/* Cohesion Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album Cohesion Analysis</h3>
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(cohesionScore)}`}>
                  {cohesionScore}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {cohesionScore >= 80 ? 'Excellent cohesion - tracks flow well together' :
                   cohesionScore >= 60 ? 'Good cohesion - minor variations between tracks' :
                   'Low cohesion - tracks may feel disconnected'}
                </p>
              </div>
            </div>

            {/* Cohesion Factors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tempo Consistency</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(100 - (calculateVariance(songs.map(s => s.audioFeatures.tempo)) / 100))}%
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Energy Flow</h4>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(100 - (calculateVariance(songs.map(s => s.audioFeatures.energy)) * 100))}%
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Mood Consistency</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(100 - (calculateVariance(songs.map(s => s.audioFeatures.valence)) * 100))}%
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'recommendations' && (
          <div className="space-y-6">
            {/* Album-level Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Album-level Recommendations</h3>
              <div className="space-y-4">
                {synthesizeAlbumRecommendations().map((rec, index) => (
                  <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{rec.title}</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">{rec.description}</p>
                        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                          Affects {rec.count} tracks: {rec.affectedTracks.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Track-specific Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Track-specific Recommendations</h3>
              <div className="space-y-4">
                {songs.map((song) => (
                  <div key={song.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{song.title}</h4>
                    <div className="space-y-2">
                      {song.successScore.recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            rec.priority === 'high' ? 'bg-error-500' : 
                            rec.priority === 'medium' ? 'bg-warning-500' : 'bg-success-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{rec.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchAnalysis; 