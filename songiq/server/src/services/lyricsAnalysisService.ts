// LYRICS ANALYSIS SERVICE FOR UNRELEASED SONGS - ACTIVE
// This service handles lyrics analysis for unreleased songs (no Spotify required)

import { LyricsAnalysisResult } from '../types/lyrics';

export class LyricsAnalysisService {
  /**
   * Analyze lyrics from plain text (for unreleased songs)
   */
  async analyzeLyricsFromText(
    lyrics: string,
    trackName: string = 'Unknown Track',
    artistName: string = 'Unknown Artist'
  ): Promise<LyricsAnalysisResult> {
    if (!lyrics || !lyrics.trim()) {
      throw new Error('Lyrics text is required');
    }

    const lines = lyrics.split('\n').filter(line => line.trim());
    const words = (lyrics.toLowerCase().match(/\b\w+\b/g) || []) as string[];
    const uniqueWords = [...new Set(words)];

    // Word count analysis
    const wordCount = words.length;
    const uniqueWordCount = uniqueWords.length;
    const averageWordLength = words.reduce((sum: number, word: string) => sum + word.length, 0) / (wordCount || 1);
    const uniqueWordRatio = uniqueWordCount / wordCount;

    // Sentiment analysis (simplified)
    const positiveWords = ['love', 'happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'great', 'good', 'best', 'fantastic'];
    const negativeWords = ['hate', 'sad', 'pain', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'evil', 'ugly'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    const neutralCount = wordCount - positiveCount - negativeCount;
    
    const overallSentiment = positiveCount > negativeCount ? 'positive' : 
                            negativeCount > positiveCount ? 'negative' : 'neutral';

    // Theme detection
    const commonThemes = [
      'love', 'heartbreak', 'freedom', 'struggle', 'success', 'party', 'loneliness',
      'friendship', 'family', 'dreams', 'reality', 'hope', 'despair', 'nature',
      'city', 'travel', 'home', 'money', 'poverty', 'religion', 'politics'
    ];
    
    const detectedThemes = commonThemes.filter(theme => 
      words.some(word => word.includes(theme) || word === theme)
    );

    // Complexity analysis
    const averageLineLength = lines.reduce((sum, line) => sum + line.split(' ').length, 0) / lines.length || 0;
    const readabilityScore = Math.max(0, 100 - (averageWordLength * 2) - (uniqueWordRatio * 50));

    // Rhyming pattern detection
    const rhymingPattern: string[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i]?.toLowerCase().replace(/[^\w\s]/g, '').split(' ').pop() || '';
      const nextLine = lines[i + 1]?.toLowerCase().replace(/[^\w\s]/g, '').split(' ').pop() || '';
      
      if (this.wordsRhyme(currentLine, nextLine)) {
        rhymingPattern.push(`${i + 1}-${i + 2}`);
      }
    }

    return {
      trackId: 'unreleased',
      trackName,
      artistName,
      lyrics,
      wordCount,
      uniqueWords: uniqueWordCount,
      averageWordsPerLine: averageLineLength,
      sentiment: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        overall: overallSentiment
      },
      themes: detectedThemes,
      complexity: {
        averageWordLength: Math.round(averageWordLength * 100) / 100,
        uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
        readabilityScore: Math.round(readabilityScore)
      },
      structure: {
        totalLines: lines.length,
        averageLineLength: Math.round(averageLineLength * 100) / 100,
        rhymingPattern
      },
      language: this.detectLanguage(lyrics),
      analysisTimestamp: new Date(),
      source: 'uploaded'
    };
  }

  /**
   * Analyze lyrics from uploaded file
   */
  async analyzeLyricsFromFile(
    fileBuffer: Buffer,
    fileName: string,
    trackName?: string,
    artistName?: string
  ): Promise<LyricsAnalysisResult> {
    try {
      // Convert buffer to string
      const fileContent = fileBuffer.toString('utf-8');
      
      // Extract track and artist names from filename if not provided
      const extractedTrackName = trackName || this.extractTrackNameFromFileName(fileName);
      const extractedArtistName = artistName || this.extractArtistNameFromFileName(fileName);
      
      // Analyze the lyrics content
      return await this.analyzeLyricsFromText(fileContent, extractedTrackName, extractedArtistName);
    } catch (error) {
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract track name from filename
   */
  private extractTrackNameFromFileName(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Try to extract track name from common filename patterns
    const patterns = [
      /^(.+?)\s*[-_]\s*(.+)$/, // "Track - Artist" or "Track_Artist"
      /^(.+?)\s*by\s*(.+)$/i,  // "Track by Artist"
      /^(.+?)\s*feat\.?\s*(.+)$/i, // "Track feat. Artist"
    ];
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        return match[1]?.trim() || '';
      }
    }
    
    // If no pattern matches, return the filename as is
    return nameWithoutExt;
  }

  /**
   * Extract artist name from filename
   */
  private extractArtistNameFromFileName(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Try to extract artist name from common filename patterns
    const patterns = [
      /^(.+?)\s*[-_]\s*(.+)$/, // "Track - Artist" or "Track_Artist"
      /^(.+?)\s*by\s*(.+)$/i,  // "Track by Artist"
      /^(.+?)\s*feat\.?\s*(.+)$/i, // "Track feat. Artist"
    ];
    
    for (const pattern of patterns) {
      const match = nameWithoutExt.match(pattern);
      if (match) {
        return match[2]?.trim() || '';
      }
    }
    
    // If no pattern matches, return "Unknown Artist"
    return 'Unknown Artist';
  }

  /**
   * Simple rhyming detection
   */
  private wordsRhyme(word1: string, word2: string): boolean {
    if (word1.length < 3 || word2.length < 3) return false;
    
    const suffix1 = word1.slice(-3);
    const suffix2 = word2.slice(-3);
    
    return suffix1 === suffix2;
  }

  /**
   * Basic language detection
   */
  private detectLanguage(text: string): string {
    // This is a very basic detection - in production you'd use a proper language detection library
    const englishWords = ['the', 'and', 'you', 'that', 'have', 'for', 'not', 'with', 'this', 'but'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const spanishCount = words.filter(word => spanishWords.includes(word)).length;
    
    if (englishCount > spanishCount) return 'English';
    if (spanishCount > englishCount) return 'Spanish';
    return 'Unknown';
  }
}

export default LyricsAnalysisService;
