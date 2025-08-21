import React, { useState, useRef, useEffect } from 'react';
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
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  TrendingUp,
  Target,
  Award,
  Share2,
  Download,
  BarChart3,
  Activity,
  Music,
  Star,
  Users,
  Globe,
  Clock,
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

// Custom hook for dynamic tooltip positioning (same as other components)
const useTooltipPosition = () => {
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateTooltipPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 300; // Width of the tooltip
      const margin = 20; // Margin from edge

      // Check if there's enough space on the right
      const spaceOnRight = viewportWidth - buttonRect.right - margin;
      const spaceOnLeft = buttonRect.left - margin;

      if (spaceOnRight >= tooltipWidth) {
        setTooltipPosition('right');
      } else if (spaceOnLeft >= tooltipWidth) {
        setTooltipPosition('left');
      } else {
        // If neither side has enough space, default to left for better visibility
        setTooltipPosition('left');
      }
    }
  };

  useEffect(() => {
    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    return () => window.removeEventListener('resize', updateTooltipPosition);
  }, []);

  return { tooltipPosition, buttonRef, updateTooltipPosition };
};

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

interface ResultsVisualizationProps {
  songData: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: number;
    audioFeatures: AudioFeatures;
    successScore: SuccessScore;
    uploadDate: string;
  };
  className?: string;
}

