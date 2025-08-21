// SPOTIFY LYRICS SERVICE - TEMPORARILY DISABLED
// To reactivate, remove all /* */ comment blocks

/*
import axios from 'axios';

interface SpotifyLyricsResponse {
  lyrics: {
    syncType: string;
    lines: Array<{
      startTimeMs: string;
      words: string;
      syllables: Array<{
        startTimeMs: string;
        duration: number;
        char: string;
      }>;
    }>;
  };
}

interface LyricsAnalysisResult {
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

export class SpotifyLyricsService {
  private accessToken: string;
  private baseUrl = 'https://api.spotify.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getTrackLyrics(trackId: string): Promise<SpotifyLyricsResponse | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tracks/${trackId}/lyrics`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching lyrics from Spotify:', error);
      return null;
    }
  }

  extractPlainLyrics(lyricsResponse: SpotifyLyricsResponse): string {
    if (!lyricsResponse?.lyrics?.lines) {
      return '';
    }

    return lyricsResponse.lyrics.lines
      .map(line => line.words)
      .filter(words => words && words.trim().length > 0)
      .join('\n');
  }

  getSynchronizedLyrics(lyricsResponse: SpotifyLyricsResponse) {
    if (!lyricsResponse?.lyrics?.lines) {
      return [];
    }

    return lyricsResponse.lyrics.lines.map(line => ({
      startTime: parseInt(line.startTimeMs),
      words: line.words
    }));
  }

  async analyzeLyrics(
    trackId: string,
    trackName: string,
    artistName: string,
    lyrics: string
  ): Promise<LyricsAnalysisResult> {
    const words = lyrics.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const uniqueWords = [...new Set(words)];
    const wordCount = words.length;
    const lines = lyrics.split('\n').filter(line => line.trim().length > 0);

    // Simple sentiment analysis
    const positiveWords = ['love', 'happy', 'joy', 'beautiful', 'amazing', 'wonderful', 'great', 'good', 'excellent'];
    const negativeWords = ['hate', 'sad', 'pain', 'terrible', 'awful', 'horrible', 'bad', 'evil', 'ugly'];

    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    const neutralCount = wordCount - positiveCount - negativeCount;

    let overallSentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) overallSentiment = 'positive';
    else if (negativeCount > positiveCount) overallSentiment = 'negative';

    // Theme detection
    const themes = this.detectThemes(words);

    // Complexity analysis
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    const uniqueWordRatio = uniqueWords.length / wordCount;
    const readabilityScore = this.calculateReadabilityScore(lyrics);

    // Structure analysis
    const totalLines = lines.length;
    const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / totalLines;
    const rhymingPattern = this.detectRhymingPattern(lines);

    // Language detection
    const language = this.detectLanguage(lyrics);

    return {
      trackId,
      trackName,
      artistName,
      lyrics,
      wordCount,
      uniqueWords: uniqueWords.length,
      averageWordsPerLine: wordCount / totalLines,
      sentiment: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        overall: overallSentiment
      },
      themes,
      complexity: {
        averageWordLength,
        uniqueWordRatio,
        readabilityScore
      },
      structure: {
        totalLines,
        averageLineLength,
        rhymingPattern
      },
      language,
      analysisTimestamp: new Date()
    };
  }

  private detectThemes(words: string[]): string[] {
    const themeKeywords = {
      love: ['love', 'heart', 'romance', 'passion', 'desire', 'affection'],
      nature: ['nature', 'earth', 'sky', 'ocean', 'mountain', 'forest', 'river'],
      party: ['party', 'dance', 'celebration', 'fun', 'music', 'night'],
      reflection: ['life', 'time', 'memory', 'dream', 'hope', 'future'],
      struggle: ['fight', 'battle', 'struggle', 'pain', 'suffering', 'overcome']
    };

    const themeCounts: { [key: string]: number } = {};
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      themeCounts[theme] = words.filter(word => keywords.includes(word)).length;
    }

    return Object.entries(themeCounts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .map(([theme, _]) => theme);
  }

  private calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    if (sentences.length === 0 || words.length === 0) return 0;

    const fleschReadingEase = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
    return Math.max(0, Math.min(100, fleschReadingEase));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    for (const word of words) {
      if (word.length <= 3) {
        syllableCount += 1;
        continue;
      }

      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length === 0) continue;

      let syllables = 0;
      let previousVowel = false;

      for (const char of cleanWord) {
        const isVowel = /[aeiouy]/.test(char);
        if (isVowel && !previousVowel) {
          syllables++;
        }
        previousVowel = isVowel;
      }

      if (syllables === 0) syllables = 1;
      syllableCount += syllables;
    }

    return syllableCount;
  }

  private detectRhymingPattern(lines: string[]): string[] {
    const rhymingPattern: string[] = [];
    
    for (let i = 0; i < lines.length - 1; i++) {
      const currentLine = lines[i].trim();
      const nextLine = lines[i + 1].trim();
      
      if (currentLine && nextLine && this.linesRhyme(currentLine, nextLine)) {
        rhymingPattern.push(`${i + 1}-${i + 2}`);
      }
    }
    
    return rhymingPattern;
  }

  private linesRhyme(line1: string, line2: string): boolean {
    const words1 = line1.split(/\s+/).filter(w => w.length > 0);
    const words2 = line2.split(/\s+/).filter(w => w.length > 0);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    const lastWord1 = words1[words1.length - 1].toLowerCase().replace(/[^\w]/g, '');
    const lastWord2 = words2[words2.length - 1].toLowerCase().replace(/[^\w]/g, '');
    
    return this.wordsRhyme(lastWord1, lastWord2);
  }

  private wordsRhyme(word1: string, word2: string): boolean {
    if (word1.length < 3 || word2.length < 3) return false;
    
    const suffix1 = word1.slice(-3);
    const suffix2 = word2.slice(-3);
    
    return suffix1 === suffix2;
  }

  private detectLanguage(text: string): string {
    const englishWords = ['the', 'and', 'you', 'that', 'have', 'for', 'not', 'with', 'this', 'but'];
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se'];
    
    const words = text.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const spanishCount = words.filter(word => spanishWords.includes(word)).length;
    
    if (englishCount > spanishCount) return 'English';
    if (spanishCount > englishCount) return 'Spanish';
    return 'Unknown';
  }

  async compareLyrics(track1Id: string, track2Id: string): Promise<{
    track1: LyricsAnalysisResult;
    track2: LyricsAnalysisResult;
    comparison: {
      wordCountDifference: number;
      sentimentDifference: number;
      commonThemes: string[];
      uniqueThemes: string[];
      complexityComparison: string;
    };
  }> {
    const [track1Lyrics, track2Lyrics] = await Promise.all([
      this.getTrackLyrics(track1Id),
      this.getTrackLyrics(track2Id)
    ]);

    if (!track1Lyrics || !track2Lyrics) {
      throw new Error('Failed to fetch lyrics for comparison');
    }

    const track1Analysis = await this.analyzeLyrics(
      track1Id,
      'Track 1',
      'Artist 1',
      this.extractPlainLyrics(track1Lyrics)
    );

    const track2Analysis = await this.analyzeLyrics(
      track2Id,
      'Track 2',
      'Artist 2',
      this.extractPlainLyrics(track2Lyrics)
    );

    const wordCountDifference = Math.abs(track1Analysis.wordCount - track2Analysis.wordCount);
    const sentimentDifference = this.calculateSentimentDifference(
      track1Analysis.sentiment,
      track2Analysis.sentiment
    );

    const commonThemes = track1Analysis.themes.filter(theme => 
      track2Analysis.themes.includes(theme)
    );

    const uniqueThemes = [
      ...track1Analysis.themes.filter(theme => !track2Analysis.themes.includes(theme)),
      ...track2Analysis.themes.filter(theme => !track1Analysis.themes.includes(theme))
    ];

    const complexityComparison = this.compareComplexity(
      track1Analysis.complexity,
      track2Analysis.complexity
    );

    return {
      track1: track1Analysis,
      track2: track2Analysis,
      comparison: {
        wordCountDifference,
        sentimentDifference,
        commonThemes,
        uniqueThemes,
        complexityComparison
      }
    };
  }

  private calculateSentimentDifference(
    sentiment1: { positive: number; negative: number; neutral: number },
    sentiment2: { positive: number; negative: number; neutral: number }
  ): number {
    const score1 = (sentiment1.positive - sentiment1.negative) / (sentiment1.positive + sentiment1.negative + sentiment1.neutral);
    const score2 = (sentiment2.positive - sentiment2.negative) / (sentiment2.positive + sentiment2.negative + sentiment2.neutral);
    
    return Math.abs(score1 - score2);
  }

  private compareComplexity(
    complexity1: { averageWordLength: number; uniqueWordRatio: number; readabilityScore: number },
    complexity2: { averageWordLength: number; uniqueWordRatio: number; readabilityScore: number }
  ): string {
    const avgWordLengthDiff = complexity1.averageWordLength - complexity2.averageWordLength;
    const uniqueWordRatioDiff = complexity1.uniqueWordRatio - complexity2.uniqueWordRatio;
    const readabilityDiff = complexity1.readabilityScore - complexity2.readabilityScore;

    if (Math.abs(avgWordLengthDiff) < 0.5 && Math.abs(uniqueWordRatioDiff) < 0.1 && Math.abs(readabilityDiff) < 10) {
      return 'Similar complexity';
    } else if (avgWordLengthDiff > 0 && uniqueWordRatioDiff > 0 && readabilityDiff < 0) {
      return 'Track 1 is more complex';
    } else if (avgWordLengthDiff < 0 && uniqueWordRatioDiff < 0 && readabilityDiff > 0) {
      return 'Track 2 is more complex';
    } else {
      return 'Mixed complexity differences';
    }
  }
}

export default SpotifyLyricsService;
*/
