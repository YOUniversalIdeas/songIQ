// LYRICS TYPES FOR UNRELEASED SONGS - ACTIVE
// These types support lyrics analysis for unreleased songs

export interface LyricsAnalysisResult {
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
  source: 'spotify' | 'uploaded' | 'manual';
}

export interface LyricsUploadRequest {
  trackName: string;
  artistName: string;
  lyrics?: string;
  file?: Express.Multer.File;
}

export interface LyricsComparisonResult {
  track1: LyricsAnalysisResult;
  track2: LyricsAnalysisResult;
  comparison: {
    wordCountDifference: number;
    sentimentDifference: number;
    commonThemes: string[];
    uniqueThemes: string[];
    complexityComparison: string;
  };
}
