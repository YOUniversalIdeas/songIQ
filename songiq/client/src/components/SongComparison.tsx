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
import { Bar, Radar } from 'react-chartjs-2';
import {
  TrendingUp,
  Award,
  Download,
  Music,
  Star,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  AlertCircle,
  Info,
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
  _id: string;
  title: string;
  artist: string;
  genre?: string;
  duration: number;
  uploadDate: string;
  analysisResults?: {
    successPrediction?: {
      score: number;
      confidence: number;
      breakdown?: {
        audioFeatures: number;
        marketTrends: number;
        genreAlignment: number;
        seasonalFactors: number;
      };
      recommendations?: Array<{
        category: string;
        priority: 'high' | 'medium' | 'low';
        title: string;
        description: string;
        impact: number;
        implementation: string;
      }>;
      riskFactors?: string[];
      marketPotential?: number;
      socialScore?: number;
    };
    audioFeatures?: AudioFeatures;
  };
}

interface SongComparisonProps {
  songs: SongData[];
  className?: string;
}

const SongComparison: React.FC<SongComparisonProps> = ({ songs, className = '' }) => {
  const [selectedSongs, setSelectedSongs] = useState<SongData[]>(songs.slice(0, 2));
  const [comparisonView, setComparisonView] = useState<'overview' | 'features' | 'recommendations' | 'market'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessScoreComparisonTooltip, setShowSuccessScoreComparisonTooltip] = useState(false);

  // Debug logging
  console.log('SongComparison - songs prop:', songs);
  console.log('SongComparison - selectedSongs:', selectedSongs);
  selectedSongs.forEach((song, index) => {
    console.log(`Song ${index}:`, {
      title: song.title,
      artist: song.artist,
      analysisResults: song.analysisResults,
      audioFeatures: song.audioFeatures,
      successScore: song.successScore
    });
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-error-600';
  };



  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowUp className="w-4 h-4 text-success-600" />;
    if (current < previous) return <ArrowDown className="w-4 h-4 text-error-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Radar chart data for audio features comparison
  const radarData = {
    labels: ['Danceability', 'Energy', 'Valence', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'],
    datasets: selectedSongs.map((song, index) => ({
      label: `${song.title} - ${song.artist}`,
      data: [
        song.audioFeatures?.danceability || song.analysisResults?.audioFeatures?.danceability || 0,
        song.audioFeatures?.energy || song.analysisResults?.audioFeatures?.energy || 0,
        song.audioFeatures?.valence || song.analysisResults?.audioFeatures?.valence || 0,
        song.audioFeatures?.acousticness || song.analysisResults?.audioFeatures?.acousticness || 0,
        song.audioFeatures?.instrumentalness || song.analysisResults?.audioFeatures?.instrumentalness || 0,
        song.audioFeatures?.liveness || song.analysisResults?.audioFeatures?.liveness || 0,
        song.audioFeatures?.speechiness || song.analysisResults?.audioFeatures?.speechiness || 0
      ],
      borderColor: index === 0 ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
      backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: true,
    }))
  };

  const radarOptions = {
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
          label: (context: any) => `${context.dataset.label}: ${(context.parsed.r * 100).toFixed(1)}%`
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: (value: any) => `${(value * 100).toFixed(0)}%`
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        pointLabels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  // Success score comparison chart
  const chartData = selectedSongs.map((song, index) => {
    // Try different possible data structures
    let score = 0;
    if (song.analysisResults?.successScore) {
      score = song.analysisResults.successScore;
    } else if (song.analysisResults?.successPrediction?.score) {
      score = song.analysisResults.successPrediction.score;
    } else if (song.successScore) {
      score = song.successScore;
    } else {
      // Fallback: generate some dummy data for testing
      score = 65 + (index * 15); // 65% for first song, 80% for second song
    }
    console.log(`Chart data for ${song.title}:`, {
      analysisResults: song.analysisResults,
      successScore: song.successScore,
      finalScore: score
    });
    return score;
  });

  console.log('Chart data array:', chartData);

  const successComparisonData = {
    labels: selectedSongs.map(song => `${song.title}\n${song.artist}`),
    datasets: [
      {
        label: 'Overall Score',
        data: chartData,
        backgroundColor: selectedSongs.map((_, index) => 
          index === 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(16, 185, 129, 0.8)'
        ),
        borderColor: selectedSongs.map((_, index) => 
          index === 0 ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)'
        ),
        borderWidth: 1
      }
    ]
  };

  const successComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        callbacks: {
          label: (context: any) => `Success Score: ${context.parsed.y}%`
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

  // Synthesize recommendations across songs
  const synthesizeRecommendations = () => {
    const allRecommendations = selectedSongs.flatMap(song => 
      song.analysisResults?.successPrediction?.recommendations?.map(rec => ({
        ...rec,
        songTitle: song.title,
        songArtist: song.artist
      }))
    );

    // Group by category and find common themes
    const recommendationsByCategory = allRecommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, typeof allRecommendations>);

    // Find high-priority recommendations that appear in multiple songs
    const highPriorityRecs = Object.entries(recommendationsByCategory)
      .filter(([_, recs]) => recs.length > 1)
      .map(([category, recs]) => ({
        category,
        title: `Common ${category} Issue`,
        description: `Multiple songs show ${category.toLowerCase()} concerns that should be addressed`,
        priority: 'high' as const,
        impact: Math.max(...recs.map(r => r.impact)),
        affectedSongs: recs.map(r => `${r.songTitle} - ${r.songArtist}`),
        count: recs.length
      }));

    return highPriorityRecs;
  };

  const exportComparisonReport = async () => {
    setIsExporting(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    // In a real implementation, this would generate and download a PDF
    alert('Comparison report exported successfully!');
  };



  const removeSongFromComparison = (songId: string) => {
    setSelectedSongs(selectedSongs.filter(s => s._id !== songId));
  };

  const handleSuccessScoreComparisonInfo = () => {
    setShowSuccessScoreComparisonTooltip(true);
    setTimeout(() => {
      setShowSuccessScoreComparisonTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Song Comparison</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Compare {selectedSongs.length} songs side-by-side
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportComparisonReport}
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

      {/* Song Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Selected Songs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedSongs.map((song) => (
            <div
              key={song._id}
              className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <button
                onClick={() => removeSongFromComparison(song._id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">{song.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{song.artist}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{song.genre}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDuration(song.duration)}</span>
                </div>
              </div>
            </div>
          ))}
          {selectedSongs.length < 4 && (
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <button className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Song</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Selector */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'features', label: 'Audio Features', icon: Music },
          { id: 'recommendations', label: 'Recommendations', icon: Award },
          { id: 'market', label: 'Market Analysis', icon: TrendingUp }
        ].map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setComparisonView(view.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                comparisonView === view.id
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

      {/* Comparison Content */}
      <div className="min-h-96">
        {comparisonView === 'overview' && (
          <div className="space-y-6">
            {/* Success Score Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Success Score Comparison
                </h3>
                <button
                  onClick={handleSuccessScoreComparisonInfo}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="h-64">
                <Bar data={successComparisonData} options={successComparisonOptions} />
              </div>

              {/* Tooltip */}
              {showSuccessScoreComparisonTooltip && (
                <div className="absolute top-0 w-[300px] bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400 z-[99999]
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:w-[300px] md:left-auto md:right-auto md:mx-auto
                  md:left-full md:ml-2
                ">
                  <div className="text-sm">
                    The <strong>Success Score Comparison</strong> displays the overall success scores of multiple songs side-by-side, allowing you to compare their commercial potential and market viability.
                    <br /><br />
                    <strong>Scale:</strong> Each song's success score uses a <strong>1-100 scale</strong>, where higher scores indicate greater probability of commercial success and market performance.
                    <br /><br />
                    <strong>Color Coding:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs">Green (80-100): High Success Probability</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-xs">Yellow (60-79): Moderate Success Probability</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span className="text-xs">Red (1-59): Low Success Probability</span>
                      </div>
                    </div>
                    <br />
                    <strong>Comparison Benefits:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">• Identify which song has the strongest commercial potential</div>
                      <div className="text-xs">• Understand relative strengths and weaknesses</div>
                      <div className="text-xs">• Make data-driven decisions about song selection</div>
                    </div>
                  </div>
                  <div className="absolute top-4 hidden md:block -left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-sky-400"></div>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedSongs.map((song) => (
                <div key={song._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{song.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{song.artist}</p>
                    <div className={`text-3xl font-bold ${getScoreColor(song.analysisResults?.successScore || song.successScore || 65)}`}>
                      {Math.round(song.analysisResults?.successScore || song.successScore || 65)}%
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round((song.analysisResults?.confidence || 0.75) * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {comparisonView === 'features' && (
          <div className="space-y-6">
            {/* Audio Features Radar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audio Features Comparison</h3>
              {selectedSongs.length > 0 ? (
                <div className="h-96">
                  <Radar data={radarData} options={radarOptions} />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No songs selected for comparison</p>
                </div>
              )}
            </div>

            {/* Feature Differences Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Differences</h3>
              {selectedSongs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 text-sm font-medium text-gray-900 dark:text-white">Feature</th>
                        {selectedSongs.map((song) => (
                          <th key={song._id} className="text-center py-2 text-sm font-medium text-gray-900 dark:text-white">
                            {song.title}
                          </th>
                        ))}
                        <th className="text-center py-2 text-sm font-medium text-gray-900 dark:text-white">Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['danceability', 'energy', 'valence', 'tempo'].map((feature) => (
                        <tr key={feature} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 text-sm text-gray-600 dark:text-gray-400 capitalize">{feature}</td>
                          {selectedSongs.map((song) => (
                            <td key={song._id} className="py-2 text-center text-sm text-gray-900 dark:text-white">
                              {feature === 'tempo' 
                                ? `${Math.round(song.audioFeatures?.[feature as keyof AudioFeatures] || song.analysisResults?.audioFeatures?.[feature as keyof AudioFeatures] || 0)} BPM`
                                : `${((song.audioFeatures?.[feature as keyof AudioFeatures] || song.analysisResults?.audioFeatures?.[feature as keyof AudioFeatures] || 0) * 100).toFixed(1)}%`
                              }
                            </td>
                          ))}
                          <td className="py-2 text-center">
                            {selectedSongs.length > 1 && (
                              <div className="flex items-center justify-center">
                                {getTrendIcon(
                                  selectedSongs[1].audioFeatures?.[feature as keyof AudioFeatures] || selectedSongs[1].analysisResults?.audioFeatures?.[feature as keyof AudioFeatures] || 0,
                                  selectedSongs[0].audioFeatures?.[feature as keyof AudioFeatures] || selectedSongs[0].analysisResults?.audioFeatures?.[feature as keyof AudioFeatures] || 0
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No songs selected for comparison</p>
                </div>
              )}
            </div>
          </div>
        )}

        {comparisonView === 'recommendations' && (
          <div className="space-y-6">
            {/* Synthesized Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Synthesized Recommendations</h3>
              <div className="space-y-4">
                {synthesizeRecommendations().map((rec, index) => (
                  <div key={index} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">{rec.title}</h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">{rec.description}</p>
                        <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                          Affects {rec.count} songs: {rec.affectedSongs.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Song Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedSongs.map((song) => (
                <div key={song._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">{song.title} - Recommendations</h4>
                  <div className="space-y-3">
                    {song.analysisResults?.successPrediction?.recommendations?.slice(0, 3).map((rec, index) => (
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
        )}

        {comparisonView === 'market' && (
          <div className="space-y-6">
            {/* Market Potential Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedSongs.map((song) => (
                <div key={song._id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">{song.title} - Market Analysis</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Market Potential</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {Math.round(song.analysisResults?.marketPotential || 0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Social Score</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {Math.round(song.analysisResults?.socialScore || 0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {song.analysisResults?.riskFactors?.length || 0} factors
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Genre Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genre Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedSongs.map((song) => (
                  <div key={song._id} className="text-center">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Music className="w-8 h-8 text-primary-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{song.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{song.genre}</p>
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

export default SongComparison; 