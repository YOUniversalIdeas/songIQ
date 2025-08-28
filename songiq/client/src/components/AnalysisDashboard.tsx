import React, { useState, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import WaveformVisualizer from './WaveformVisualizer';
import { 
  TrendingUp, 
  Target, 
  Download,
  Share2,
  Music,
  Users,
  Info
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Custom hook for dynamic tooltip positioning (same as Recommendations page)
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
  const [showDurationTooltip, setShowDurationTooltip] = useState(false);
  const [showBreakdownTooltip, setShowBreakdownTooltip] = useState(false);

  // Use the custom hook for each tooltip
  const overallScorePosition = useTooltipPosition();
  const marketPotentialPosition = useTooltipPosition();
  const socialScorePosition = useTooltipPosition();
  const durationPosition = useTooltipPosition();
  const breakdownPosition = useTooltipPosition();

  const handleOverallScoreInfo = () => {
    overallScorePosition.updateTooltipPosition();
    setShowOverallScoreTooltip(true);
    setTimeout(() => {
      setShowOverallScoreTooltip(false);
    }, 4000);
  };

  const handleMarketPotentialInfo = () => {
    marketPotentialPosition.updateTooltipPosition();
    setShowMarketPotentialTooltip(true);
    setTimeout(() => {
      setShowMarketPotentialTooltip(false);
    }, 4000);
  };

  const handleSocialScoreInfo = () => {
    socialScorePosition.updateTooltipPosition();
    setShowSocialScoreTooltip(true);
    setTimeout(() => {
      setShowSocialScoreTooltip(false);
    }, 4000);
  };

  const handleDurationInfo = () => {
    durationPosition.updateTooltipPosition();
    setShowDurationTooltip(true);
    setTimeout(() => {
      setShowDurationTooltip(false);
    }, 4000);
  };

  const handleBreakdownTooltip = () => {
    breakdownPosition.updateTooltipPosition();
    setShowBreakdownTooltip(true);
    setTimeout(() => {
      setShowBreakdownTooltip(false);
    }, 4000);
  };

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

  // Simple chart data for testing
  const breakdownData = {
    labels: ['Song Quality', 'Industry Trends', 'Genre Fit', 'Release Timing'],
    datasets: [
      {
        label: 'Career Impact',
        data: [
          songData.successScore.breakdown.audioFeatures,
          songData.successScore.breakdown.marketTrends,
          songData.successScore.breakdown.genreAlignment,
          songData.successScore.breakdown.seasonalFactors
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
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
            label: (context: any) => `${context.label}: ${context.parsed.y}/100 Career Impact`
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

  const exportAnalysis = async () => {
    setIsExporting(true);
    try {
      // Simplified export - just show success message
      alert('Career report PDF would generate here (simplified for testing)');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareResults = async () => {
    try {
      const shareData = {
        title: `${songData.title} - Career Analysis`,
        text: `Check out the career analysis for "${songData.title}" by ${songData.artist} on songIQ!`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Career analysis URL copied to clipboard!');
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

  return (
    <div className={`analysis-dashboard ${className}`}>
      

      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎵 Your Song's Career Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {songData.title} • {songData.artist} • Industry Intelligence
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportAnalysis}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Report...' : 'Export Career Report'}</span>
            </button>
            <button
              onClick={shareResults}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Results</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg border bg-blue-600 border-blue-500 relative">
                      <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-200">Career Success Score</p>
                <p className="text-2xl font-bold text-white">
                  {songData.successScore.overallScore}
                </p>
              </div>
            </div>
                    <button
            onClick={handleOverallScoreInfo}
            ref={overallScorePosition.buttonRef}
            className="absolute top-2 right-2 p-1 rounded-full bg-blue-400 hover:bg-blue-300 transition-colors duration-200"
            title="Click for more information"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
          
          {/* Tooltip */}
          {showOverallScoreTooltip && (
            <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${overallScorePosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                overallScorePosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Career Success Score</h4>
              <p className="text-sm mb-3">
                Your Career Success Score predicts how well this song will advance your music career. 
                This is based on current industry trends, audience demand, and your song's unique strengths.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">Career Impact:</p>
                <p>• 80-100: Breakout potential, career-defining moment</p>
                <p>• 60-79: Strong career builder, solid foundation</p>
                <p>• 40-59: Career stepping stone, needs refinement</p>
                <p>• Below 40: Learning experience, major improvements needed</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Career Factors Analyzed:</p>
                <p>• Industry positioning and market demand</p>
                <p>• Audience appeal and viral potential</p>
                <p>• Release timing and seasonal trends</p>
                <p>• Genre evolution and career trajectory</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border bg-green-600 border-green-500 relative">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-200">Industry Opportunity</p>
              <p className="text-2xl font-bold text-white">
                {songData.successScore.marketPotential}%
              </p>
            </div>
          </div>
                                          <button
             onClick={handleMarketPotentialInfo}
             ref={marketPotentialPosition.buttonRef}
             className="absolute top-2 right-2 p-1 rounded-full bg-green-400 hover:bg-green-300 transition-colors duration-200"
             title="Click for more information"
           >
             <Info className="w-4 h-4 text-white" />
           </button>
          
          {/* Tooltip */}
          {showMarketPotentialTooltip && (
            <div className={`absolute top-0 w-[300px] bg-green-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
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
              <h4 className="font-semibold mb-2">Industry Opportunity</h4>
              <p className="text-sm mb-3">
                Industry Opportunity measures your song's potential to capture current market demand.
                This shows how well positioned you are to ride current trends and reach your target audience.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Opportunity Factors:</p>
                <p>• Current genre popularity and trend momentum</p>
                <p>• Audience demand and listening patterns</p>
                <p>• Market saturation and competition level</p>
                <p>• Seasonal timing and release windows</p>
              </div>
            </div>
          )}
          </div>

        <div className="p-4 rounded-lg border bg-purple-600 border-purple-500 relative">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-200">Viral Potential</p>
              <p className="text-2xl font-bold text-white">
                {songData.successScore.socialScore}
              </p>
            </div>
          </div>
                                          <button
             onClick={handleSocialScoreInfo}
             ref={socialScorePosition.buttonRef}
             className="absolute top-2 right-2 p-1 rounded-full bg-purple-400 hover:bg-purple-300 transition-colors duration-200"
             title="Click for more information"
           >
             <Info className="w-4 h-4 text-white" />
           </button>
          
          {/* Tooltip */}
          {showSocialScoreTooltip && (
            <div className={`absolute top-0 w-[300px] bg-purple-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
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
              <h4 className="font-semibold mb-2">Viral Potential</h4>
              <p className="text-sm mb-3">
                Viral Potential predicts how likely your song is to spread rapidly on social media.
                This measures your song's ability to create buzz, generate shares, and reach viral status.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Viral Factors:</p>
                <p>• Hook strength and memorable elements</p>
                <p>• Shareability and social appeal</p>
                <p>• Trend alignment and cultural relevance</p>
                <p>• Content creation potential</p>
              </div>
            </div>
          )}
          </div>

        <div className="p-4 rounded-lg border bg-yellow-600 border-yellow-500 relative">
          <div className="flex items-center space-x-3">
            <Music className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-200">Optimal Length</p>
              <p className="text-2xl font-bold text-white">
                {formatDuration(songData.duration)}
              </p>
            </div>
          </div>
                                          <button
             onClick={handleDurationInfo}
             ref={durationPosition.buttonRef}
             className="absolute top-2 right-2 p-1 rounded-full bg-yellow-400 hover:bg-yellow-300 transition-colors duration-200"
             title="Click for more information"
           >
             <Info className="w-4 h-4 text-white" />
           </button>
          
          {/* Tooltip */}
          {showDurationTooltip && (
            <div className={`absolute top-0 w-[300px] bg-yellow-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
              left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
              md:w-[300px] md:left-auto md:right-auto md:mx-auto
              ${durationPosition.tooltipPosition === 'right' 
                ? 'md:left-full md:ml-2' 
                : 'md:right-full md:mr-2'
              }
            `}>
              <div className={`absolute top-4 hidden md:block ${
                durationPosition.tooltipPosition === 'right' 
                  ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-yellow-600' 
                  : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-yellow-600'
              }`}></div>
              <h4 className="font-semibold mb-2">Optimal Length</h4>
              <p className="text-sm mb-3">
                Optimal Length analyzes whether your song's duration maximizes audience engagement.
                Different platforms and audiences prefer different song lengths for maximum impact.
              </p>
              <div className="text-sm">
                <p className="font-medium mb-1">Length Factors:</p>
                <p>• Platform-specific optimal durations (Spotify, Apple Music, etc.)</p>
                <p>• Audience attention span and retention patterns</p>
                <p>• Genre-specific length preferences</p>
                <p>• Streaming algorithm optimization</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg max-w-md">
          {['career-overview', 'song-features', 'action-plan', 'audio-visual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="capitalize">
                {tab === 'career-overview' ? 'Career Overview' :
                 tab === 'song-features' ? 'Song Features' :
                 tab === 'action-plan' ? 'Action Plan' :
                 tab === 'audio-visual' ? 'Audio Visual' : tab}
              </span>
            </button>
          ))}
        </div>
      </div>



      {/* Tab Content */}
      {activeTab === 'career-overview' && (
        <div className="space-y-6">
          {/* Success Score Breakdown with Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🎯 Your Song's Success Factors
              </h3>
                              <button
                onClick={handleBreakdownTooltip}
                ref={breakdownPosition.buttonRef}
                className="p-1 rounded-full bg-blue-400 hover:bg-blue-300 transition-colors duration-200"
                title="Click for more information"
              >
                <Info className="w-4 h-4 text-white" />
              </button>
              
              {/* Tooltip - positioned relative to section container */}
              {showBreakdownTooltip && (
                <div className={`absolute top-0 w-[300px] bg-blue-600 text-white p-4 rounded-lg shadow-2xl z-[999999999] 
                  left-0 right-0 mx-2 w-auto max-w-[calc(100vw-1rem)]
                  md:w-[300px] md:left-auto md:right-auto md:mx-auto
                  ${breakdownPosition.tooltipPosition === 'right' 
                    ? 'md:left-full md:ml-2' 
                    : 'md:right-full md:mr-2'
                  }
                `}>
                  <div className={`absolute top-4 hidden md:block ${
                    breakdownPosition.tooltipPosition === 'right' 
                      ? '-left-2 border-t-4 border-b-4 border-r-4 border-transparent border-r-blue-600' 
                      : '-right-2 border-t-4 border-b-4 border-l-4 border-transparent border-l-blue-600'
                  }`}></div>
                  <h4 className="font-semibold mb-2">Your Song's Success Factors</h4>
                  <p className="text-sm mb-3">
                    This breakdown shows how different aspects of your song contribute to your career success. 
                    Each factor represents a key element that influences your song's potential to advance your music career.
                  </p>
                  <div className="text-sm mb-3">
                    <p className="font-medium mb-1">Career Impact:</p>
                    <p>• Higher scores (80-100): Your strength - leverage this for career growth</p>
                    <p>• Moderate scores (60-79): Good foundation - minor improvements needed</p>
                    <p>• Lower scores (below 60): Focus area - significant improvements will boost career</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Categories Explained:</p>
                    <p>• <strong>Audio Features:</strong> Tempo, key, energy, and other musical characteristics</p>
                    <p>• <strong>Market Trends:</strong> Alignment with current popular styles and demand</p>
                    <p>• <strong>Genre Alignment:</strong> How well your song fits its intended genre</p>
                    <p>• <strong>Seasonal Factors:</strong> Timing and seasonal relevance considerations</p>
                  </div>
                </div>
              )}
            </div>
            

            
            <div className="h-64 mb-4">
              <Bar data={breakdownData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(songData.successScore.breakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getScoreBgColor(value)} ${getScoreBorderColor(value)} border-2`}>
                    <span className={`text-lg font-bold ${getScoreColor(value)}`}>{value}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Recommendations
            </h3>
            <div className="space-y-4">
              {songData.successScore.recommendations.slice(0, 3).map((rec, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-yellow-600 border-yellow-500"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{rec.title}</h4>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-200 mb-3">
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
      )}

      {activeTab === 'features' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Audio Features Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(songData.audioFeatures).map(([key, value]) => (
              <div key={key} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {typeof value === 'number' && value <= 1 ? (value * 100).toFixed(0) + '%' : value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songData.successScore.recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border bg-yellow-600 border-yellow-500"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-white">{rec.title}</h4>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-yellow-200 mb-3">
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
      )}

      {activeTab === 'waveform' && songData.waveformData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Audio Waveform
          </h3>
          <WaveformVisualizer
            waveformData={songData.waveformData}
            duration={songData.duration}
            title={`${songData.title} - Audio Waveform`}
            height={300}
            showControls={true}
            onTimeSelect={(_time) => {
              // Handle time selection
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard; 