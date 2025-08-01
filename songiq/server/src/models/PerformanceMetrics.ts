import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceMetrics extends Document {
  songId: mongoose.Types.ObjectId;
  streamingData: {
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
  };
  chartPositions: {
    billboard: {
      hot100?: number;
      top200?: number;
    };
    genreSpecific: {
      [key: string]: number;
    };
  };
  socialMetrics: {
    mentions: number;
    engagement: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    trending: boolean;
  };
  demographics: {
    ageGroups: {
      [key: string]: number;
    };
    locations: {
      [key: string]: number;
    };
    gender: {
      male: number;
      female: number;
      other: number;
    };
  };
  updatedAt: Date;
}

const StreamingDataSchema = new Schema({
  spotify: {
    streams: {
      type: Number,
      default: 0,
      min: 0
    },
    listeners: {
      type: Number,
      default: 0,
      min: 0
    },
    playlistAdds: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  apple: {
    streams: {
      type: Number,
      default: 0,
      min: 0
    },
    listeners: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  youtube: {
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    comments: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, { _id: false });

const ChartPositionsSchema = new Schema({
  billboard: {
    hot100: {
      type: Number,
      min: 1,
      max: 100
    },
    top200: {
      type: Number,
      min: 1,
      max: 200
    }
  },
  genreSpecific: {
    type: Map,
    of: Number,
    default: {}
  }
}, { _id: false });

const SocialMetricsSchema = new Schema({
  mentions: {
    type: Number,
    default: 0,
    min: 0
  },
  engagement: {
    type: Number,
    default: 0,
    min: 0
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  trending: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const DemographicsSchema = new Schema({
  ageGroups: {
    type: Map,
    of: Number,
    default: {}
  },
  locations: {
    type: Map,
    of: Number,
    default: {}
  },
  gender: {
    male: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    female: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    other: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, { _id: false });

const PerformanceMetricsSchema = new Schema<IPerformanceMetrics>({
  songId: {
    type: Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
    unique: true
  },
  streamingData: {
    type: StreamingDataSchema,
    required: true,
    default: {}
  },
  chartPositions: {
    type: ChartPositionsSchema,
    required: true,
    default: {}
  },
  socialMetrics: {
    type: SocialMetricsSchema,
    required: true,
    default: {}
  },
  demographics: {
    type: DemographicsSchema,
    required: true,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
PerformanceMetricsSchema.index({ songId: 1 });
PerformanceMetricsSchema.index({ 'streamingData.spotify.streams': -1 });
PerformanceMetricsSchema.index({ 'chartPositions.billboard.hot100': 1 });
PerformanceMetricsSchema.index({ 'socialMetrics.engagement': -1 });
PerformanceMetricsSchema.index({ updatedAt: -1 });

// Virtual for total streams across all platforms
PerformanceMetricsSchema.virtual('totalStreams').get(function(this: IPerformanceMetrics) {
  return (
    this.streamingData.spotify.streams +
    this.streamingData.apple.streams +
    this.streamingData.youtube.views
  );
});

// Virtual for total listeners
PerformanceMetricsSchema.virtual('totalListeners').get(function(this: IPerformanceMetrics) {
  return (
    this.streamingData.spotify.listeners +
    this.streamingData.apple.listeners
  );
});

// Virtual for engagement rate
PerformanceMetricsSchema.virtual('engagementRate').get(function(this: IPerformanceMetrics) {
  const totalMentions = this.socialMetrics.mentions;
  if (totalMentions === 0) return 0;
  return (this.socialMetrics.engagement / totalMentions) * 100;
});

// Pre-save validation
PerformanceMetricsSchema.pre('save', function(next) {
  // Validate gender percentages sum to 100
  const genderSum = this.demographics.gender.male + this.demographics.gender.female + this.demographics.gender.other;
  if (Math.abs(genderSum - 100) > 0.01) {
    next(new Error('Gender percentages must sum to 100'));
  }
  
  // Validate chart positions
  if (this.chartPositions.billboard.hot100 && (this.chartPositions.billboard.hot100 < 1 || this.chartPositions.billboard.hot100 > 100)) {
    next(new Error('Billboard Hot 100 position must be between 1 and 100'));
  }
  
  if (this.chartPositions.billboard.top200 && (this.chartPositions.billboard.top200 < 1 || this.chartPositions.billboard.top200 > 200)) {
    next(new Error('Billboard Top 200 position must be between 1 and 200'));
  }
  
  next();
});

// Static method to get top performing songs
PerformanceMetricsSchema.statics.getTopPerforming = function(limit = 10) {
  return this.find()
    .sort({ 'streamingData.spotify.streams': -1 })
    .limit(limit)
    .populate('songId', 'title artist');
};

// Instance method to update streaming data
PerformanceMetricsSchema.methods.updateStreamingData = function(platform: string, data: any) {
  if (platform === 'spotify') {
    this.streamingData.spotify = { ...this.streamingData.spotify, ...data };
  } else if (platform === 'apple') {
    this.streamingData.apple = { ...this.streamingData.apple, ...data };
  } else if (platform === 'youtube') {
    this.streamingData.youtube = { ...this.streamingData.youtube, ...data };
  }
  return this.save();
};

export default mongoose.model<IPerformanceMetrics>('PerformanceMetrics', PerformanceMetricsSchema); 