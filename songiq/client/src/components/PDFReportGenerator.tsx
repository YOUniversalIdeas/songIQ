// Simple PDF export functionality using pdfmake
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfmake with fonts
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

interface PDFReportGeneratorProps {
  songData: {
    title: string;
    artist: string;
    analysis?: any;
    audioFeatures?: any;
    marketData?: any;
    timestamp: Date;
  };
}

export const generatePDFReport = async (songData: PDFReportGeneratorProps['songData']): Promise<void> => {
  try {
    // Define document content with songIQ branding
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        text: 'songIQ - Music Intelligence Platform',
        alignment: 'center',
        margin: [0, 20, 0, 0],
        fontSize: 16,
        color: '#2563eb',
        bold: true
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 0, 0, 20],
          fontSize: 10,
          color: '#6b7280'
        };
      },
      content: [
        // Title Section
        {
          text: '🎵 songIQ Analysis Report',
          fontSize: 24,
          alignment: 'center',
          margin: [0, 0, 0, 20],
          color: '#1e40af',
          bold: true
        },
        {
          text: songData.title,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 5],
          bold: true
        },
        {
          text: `by ${songData.artist}`,
          fontSize: 16,
          alignment: 'center',
          margin: [0, 0, 0, 20],
          color: '#6b7280'
        },
        {
          text: `Generated on ${songData.timestamp.toLocaleDateString()}`,
          fontSize: 12,
          alignment: 'center',
          margin: [0, 0, 0, 30],
          color: '#9ca3af'
        },
        
        // Song Overview Section
        {
          text: '📊 Song Overview',
          fontSize: 18,
          margin: [0, 20, 0, 15],
          color: '#2563eb',
          bold: true
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Title', style: 'tableHeader' },
                { text: songData.title, style: 'tableCell' }
              ],
              [
                { text: 'Artist', style: 'tableHeader' },
                { text: songData.artist, style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        
        // Analysis Results Section
        songData.analysis ? {
          text: '🧠 Analysis Results',
          fontSize: 18,
          margin: [0, 25, 0, 15],
          color: '#2563eb',
          bold: true
        } : {},
        songData.analysis ? {
          text: songData.analysis.summary || 'Analysis completed successfully',
          fontSize: 12,
          margin: [0, 0, 0, 20],
          color: '#374151',
          lineHeight: 1.5
        } : {},
        
        // Audio Features Section
        songData.audioFeatures ? {
          text: '🎛️ Audio Features',
          fontSize: 18,
          margin: [0, 25, 0, 15],
          color: '#2563eb',
          bold: true
        } : {},
        songData.audioFeatures ? {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Tempo', style: 'tableHeader' },
                { text: `${songData.audioFeatures.tempo || 'N/A'} BPM`, style: 'tableCell' }
              ],
              [
                { text: 'Key', style: 'tableHeader' },
                { text: songData.audioFeatures.key || 'N/A', style: 'tableCell' }
              ],
              [
                { text: 'Energy', style: 'tableHeader' },
                { text: songData.audioFeatures.energy ? `${(songData.audioFeatures.energy * 100).toFixed(0)}%` : 'N/A', style: 'tableCell' }
              ],
              [
                { text: 'Danceability', style: 'tableHeader' },
                { text: songData.audioFeatures.danceability ? `${(songData.audioFeatures.danceability * 100).toFixed(0)}%` : 'N/A', style: 'tableCell' }
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        } : {},
        
        // Market Insights Section
        songData.marketData ? {
          text: '📈 Market Insights',
          fontSize: 18,
          margin: [0, 25, 0, 15],
          color: '#2563eb',
          bold: true
        } : {},
        songData.marketData ? {
          text: songData.marketData.insights || 'Market data analysis completed',
          fontSize: 12,
          margin: [0, 0, 0, 20],
          color: '#374151',
          lineHeight: 1.5
        } : {},
        
        // Report Summary Section
        {
          text: '📋 Report Summary',
          fontSize: 18,
          margin: [0, 25, 0, 15],
          color: '#2563eb',
          bold: true
        },
        {
          text: 'This comprehensive analysis report was generated by songIQ\'s AI-powered music intelligence platform. The analysis includes detailed insights into your song\'s musical characteristics, market potential, and artistic elements.',
          fontSize: 11,
          margin: [0, 0, 0, 20],
          color: '#6b7280',
          lineHeight: 1.5
        },
        
        // Branding Footer
        {
          text: 'Generated by songIQ - Music Intelligence Platform',
          fontSize: 12,
          alignment: 'center',
          margin: [0, 30, 0, 0],
          color: '#9ca3af',
          italics: true
        }
      ].filter(Boolean), // Remove empty objects
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: '#1f2937',
          fillColor: '#f3f4f6'
        },
        tableCell: {
          fontSize: 12,
          color: '#374151'
        }
      },
      defaultStyle: {
        font: 'Helvetica'
      }
    };

    // Generate and download the PDF
    const pdfDoc = pdfMake.createPdf(docDefinition as any);
    pdfDoc.download(`songiq-analysis-${songData.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
    
    
  } catch (error) {
    console.error('Error generating PDF report:', error);
    alert('Failed to generate report. Please try again.');
  }
};

export default generatePDFReport; 