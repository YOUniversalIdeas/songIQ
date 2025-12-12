import mongoose, { Document, Schema } from 'mongoose';

export interface IUnifiedTrack extends Document {
  // Identity
  name: string;
  artistId: mongoose.Types.ObjectId;
  artistName: string;
  musicbrainzId?: string;
  externalIds?: {
    spotify?: string;
    lastfm?: string;
  };

  // Metrics
  metrics?: {
    spotify?: {
      timestamp: Date;
      source: string;
      popularity: number;
      playcount?: number;
    };
    lastfm?: {
      timestamp: Date;
      source: string;
      listeners: number;
      playcount: number;
    };
  };

  // Composite scoring
  compositeScore?: number;
  momentumScore?: number;
  lastScoreUpdate?: Date;

  // Metadata
  album?: string;
  releaseDate?: Date;
  genres?: string[];
  images?: Array<{
    url: string;
    source: string;
  }>;
  duration?: number;

  // History tracking
  scoreHistory?: Array<{
    date: Date;
    compositeScore: number;
    momentumScore: number;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UnifiedTrackSchema = new Schema<IUnifiedTrack>(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    artistId: {
      type: Schema.Types.ObjectId,
      ref: 'UnifiedArtist',
      required: true,
      index: true
    },
    artistName: {
      type: String,
      required: true,
      index: true
    },
    musicbrainzId: String,
    externalIds: {
      spotify: String,
      lastfm: String
    },
    metrics: {
      spotify: {
        timestamp: Date,
        source: String,
        popularity: Number,
        playcount: Number
      },
      lastfm: {
        timestamp: Date,
        source: String,
        listeners: Number,
        playcount: Number
      }
    },
    compositeScore: {
      type: Number,
      default: 0,
      index: true
    },
    momentumScore: {
      type: Number,
      default: 0
    },
    lastScoreUpdate: Date,
    album: String,
    releaseDate: Date,
    genres: [String],
    images: [{
      url: String,
      source: String
    }],
    duration: Number,
    scoreHistory: [{
      date: Date,
      compositeScore: Number,
      momentumScore: Number
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
UnifiedTrackSchema.index({ compositeScore: -1 });
UnifiedTrackSchema.index({ artistId: 1, compositeScore: -1 });
UnifiedTrackSchema.index({ name: 'text', artistName: 'text' });
UnifiedTrackSchema.index({ genres: 1 });

const UnifiedTrack = mongoose.model<IUnifiedTrack>('UnifiedTrack', UnifiedTrackSchema);

export default UnifiedTrack;

