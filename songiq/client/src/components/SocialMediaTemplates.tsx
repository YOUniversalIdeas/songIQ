import React, { useState, useRef } from 'react';
import { X, Download, Copy, Share2, Instagram, Twitter, Facebook, Linkedin, Music, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { SongData } from '../types/song';
import { generateSocialMediaImage, downloadImage } from '../utils/socialMediaImageGenerator';

interface SocialMediaTemplatesProps {
  songData: SongData;
  isOpen: boolean;
  onClose: () => void;
}

interface Template {
  id: string;
  name: string;
  platform: string;
  icon: React.ReactNode;
  description: string;
  dimensions: string;
  template: (data: SongData) => string;
  visualTemplate?: (data: SongData) => JSX.Element;
}

const SocialMediaTemplates: React.FC<SocialMediaTemplatesProps> = ({ songData, isOpen, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const templates: Template[] = [
    {
      id: 'instagram-story',
      name: 'Instagram Story',
      platform: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      description: 'Vertical story format with songIQ branding',
      dimensions: '1080x1920',
      template: (data) => `🎵 ${data.title} by ${data.artist}

🎯 Success Score: ${data.successScore.overallScore}/100

📊 Analysis Breakdown:
• Audio Features: ${data.successScore.breakdown.audioFeatures}/100
• Market Trends: ${data.successScore.breakdown.marketTrends}/100
• Genre Alignment: ${data.successScore.breakdown.genreAlignment}/100
• Seasonal Factors: ${data.successScore.breakdown.seasonalFactors}/100

🔍 Analyzed by songIQ AI
#songIQ #MusicAnalysis #AI #${data.artist.replace(/\s+/g, '')} #${data.title.replace(/\s+/g, '')}`,
      visualTemplate: (data) => (
        <div className="w-full h-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex flex-col items-center justify-center text-white p-8 relative">
          <div className="absolute top-8 left-8 text-2xl font-bold">song<span className="text-yellow-300">IQ</span></div>
          <div className="text-center space-y-6">
            <div className="text-4xl">🎵</div>
            <div className="text-3xl font-bold">{data.title}</div>
            <div className="text-xl opacity-90">by {data.artist}</div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-6xl font-bold text-yellow-300">{data.successScore.overallScore}</div>
              <div className="text-lg">Success Score</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold">{data.successScore.breakdown.audioFeatures}</div>
                <div>Audio</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold">{data.successScore.breakdown.marketTrends}</div>
                <div>Market</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold">{data.successScore.breakdown.genreAlignment}</div>
                <div>Genre</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold">{data.successScore.breakdown.seasonalFactors}</div>
                <div>Seasonal</div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 text-sm opacity-80">Powered by songIQ AI</div>
        </div>
      )
    },
    {
      id: 'twitter-post',
      name: 'Twitter Post',
      platform: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      description: 'Tweet format with key insights',
      dimensions: '1200x675',
      template: (data) => `🎵 Just analyzed "${data.title}" by ${data.artist} with songIQ!

🎯 Success Score: ${data.successScore.overallScore}/100

Key insights:
• Audio Features: ${data.successScore.breakdown.audioFeatures}/100
• Market Trends: ${data.successScore.breakdown.marketTrends}/100

Discover your song's potential at songiq.ai

#songIQ #MusicAnalysis #AI #MusicTech #${data.artist.replace(/\s+/g, '')}`,
      visualTemplate: (data) => (
        <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white p-8">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold">song<span className="text-yellow-300">IQ</span></div>
            <div className="text-lg">🎵 {data.title} by {data.artist}</div>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-yellow-300">{data.successScore.overallScore}/100</div>
              <div className="text-sm">Success Score</div>
            </div>
            <div className="text-sm opacity-90">Powered by AI • songiq.ai</div>
          </div>
        </div>
      )
    },
    {
      id: 'facebook-post',
      name: 'Facebook Post',
      platform: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      description: 'Facebook post with detailed analysis',
      dimensions: '1200x630',
      template: (data) => `🎵 SONG ANALYSIS RESULTS 🎵

"${data.title}" by ${data.artist}

🎯 Overall Success Score: ${data.successScore.overallScore}/100

📊 Detailed Breakdown:
• Audio Features: ${data.successScore.breakdown.audioFeatures}/100
• Market Trends: ${data.successScore.breakdown.marketTrends}/100
• Genre Alignment: ${data.successScore.breakdown.genreAlignment}/100
• Seasonal Factors: ${data.successScore.breakdown.seasonalFactors}/100

${data.keyInsights && data.keyInsights.length > 0 ? `\n💡 Key Insights:\n${data.keyInsights.map(insight => `• ${insight}`).join('\n')}` : ''}

Discover what makes your music successful with songIQ's AI-powered analysis!

Visit songiq.ai to analyze your own songs.

#songIQ #MusicAnalysis #AI #MusicIndustry #${data.artist.replace(/\s+/g, '')} #${data.title.replace(/\s+/g, '')}`,
      visualTemplate: (data) => (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col items-center justify-center text-white p-8">
          <div className="text-center space-y-6">
            <div className="text-3xl font-bold">song<span className="text-yellow-300">IQ</span></div>
            <div className="text-2xl font-semibold">🎵 {data.title}</div>
            <div className="text-lg opacity-90">by {data.artist}</div>
            <div className="bg-white/20 rounded-2xl p-8">
              <div className="text-5xl font-bold text-yellow-300 mb-2">{data.successScore.overallScore}</div>
              <div className="text-lg">Success Score</div>
              <div className="text-sm opacity-80 mt-2">out of 100</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold text-lg">{data.successScore.breakdown.audioFeatures}</div>
                <div className="text-xs">Audio</div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="font-bold text-lg">{data.successScore.breakdown.marketTrends}</div>
                <div className="text-xs">Market</div>
              </div>
            </div>
            <div className="text-sm opacity-80">Powered by songIQ AI • songiq.ai</div>
          </div>
        </div>
      )
    },
    {
      id: 'linkedin-post',
      name: 'LinkedIn Post',
      platform: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      description: 'Professional format for music industry',
      dimensions: '1200x627',
      template: (data) => `🎵 Music Industry Analysis: "${data.title}" by ${data.artist}

As a music industry professional, I'm excited to share insights from songIQ's AI-powered analysis of "${data.title}" by ${data.artist}.

📊 Analysis Results:
• Overall Success Score: ${data.successScore.overallScore}/100
• Audio Features: ${data.successScore.breakdown.audioFeatures}/100
• Market Trends: ${data.successScore.breakdown.marketTrends}/100
• Genre Alignment: ${data.successScore.breakdown.genreAlignment}/100
• Seasonal Factors: ${data.successScore.breakdown.seasonalFactors}/100

${data.recommendations && data.recommendations.length > 0 ? `\n💼 Strategic Recommendations:\n${data.recommendations.slice(0, 3).map(rec => `• ${rec}`).join('\n')}` : ''}

The music industry is evolving with AI technology. Tools like songIQ are revolutionizing how we understand and predict musical success.

What are your thoughts on AI in music analysis? Have you tried any AI-powered music tools?

#MusicIndustry #AI #MusicTech #songIQ #MusicAnalysis #Innovation #${data.artist.replace(/\s+/g, '')}`,
      visualTemplate: (data) => (
        <div className="w-full h-full bg-gradient-to-r from-blue-700 to-blue-900 flex items-center justify-center text-white p-8">
          <div className="text-center space-y-6">
            <div className="text-2xl font-bold">song<span className="text-yellow-300">IQ</span></div>
            <div className="text-xl font-semibold">Music Industry Analysis</div>
            <div className="text-lg">🎵 {data.title} by {data.artist}</div>
            <div className="bg-white/20 rounded-xl p-6">
              <div className="text-4xl font-bold text-yellow-300">{data.successScore.overallScore}/100</div>
              <div className="text-sm">Success Score</div>
            </div>
            <div className="text-sm opacity-90">AI-Powered Music Analysis • songiq.ai</div>
          </div>
        </div>
      )
    },
    {
      id: 'tiktok-description',
      name: 'TikTok Description',
      platform: 'TikTok',
      icon: <Music className="w-5 h-5" />,
      description: 'TikTok format with trending hashtags',
      dimensions: '1080x1920',
      template: (data) => `🎵 ${data.title} by ${data.artist} got a ${data.successScore.overallScore}/100 success score! 

songIQ AI analyzed this track and here's what it found:

📈 Audio Features: ${data.successScore.breakdown.audioFeatures}/100
💰 Market Trends: ${data.successScore.breakdown.marketTrends}/100
🎨 Genre Alignment: ${data.successScore.breakdown.genreAlignment}/100
⚡ Seasonal Factors: ${data.successScore.breakdown.seasonalFactors}/100

${data.successScore.overallScore >= 80 ? '🔥 This song is FIRE!' : data.successScore.overallScore >= 60 ? '✨ Great potential!' : '💪 Room to grow!'}

Try songIQ for your own music! Link in bio 🔗

#songIQ #MusicAnalysis #AI #MusicTok #${data.artist.replace(/\s+/g, '')} #${data.title.replace(/\s+/g, '')} #MusicTech #ViralMusic #MusicDiscovery #AI #FYP #ForYou`,
      visualTemplate: (data) => (
        <div className="w-full h-full bg-gradient-to-b from-pink-500 via-red-500 to-yellow-500 flex flex-col items-center justify-center text-white p-8 relative">
          <div className="absolute top-8 left-8 text-2xl font-bold">song<span className="text-yellow-300">IQ</span></div>
          <div className="text-center space-y-6">
            <div className="text-6xl">🎵</div>
            <div className="text-3xl font-bold">{data.title}</div>
            <div className="text-xl opacity-90">by {data.artist}</div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-6xl font-bold text-yellow-300">{data.successScore.overallScore}</div>
              <div className="text-lg">Success Score</div>
            </div>
            <div className="text-2xl">
              {data.successScore.overallScore >= 80 ? '🔥 FIRE!' : data.successScore.overallScore >= 60 ? '✨ Great!' : '💪 Potential!'}
            </div>
          </div>
          <div className="absolute bottom-8 text-sm opacity-80">songIQ AI • songiq.ai</div>
        </div>
      )
    }
  ];

  const generateContent = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setGeneratedContent(template.template(songData));
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      alert('Content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAsText = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songData.title}-${songData.artist}-social-media-content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareContent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${songData.title} - songIQ Analysis`,
          text: generatedContent,
          url: window.location.href
        });
      } else {
        await copyToClipboard();
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const generateVisual = async () => {
    if (!selectedTemplate || !canvasRef.current) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsGenerating(true);
    try {
      const dataUrl = await generateSocialMediaImage(songData, selectedTemplate, canvasRef.current);
      const filename = `${songData.title}-${songData.artist}-${template.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      downloadImage(dataUrl, filename);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Results</h2>
            <p className="text-gray-600 dark:text-gray-400">Create branded social media content</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Template Selection */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose Platform</h3>
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => generateContent(template.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {template.icon}
                    <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{template.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">{template.dimensions}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-6">
                {/* Visual Preview */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Visual Preview</h4>
                  <div className="aspect-[9/16] max-w-xs mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
                    {templates.find(t => t.id === selectedTemplate)?.visualTemplate?.(songData)}
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Text Content</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={shareContent}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={generateVisual}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'Generate Image'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a platform to generate content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaTemplates;