const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({ songData, className = '' }) => {
  const [activeView, setActiveView] = useState('overview');
  const [isSharing, setIsSharing] = useState(false);
  const [showSuccessScoreTooltip, setShowSuccessScoreTooltip] = useState(false);
  const [showMarketPotentialTooltip, setShowMarketPotentialTooltip] = useState(false);
  const [showSocialScoreTooltip, setShowSocialScoreTooltip] = useState(false);
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false);
  const [showSuccessProbabilityGaugeTooltip, setShowSuccessProbabilityGaugeTooltip] = useState(false);
  const [showScoreBreakdownTooltip, setShowScoreBreakdownTooltip] = useState(false);
  const [showAudioFeaturesTooltip, setShowAudioFeaturesTooltip] = useState(false);
  const [showMarketPositionTooltip, setShowMarketPositionTooltip] = useState(false);
  const [showSuccessScoreTrendsTooltip, setShowSuccessScoreTrendsTooltip] = useState(false);

  // Use the custom hook for Success Score tooltip positioning
  const successScorePosition = useTooltipPosition();
  
  // Use the custom hook for Market Potential tooltip positioning
  const marketPotentialPosition = useTooltipPosition();

  // Use the custom hook for Social Score tooltip positioning
  const socialScorePosition = useTooltipPosition();

  // Use the custom hook for Confidence tooltip positioning
  const confidencePosition = useTooltipPosition();

  // Use the custom hook for Success Probability Gauge tooltip positioning
  const successProbabilityGaugePosition = useTooltipPosition();

  // Use the custom hook for Score Breakdown tooltip positioning
  const scoreBreakdownPosition = useTooltipPosition();

  // Success probability gauge with animated transitions
  const successGaugeData = {
    labels: ['Success Probability', 'Remaining'],
    datasets: [
      {
        data: [songData.successScore.overallScore, 100 - songData.successScore.overallScore],
        backgroundColor: [
          songData.successScore.overallScore >= 80
            ? 'rgba(16, 185, 129, 0.8)'
            : songData.successScore.overallScore >= 60
            ? 'rgba(245, 158, 11, 0.8)'
            : songData.successScore.overallScore >= 40
            ? 'rgba(239, 68, 68, 0.8)'
            : 'rgba(156, 163, 175, 0.8)',
          'rgba(156, 163, 175, 0.2)'
        ],
        borderColor: [
          songData.successScore.overallScore >= 80
            ? 'rgb(16, 185, 129)'
            : songData.successScore.overallScore >= 60
            ? 'rgb(245, 158, 11)'
            : songData.successScore.overallScore >= 40
            ? 'rgb(239, 68, 68)'
            : 'rgb(156, 163, 175)',
          'rgb(156, 163, 175)'
        ],
        borderWidth: 0
      }
    ]
  };

  const successGaugeOptions = {
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
              return `Success Probability: ${context.parsed}%`;
            }
            return '';
          }
        }
      }
    },
    cutout: '75%'
  };

  // Feature comparison chart
  const featureComparisonData = {
    labels: ['Danceability', 'Energy', 'Valence', 'Acousticness', 'Instrumentalness', 'Liveness', 'Speechiness'],
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
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Genre Average',
        data: [0.7, 0.65, 0.6, 0.2, 0.1, 0.15, 0.08],
        backgroundColor: 'rgba(156, 163, 175, 0.8)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2
      },
      {
        label: 'Top Hits Average',
        data: [0.8, 0.75, 0.7, 0.15, 0.05, 0.12, 0.06],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      }
    ]
  };

  const featureComparisonOptions = {
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
      y: {
        beginAtZero: true,
        max: 1,
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

  // Market position scatter plot
  const marketPositionData = {
    datasets: [
      {
        label: 'Your Song',
        data: [{
          x: songData.audioFeatures.energy,
          y: songData.audioFeatures.danceability
        }],
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgb(59, 130, 246)',
        pointRadius: 8,
        pointHoverRadius: 12
      },
      {
        label: 'Similar Genre Songs',
        data: [
          { x: 0.7, y: 0.75 },
          { x: 0.8, y: 0.65 },
          { x: 0.6, y: 0.8 },
          { x: 0.75, y: 0.7 },
          { x: 0.65, y: 0.85 },
          { x: 0.85, y: 0.6 },
          { x: 0.7, y: 0.8 },
          { x: 0.8, y: 0.7 }
        ],
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgb(156, 163, 175)',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Top Hits',
        data: [
          { x: 0.85, y: 0.9 },
          { x: 0.9, y: 0.8 },
          { x: 0.8, y: 0.85 },
          { x: 0.75, y: 0.9 },
          { x: 0.9, y: 0.75 }
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const marketPositionOptions = {
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
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: Energy ${context.parsed.x.toFixed(2)}, Danceability ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Energy',
          color: 'rgb(156, 163, 175)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Danceability',
          color: 'rgb(156, 163, 175)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };

  // Historical trend line chart
  const historicalTrendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Success Score Trend',
        data: [songData.successScore.overallScore, 72, 75, 78, 80, 82, 85, 87],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Market Potential',
        data: [songData.successScore.marketPotential, 75, 78, 80, 82, 85, 87, 89],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const historicalTrendOptions = {
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
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  };



  const handleSuccessScoreInfo = () => {
    setShowSuccessScoreTooltip(true);
    successScorePosition.updateTooltipPosition();
    setTimeout(() => {
      setShowSuccessScoreTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleMarketPotentialInfo = () => {
    setShowMarketPotentialTooltip(true);
    marketPotentialPosition.updateTooltipPosition();
    setTimeout(() => {
      setShowMarketPotentialTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleSocialScoreInfo = () => {
    setShowSocialScoreTooltip(true);
    socialScorePosition.updateTooltipPosition();
    setTimeout(() => {
      setShowSocialScoreTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleConfidenceInfo = () => {
    setShowConfidenceTooltip(true);
    confidencePosition.updateTooltipPosition();
    setTimeout(() => {
      setShowConfidenceTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleSuccessProbabilityGaugeInfo = () => {
    setShowSuccessProbabilityGaugeTooltip(true);
    successProbabilityGaugePosition.updateTooltipPosition();
    setTimeout(() => {
      setShowSuccessProbabilityGaugeTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const handleScoreBreakdownInfo = () => {
    setShowScoreBreakdownTooltip(true);
    scoreBreakdownPosition.updateTooltipPosition();
    setTimeout(() => {
      setShowScoreBreakdownTooltip(false);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  const shareResults = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: `${songData.title} - songIQ Analysis Results`,
        text: `Check out the analysis results for "${songData.title}" by ${songData.artist}! Success Score: ${songData.successScore.overallScore}/100`,
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
    } finally {
      setIsSharing(false);
    }
  };

  const exportResults = () => {
    const report = {
      song: songData,
      analysis: songData.successScore,
      timestamp: new Date().toISOString(),
      generatedBy: 'songIQ Results Visualization'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songData.title}-${songData.artist}-results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`results-visualization ${className}`}>
      {/* Header with Action Buttons */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analysis Results
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights for "{songData.title}" by {songData.artist}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportResults}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={shareResults}
              disabled={isSharing}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharing ? 'Sharing...' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Score Overview with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg border bg-blue-600 border-blue-500 transition-all duration-500 relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Success Score</p>
              <p className="text-3xl font-bold text-white">
                {songData.successScore.overallScore}
              </p>
              <p className="text-xs text-blue-200">out of 100</p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleSuccessScoreInfo}
            ref={successScorePosition.buttonRef}
            className="absolute top-2 right-2 p-1 rounded-full bg-blue-400 hover:bg-blue-300 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-white" />
          </button>

          {/* Tooltip */}
          {showSuccessScoreTooltip && (
            <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999999] 
              fixed md:absolute
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${successScorePosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                successScorePosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Success Score</h4>
              <p className="text-sm mb-3">
                The Success Score represents a comprehensive quality rating for your song, combining multiple musical factors into a single performance metric.
                Scores use a 1-100 scale, where higher scores indicate better overall performance and market potential.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Color Coding:</p>
                <p>• Green (80-100): Excellent potential</p>
                <p>• Yellow (60-79): Good potential</p>
                <p>• Red (1-59): Needs improvement</p>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 rounded-lg border bg-green-600 border-green-500 transition-all duration-500 relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-200">Market Potential</p>
              <p className="text-3xl font-bold text-white">
                {songData.successScore.marketPotential}%
              </p>
              <p className="text-xs text-green-200">
                {songData.successScore.marketPotential >= 80 ? 'high potential' : songData.successScore.marketPotential >= 60 ? 'moderate potential' : songData.successScore.marketPotential >= 40 ? 'low potential' : 'very low potential'}
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleMarketPotentialInfo}
            ref={marketPotentialPosition.buttonRef}
            className="absolute top-2 right-2 p-1 rounded-full bg-green-400 hover:bg-green-300 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-white" />
          </button>

          {/* Tooltip */}
          {showMarketPotentialTooltip && (
            <div className={`absolute top-0 w-[300px] bg-green-600 text-white p-4 rounded-lg shadow-2xl z-[999999999999] 
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${marketPotentialPosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                marketPotentialPosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-green-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-green-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Market Potential</h4>
              <p className="text-sm mb-3">
                Market Potential indicates the likelihood of your song achieving commercial success based on current market trends, genre popularity, and audience demand.
                Scores use a 0-100% scale, where higher percentages suggest greater market opportunity and revenue potential.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Color Coding:</p>
                <p>• Green (80-100%): High Market Potential</p>
                <p>• Yellow (60-79%): Moderate Potential</p>
                <p>• Red (0-59%): Low Market Potential</p>
              </div>
            </div>
          )}

        </div>

        <div className="p-6 rounded-lg border bg-purple-600 border-purple-500 transition-all duration-500 relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-200">Social Score</p>
              <p className="text-3xl font-bold text-white">
                {songData.successScore.socialScore}
              </p>
              <p className="text-xs text-purple-200">
                {songData.successScore.socialScore >= 80 ? 'highly shareable' : songData.successScore.socialScore >= 60 ? 'shareable content' : songData.successScore.socialScore >= 40 ? 'moderate sharing' : 'low sharing potential'}
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleSocialScoreInfo}
            ref={socialScorePosition.buttonRef}
            className="absolute top-2 right-2 p-1 rounded-full bg-purple-400 hover:bg-purple-300 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-white" />
          </button>

          {/* Tooltip */}
          {showSocialScoreTooltip && (
            <div className={`absolute top-0 w-[300px] bg-purple-600 text-white p-4 rounded-lg shadow-2xl z-[999999999999] 
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${socialScorePosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                socialScorePosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-purple-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-purple-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Social Score</h4>
              <p className="text-sm mb-3">
                Social Score measures the potential for "{songData.title}" to generate social media engagement, viral sharing, and community buzz based on its musical characteristics.
                Scores use a 1-100 scale, where higher scores indicate greater potential for social media success and audience engagement.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Color Coding:</p>
                <p>• Green (80-100): High Social Potential</p>
                <p>• Yellow (60-79): Moderate Social Potential</p>
                <p>• Red (1-59): Low Social Potential</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 rounded-lg border bg-yellow-600 border-yellow-500 transition-all duration-500 relative">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white rounded-full">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-200">Confidence</p>
              <p className="text-3xl font-bold text-white">
                {Math.round(songData.successScore.confidence * 100)}%
              </p>
              <p className="text-xs text-yellow-200">
                {Math.round(songData.successScore.confidence * 100) >= 80 ? 'high confidence' : Math.round(songData.successScore.confidence * 100) >= 60 ? 'moderate confidence' : Math.round(songData.successScore.confidence * 100) >= 40 ? 'low confidence' : 'very low confidence'}
              </p>
            </div>
          </div>
          
          {/* Info Icon */}
          <button
            onClick={handleConfidenceInfo}
            ref={confidencePosition.buttonRef}
            className="absolute top-2 right-2 p-1 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors duration-200"
          >
            <Info className="w-4 h-4 text-white" />
          </button>

          {/* Tooltip */}
          {showConfidenceTooltip && (
            <div className={`absolute top-0 w-[300px] bg-yellow-600 text-white p-4 rounded-lg shadow-2xl z-[999999999999] 
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${confidencePosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                confidencePosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-yellow-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-yellow-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Confidence</h4>
              <p className="text-sm mb-3">
                The Confidence score indicates the reliability of the analysis, reflecting the completeness and quality of the data used.
                Scores use a 0-100% scale, where higher percentages mean more reliable analysis.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Color Coding:</p>
                <p>• Green (80-100%): High Confidence</p>
                <p>• Yellow (60-79%): Moderate Confidence</p>
                <p>• Red (0-59%): Low Confidence</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* View Selector */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'features', label: 'Features', icon: Music },
            { id: 'market', label: 'Market Position', icon: Globe },
            { id: 'trends', label: 'Trends', icon: Activity }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
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
        </nav>
      </div>

      {/* Content Views */}
      <div className="min-h-96">
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Success Probability Gauge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Success Probability Gauge
                </h3>
                <button
                  onClick={handleSuccessProbabilityGaugeInfo}
                  ref={successProbabilityGaugePosition.buttonRef}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="h-80 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <Doughnut data={successGaugeData} options={successGaugeOptions} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {songData.successScore.overallScore}%
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Success Probability</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tooltip */}
              {showSuccessProbabilityGaugeTooltip && (
                <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:w-[300px] md:left-auto md:right-auto md:mx-auto
                  ${successProbabilityGaugePosition.tooltipPosition === 'right' 
                    ? 'md:left-full md:ml-2' 
                    : 'md:right-full md:mr-2'
                  }
                `}>
                  <div className={`absolute top-4 hidden md:block ${
                    successProbabilityGaugePosition.tooltipPosition === 'right' 
                      ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                      : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
                  }`}></div>
                  <h4 className="font-semibold mb-2">Success Probability Gauge</h4>
                  <p className="text-sm mb-3">
                    The Success Probability Gauge displays the overall success probability for "{songData.title}" based on comprehensive analysis of musical quality, market trends, and commercial viability.
                    Scores use a 1-100 scale, where higher scores indicate greater probability of commercial success and market performance.
                  </p>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Color Coding:</p>
                    <p>• Green (80-100): High Success Probability</p>
                    <p>• Yellow (60-79): Moderate Success Probability</p>
                    <p>• Red (1-59): Low Success Probability</p>
                  </div>
                </div>
              )}
            </div>

            {/* Score Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Score Breakdown
                </h3>
                <button
                  onClick={handleScoreBreakdownInfo}
                  ref={scoreBreakdownPosition.buttonRef}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              <div className="space-y-4">
                {Object.entries(songData.successScore.breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tooltip */}
              {showScoreBreakdownTooltip && (
                <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:w-[300px] md:left-auto md:right-auto md:mx-auto
                  ${scoreBreakdownPosition.tooltipPosition === 'right' 
                    ? 'md:left-full md:ml-2' 
                    : 'md:right-full md:mr-2'
                  }
                `}>
                  <div className={`absolute top-4 hidden md:block ${
                    scoreBreakdownPosition.tooltipPosition === 'right' 
                      ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                      : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
                  }`}></div>
                  <h4 className="font-semibold mb-2">Score Breakdown</h4>
                  <p className="text-sm mb-3">
                    The Score Breakdown shows how "{songData.title}" performs across four key analysis categories that contribute to the overall success score.
                    Each category uses a 1-100 scale, where higher scores indicate better performance in that area.
                  </p>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Categories:</p>
                    <p>• <strong>Audio Features:</strong> Musical quality and characteristics</p>
                    <p>• <strong>Market Trends:</strong> Current industry demand</p>
                    <p>• <strong>Genre Alignment:</strong> Fit within genre standards</p>
                    <p>• <strong>Seasonal Factors:</strong> Timing and seasonal appeal</p>
                  </div>
                  <div className="text-sm mt-3">
                    <p className="font-medium mb-1">Color Coding:</p>
                    <p>• Green (80-100): Excellent</p>
                    <p>• Yellow (60-79): Good</p>
                    <p>• Orange (40-59): Fair</p>
                    <p>• Red (1-39): Needs improvement</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'features' && (
          <div className="space-y-8">
            {/* Feature Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Audio Features Comparison
                </h3>
                
                {/* Info Icon */}
                <button
                  onClick={() => {
                    setShowAudioFeaturesTooltip(true);
                    setTimeout(() => setShowAudioFeaturesTooltip(false), 4000);
                  }}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              
              {/* Tooltip */}
              {showAudioFeaturesTooltip && (
                <div className="fixed top-20 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:max-w-xs md:left-auto md:right-auto md:mx-auto
                  md:right-4
                ">
                  <div className="text-sm">
                    <strong>Audio Features Comparison</strong> analyzes the musical characteristics of your song, comparing them against industry standards and optimal ranges for your genre.
                    <br /><br />
                    <strong>Key Metrics:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Danceability & Energy</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Tempo & Loudness</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Acoustic & Instrumental</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Valence & Speechiness</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="h-96">
                <Bar data={featureComparisonData} options={featureComparisonOptions} />
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(songData.audioFeatures).map(([key, value]) => {
                if (key === 'key' || key === 'mode') return null;
                const normalizedValue = key === 'tempo' ? value / 200 : key === 'loudness' ? (value + 60) / 60 : value;
                const percentage = Math.round(normalizedValue * 100);
                
                return (
                  <div key={key} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {key}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {key === 'tempo' ? `${Math.round(value)} BPM` : 
                         key === 'loudness' ? `${Math.round(value)} dB` : 
                         `${percentage}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'market' && (
          <div className="space-y-8">
            {/* Market Position Scatter Plot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Market Position Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your song's position compared to similar genre songs and top hits
                  </p>
                </div>
                
                {/* Info Icon */}
                <button
                  onClick={() => {
                    setShowMarketPositionTooltip(true);
                    setTimeout(() => setShowMarketPositionTooltip(false), 4000);
                  }}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              
              {/* Tooltip */}
              {showMarketPositionTooltip && (
                <div className="fixed top-20 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:max-w-xs md:left-auto md:right-auto md:mx-auto
                  md:right-4
                ">
                  <div className="text-sm">
                    <strong>Market Position Analysis</strong> visualizes how your song compares to similar genre songs and top hits across key audio features like Energy and Danceability.
                    <br /><br />
                    <strong>What it shows:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Your song's position</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                        <span className="text-xs">Similar genre songs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs">Top hits benchmark</span>
                      </div>
                    </div>
                    <br />
                    This helps identify your song's competitive positioning and market opportunities.
                  </div>
                </div>
              )}
              
              <div className="h-96">
                <Scatter data={marketPositionData} options={marketPositionOptions} />
              </div>
            </div>

            {/* Market Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Market Insights
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Genre Popularity</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Competition Level</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Medium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Market Saturation</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Low</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Competitive Advantage
                </h4>
                <div className="space-y-2">
                  {songData.successScore.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-yellow-600 border-yellow-500">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-200 mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-yellow-200">
                          Potential Impact: +{rec.impact} points
                        </span>
                        <button className="text-xs text-white hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'trends' && (
          <div className="space-y-8">
            {/* Historical Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Success Score Trends
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Projected performance over time based on current analysis
                  </p>
                </div>
                
                {/* Info Icon */}
                <button
                  onClick={() => {
                    setShowSuccessScoreTrendsTooltip(true);
                    setTimeout(() => setShowSuccessScoreTrendsTooltip(false), 4000);
                  }}
                  className="p-1 rounded-full bg-blue-100 dark:bg-blue-700 hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  <Info className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </button>
              </div>
              
              {/* Tooltip */}
              {showSuccessScoreTrendsTooltip && (
                <div className="fixed top-20 z-[9999] max-w-xs bg-sky-200 text-gray-900 p-4 rounded-lg shadow-xl border-2 border-sky-400
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:max-w-xs md:left-auto md:right-auto md:mx-auto
                  md:right-4
                ">
                  <div className="text-sm">
                    <strong>Success Score Trends</strong> projects your song's performance trajectory over an 8-week period, showing both current success score and market potential.
                    <br /><br />
                    <strong>What it tracks:</strong>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="text-xs">Success Score Trend (blue line)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="text-xs">Market Potential (green line)</span>
                      </div>
                    </div>
                    <br />
                    This helps identify optimal release timing and track progress toward your target success score.
                  </div>
                </div>
              )}
              
              <div className="h-96">
                <Line data={historicalTrendData} options={historicalTrendOptions} />
              </div>
            </div>

            {/* Trend Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Growth Trend</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+15%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Expected improvement</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Peak Timing</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Week 6</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Optimal release window</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Target Score</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">87</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Achievable with optimization</p>
              </div>
            </div>
          </div>
        )}
      </div>



    </div>
  );
};

export default ResultsVisualization; 