import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFReportGeneratorProps {
  songData: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    duration: number;
    audioFeatures: {
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
    };
    successScore: {
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
    };
    uploadDate: string;
  };
}

export const generatePDFReport = async (songData: PDFReportGeneratorProps['songData']): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Return height used
  };

  // Helper function to get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return [34, 197, 94]; // Green
    if (score >= 60) return [234, 179, 8]; // Yellow
    return [239, 68, 68]; // Red
  };

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to get key name
  const getKeyName = (key: number) => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return keys[key];
  };

  // Page 1: Cover Page
  pdf.setFillColor(102, 126, 234); // songIQ primary color
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // songIQ Logo/Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(48);
  pdf.setFont('helvetica', 'bold');
  pdf.text('songIQ', pageWidth / 2, 80, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Music Analysis Platform', pageWidth / 2, 95, { align: 'center' });
  
  // Song Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`"${songData.title}"`, pageWidth / 2, 130, { align: 'center' });
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`by ${songData.artist}`, pageWidth / 2, 145, { align: 'center' });
  
  // Analysis Report
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Report', pageWidth / 2, 170, { align: 'center' });
  
  // Date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(`Generated on ${reportDate}`, pageWidth / 2, 200, { align: 'center' });
  
  // Page 2: Executive Summary
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFillColor(102, 126, 234);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, 20);
  
  yPosition = 50;
  
  // Overall Score
  const overallScoreColor = getScoreColor(songData.successScore.overallScore);
  pdf.setFillColor(overallScoreColor[0], overallScoreColor[1], overallScoreColor[2]);
  pdf.rect(margin, yPosition, 40, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(songData.successScore.overallScore.toString(), margin + 20, yPosition + 12, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Score', margin + 50, yPosition + 8);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Comprehensive quality rating combining multiple musical factors', margin + 50, yPosition + 15);
  
  yPosition += 35;
  
  // Market Potential
  const marketPotentialColor = getScoreColor(songData.successScore.marketPotential);
  pdf.setFillColor(marketPotentialColor[0], marketPotentialColor[1], marketPotentialColor[2]);
  pdf.rect(margin, yPosition, 40, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${songData.successScore.marketPotential}%`, margin + 20, yPosition + 12, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Market Potential', margin + 50, yPosition + 8);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Commercial success probability based on market trends', margin + 50, yPosition + 15);
  
  yPosition += 35;
  
  // Social Score
  const socialScoreColor = getScoreColor(songData.successScore.socialScore);
  pdf.setFillColor(socialScoreColor[0], socialScoreColor[1], socialScoreColor[2]);
  pdf.rect(margin, yPosition, 40, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(songData.successScore.socialScore.toString(), margin + 20, yPosition + 12, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Social Score', margin + 50, yPosition + 8);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Potential for social media engagement and viral sharing', margin + 50, yPosition + 15);
  
  yPosition += 35;
  
  // Confidence
  const confidenceScore = Math.round(songData.successScore.confidence * 100);
  const confidenceColor = getScoreColor(confidenceScore);
  pdf.setFillColor(confidenceColor[0], confidenceColor[1], confidenceColor[2]);
  pdf.rect(margin, yPosition, 40, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${confidenceScore}%`, margin + 20, yPosition + 12, { align: 'center' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Analysis Confidence', margin + 50, yPosition + 8);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Reliability of the analysis results', margin + 50, yPosition + 15);
  
  // Page 3: Detailed Analysis
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFillColor(102, 126, 234);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Analysis', margin, 20);
  
  yPosition = 50;
  
  // Song Information
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Song Information', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Genre: ${songData.genre.replace('_', ' ')}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Duration: ${formatDuration(songData.duration)}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Tempo: ${Math.round(songData.audioFeatures.tempo)} BPM`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Key: ${getKeyName(songData.audioFeatures.key)}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Mode: ${songData.audioFeatures.mode === 1 ? 'Major' : 'Minor'}`, margin, yPosition);
  
  yPosition += 20;
  
  // Success Score Breakdown
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Success Score Breakdown', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const breakdownItems = [
    { name: 'Audio Features', score: songData.successScore.breakdown.audioFeatures },
    { name: 'Market Trends', score: songData.successScore.breakdown.marketTrends },
    { name: 'Genre Alignment', score: songData.successScore.breakdown.genreAlignment },
    { name: 'Seasonal Factors', score: songData.successScore.breakdown.seasonalFactors }
  ];
  
  breakdownItems.forEach(item => {
    const color = getScoreColor(item.score);
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin, yPosition - 3, 15, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.score.toString(), margin + 7.5, yPosition + 2, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${item.name}: ${item.score}/100`, margin + 20, yPosition);
    yPosition += 8;
  });
  
  // Page 4: Recommendations
  pdf.addPage();
  yPosition = margin;
  
  // Header
  pdf.setFillColor(102, 126, 234);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Recommendations', margin, 20);
  
  yPosition = 50;
  
  // Sort recommendations by priority
  const sortedRecommendations = [...songData.successScore.recommendations].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  
  sortedRecommendations.forEach((rec, index) => {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Priority indicator
    const priorityColors = {
      high: [239, 68, 68], // Red
      medium: [234, 179, 8], // Yellow
      low: [59, 130, 246] // Blue
    };
    const color = priorityColors[rec.priority];
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin, yPosition, 5, 25, 'F');
    
    // Title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(rec.title, margin + 10, yPosition + 8);
    
    // Priority badge
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(margin + contentWidth - 30, yPosition, 25, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(rec.priority.toUpperCase(), margin + contentWidth - 17.5, yPosition + 5, { align: 'center' });
    
    // Description
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const descHeight = addWrappedText(rec.description, margin + 10, yPosition + 15, contentWidth - 40);
    
    // Impact
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Potential Impact: +${rec.impact} points`, margin + 10, yPosition + 15 + descHeight + 5);
    
    yPosition += 25 + descHeight;
  });
  
  // Page 5: Risk Factors (if any)
  if (songData.successScore.riskFactors.length > 0) {
    pdf.addPage();
    yPosition = margin;
    
    // Header
    pdf.setFillColor(102, 126, 234);
    pdf.rect(0, 0, pageWidth, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Risk Factors', margin, 20);
    
    yPosition = 50;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    songData.successScore.riskFactors.forEach((risk, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Risk indicator
      pdf.setFillColor(245, 158, 11); // Orange
      pdf.circle(margin + 3, yPosition + 3, 2, 'F');
      
      pdf.text(`${index + 1}. ${risk}`, margin + 10, yPosition + 5);
      yPosition += 8;
    });
  }
  
  // Footer on last page
  const lastPage = pdf.getNumberOfPages();
  pdf.setPage(lastPage);
  
  pdf.setFillColor(102, 126, 234);
  pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Generated by songIQ - Music Analysis Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Save the PDF
  const fileName = `${songData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${songData.artist.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_Report.pdf`;
  pdf.save(fileName);
};

export default generatePDFReport; 