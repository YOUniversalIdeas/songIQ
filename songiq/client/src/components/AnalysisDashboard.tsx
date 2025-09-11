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
import SocialMediaTemplates from './SocialMediaTemplates';
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
  const [showSocialTemplates, setShowSocialTemplates] = useState(false);
  const [showOverallScoreTooltip, setShowOverallScoreTooltip] = useState(false);
  const [showMarketPotentialTooltip, setShowMarketPotentialTooltip] = useState(false);
  const [showSocialScoreTooltip, setShowSocialScoreTooltip] = useState(false);
  const [showDurationTooltip, setShowDurationTooltip] = useState(false);
  const [showBreakdownTooltip, setShowBreakdownTooltip] = useState(false);
  const [showActionPlanTooltip, setShowActionPlanTooltip] = useState(false);

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
        label: 'Impact',
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
            label: (context: any) => `${context.label}: ${context.parsed.y}/100 Impact`
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
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set font
      pdf.setFont('helvetica');
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      // ===== COVER PAGE =====
      
      // Professional gradient background (blue to orange)
      const gradientSteps = 30;
      for (let i = 0; i < gradientSteps; i++) {
        const alpha = 1 - (i / gradientSteps) * 0.3; // Fade to 70% opacity
        const blue = Math.round(59 + (i * 6)); // Start with blue
        const green = Math.round(130 + (i * 4));
        const red = Math.round(246 - (i * 6)); // Transition to orange
        
        const y = (i / gradientSteps) * pageHeight;
        const height = pageHeight / gradientSteps;
        
        pdf.setFillColor(red, green, blue, alpha);
        pdf.rect(0, y, pageWidth, height, 'F');
      }
      
      // Add subtle pattern overlay
      pdf.setFillColor(255, 255, 255, 0.05);
      for (let i = 0; i < pageWidth; i += 15) {
        for (let j = 0; j < pageHeight; j += 15) {
          if ((i + j) % 30 === 0) {
            pdf.rect(i, j, 8, 8, 'F');
          }
        }
      }
      
      // Main logo area with enhanced styling
      pdf.setFillColor(255, 255, 255, 0.95);
      pdf.rect(margin, margin, contentWidth, 80, 'F');
      
      // Add border to logo area
      pdf.setDrawColor(255, 165, 0);
      pdf.setLineWidth(2);
      pdf.rect(margin, margin, contentWidth, 80, 'S');
      
      // songIQ logo with enhanced styling
      pdf.setFontSize(52);
      pdf.setTextColor(255, 165, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('songIQ', pageWidth / 2, margin + 45, { align: 'center' });
      
      // Subtitle with better styling
      pdf.setFontSize(16);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-Powered Music Intelligence Platform', pageWidth / 2, margin + 65, { align: 'center' });
      
      // Report title with enhanced styling
      pdf.setFontSize(42);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Music Analysis Report', pageWidth / 2, margin + 130, { align: 'center' });
      
      // Add decorative line under title
      pdf.setDrawColor(255, 165, 0);
      pdf.setLineWidth(3);
      pdf.line(pageWidth / 2 - 80, margin + 140, pageWidth / 2 + 80, margin + 140);
      
      // Song info box with enhanced design
      pdf.setFillColor(255, 255, 255, 0.98);
      pdf.rect(margin, margin + 160, contentWidth, 100, 'F');
      
      // Add border and shadow effect
      pdf.setDrawColor(255, 165, 0);
      pdf.setLineWidth(2);
      pdf.rect(margin, margin + 160, contentWidth, 100, 'S');
      
      // Inner border
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(1);
      pdf.rect(margin + 5, margin + 165, contentWidth - 10, 90, 'S');
      
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Song Information', pageWidth / 2, margin + 185, { align: 'center' });
      
      // Song details with better formatting
      pdf.setFontSize(14);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Track:`, margin + 30, margin + 205);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${songData.title}`, margin + 60, margin + 205);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Artist:`, margin + 30, margin + 220);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${songData.artist}`, margin + 60, margin + 220);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Genre:`, margin + 30, margin + 235);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${songData.genre}`, margin + 60, margin + 235);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Analysis Date:`, margin + 30, margin + 250);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin + 90, margin + 250);
      
      // Enhanced footer with branding
      pdf.setFontSize(11);
      pdf.setTextColor(255, 255, 255, 0.9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Generated by songIQ - Unlocking the hidden insights in your music', pageWidth / 2, pageHeight - 30, { align: 'center' });
      
      // Add website URL
      pdf.setFontSize(10);
      pdf.setTextColor(255, 165, 0);
      pdf.text('www.songiq.ai', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // ===== ANALYSIS PAGE =====
      pdf.addPage();
      
      // Enhanced header with gradient
      const headerGradientSteps = 10;
      for (let i = 0; i < headerGradientSteps; i++) {
        const alpha = 1 - (i / headerGradientSteps) * 0.2;
        const blue = Math.round(59 + (i * 2));
        const green = Math.round(130 + (i * 1));
        const red = Math.round(246 - (i * 2));
        
        const y = (i / headerGradientSteps) * 50;
        const height = 50 / headerGradientSteps;
        
        pdf.setFillColor(red, green, blue, alpha);
        pdf.rect(0, y, pageWidth, height, 'F');
      }
      
      // Add pattern to header
      pdf.setFillColor(255, 255, 255, 0.1);
      for (let i = 0; i < pageWidth; i += 20) {
        for (let j = 0; j < 50; j += 20) {
          pdf.rect(i, j, 10, 10, 'F');
        }
      }
      
      // songIQ logo in header
      pdf.setFontSize(28);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('songIQ', margin, 30);
      
      // Page title
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255, 0.95);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Analysis Results', pageWidth - margin, 30, { align: 'right' });
      
      // Add decorative line under header
      pdf.setDrawColor(255, 165, 0);
      pdf.setLineWidth(2);
      pdf.line(0, 50, pageWidth, 50);
      
      let currentY = 70;
      
      // Success Score with enhanced styling
      pdf.setFontSize(24);
      pdf.setTextColor(255, 165, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Success Score', margin, currentY);
      currentY += 20;
      
      // Score box with background
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, currentY - 10, 120, 60, 'F');
      pdf.setDrawColor(59, 130, 246);
      pdf.setLineWidth(2);
      pdf.rect(margin, currentY - 10, 120, 60, 'S');
      
      pdf.setFontSize(56);
      pdf.setTextColor(59, 130, 246);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${songData.successScore.overallScore}%`, margin + 60, currentY + 25, { align: 'center' });
      
      // Add score label
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Overall Score', margin + 60, currentY + 40, { align: 'center' });
      
      currentY += 70;
      
      // Breakdown with enhanced styling
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Score Breakdown', margin, currentY);
      currentY += 15;
      
      const breakdownItems = [
        { label: 'Audio Features', value: songData.successScore.breakdown.audioFeatures, color: [59, 130, 246] },
        { label: 'Market Trends', value: songData.successScore.breakdown.marketTrends, color: [34, 197, 94] },
        { label: 'Genre Alignment', value: songData.successScore.breakdown.genreAlignment, color: [168, 85, 247] },
        { label: 'Seasonal Factors', value: songData.successScore.breakdown.seasonalFactors, color: [245, 158, 11] }
      ];
      
      // Create breakdown boxes
      const boxWidth = 80;
      const boxHeight = 50;
      const boxesPerRow = 2;
      let boxX = margin;
      let boxY = currentY;
      
      breakdownItems.forEach((item, index) => {
        const row = Math.floor(index / boxesPerRow);
        const col = index % boxesPerRow;
        
        const x = boxX + (col * (boxWidth + 20));
        const y = boxY + (row * (boxHeight + 15));
        
        // Box background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(x, y, boxWidth, boxHeight, 'F');
        
        // Box border
        pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
        pdf.setLineWidth(2);
        pdf.rect(x, y, boxWidth, boxHeight, 'S');
        
        // Score value
        pdf.setFontSize(24);
        pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${item.value}%`, x + boxWidth/2, y + 20, { align: 'center' });
        
        // Label
        pdf.setFontSize(10);
        pdf.setTextColor(55, 65, 81);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.label, x + boxWidth/2, y + 35, { align: 'center' });
      });
      
      currentY += 120;
      
      // Market Potential with enhanced styling
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Market Analysis', margin, currentY);
      currentY += 20;
      
      // Market potential box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, currentY - 10, 100, 40, 'F');
      pdf.setDrawColor(34, 197, 94);
      pdf.setLineWidth(2);
      pdf.rect(margin, currentY - 10, 100, 40, 'S');
      
      pdf.setFontSize(20);
      pdf.setTextColor(34, 197, 94);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${songData.successScore.marketPotential}%`, margin + 50, currentY + 5, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Market Potential', margin + 50, currentY + 20, { align: 'center' });
      
      // Social score box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin + 120, currentY - 10, 100, 40, 'F');
      pdf.setDrawColor(168, 85, 247);
      pdf.setLineWidth(2);
      pdf.rect(margin + 120, currentY - 10, 100, 40, 'S');
      
      pdf.setFontSize(20);
      pdf.setTextColor(168, 85, 247);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${songData.successScore.socialScore}%`, margin + 170, currentY + 5, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(55, 65, 81);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Social Score', margin + 170, currentY + 20, { align: 'center' });
      
      currentY += 50;
      
      // Recommendations with enhanced styling
      if (songData.successScore.recommendations && songData.successScore.recommendations.length > 0) {
        pdf.setFontSize(20);
        pdf.setTextColor(255, 165, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Recommendations', margin, currentY);
        currentY += 20;
        
        songData.successScore.recommendations.slice(0, 5).forEach((rec, index) => {
          // Recommendation box
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, currentY - 5, contentWidth, 30, 'F');
          pdf.setDrawColor(255, 165, 0);
          pdf.setLineWidth(1);
          pdf.rect(margin, currentY - 5, contentWidth, 30, 'S');
          
          // Number badge
          pdf.setFillColor(255, 165, 0);
          pdf.rect(margin + 5, currentY - 2, 20, 20, 'F');
          pdf.setFontSize(12);
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}`, margin + 15, currentY + 8, { align: 'center' });
          
          // Title
          pdf.setFontSize(12);
          pdf.setTextColor(55, 65, 81);
          pdf.setFont('helvetica', 'bold');
          pdf.text(rec.title, margin + 35, currentY + 8);
          
          // Description
          if (rec.description) {
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.setFont('helvetica', 'normal');
            const description = pdf.splitTextToSize(rec.description, contentWidth - 50);
            pdf.text(description, margin + 35, currentY + 18);
            currentY += 35 + (description.length * 3);
          } else {
            currentY += 25;
          }
        });
      }
      
      // Enhanced footer with branding
      const footerY = pageHeight - 40;
      
      // Footer background
      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, footerY, pageWidth, 40, 'F');
      
      // Footer content
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Generated by songIQ', pageWidth / 2, footerY + 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255, 0.8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI-Powered Music Intelligence Platform', pageWidth / 2, footerY + 25, { align: 'center' });
      
      pdf.setFontSize(8);
      pdf.setTextColor(255, 165, 0);
      pdf.text(`Report ID: ${Date.now()} | ${new Date().toISOString()}`, pageWidth / 2, footerY + 35, { align: 'center' });
      
      // Download the PDF
      pdf.save(`songiq-analysis-${songData.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const shareResults = async () => {
    try {
      console.log('Share Results clicked, songData:', songData);
      
      const shareData = {
        title: `${songData.title} - Analysis`,
        text: `Check out the analysis for "${songData.title}" by ${songData.artist} on songIQ!`,
        url: window.location.href
      };

      console.log('Share data:', shareData);

      // Check if Web Share API is available and supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        console.log('Using native share API');
        try {
          await navigator.share(shareData);
          return; // Success, exit early
        } catch (shareError) {
          console.log('Native share failed, trying fallback:', shareError);
          // Continue to fallback options
        }
      }

      // Fallback: Show sharing options
      console.log('Using fallback sharing options');
      showSharingOptions(shareData);
      
    } catch (error) {
      console.error('Share failed:', error);
      showSharingOptions({
        title: `${songData.title} - Analysis`,
        text: `Check out the analysis for "${songData.title}" by ${songData.artist} on songIQ!`,
        url: window.location.href
      });
    }
  };

  const showSharingOptions = (shareData: { title: string; text: string; url: string }) => {
    const shareText = `${shareData.text}\n\n${shareData.url}`;
    
    // Create a modal with sharing options
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Results</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Choose how you'd like to share this analysis:</p>
        
        <div class="space-y-3">
          <button id="copy-link" class="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Copy Link</span>
          </button>
          
          <button id="copy-text" class="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Copy Text</span>
          </button>
          
          <button id="email-share" class="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>Email</span>
          </button>
          
          <button id="whatsapp-share" class="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            <span>WhatsApp</span>
          </button>
          
          <button id="twitter-share" class="w-full p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center space-x-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            <span>Twitter</span>
          </button>
          
          <button id="close-modal" class="w-full p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('#copy-link')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
        document.body.removeChild(modal);
      } catch (error) {
        console.error('Failed to copy link:', error);
        alert('Failed to copy link');
      }
    });

    modal.querySelector('#copy-text')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Text copied to clipboard!');
        document.body.removeChild(modal);
      } catch (error) {
        console.error('Failed to copy text:', error);
        alert('Failed to copy text');
      }
    });

    modal.querySelector('#email-share')?.addEventListener('click', () => {
      const subject = encodeURIComponent(shareData.title);
      const body = encodeURIComponent(shareText);
      window.open(`mailto:?subject=${subject}&body=${body}`);
      document.body.removeChild(modal);
    });

    modal.querySelector('#whatsapp-share')?.addEventListener('click', () => {
      const text = encodeURIComponent(shareText);
      window.open(`https://wa.me/?text=${text}`);
      document.body.removeChild(modal);
    });

    modal.querySelector('#twitter-share')?.addEventListener('click', () => {
      const text = encodeURIComponent(shareData.text);
      const url = encodeURIComponent(shareData.url);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
      document.body.removeChild(modal);
    });

    modal.querySelector('#close-modal')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };

  const openSocialTemplates = () => {
    setShowSocialTemplates(true);
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
              🎵 Your Song's Analysis
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
              <span>{isExporting ? 'Generating Report...' : 'Export Report'}</span>
            </button>
            <button
              onClick={shareResults}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Results</span>
            </button>
            <button
              onClick={openSocialTemplates}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center space-x-2"
            >
              <Music className="w-4 h-4" />
              <span>Social Media</span>
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
                <p className="text-sm text-gray-200">Success Score</p>
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
              <h4 className="font-semibold mb-2">Success Score</h4>
              <p className="text-sm mb-3">
                Your Success Score predicts how well this song will advance your music. 
                This is based on current industry trends, audience demand, and your song's unique strengths.
              </p>
              <div className="text-sm mb-3">
                <p className="font-medium mb-1">Impact:</p>
                <p>• 80-100: Breakout potential, defining moment</p>
                <p>• 60-79: Strong builder, solid foundation</p>
                <p>• 40-59: Stepping stone, needs refinement</p>
                <p>• Below 40: Learning experience, major improvements needed</p>
              </div>
              <div className="text-sm">
                <p className="font-medium mb-1">Factors Analyzed:</p>
                <p>• Industry positioning and market demand</p>
                <p>• Audience appeal and viral potential</p>
                <p>• Release timing and seasonal trends</p>
                <p>• Genre evolution and trajectory</p>
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
                {tab === 'career-overview' ? 'Overview' :
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
                    This breakdown shows how different aspects of your song contribute to your success. 
                    Each factor represents a key element that influences your song's potential to advance your music.
                  </p>
                  <div className="text-sm mb-3">
                    <p className="font-medium mb-1">Impact:</p>
                    <p>• Higher scores (80-100): Your strength - leverage this for growth</p>
                    <p>• Moderate scores (60-79): Good foundation - minor improvements needed</p>
                    <p>• Lower scores (below 60): Focus area - significant improvements will boost success</p>
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

      {activeTab === 'action-plan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Your Action Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Based on your song's analysis, here's a prioritized action plan to maximize your success potential.
            </p>
            
            {/* Priority-based recommendations */}
            <div className="space-y-4">
              {/* High Priority Actions */}
              {songData.successScore.recommendations.filter(rec => rec.priority === 'high').length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    High Priority Actions
                  </h4>
                  <div className="space-y-3">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'high').map((rec, index) => (
                      <div key={index} className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                            +{rec.impact} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {rec.description}
                        </p>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Implementation:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.implementation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Actions */}
              {songData.successScore.recommendations.filter(rec => rec.priority === 'medium').length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Medium Priority Actions
                  </h4>
                  <div className="space-y-3">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'medium').map((rec, index) => (
                      <div key={index} className="p-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                            +{rec.impact} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {rec.description}
                        </p>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Implementation:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.implementation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Low Priority Actions */}
              {songData.successScore.recommendations.filter(rec => rec.priority === 'low').length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Low Priority Actions
                  </h4>
                  <div className="space-y-3">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'low').map((rec, index) => (
                      <div key={index} className="p-4 rounded-lg border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">{rec.title}</h5>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            +{rec.impact} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {rec.description}
                        </p>
                        <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Implementation:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{rec.implementation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Plan Summary */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">📋 Action Plan Summary</h4>
                <button
                  onClick={() => setShowActionPlanTooltip(!showActionPlanTooltip)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  title="How to interpret this data"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Tooltip */}
              {showActionPlanTooltip && (
                <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg border border-blue-300 dark:border-blue-700">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-3">📊 How to interpret this data:</h5>
                  <div className="space-y-3">
                    <div>
                      <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Priority System:</h6>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-2">
                        <li>• <span className="text-red-600 dark:text-red-400 font-medium">High Priority:</span> Critical issues that severely impact success potential</li>
                        <li>• <span className="text-yellow-600 dark:text-yellow-400 font-medium">Medium Priority:</span> Important improvements that will boost performance</li>
                        <li>• <span className="text-green-600 dark:text-green-400 font-medium">Low Priority:</span> Nice-to-have optimizations for fine-tuning</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Impact Scoring:</h6>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-2">
                        <li>• <strong>Impact Points:</strong> Potential success score improvement (0-100 scale)</li>
                        <li>• <strong>Total Impact:</strong> Maximum possible score increase if all actions are completed</li>
                        <li>• <strong>Current Score:</strong> {songData.successScore.overallScore}/100</li>
                        <li>• <strong>Potential Score:</strong> {songData.successScore.overallScore + songData.successScore.recommendations.reduce((sum, rec) => sum + rec.impact, 0)}/100</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Recommended Approach:</h6>
                      <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-2">
                        <li>1. Start with High Priority actions (biggest impact)</li>
                        <li>2. Move to Medium Priority actions (steady improvements)</li>
                        <li>3. Consider Low Priority actions (polish and optimization)</li>
                        <li>4. Re-analyze your song after implementing changes</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'high').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'medium').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Medium Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {songData.successScore.recommendations.filter(rec => rec.priority === 'low').length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Low Priority</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Total Potential Impact: +{songData.successScore.recommendations.reduce((sum, rec) => sum + rec.impact, 0)} points
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Implement these actions to improve your song's success score
                </div>
              </div>
            </div>
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

      {/* Social Media Templates Modal */}
      <SocialMediaTemplates
        songData={songData}
        isOpen={showSocialTemplates}
        onClose={() => setShowSocialTemplates(false)}
      />
    </div>
  );
};

export default AnalysisDashboard; 