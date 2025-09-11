export interface SongData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
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
    }>;
    marketPotential: number;
    socialScore: number;
  };
  audioFeatures: {
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
  waveformData?: number[];
  uploadDate: string;
}
