import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysis extends Document {
  songId: mongoose.Types.ObjectId;
  // Prediction Results
  successScore: number; // 0-100 overall success prediction
  marketPotential: number; // 0-100 market viability score
  socialScore: number; // 0-100 social media/viral potential
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: number; // 0-100 potential impact
  }>;
  // Detailed Analysis
  genreAnalysis: {
    primaryGenre: string;
    subGenres: string[];
    genreConfidence: number; // 0-100
    marketTrend: 'rising' | 'stable' | 'declining';
  };
  audienceAnalysis: {
    targetDemographics: string[];
    ageRange: {
      min: number;
      max: number;
    };
    geographicMarkets: string[];
    listeningHabits: string[];
  };
  competitiveAnalysis: {
    similarArtists: Array<{
      name: string;
      similarity: number; // 0-100
      marketPosition: string;
    }>;
    marketGap: string;
    competitiveAdvantage: string[];
  };
  // Technical Analysis
  productionQuality: {
    overall: number; // 0-100
    mixing: number;
    mastering: number;
    arrangement: number;
    performance: number;
  };
  // Release Strategy
  releaseRecommendations: {
    optimalReleaseDate: Date;
    targetPlatforms: string[];
    marketingStrategy: string[];
    pricingStrategy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ['production', 'marketing', 'distribution', 'performance', 'arrangement', 'genre', 'audience']
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  priority: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low']
  },
  impact: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const GenreAnalysisSchema = new Schema({
  primaryGenre: {
    type: String,
    required: true,
    enum: ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'r&b', 'folk', 'metal', 'indie', 'latin', 'reggae', 'blues', 'punk', 'alternative', 'dance', 'soul', 'funk', 'disco', 'other']
  },
  subGenres: [{
    type: String,
    maxlength: 50
  }],
  genreConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  marketTrend: {
    type: String,
    required: true,
    enum: ['rising', 'stable', 'declining']
  }
}, { _id: false });

const AudienceAnalysisSchema = new Schema({
  targetDemographics: [{
    type: String,
    enum: ['teens', 'young_adults', 'adults', 'seniors', 'urban', 'suburban', 'rural', 'college_students', 'professionals', 'artists', 'music_enthusiasts']
  }],
  ageRange: {
    min: {
      type: Number,
      required: true,
      min: 13,
      max: 100
    },
    max: {
      type: Number,
      required: true,
      min: 13,
      max: 100
    }
  },
  geographicMarkets: [{
    type: String,
    maxlength: 50
  }],
  listeningHabits: [{
    type: String,
    enum: ['streaming', 'radio', 'live_events', 'social_media', 'playlists', 'discovery_platforms']
  }]
}, { _id: false });

const SimilarArtistSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  similarity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  marketPosition: {
    type: String,
    required: true,
    enum: ['emerging', 'established', 'mainstream', 'underground', 'legendary']
  }
}, { _id: false });

const CompetitiveAnalysisSchema = new Schema({
  similarArtists: [SimilarArtistSchema],
  marketGap: {
    type: String,
    required: true,
    maxlength: 200
  },
  competitiveAdvantage: [{
    type: String,
    maxlength: 100
  }]
}, { _id: false });

const ProductionQualitySchema = new Schema({
  overall: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  mixing: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  mastering: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  arrangement: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  performance: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const ReleaseRecommendationsSchema = new Schema({
  optimalReleaseDate: {
    type: Date,
    required: true
  },
  targetPlatforms: [{
    type: String,
    enum: ['spotify', 'apple_music', 'youtube', 'soundcloud', 'tidal', 'amazon_music', 'deezer', 'bandcamp']
  }],
  marketingStrategy: [{
    type: String,
    maxlength: 200
  }],
  pricingStrategy: {
    type: String,
    required: true,
    enum: ['premium', 'standard', 'budget', 'free', 'pay_what_you_want']
  }
}, { _id: false });

const AnalysisSchema = new Schema<IAnalysis>({
  songId: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    unique: true
  },
  successScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  marketPotential: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  socialScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  recommendations: [RecommendationSchema],
  genreAnalysis: {
    type: GenreAnalysisSchema,
    required: true
  },
  audienceAnalysis: {
    type: AudienceAnalysisSchema,
    required: true
  },
  competitiveAnalysis: {
    type: CompetitiveAnalysisSchema,
    required: true
  },
  productionQuality: {
    type: ProductionQualitySchema,
    required: true
  },
  releaseRecommendations: {
    type: ReleaseRecommendationsSchema,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AnalysisSchema.index({ songId: 1 });
AnalysisSchema.index({ successScore: -1 });
AnalysisSchema.index({ marketPotential: -1 });
AnalysisSchema.index({ socialScore: -1 });
AnalysisSchema.index({ 'genreAnalysis.primaryGenre': 1 });
AnalysisSchema.index({ 'genreAnalysis.marketTrend': 1 });
AnalysisSchema.index({ createdAt: -1 });

// Virtual for overall rating
AnalysisSchema.virtual('overallRating').get(function(this: IAnalysis) {
  return Math.round((this.successScore + this.marketPotential + this.socialScore) / 3);
});

// Virtual for rating category
AnalysisSchema.virtual('ratingCategory').get(function(this: IAnalysis) {
  const rating = Math.round((this.successScore + this.marketPotential + this.socialScore) / 3);
  if (rating >= 80) return 'excellent';
  if (rating >= 60) return 'good';
  if (rating >= 40) return 'average';
  if (rating >= 20) return 'below_average';
  return 'poor';
});

// Virtual for high priority recommendations
AnalysisSchema.virtual('highPriorityRecommendations').get(function(this: IAnalysis) {
  return this.recommendations.filter(rec => rec.priority === 'high');
});

// Pre-save validation
AnalysisSchema.pre('save', function(next) {
  // Validate scores are within range
  const scores = ['successScore', 'marketPotential', 'socialScore'];
  for (const score of scores) {
    const value = this.get(score);
    if (value < 0 || value > 100) {
      return next(new Error(`${score} must be between 0 and 100`));
    }
  }
  
  // Validate age range
  if (this.audienceAnalysis.ageRange.min > this.audienceAnalysis.ageRange.max) {
    return next(new Error('Minimum age cannot be greater than maximum age'));
  }
  
  // Validate production quality scores
  const qualityScores = ['overall', 'mixing', 'mastering', 'arrangement', 'performance'];
  for (const score of qualityScores) {
    const value = this.productionQuality[score as keyof typeof this.productionQuality];
    if (value < 0 || value > 100) {
      return next(new Error(`Production quality ${score} must be between 0 and 100`));
    }
  }
  
  next();
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema); 