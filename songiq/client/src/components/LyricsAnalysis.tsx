import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

// Remove the complex pdfmake loading logic
// let pdfMake: any = null;
// const loadPdfMake = async () => { ... };

interface LyricsAnalysisData {
  trackId: string;
  trackName: string;
  artistName: string;
  lyrics: string;
  wordCount: number;
  uniqueWords: number;
  averageWordsPerLine: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: 'positive' | 'negative' | 'neutral';
  };
  themes: string[];
  complexity: {
    averageWordLength: number;
    uniqueWordRatio: number;
    readabilityScore: number;
  };
  structure: {
    totalLines: number;
    averageLineLength: number;
    rhymingPattern: string[];
  };
  language: string;
  analysisTimestamp: Date;
}

const LyricsAnalysis = () => {
  const [trackName, setTrackName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [lyricsText, setLyricsText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<LyricsAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  // Remove pdfMakeLoaded state since we're not using pdfmake anymore
  // const [pdfMakeLoaded, setPdfMakeLoaded] = useState(false);

  // Remove the useEffect for loading pdfmake
  // React.useEffect(() => { ... }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReadabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReadabilityLabel = (score: number) => {
    if (score >= 80) return 'Very Easy';
    if (score >= 60) return 'Easy';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Difficult';
    return 'Very Difficult';
  };

  const analyzeLyrics = async () => {
    if (!trackName.trim() || !artistName.trim()) {
      setError('Please enter both track name and artist name');
      return;
    }

    if (!lyricsText.trim() && !selectedFile) {
      setError('Please provide lyrics text or upload a file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (selectedFile) {
        // For file uploads, we need authentication - show signup prompt
        setError('File upload requires authentication. Please sign up for full access.');
        setLoading(false);
        return;
      } else {
        // Try demo endpoint first (no auth required)
        response = await fetch('/api/lyrics/demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lyrics: lyricsText,
            trackName,
            artistName
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze lyrics');
      }

      const result = await response.json();
      setAnalysis(result.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing lyrics');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLyricsText(''); // Clear text input when file is selected
      // Show signup prompt for file uploads
      setError('File upload requires authentication. Please sign up for full access to upload and analyze lyrics files.');
    }
  };

  const handleSignupClick = () => {
    // Navigate to signup page or open signup modal
    window.location.href = '/auth';
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyricsText(event.target.value);
    setSelectedFile(null); // Clear file selection when text is entered
  };

  const exportToPDF = async () => {
    try {
  
      
      // Create new PDF document with landscape orientation for better layout
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set font
      pdf.setFont('helvetica');
      
      // Page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      // ===== PAGE 1: COVER PAGE =====
      
      // Background gradient effect (simulated with rectangles)
      // Create orange to white gradient effect
      const gradientSteps = 20;
      for (let i = 0; i < gradientSteps; i++) {
        const alpha = 1 - (i / gradientSteps);
        const orange = Math.round(255 - (i * 10)); // Start with orange, fade to white
        const red = Math.round(255 - (i * 8));
        const green = Math.round(165 - (i * 6));
        
        const y = (i / gradientSteps) * pageHeight;
        const height = pageHeight / gradientSteps;
        
        pdf.setFillColor(red, green, orange, alpha);
        pdf.rect(0, y, pageWidth, height, 'F');
      }
      
      // Add subtle pattern overlay
      pdf.setFillColor(255, 255, 255, 0.1);
      for (let i = 0; i < pageWidth; i += 20) {
        for (let j = 0; j < pageHeight; j += 20) {
          pdf.rect(i, j, 10, 10, 'F');
        }
      }
      
      // Main logo area
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, margin, contentWidth, 60, 'F');
      
      // songIQ logo text
      pdf.setFontSize(48);
      pdf.setTextColor(255, 165, 0); // Orange color
      pdf.text('songIQ', pageWidth / 2, margin + 35, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(18);
      pdf.setTextColor(107, 114, 128);
      pdf.text('AI-Powered Lyrics Analysis Platform', pageWidth / 2, margin + 55, { align: 'center' });
      
      // Main title
      pdf.setFontSize(36);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Lyrics Analysis Report', pageWidth / 2, margin + 120, { align: 'center' });
      
      // Song details box
      pdf.setFillColor(255, 255, 255, 0.95);
      pdf.rect(margin, margin + 140, contentWidth, 80, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 165, 0); // Orange color
      pdf.text('Song Information', pageWidth / 2, margin + 165, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(255, 165, 0); // Orange color instead of dark
      pdf.text(`Track: ${trackName || 'Not specified'}`, margin + 30, margin + 185);
      pdf.text(`Artist: ${artistName || 'Not specified'}`, margin + 30, margin + 200);
      pdf.text(`Analysis Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      })}`, margin + 30, margin + 215);
      
      // Footer
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255, 0.8);
      pdf.text('Generated by songIQ - Unlocking the hidden insights in your music', pageWidth / 2, pageHeight - 20, { align: 'center' });
      
      // ===== PAGE 2: ANALYSIS DETAILS =====
      pdf.addPage();
      
      // Header
      pdf.setFillColor(255, 165, 0); // Orange
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('songIQ', margin, 25);
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255, 0.9);
      pdf.text('Lyrics Analysis Report', pageWidth - margin, 25, { align: 'right' });
      
      // Content starts at y = 60
      let currentY = 60;
      
      // Basic Statistics Section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Basic Statistics', margin, currentY);
      currentY += 25;
      
      // Create statistics boxes
      const stats = [
        { label: 'Word Count', value: lyricsText.split(/\s+/).filter(word => word.length > 0).length, color: [255, 165, 0] },
        { label: 'Character Count', value: lyricsText.length, color: [255, 140, 0] },
        { label: 'Line Count', value: lyricsText.split('\n').filter(line => line.trim().length > 0).length, color: [255, 120, 0] },
        { label: 'Unique Words', value: new Set(lyricsText.toLowerCase().split(/\s+/).filter(word => word.length > 0)).size, color: [255, 100, 0] }
      ];
      
      const boxWidth = (contentWidth - 30) / 4;
      const boxHeight = 40;
      
      stats.forEach((stat, index) => {
        const x = margin + (index * (boxWidth + 10));
        const y = currentY;
        
        // Box background
        pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2], 0.1);
        pdf.rect(x, y, boxWidth, boxHeight, 'F');
        
        // Border
        pdf.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, boxWidth, boxHeight, 'S');
        
        // Text
        pdf.setFontSize(18);
        pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        pdf.text(stat.value.toString(), x + boxWidth/2, y + 15, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(stat.label, x + boxWidth/2, y + 30, { align: 'center' });
      });
      
      currentY += 60;
      
      // Lyrics Content Section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Lyrics Content', margin, currentY);
      currentY += 25;
      
      // Lyrics box
      pdf.setFillColor(248, 250, 252);
      pdf.rect(margin, currentY, contentWidth, 120, 'F');
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, currentY, contentWidth, 120, 'S');
      
      // Lyrics text
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      const maxWidth = contentWidth - 20;
      const lyricsLines = pdf.splitTextToSize(lyricsText || 'No lyrics provided', maxWidth);
      
      // Limit lyrics to fit in the box
      const maxLines = Math.floor(110 / 6); // Approximate line height
      const displayLyrics = lyricsLines.slice(0, maxLines);
      
      pdf.text(displayLyrics, margin + 10, currentY + 15);
      
      if (lyricsLines.length > maxLines) {
        pdf.setFontSize(10);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`... and ${lyricsLines.length - maxLines} more lines`, margin + 10, currentY + 110);
      }
      
      currentY += 140;
      
      // ===== PAGE 3: DETAILED ANALYSIS =====
      pdf.addPage();
      
      // Header
      pdf.setFillColor(255, 165, 0); // Orange
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('songIQ', margin, 25);
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255, 0.9);
      pdf.text('Detailed Analysis', pageWidth - margin, 25, { align: 'right' });
      
      currentY = 60;
      
      // Sentiment Analysis Section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Sentiment Analysis', margin, currentY);
      currentY += 25;
      
      // Sentiment visualization (if analysis data exists)
      if (analysis) {
        const sentimentData = [
          { label: 'Positive', value: analysis.sentiment.positive, color: [34, 197, 94] },
          { label: 'Neutral', value: analysis.sentiment.neutral, color: [251, 191, 36] },
          { label: 'Negative', value: analysis.sentiment.negative, color: [239, 68, 68] }
        ];
        
        const total = sentimentData.reduce((sum, item) => sum + item.value, 0);
        
        sentimentData.forEach((item, index) => {
          const x = margin + (index * (boxWidth + 10));
          const y = currentY;
          
          // Box background
          pdf.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
          pdf.rect(x, y, boxWidth, boxHeight, 'F');
          
          // Border
          pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
          pdf.setLineWidth(0.5);
          pdf.rect(x, y, boxWidth, boxHeight, 'S');
          
          // Text
          pdf.setFontSize(16);
          pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
          pdf.text(item.value.toString(), x + boxWidth/2, y + 15, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text(item.label, x + boxWidth/2, y + 30, { align: 'center' });
          
          // Percentage
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          pdf.text(`${percentage}%`, x + boxWidth/2, y + 40, { align: 'center' });
        });
        
        currentY += 60;
        
        // Overall sentiment
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text(`Overall Sentiment: ${analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}`, margin, currentY);
        currentY += 25;
      }
      
      // Themes Section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Detected Themes', margin, currentY);
      currentY += 25;
      
      if (analysis && analysis.themes.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        
        const themesPerRow = 3;
        analysis.themes.forEach((theme, index) => {
          const row = Math.floor(index / themesPerRow);
          const col = index % themesPerRow;
          const x = margin + (col * (boxWidth + 10));
          const y = currentY + (row * 20);
          
          // Theme box
          pdf.setFillColor(255, 165, 0, 0.1);
          pdf.rect(x, y, boxWidth, 15, 'F');
          pdf.setDrawColor(255, 165, 0);
          pdf.setLineWidth(0.3);
          pdf.rect(x, y, boxWidth, 15, 'S');
          
          // Theme text
          pdf.setTextColor(255, 165, 0);
          pdf.text(theme, x + 5, y + 10);
        });
        
        currentY += (Math.ceil(analysis.themes.length / themesPerRow) * 20) + 20;
      } else {
        pdf.setFontSize(12);
        pdf.setTextColor(156, 163, 175);
        pdf.text('No specific themes detected', margin, currentY);
        currentY += 25;
      }
      
      // Complexity Analysis Section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Complexity Analysis', margin, currentY);
      currentY += 25;
      
      if (analysis) {
        const complexityData = [
          { label: 'Avg Word Length', value: `${analysis.complexity.averageWordLength.toFixed(1)} chars`, color: [245, 158, 11] },
          { label: 'Unique Word Ratio', value: `${(analysis.complexity.uniqueWordRatio * 100).toFixed(1)}%`, color: [251, 113, 133] },
          { label: 'Readability Score', value: analysis.complexity.readabilityScore.toString(), color: [16, 185, 129] }
        ];
        
        complexityData.forEach((item, index) => {
          const x = margin + (index * (boxWidth + 10));
          const y = currentY;
          
          // Box background
          pdf.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
          pdf.rect(x, y, boxWidth, boxHeight, 'F');
          
          // Border
          pdf.setDrawColor(item.color[0], item.color[1], item.color[2]);
          pdf.setLineWidth(0.5);
          pdf.rect(x, y, boxWidth, boxHeight, 'S');
          
          // Text
          pdf.setFontSize(14);
          pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
          pdf.text(item.value, x + boxWidth/2, y + 15, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.setTextColor(107, 114, 128);
          pdf.text(item.label, x + boxWidth/2, y + 30, { align: 'center' });
        });
        
        currentY += 60;
        
        // Readability level
        const readabilityLabel = getReadabilityLabel(analysis.complexity.readabilityScore);
        pdf.setFontSize(16);
        pdf.setTextColor(30, 41, 59);
        pdf.text(`Readability Level: ${readabilityLabel}`, margin, currentY);
        currentY += 25;
      }
      
      // ===== PAGE 4: ABOUT & CONTACT =====
      pdf.addPage();
      
      // Header
      pdf.setFillColor(255, 165, 0); // Orange
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('songIQ', margin, 25);
      
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255, 0.9);
      pdf.text('About songIQ', pageWidth - margin, 25, { align: 'right' });
      
      currentY = 60;
      
      // About section
      pdf.setFontSize(24);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('About songIQ', margin, currentY);
      currentY += 30;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      const aboutText = 'songIQ is an AI-powered platform that provides deep insights into your music through advanced lyrics analysis. Our technology helps artists, producers, and music professionals understand the emotional impact, thematic elements, and linguistic complexity of their lyrics.';
      const aboutLines = pdf.splitTextToSize(aboutText, contentWidth);
      pdf.text(aboutLines, margin, currentY);
      
      currentY += (aboutLines.length * 6) + 30;
      
      // Features section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Key Features', margin, currentY);
      currentY += 25;
      
      const features = [
        'Advanced Sentiment Analysis',
        'Theme Detection & Categorization',
        'Complexity & Readability Scoring',
        'Structural Pattern Recognition',
        'Professional PDF Reports',
        'AI-Powered Insights'
      ];
      
      features.forEach((feature, index) => {
        const x = margin + (index % 2) * (contentWidth / 2 + 10);
        const y = currentY + Math.floor(index / 2) * 20;
        
        pdf.setFontSize(12);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`• ${feature}`, x, y);
      });
      
      currentY += (Math.ceil(features.length / 2) * 20) + 30;
      
      // Contact section
      pdf.setFontSize(20);
      pdf.setTextColor(255, 165, 0); // Orange
      pdf.text('Get in Touch', margin, currentY);
      currentY += 25;
      
      pdf.setFontSize(12);
      pdf.setTextColor(55, 65, 81);
      pdf.text('Ready to unlock the hidden insights in your music?', margin, currentY);
      currentY += 20;
      
      pdf.text('Visit our platform to analyze your lyrics and discover new dimensions', margin, currentY);
      currentY += 20;
      
      pdf.text('in your songwriting.', margin, currentY);
      
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated by songIQ - AI-Powered Lyrics Analysis Platform', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text(`Report ID: ${Date.now()} | ${new Date().toISOString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      
      
      // Save the PDF
      pdf.save('songiq-lyrics-analysis-report.pdf');
      
      
      alert('🎉 Beautifully branded songIQ PDF report has been downloaded successfully!');
      
    } catch (error: any) {
      console.error('Error in PDF generation:', error);
      alert(`PDF Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-6 py-8">
          <div className="relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl"></div>
            </div>
            
            {/* Main heading */}
            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Lyrics Analysis
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Unlock the hidden insights in your unreleased songs with AI-powered lyrics analysis
          </p>
          
          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sentiment Analysis</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Detection</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 dark:border-purple-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Complexity Scoring</span>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Analysis Form</span>
            </h2>
            <p className="text-blue-100 mt-2">Enter your song details and lyrics to begin analysis</p>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-6">
            {/* Track and Artist Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="trackName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Track Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="trackName"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="Enter track name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="artistName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Artist Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="artistName"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Enter artist name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Lyrics Text Area */}
            <div className="space-y-2">
              <label htmlFor="lyricsText" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Lyrics Text
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <textarea
                  id="lyricsText"
                  value={lyricsText}
                  onChange={handleTextChange}
                  placeholder="Paste your lyrics here... Let the AI analyze your words and reveal hidden patterns, emotions, and insights."
                  rows={8}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The AI will analyze sentiment, themes, complexity, and linguistic patterns in your lyrics
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">OR</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label htmlFor="lyricsFile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Upload Lyrics File (Requires Sign Up)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <input
                  type="file"
                  id="lyricsFile"
                  onChange={handleFileChange}
                  accept=".txt,.lrc,.srt"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: .txt, .lrc, .srt (max 5MB) - <span className="text-blue-600 dark:text-blue-400">Sign up required for file uploads</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={analyzeLyrics}
                disabled={loading || !trackName || !artistName || (!lyricsText && !selectedFile)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                <span>{loading ? 'Analyzing...' : 'Analyze Lyrics'}</span>
              </button>

              <button
                onClick={exportToPDF}
                disabled={!analysis}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export to PDF</span>
              </button>


            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {loading && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analyzing Lyrics...</span>
              </h2>
            </div>
            <div className="p-8 text-center text-gray-600 dark:text-gray-300">
              <p>Please wait while we process your lyrics...</p>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Track Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {analysis.trackName} - {analysis.artistName}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={exportToPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors duration-200 backdrop-blur-sm"
                      title="Download PDF Report"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.wordCount}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Words</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analysis.uniqueWords}</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">Unique Words</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysis.structure.totalLines}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Lines</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-700">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analysis.language}</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">Language</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">😊</span>
                  Sentiment Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analysis.sentiment.positive}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Positive</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analysis.sentiment.neutral}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Neutral</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{analysis.sentiment.negative}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Negative</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className={`px-6 py-3 rounded-full text-lg font-semibold ${getSentimentColor(analysis.sentiment.overall)}`}>
                    Overall: {analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🎯</span>
                  Detected Themes
                </h3>
              </div>
              
              <div className="p-8">
                {analysis.themes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {analysis.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-800 dark:text-violet-200 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-700"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No specific themes detected</p>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🧠</span>
                  Complexity Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Word Analysis</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Average Word Length</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.complexity.averageWordLength} characters</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Unique Word Ratio</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(analysis.complexity.uniqueWordRatio * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Readability</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Score</span>
                        <span className={`font-semibold ${getReadabilityColor(analysis.complexity.readabilityScore)}`}>
                          {analysis.complexity.readabilityScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Level</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {getReadabilityLabel(analysis.complexity.readabilityScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📄</span>
                  Structure Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Total Lines</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.structure.totalLines}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Average Line Length</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.structure.averageLineLength} words</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rhyming Pattern</h4>
                    {analysis.structure.rhymingPattern.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.structure.rhymingPattern.map((pattern, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 rounded-lg text-sm mr-2 mb-2 border border-cyan-200 dark:border-cyan-700"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 py-4">No clear rhyming pattern detected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics Display */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-slate-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">📝</span>
                    Lyrics Content
                  </h3>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200"
                  >
                    {showLyrics ? 'Hide' : 'Show'} Lyrics
                  </button>
                </div>
              </div>
              
              {showLyrics && (
                <div className="p-8">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                      {analysis.lyrics}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-700/50">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Why Analyze Your Lyrics?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Emotional Impact</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">Understand the emotional resonance and sentiment of your lyrics</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Theme Detection</h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300">Identify recurring themes and motifs in your songwriting</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Complexity Analysis</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">Measure readability and linguistic complexity of your lyrics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Analyzing Lyrics...</span>
              </h2>
            </div>
            <div className="p-8 text-center text-gray-600 dark:text-gray-300">
              <p>Please wait while we process your lyrics...</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Track Info */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {analysis.trackName} - {analysis.artistName}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={exportToPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors duration-200 backdrop-blur-sm"
                      title="Download PDF Report"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export PDF</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.wordCount}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Words</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl border border-indigo-200 dark:border-indigo-700">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{analysis.uniqueWords}</div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300">Unique Words</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysis.structure.totalLines}</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Lines</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-700">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analysis.language}</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">Language</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">😊</span>
                  Sentiment Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{analysis.sentiment.positive}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Positive</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{analysis.sentiment.neutral}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Neutral</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{analysis.sentiment.negative}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Negative</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className={`px-6 py-3 rounded-full text-lg font-semibold ${getSentimentColor(analysis.sentiment.overall)}`}>
                    Overall: {analysis.sentiment.overall.charAt(0).toUpperCase() + analysis.sentiment.overall.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🎯</span>
                  Detected Themes
                </h3>
              </div>
              
              <div className="p-8">
                {analysis.themes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {analysis.themes.map((theme, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-800 dark:text-violet-200 rounded-full text-sm font-medium border border-violet-200 dark:border-violet-700"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No specific themes detected</p>
                )}
              </div>
            </div>

            {/* Complexity Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🧠</span>
                  Complexity Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Word Analysis</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Average Word Length</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.complexity.averageWordLength} characters</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Unique Word Ratio</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{(analysis.complexity.uniqueWordRatio * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Readability</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Score</span>
                        <span className={`font-semibold ${getReadabilityColor(analysis.complexity.readabilityScore)}`}>
                          {analysis.complexity.readabilityScore}
                        </span>
                      </div>
                      <div className="flex justify-between space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Level</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {getReadabilityLabel(analysis.complexity.readabilityScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Structure Analysis */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">📄</span>
                  Structure Analysis
                </h3>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Total Lines</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.structure.totalLines}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-gray-600 dark:text-gray-400">Average Line Length</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{analysis.structure.averageLineLength} words</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rhyming Pattern</h4>
                    {analysis.structure.rhymingPattern.length > 0 ? (
                      <div className="space-y-2">
                        {analysis.structure.rhymingPattern.map((pattern, index) => (
                          <span
                            key={index}
                            className="inline-block px-3 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 rounded-lg text-sm mr-2 mb-2 border border-cyan-200 dark:border-cyan-700"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 py-4">No clear rhyming pattern detected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics Display */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-slate-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">📝</span>
                    Lyrics Content
                  </h3>
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className="text-white/80 hover:text-white font-medium transition-colors duration-200"
                  >
                    {showLyrics ? 'Hide' : 'Show'} Lyrics
                  </button>
                </div>
              </div>
              
              {showLyrics && (
                <div className="p-8">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                      {analysis.lyrics}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Analysis Error</h3>
                <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                {error.includes('authentication') || error.includes('sign up') ? (
                  <div className="mt-4">
                    <button
                      onClick={handleSignupClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Sign Up for Full Access
                    </button>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      Get unlimited lyrics analysis, file uploads, and more features
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LyricsAnalysis;
