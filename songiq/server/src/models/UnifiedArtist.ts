import mongoose, { Document, Schema } from 'mongoose';

export interface IUnifiedArtist extends Document {
  // Identity
  name: string;
  musicbrainzId?: string;
  externalIds?: {
    spotify?: string;
    lastfm?: string;
    listenbrainz?: string;
  };

  // Metrics from different sources
  metrics?: {
    spotify?: {
      timestamp: Date;
      source: string;
      followers: number;
      popularity: number;
      followersGrowth7d?: number;
      followersGrowthPct7d?: number;
    };
    lastfm?: {
      timestamp: Date;
      source: string;
      listeners: number;
      playcount: number;
      listenersGrowth7d?: number;
      playcountGrowth7d?: number;
    };
    listenbrainz?: {
      timestamp: Date;
      source: string;
      listeners: number;
      listenCount: number;
    };
  };

  // Composite scoring
  compositeScore?: number;
  momentumScore?: number;
  reachScore?: number;
  lastScoreUpdate?: Date;

  // Metadata
  genres?: string[];
  images?: Array<{
    url: string;
    source: string;
    width?: number;
    height?: number;
  }>;
  country?: string;
  type?: string;
  isIndependent?: boolean; // Flag for independent artists
  label?: string; // Record label name if available

  // History tracking
  scoreHistory?: Array<{
    date: Date;
    compositeScore: number;
    momentumScore: number;
    reachScore: number;
  }>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UnifiedArtistSchema = new Schema<IUnifiedArtist>(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    musicbrainzId: {
      type: String,
      index: true,
      sparse: true
    },
    externalIds: {
      spotify: String,
      lastfm: String,
      listenbrainz: String
    },
    metrics: {
      spotify: {
        timestamp: Date,
        source: String,
        followers: Number,
        popularity: Number,
        followersGrowth7d: Number,
        followersGrowthPct7d: Number
      },
      lastfm: {
        timestamp: Date,
        source: String,
        listeners: Number,
        playcount: Number,
        listenersGrowth7d: Number,
        playcountGrowth7d: Number
      },
      listenbrainz: {
        timestamp: Date,
        source: String,
        listeners: Number,
        listenCount: Number
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
    reachScore: {
      type: Number,
      default: 0
    },
    lastScoreUpdate: Date,
    genres: [String],
    images: [{
      url: String,
      source: String,
      width: Number,
      height: Number
    }],
    country: String,
    type: String,
    isIndependent: {
      type: Boolean,
      default: true,
      index: true
    },
    label: String,
    scoreHistory: [{
      date: Date,
      compositeScore: Number,
      momentumScore: Number,
      reachScore: Number
    }]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
UnifiedArtistSchema.index({ compositeScore: -1 });
UnifiedArtistSchema.index({ momentumScore: -1 });
UnifiedArtistSchema.index({ name: 'text' });
UnifiedArtistSchema.index({ genres: 1 });
UnifiedArtistSchema.index({ 'externalIds.spotify': 1 });
UnifiedArtistSchema.index({ 'externalIds.lastfm': 1 });

const UnifiedArtist = mongoose.model<IUnifiedArtist>('UnifiedArtist', UnifiedArtistSchema);

export default UnifiedArtist;

