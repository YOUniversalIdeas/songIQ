import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioFeatures extends Document {
  songId: mongoose.Types.ObjectId;
  // Spotify Audio Features
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

const AudioFeaturesSchema = new Schema<IAudioFeatures>({
  songId: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    unique: true
  },
  acousticness: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  danceability: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  energy: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  instrumentalness: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  liveness: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  loudness: {
    type: Number,
    required: true,
    min: -60.0,
    max: 0.0,
    default: 0.0
  },
  speechiness: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.0
  },
  tempo: {
    type: Number,
    required: true,
    min: 0,
    max: 300,
    default: 120
  },
  valence: {
    type: Number,
    required: true,
    min: 0.0,
    max: 1.0,
    default: 0.5
  },
  key: {
    type: Number,
    required: true,
    min: 0,
    max: 11,
    default: 0
  },
  mode: {
    type: Number,
    required: true,
    enum: [0, 1], // 0=minor, 1=major
    default: 1
  },
  time_signature: {
    type: Number,
    required: true,
    min: 3,
    max: 7,
    default: 4
  },
  duration_ms: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AudioFeaturesSchema.index({ songId: 1 });
AudioFeaturesSchema.index({ tempo: 1 });
AudioFeaturesSchema.index({ key: 1 });
AudioFeaturesSchema.index({ energy: 1 });
AudioFeaturesSchema.index({ danceability: 1 });
AudioFeaturesSchema.index({ valence: 1 });

// Virtual for formatted duration
AudioFeaturesSchema.virtual('duration_seconds').get(function(this: IAudioFeatures) {
  return Math.round(this.duration_ms / 1000);
});

// Virtual for key name
AudioFeaturesSchema.virtual('key_name').get(function(this: IAudioFeatures) {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return keys[this.key];
});

// Virtual for mode name
AudioFeaturesSchema.virtual('mode_name').get(function(this: IAudioFeatures) {
  return this.mode === 1 ? 'major' : 'minor';
});

// Pre-save validation
AudioFeaturesSchema.pre('save', function(next) {
  // Validate that all Spotify features are within proper ranges
  const features = ['acousticness', 'danceability', 'energy', 'instrumentalness', 'liveness', 'speechiness', 'valence'];
  
  for (const feature of features) {
    const value = this.get(feature);
    if (value < 0.0 || value > 1.0) {
      return next(new Error(`${feature} must be between 0.0 and 1.0`));
    }
  }
  
  if (this.loudness < -60.0 || this.loudness > 0.0) {
    return next(new Error('loudness must be between -60.0 and 0.0'));
  }
  
  if (this.tempo < 0 || this.tempo > 300) {
    return next(new Error('tempo must be between 0 and 300 BPM'));
  }
  
  if (this.key < 0 || this.key > 11) {
    return next(new Error('key must be between 0 and 11'));
  }
  
  if (![0, 1].includes(this.mode)) {
    return next(new Error('mode must be 0 (minor) or 1 (major)'));
  }
  
  if (this.time_signature < 3 || this.time_signature > 7) {
    return next(new Error('time_signature must be between 3 and 7'));
  }
  
  next();
});

export default mongoose.model<IAudioFeatures>('AudioFeatures', AudioFeaturesSchema); 