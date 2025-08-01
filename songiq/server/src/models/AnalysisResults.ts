import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalysisResults extends Document {
  songId: mongoose.Types.ObjectId;
  audioFeatures: {
    genre: string;
    subGenre: string;
    tempo: number;
    key: string;
    mood: string;
    energy: number;
    duration: number;
    dynamicRange: number;
    loudness: number;
    spectralCentroid: number;
    spectralRolloff: number;
  };
  vocalCharacteristics: {
    style: string;
    range: string;
    intensity: number;
    clarity: number;
    presence: number;
  };
  instrumentation: string[];
  lyricalThemes: string[];
  successPrediction: {
    score: number;
    ranking: string;
    insights: string[];
    confidence: number;
    factors: Array<{
      name: string;
      weight: number;
      score: number;
      description: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PredictionFactorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const AudioFeaturesSchema = new Schema({
  genre: {
    type: String,
    required: true,
    enum: ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'r&b', 'folk', 'metal', 'indie', 'other']
  },
  subGenre: {
    type: String,
    required: true
  },
  tempo: {
    type: Number,
    required: true,
    min: 0,
    max: 300
  },
  key: {
    type: String,
    required: true,
    enum: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'energetic', 'calm', 'dark', 'uplifting', 'melancholic', 'aggressive', 'romantic', 'mysterious']
  },
  energy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  dynamicRange: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  loudness: {
    type: Number,
    required: true
  },
  spectralCentroid: {
    type: Number,
    required: true
  },
  spectralRolloff: {
    type: Number,
    required: true
  }
}, { _id: false });

const VocalCharacteristicsSchema = new Schema({
  style: {
    type: String,
    required: true,
    enum: ['pop', 'rock', 'jazz', 'classical', 'folk', 'r&b', 'rap', 'country', 'electronic', 'other']
  },
  range: {
    type: String,
    required: true,
    enum: ['bass', 'baritone', 'tenor', 'alto', 'soprano', 'instrumental']
  },
  intensity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  clarity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  presence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { _id: false });

const SuccessPredictionSchema = new Schema({
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  ranking: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'average', 'below_average', 'poor']
  },
  insights: [{
    type: String,
    required: true
  }],
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  factors: [PredictionFactorSchema]
}, { _id: false });

const AnalysisResultsSchema = new Schema<IAnalysisResults>({
  songId: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    unique: true
  },
  audioFeatures: {
    type: AudioFeaturesSchema,
    required: true
  },
  vocalCharacteristics: {
    type: VocalCharacteristicsSchema,
    required: true
  },
  instrumentation: [{
    type: String,
    enum: ['drums', 'bass', 'guitar', 'piano', 'synth', 'strings', 'brass', 'woodwinds', 'percussion', 'vocals', 'other']
  }],
  lyricalThemes: [{
    type: String,
    maxlength: 50
  }],
  successPrediction: {
    type: SuccessPredictionSchema,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
AnalysisResultsSchema.index({ songId: 1 });
AnalysisResultsSchema.index({ 'audioFeatures.genre': 1 });
AnalysisResultsSchema.index({ 'successPrediction.score': -1 });
AnalysisResultsSchema.index({ createdAt: -1 });

// Virtual for formatted duration
AnalysisResultsSchema.virtual('formattedDuration').get(function(this: IAnalysisResults) {
  const minutes = Math.floor(this.audioFeatures.duration / 60);
  const seconds = Math.floor(this.audioFeatures.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Pre-save validation
AnalysisResultsSchema.pre('save', function(next) {
  if (this.successPrediction.score < 0 || this.successPrediction.score > 100) {
    next(new Error('Success prediction score must be between 0 and 100'));
  }
  next();
});

export default mongoose.model<IAnalysisResults>('AnalysisResults', AnalysisResultsSchema); 