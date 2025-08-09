import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
} from 'chart.js';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import { 
  TrendingUp, 
 
  Target, 
  Award, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Share2,
  Music,

  Users,
  Star,
  Info
} from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import generatePDFReport from './PDFReportGenerator';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
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

interface AnalysisDashboardProps {
  songData: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: number;
    audioFeatures: AudioFeatures;
    successScore: SuccessScore;
    waveformData?: number[];
    uploadDate: string;
  };
  className?: string;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ songData, className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [showOverallScoreTooltip, setShowOverallScoreTooltip] = useState(false);
  const [showMarketPotentialTooltip, setShowMarketPotentialTooltip] = useState(false);
  const [showSocialScoreTooltip, setShowSocialScoreTooltip] = useState(false);
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false);
  const [showBreakdownTooltip, setShowBreakdownTooltip] = useState(false);
  const [showMarketPotentialGaugeTooltip, setShowMarketPotentialGaugeTooltip] = useState(false);
  const [showSuccessProbabilityGaugeTooltip, setShowSuccessProbabilityGaugeTooltip] = useState(false);
  const [showSongInfoTooltip, setShowSongInfoTooltip] = useState(false);
  const [showRiskFactorsTooltip, setShowRiskFactorsTooltip] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200 dark:border-green-800';
    if (score >= 60) return 'border-yellow-200 dark:border-yellow-800';
    if (score >= 40) return 'border-orange-200 dark:border-orange-800';
    return 'border-red-200 dark:border-red-800';
  };

  // Radar chart data for audio features
  const radarData = {
    labels: [
      'Danceability',
      'Energy',
      'Valence',
      'Acousticness',
      'Instrumentalness',
      'Liveness',
      'Speechiness'
    ],
    datasets: [
      {
        label: 'Your Song',
        data: [
          songData.audioFeatures.danceability,
          songData.audioFeatures.energy,
          songData.audioFeatures.valence,
          songData.audioFeatures.acousticness,
          songData.audioFeatures.instrumentalness,
          songData.audioFeatures.liveness,
          songData.audioFeatures.speechiness
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      },
      {
        label: 'Genre Average',
        data: [0.7, 0.65, 0.6, 0.2, 0.1, 0.15, 0.08],
        backgroundColor: 'rgba(156, 163, 175, 0.2)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(156, 163, 175)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(156, 163, 175)'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgb(255, 255, 255)',
        bodyColor: 'rgb(255, 255, 255)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: 'rgb(156, 163, 175)',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        pointLabels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Helper function to get chart colors based on score
  const getChartColor = (score: number) => {
    if (score >= 80) {
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
        borderColor: 'rgb(34, 197, 94)'
      };
    } else if (score >= 60) {
      return {
        backgroundColor: 'rgba(234, 179, 8, 0.8)', // Yellow
        borderColor: 'rgb(234, 179, 8)'
      };
    } else {
      return {
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
        borderColor: 'rgb(239, 68, 68)'
      };
    }
  };

  // Success score breakdown chart
  const breakdownScores = [
    songData.successScore.breakdown.audioFeatures,
    songData.successScore.breakdown.marketTrends,
    songData.successScore.breakdown.genreAlignment,
    songData.successScore.breakdown.seasonalFactors
  ];

  const breakdownData = {
    labels: ['Audio Features', 'Market Trends', 'Genre Alignment', 'Seasonal Factors'],
    datasets: [
      {
        label: 'Score',
        data: breakdownScores,
        backgroundColor: breakdownScores.map(score => getChartColor(score).backgroundColor),
        borderColor: breakdownScores.map(score => getChartColor(score).borderColor),
        borderWidth: 1
      }
    ]
  };

  const breakdownOptions = {
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
          label: (context: any) => `${context.label}: ${context.parsed.y}/100`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Success probability gauge
  const successProbabilityScore = songData.successScore.overallScore;
  const successProbabilityColor = successProbabilityScore >= 80 
    ? { backgroundColor: 'rgba(34, 197, 94, 0.8)', borderColor: 'rgb(34, 197, 94)' } // Green
    : successProbabilityScore >= 60 
    ? { backgroundColor: 'rgba(234, 179, 8, 0.8)', borderColor: 'rgb(234, 179, 8)' } // Yellow
    : { backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgb(239, 68, 68)' }; // Red

  const successProbabilityData = {
    labels: ['Success Probability', 'Remaining'],
    datasets: [
      {
        data: [successProbabilityScore, 100 - successProbabilityScore],
        backgroundColor: [
          successProbabilityColor.backgroundColor,
          'rgba(156, 163, 175, 0.2)'
        ],
        borderColor: [
          successProbabilityColor.borderColor,
          'rgb(156, 163, 175)'
        ],
        borderWidth: 0
      }
    ]
  };

  const successProbabilityOptions = {
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
          label: (context: any) => {
            if (context.dataIndex === 0) {
              return `Success Probability: ${context.parsed}`;
            }
            return '';
          }
        }
      }
    },
    cutout: '70%'
  };

  const exportAnalysis = async () => {
    setIsExporting(true);
    try {
      await generatePDFReport(songData);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareResults = async () => {
    try {
      const shareData = {
        title: `${songData.title} - Analysis Results`,
        text: `Check out the analysis results for "${songData.title}" by ${songData.artist} on songIQ!`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Analysis URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOverallScoreInfo = () => {
    console.log('Overall Score Info clicked!');
    setShowOverallScoreTooltip(true);
    setTimeout(() => {
      setShowOverallScoreTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleMarketPotentialInfo = () => {
    setShowMarketPotentialTooltip(true);
    setTimeout(() => {
      setShowMarketPotentialTooltip(false);
    }, 4000);
  };

  const handleSocialScoreInfo = () => {
    setShowSocialScoreTooltip(true);
    setTimeout(() => {
      setShowSocialScoreTooltip(false);
    }, 4000);
  };

  const handleConfidenceInfo = () => {
    setShowConfidenceTooltip(true);
    setTimeout(() => {
      setShowConfidenceTooltip(false);
    }, 4000);
  };

  const handleBreakdownInfo = () => {
    setShowBreakdownTooltip(true);
    setTimeout(() => {
      setShowBreakdownTooltip(false);
    }, 4000);
  };

  const handleMarketPotentialGaugeInfo = () => {
    setShowMarketPotentialGaugeTooltip(true);
    setTimeout(() => {
      setShowMarketPotentialGaugeTooltip(false);
    }, 4000);
  };

  const handleSuccessProbabilityGaugeInfo = () => {
    setShowSuccessProbabilityGaugeTooltip(true);
    setTimeout(() => {
      setShowSuccessProbabilityGaugeTooltip(false);
    }, 4000);
  };

  const handleSongInfoInfo = () => {
    setShowSongInfoTooltip(true);
    setTimeout(() => {
      setShowSongInfoTooltip(false);
    }, 4000);
  };

  const handleRiskFactorsInfo = () => {
    setShowRiskFactorsTooltip(true);
    setTimeout(() => {
      setShowRiskFactorsTooltip(false);
    }, 4000);
  };

  return (
    <div className={`analysis-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analysis Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {songData.title} • {songData.artist}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportAnalysis}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Export PDF Report'}</span>
            </button>
            <button
              onClick={shareResults}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-lg border ${getScoreBgColor(songData.successScore.overallScore)} ${getScoreBorderColor(songData.successScore.overallScore)} relative`}>
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(songData.successScore.overallScore)}`}>
                {songData.successScore.overallScore}
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleOverallScoreInfo}
            className="absolute top-2 right-2 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-200 shadow-lg border-2 border-white z-10"
            title="Click for more information"
          >
            <Info className="w-6 h-6 text-white" />
          </button>

          {/* Tooltip */}
          {showOverallScoreTooltip && (
            <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
              <div className="text-sm">
                The <strong>Overall Score</strong> of {songData.successScore.overallScore} represents a comprehensive quality rating for "{songData.title}," combining multiple musical factors into a single performance metric.
                <br /><br />
                Scores use a <strong>1-100 scale</strong>, where higher scores indicate better overall performance and market potential.
                <br /><br />
                <strong>Color Coding:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs">Green (80-100): Excellent</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-xs">Yellow (60-79): Good</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs">Red (1-59): Needs Improvement</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border relative ${getScoreBgColor(songData.successScore.marketPotential)} ${getScoreBorderColor(songData.successScore.marketPotential)}`}>
          <div className="flex items-center space-x-3">
            <TrendingUp className={`w-8 h-8 ${getScoreColor(songData.successScore.marketPotential)}`} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Potential</p>
              <p className={`text-2xl font-bold ${getScoreColor(songData.successScore.marketPotential)}`}>
                {songData.successScore.marketPotential}%
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleMarketPotentialInfo}
            className="absolute top-2 right-2 p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </button>

          {/* Tooltip */}
          {showMarketPotentialTooltip && (
            <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
              <div className="text-sm">
                <strong>Market Potential</strong> indicates the likelihood of "{songData.title}" achieving commercial success based on current market trends, genre popularity, and audience demand.
                <br /><br />
                Scores use a <strong>0-100% scale</strong>, where higher percentages suggest greater market opportunity and revenue potential.
                <br /><br />
                <strong>Color Coding:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs">Green (80-100%): High Market Potential</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-xs">Yellow (60-79%): Moderate Potential</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs">Red (0-59%): Low Market Potential</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border relative ${getScoreBgColor(songData.successScore.socialScore)} ${getScoreBorderColor(songData.successScore.socialScore)}`}>
          <div className="flex items-center space-x-3">
            <Users className={`w-8 h-8 ${getScoreColor(songData.successScore.socialScore)}`} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Social Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(songData.successScore.socialScore)}`}>
                {songData.successScore.socialScore}
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleSocialScoreInfo}
            className="absolute top-2 right-2 p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </button>

          {/* Tooltip */}
          {showSocialScoreTooltip && (
            <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
              <div className="text-sm">
                <strong>Social Score</strong> measures the potential for "{songData.title}" to generate social media engagement, viral sharing, and community buzz based on its musical characteristics.
                <br /><br />
                Scores use a <strong>1-100 scale</strong>, where higher scores indicate greater potential for social media success and audience engagement.
                <br /><br />
                <strong>Color Coding:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs">Green (80-100): High Social Potential</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-xs">Yellow (60-79): Moderate Social Potential</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs">Red (1-59): Low Social Potential</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
            </div>
          )}
        </div>

        <div className={`p-4 rounded-lg border relative ${getScoreBgColor(Math.round(songData.successScore.confidence * 100))} ${getScoreBorderColor(Math.round(songData.successScore.confidence * 100))}`}>
          <div className="flex items-center space-x-3">
            <Star className={`w-8 h-8 ${getScoreColor(Math.round(songData.successScore.confidence * 100))}`} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
              <p className={`text-2xl font-bold ${getScoreColor(Math.round(songData.successScore.confidence * 100))}`}>
                {Math.round(songData.successScore.confidence * 100)}%
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleConfidenceInfo}
            className="absolute top-2 right-2 p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          </button>

          {/* Tooltip */}
          {showConfidenceTooltip && (
            <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
              <div className="text-sm">
                <strong>Confidence</strong> represents the reliability of the analysis results for "{songData.title}" based on data quality, sample size, and analysis completeness.
                <br /><br />
                Scores use a <strong>0-100% scale</strong>, where higher percentages indicate more reliable and trustworthy analysis results.
                <br /><br />
                <strong>Color Coding:</strong>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-xs">Green (80-100%): High Confidence</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-xs">Yellow (60-79%): Moderate Confidence</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span className="text-xs">Red (0-59%): Low Confidence</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'features', label: 'Audio Features', icon: Music },
            { id: 'recommendations', label: 'Recommendations', icon: Award },
            { id: 'waveform', label: 'Waveform', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Success Score Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Success Score Breakdown
                </h3>
                <button
                  onClick={handleBreakdownInfo}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="h-64">
                <Bar data={breakdownData} options={breakdownOptions} />
              </div>

                                                                                                   {/* Tooltip */}
            {showBreakdownTooltip && (
              <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
                  <div className="text-sm">
                    <strong>Success Score Breakdown</strong> shows how "{songData.title}" performs across four key analysis categories that contribute to the overall success score.
                    <br /><br />
                    <strong>Categories:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">• <strong>Audio Features:</strong> Musical quality and characteristics</div>
                      <div className="text-xs">• <strong>Market Trends:</strong> Current industry demand</div>
                      <div className="text-xs">• <strong>Genre Alignment:</strong> Fit within genre standards</div>
                      <div className="text-xs">• <strong>Seasonal Factors:</strong> Timing and seasonal appeal</div>
                    </div>
                    <br />
                    <strong>Scale:</strong> Each category uses a <strong>1-100 scale</strong>, where higher scores indicate better performance in that area.
                    <br /><br />
                    <strong>Color Coding:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs">Green (80-100): Excellent</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                        <span className="text-xs">Yellow (60-79): Good</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span className="text-xs">Red (1-59): Needs Improvement</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                </div>
              )}
            </div>

            {/* Success Probability Gauge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Success Probability
                </h3>
                <button
                  onClick={handleSuccessProbabilityGaugeInfo}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <Doughnut data={successProbabilityData} options={successProbabilityOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${
                        songData.successScore.overallScore >= 80 
                          ? 'text-green-600 dark:text-green-400' 
                          : songData.successScore.overallScore >= 60 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {songData.successScore.overallScore}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {showSuccessProbabilityGaugeTooltip && (
                <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
                  <div className="text-sm">
                    The <strong>Success Probability Gauge</strong> displays the overall success probability for "{songData.title}" based on comprehensive analysis of musical quality, market trends, and commercial viability.
                    <br /><br />
                    <strong>Scale:</strong> Uses a <strong>1-100 scale</strong>, where higher scores indicate greater probability of commercial success and market performance.
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
                  </div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                </div>
              )}
            </div>

            {/* Song Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Song Information
                </h3>
                <button
                  onClick={handleSongInfoInfo}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Genre:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {songData.genre.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(songData.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tempo:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {Math.round(songData.audioFeatures.tempo)} BPM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Key:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][songData.audioFeatures.key]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {songData.audioFeatures.mode === 1 ? 'Major' : 'Minor'}
                  </span>
                </div>
              </div>

              {/* Tooltip */}
              {showSongInfoTooltip && (
                <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
                  <div className="text-sm">
                    <strong>Song Information</strong> displays the technical and musical characteristics of "{songData.title}" extracted from the audio analysis.
                    <br /><br />
                    <strong>Key Metrics:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">• <strong>Genre:</strong> Musical classification and style</div>
                      <div className="text-xs">• <strong>Duration:</strong> Total length of the track</div>
                      <div className="text-xs">• <strong>Tempo:</strong> Beats per minute (BPM)</div>
                      <div className="text-xs">• <strong>Key:</strong> Musical key signature</div>
                      <div className="text-xs">• <strong>Mode:</strong> Major or minor tonality</div>
                    </div>
                    <br />
                    <strong>Purpose:</strong> These technical details help assess musical quality, genre fit, and market positioning for "{songData.title}".
                  </div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                </div>
              )}
            </div>

            {/* Risk Factors */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Risk Factors
                </h3>
                <button
                  onClick={handleRiskFactorsInfo}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              {songData.successScore.riskFactors.length > 0 ? (
                <div className="space-y-2">
                  {songData.successScore.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{risk}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">No significant risk factors identified</span>
                </div>
              )}

              {/* Tooltip */}
              {showRiskFactorsTooltip && (
                <div className="fixed top-20 right-4 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400">
                  <div className="text-sm">
                    <strong>Risk Factors</strong> identifies potential challenges and concerns that could impact the commercial success of "{songData.title}".
                    <br /><br />
                    <strong>Assessment Criteria:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">• <strong>Market Saturation:</strong> Competition level in the genre</div>
                      <div className="text-xs">• <strong>Technical Issues:</strong> Audio quality or production concerns</div>
                      <div className="text-xs">• <strong>Trend Alignment:</strong> Fit with current market preferences</div>
                      <div className="text-xs">• <strong>Target Audience:</strong> Potential reach limitations</div>
                    </div>
                    <br />
                    <strong>Color Coding:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                        <span className="text-xs">Orange: Identified risk factors</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs">Green: No significant risks</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Audio Features Analysis
            </h3>
            <div className="h-96">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recommendations for Improvement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {songData.successScore.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{rec.title}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.priority === 'high'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rec.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Potential Impact: +{rec.impact} points
                    </span>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'waveform' && songData.waveformData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Audio Waveform
            </h3>
            <WaveformVisualizer
              waveformData={songData.waveformData}
              duration={songData.duration}
              title={`${songData.title} - Waveform Analysis`}
              height={300}
              showControls={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard; 