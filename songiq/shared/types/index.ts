// Song-related types
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // Duration in seconds
  audioFeatures?: AudioFeatures;
  uploadDate: Date;
  fileUrl: string;
  analysisResults?: Analysis;
  userId?: string;
  isReleased: boolean;
  releaseDate?: Date;
  platforms?: string[];
  performanceMetrics?: PerformanceMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// Analysis results types (new comprehensive Analysis model)
export interface Analysis {
  songId: string;
  // Prediction Results
  successScore: number; // 0-100 overall success prediction
  marketPotential: number; // 0-100 market viability score
  socialScore: number; // 0-100 social media/viral potential
  recommendations: Recommendation[];
  // Detailed Analysis
  genreAnalysis: GenreAnalysis;
  audienceAnalysis: AudienceAnalysis;
  competitiveAnalysis: CompetitiveAnalysis;
  // Technical Analysis
  productionQuality: ProductionQuality;
  // Release Strategy
  releaseRecommendations: ReleaseRecommendations;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy AnalysisResults (keeping for backward compatibility)
export interface AnalysisResults {
  songId: string;
  audioFeatures: LegacyAudioFeatures;
  vocalCharacteristics: VocalCharacteristics;
  instrumentation: string[];
  lyricalThemes: string[];
  successPrediction: SuccessPrediction;
  createdAt: Date;
  updatedAt: Date;
}

// Spotify Audio Features (matching the AudioFeatures model)
export interface AudioFeatures {
  songId: string;
  acousticness: number; // 0.0 to 1.0
  danceability: number; // 0.0 to 1.0
  energy: number; // 0.0 to 1.0
  instrumentalness: number; // 0.0 to 1.0
  liveness: number; // 0.0 to 1.0
  loudness: number; // -60.0 to 0.0 dB
  speechiness: number; // 0.0 to 1.0
  tempo: number; // BPM
  valence: number; // 0.0 to 1.0 (musical positiveness)
  key: number; // 0-11 (C=0, C#=1, D=2, etc.)
  mode: number; // 0=minor, 1=major
  time_signature: number; // 3/4=3, 4/4=4, etc.
  duration_ms: number; // Duration in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

// Legacy AudioFeatures (keeping for backward compatibility)
export interface LegacyAudioFeatures {
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

// New Analysis model interfaces
export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: number; // 0-100 potential impact
}

export interface GenreAnalysis {
  primaryGenre: string;
  subGenres: string[];
  genreConfidence: number; // 0-100
  marketTrend: 'rising' | 'stable' | 'declining';
}

export interface AudienceAnalysis {
  targetDemographics: string[];
  ageRange: {
    min: number;
    max: number;
  };
  geographicMarkets: string[];
  listeningHabits: string[];
}

export interface SimilarArtist {
  name: string;
  similarity: number; // 0-100
  marketPosition: string;
}

export interface CompetitiveAnalysis {
  similarArtists: SimilarArtist[];
  marketGap: string;
  competitiveAdvantage: string[];
}

export interface ProductionQuality {
  overall: number; // 0-100
  mixing: number;
  mastering: number;
  arrangement: number;
  performance: number;
}

export interface ReleaseRecommendations {
  optimalReleaseDate: Date;
  targetPlatforms: string[];
  marketingStrategy: string[];
  pricingStrategy: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bandName: string;
  username: string;
  telephone: string;
  profilePicture?: string;
  bio?: string;
  role: 'user' | 'artist' | 'producer' | 'label' | 'admin' | 'superadmin';
  isVerified: boolean;
  spotifyToken?: string;
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    usage: number;
  };
  songLimit: number;
  remainingSongs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  startDate: Date;
  endDate?: Date;
  features: string[];
}

export interface UserPreferences {
  genres: string[];
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profilePublic: boolean;
    songsPublic: boolean;
    analyticsPublic: boolean;
  };
}

export interface UserStats {
  totalSongs: number;
  totalAnalyses: number;
  totalPlays: number;
  memberSince: Date;
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

// Upload-related types
export interface UploadResponse {
  songId: string;
  uploadUrl: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  fileMetadata: FileMetadata;
  song: Song;
}

export interface FileMetadata {
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  sizeInMB: number;
  extension: string;
  path: string;
  url: string;
}

export interface UploadProgress {
  songId: string;
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'failed';
  progress: number; // 0-100
  currentStep: string;
  estimatedTime?: number; // seconds
  error?: string;
}

export interface UploadError {
  error: string;
  details?: string;
  field?: string;
  code?: string;
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