// Song-related types
export interface Song {
  id: string;
  title: string;
  artist: string;
  uploadDate: Date;
  audioFile: string;
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  analysisResults?: AnalysisResults;
  performanceMetrics?: PerformanceMetrics;
}

// Analysis results types
export interface AnalysisResults {
  songId: string;
  audioFeatures: AudioFeatures;
  vocalCharacteristics: VocalCharacteristics;
  instrumentation: string[];
  lyricalThemes: string[];
  successPrediction: SuccessPrediction;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioFeatures {
  genre: string;
  subGenre: string;
  tempo: number; // BPM
  key: string;
  mood: string;
  energy: number; // 0-100
  duration: number; // seconds
  dynamicRange: number;
  loudness: number; // LUFS
  spectralCentroid: number;
  spectralRolloff: number;
}

export interface VocalCharacteristics {
  style: string;
  range: string;
  intensity: number; // 0-100
  clarity: number; // 0-100
  presence: number; // 0-100
}

export interface SuccessPrediction {
  score: number; // 0-100
  ranking: string;
  insights: string[];
  confidence: number; // 0-100
  factors: PredictionFactor[];
}

export interface PredictionFactor {
  name: string;
  weight: number;
  score: number;
  description: string;
}

// Performance metrics types
export interface PerformanceMetrics {
  songId: string;
  streamingData: StreamingData;
  chartPositions: ChartPositions;
  socialMetrics: SocialMetrics;
  demographics: Demographics;
  updatedAt: Date;
}

export interface StreamingData {
  spotify: {
    streams: number;
    listeners: number;
    playlistAdds: number;
  };
  apple: {
    streams: number;
    listeners: number;
  };
  youtube: {
    views: number;
    likes: number;
    comments: number;
  };
}

export interface ChartPositions {
  billboard: {
    hot100?: number;
    top200?: number;
  };
  genreSpecific: {
    [genre: string]: number;
  };
}

export interface SocialMetrics {
  mentions: number;
  engagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  trending: boolean;
}

export interface Demographics {
  ageGroups: {
    [ageGroup: string]: number; // percentage
  };
  locations: {
    [location: string]: number; // percentage
  };
  gender: {
    male: number;
    female: number;
    other: number;
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  songId: string;
  uploadUrl: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AnalysisStatus {
  songId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  estimatedTime?: number; // seconds
}

// Form types
export interface UploadFormData {
  title: string;
  artist: string;
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  audioFile: File;
}

// Market data types
export interface MarketData {
  trends: MusicTrends;
  similarSongs: SimilarSong[];
  genreInsights: GenreInsights;
}

export interface MusicTrends {
  popularTempos: number[];
  popularKeys: string[];
  trendingGenres: string[];
  currentEnergy: number;
  popularMoods: string[];
}

export interface SimilarSong {
  id: string;
  title: string;
  artist: string;
  similarity: number; // 0-100
  performance: {
    streams: number;
    chartPosition?: number;
  };
}

export interface GenreInsights {
  genre: string;
  averageTempo: number;
  popularKeys: string[];
  successFactors: string[];
  marketSize: number;
} 