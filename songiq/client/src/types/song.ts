export interface SongData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  successScore?: {
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
    }>;
    marketPotential: number;
    socialScore: number;
  };
  audioFeatures?: {
    danceability: number;
    energy: number;
    valence: number;
    tempo: number;
    loudness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    speechiness: number;
  };
  analysisResults?: {
    successScore?: number;
    confidence?: number;
    audioFeatures?: {
      danceability: number;
      energy: number;
      valence: number;
      tempo: number;
      loudness: number;
      acousticness: number;
      instrumentalness: number;
      liveness: number;
      speechiness: number;
    };
    marketPotential?: number;
    socialScore?: number;
    riskFactors?: string[];
  };
  keyInsights?: string[];
  recommendations?: string[];
  waveformData?: number[];
  uploadDate: string;
}
