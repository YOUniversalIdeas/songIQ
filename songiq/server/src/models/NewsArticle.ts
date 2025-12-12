import mongoose, { Document, Schema } from 'mongoose';

export interface INewsArticle extends Document {
  title: string;
  description?: string;
  content?: string; // Full article content if available
  url: string; // Original article URL
  imageUrl?: string;
  author?: string;
  source: string; // Source name (e.g., "Pitchfork", "Bandcamp Daily")
  sourceType: 'rss' | 'api' | 'reddit' | 'twitter' | 'instagram' | 'soundcloud' | 'mastodon' | 'manual';
  publishedAt: Date;
  fetchedAt: Date;
  
  // Categorization
  tags?: string[]; // Generic tags
  genres?: string[]; // Music genres mentioned
  artists?: string[]; // Artists mentioned in the article
  
  // Metadata
  relevanceScore?: number; // Score for independent music relevance (0-100)
  isIndependent?: boolean; // Whether article is about independent music
  language?: string;
  
  // Engagement metrics (if available from source)
  viewCount?: number;
  likeCount?: number;
  shareCount?: number;
  
  // Status
  isActive: boolean;
  isFeatured?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const NewsArticleSchema = new Schema<INewsArticle>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [500, 'Title cannot be more than 500 characters'],
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    unique: true,
    index: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    index: true
  },
  sourceType: {
    type: String,
    enum: ['rss', 'api', 'reddit', 'twitter', 'instagram', 'soundcloud', 'mastodon', 'manual'],
    required: true,
    default: 'rss',
    index: true
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  genres: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  artists: [{
    type: String,
    trim: true
  }],
  relevanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  isIndependent: {
    type: Boolean,
    default: false,
    index: true
  },
  language: {
    type: String,
    default: 'en'
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
NewsArticleSchema.index({ publishedAt: -1, isActive: 1 });
NewsArticleSchema.index({ relevanceScore: -1, publishedAt: -1 });
NewsArticleSchema.index({ isIndependent: 1, publishedAt: -1 });
NewsArticleSchema.index({ source: 1, publishedAt: -1 });
NewsArticleSchema.index({ tags: 1, publishedAt: -1 });
NewsArticleSchema.index({ artists: 1, publishedAt: -1 });

// Text search index
NewsArticleSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text' 
});

export default mongoose.model<INewsArticle>('NewsArticle', NewsArticleSchema);

