import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bandName: string;
  username: string;
  telephone: string;
  profilePicture?: string;
  bio?: string;
  role: 'user' | 'artist' | 'producer' | 'label' | 'admin' | 'superadmin';
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  smsVerificationCode?: string;
  smsVerificationExpires?: Date;
  smsVerificationInitiated?: boolean;
  smsVerificationServiceSid?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  spotifyToken?: string;
  uploadedSongs: mongoose.Types.ObjectId[];
  favoriteSongs: mongoose.Types.ObjectId[];
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
    features: string[];
    usage: {
      songsAnalyzed: number;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    };
  };
  preferences: {
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
  };
  stats: {
    totalSongs: number;
    totalAnalyses: number;
    totalPlays: number;
    memberSince: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  isSubscriptionActive(): boolean;
  canAnalyzeSong(): Promise<boolean>;
  getSongLimit(): number;
  getRemainingSongs(): Promise<number>;
  resetUsageIfNeeded(): Promise<void>;
  generateEmailVerificationToken(): string;
  isEmailVerificationExpired(): boolean;
  generateSMSVerificationCode(): string;
  isSMSVerificationExpired(): boolean;
  generatePasswordResetToken(): string;
  isPasswordResetExpired(): boolean;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  bandName: {
    type: String,
    required: [true, 'Please select your role in the music industry'],
    enum: [
      // Primary Decision Makers
      'A&R Representative',
      'Record Label Executive', 
      'Music Publisher',
      'Artist Manager',
      'Talent Agent/Booking Agent',
      'Music Supervisor',
      'Playlist Curator',
      'Radio Program Director',
      // Creative & Production
      'Producer',
      'Songwriter',
      'Composer',
      'Artist/Musician',
      'Sound Engineer',
      'Mixing Engineer',
      // Industry Analysts & Tastemakers
      'Music Journalist/Critic',
      'Music Blogger/Influencer',
      'DJ/Radio Host',
      'Concert Promoter',
      'Streaming Platform Coordinator',
      // Business & Legal
      'Entertainment Lawyer',
      'Business Manager',
      'Digital Marketing Specialist',
      'Music Distributor'
    ]
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot be more than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  telephone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'artist', 'producer', 'label', 'admin', 'superadmin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  smsVerificationCode: {
    type: String,
    default: null
  },
  smsVerificationExpires: {
    type: Date,
    default: null
  },
  smsVerificationInitiated: {
    type: Boolean,
    default: false
  },
  smsVerificationServiceSid: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  spotifyToken: {
    type: String,
    default: null
  },
  uploadedSongs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }],
  favoriteSongs: [{
    type: Schema.Types.ObjectId,
    ref: 'Song'
  }],
  subscription: {
    plan: {
      type: String,
      required: true,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    stripePriceId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
      default: 'active'
    },
    features: [{
      type: String,
      enum: [
        'basic_analysis',
        'advanced_analysis',
        'market_insights',
        'priority_support',
        'bulk_upload',
        'api_access',
        'white_label',
        'custom_integrations'
      ]
    }],
    usage: {
      songsAnalyzed: {
        type: Number,
        default: 0
      },
      currentPeriodStart: {
        type: Date,
        default: Date.now
      },
      currentPeriodEnd: {
        type: Date,
        default: function() {
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return nextMonth;
        }
      }
    }
  },
  preferences: {
    genres: [{
      type: String,
      enum: ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'r&b', 'folk', 'metal', 'indie', 'latin', 'reggae', 'blues', 'punk', 'alternative', 'dance', 'soul', 'funk', 'disco', 'other']
    }],
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profilePublic: {
        type: Boolean,
        default: true
      },
      songsPublic: {
        type: Boolean,
        default: true
      },
      analyticsPublic: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    totalSongs: {
      type: Number,
      default: 0
    },
    totalAnalyses: {
      type: Number,
      default: 0
    },
    totalPlays: {
      type: Number,
      default: 0
    },
    memberSince: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ 'subscription.plan': 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name
UserSchema.virtual('displayName').get(function(this: IUser) {
  return this.username || `${this.firstName} ${this.lastName}`;
});

// Virtual for subscription status
UserSchema.virtual('subscriptionStatus').get(function(this: IUser) {
  if (this.subscription.plan === 'free') return 'free';
  if (!this.subscription.endDate) return 'active';
  return this.subscription.endDate > new Date() ? 'active' : 'expired';
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
UserSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to check if subscription is active
UserSchema.methods.isSubscriptionActive = function(): boolean {
  if (this.subscription.plan === 'free') return true;
  if (!this.subscription.endDate) return true;
  return this.subscription.endDate > new Date();
};

// Instance method to get song limit based on plan
UserSchema.methods.getSongLimit = function(): number {
  const limits: Record<string, number> = {
    free: 3,
    basic: 10,
    pro: 100,
    enterprise: -1 // -1 = unlimited
  };
  return limits[this.subscription.plan] || 0;
};

// Instance method to check if user can analyze another song
UserSchema.methods.canAnalyzeSong = async function(): Promise<boolean> {
  await this.resetUsageIfNeeded();
  const limit = this.getSongLimit();
  if (limit === -1) return true; // unlimited
  return this.subscription.usage.songsAnalyzed < limit;
};

// Instance method to get remaining songs
UserSchema.methods.getRemainingSongs = async function(): Promise<number> {
  await this.resetUsageIfNeeded();
  const limit = this.getSongLimit();
  if (limit === -1) return -1; // unlimited
  return Math.max(0, limit - this.subscription.usage.songsAnalyzed);
};

// Instance method to reset usage if billing period has ended
UserSchema.methods.resetUsageIfNeeded = async function(): Promise<void> {
  const now = new Date();
  if (now > this.subscription.usage.currentPeriodEnd) {
    this.subscription.usage.songsAnalyzed = 0;
    this.subscription.usage.currentPeriodStart = now;
    
    // Set next period end (1 month from now)
    const nextPeriodEnd = new Date(now);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
    this.subscription.usage.currentPeriodEnd = nextPeriodEnd;
    
    // Save the changes to the database
    await this.save();
  }
};

// Instance method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function(): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return token;
};

// Instance method to check if email verification token is expired
UserSchema.methods.isEmailVerificationExpired = function(): boolean {
  if (!this.emailVerificationExpires) return true;
  return new Date() > this.emailVerificationExpires;
};

// Instance method to generate SMS verification code
UserSchema.methods.generateSMSVerificationCode = function(): string {
  const crypto = require('crypto');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.smsVerificationCode = code;
  this.smsVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return code;
};

// Instance method to check if SMS verification code is expired
UserSchema.methods.isSMSVerificationExpired = function(): boolean {
  if (!this.smsVerificationExpires) return true;
  return new Date() > this.smsVerificationExpires;
};

// Instance method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function(): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return token;
};

// Instance method to check if password reset token is expired
UserSchema.methods.isPasswordResetExpired = function(): boolean {
  if (!this.passwordResetExpires) return true;
  return new Date() > this.passwordResetExpires;
};

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Always hash the password if it's a new user or if password is modified
  if (this.isNew || this.isModified('password')) {
    try {
      // Check if password is already hashed
      if (this.password.startsWith('$2b$')) {
        return next();
      }
      // Hash password with cost of 12
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Pre-save middleware for validation
UserSchema.pre('save', function(next) {
  // Ensure username is unique (case-insensitive)
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  // Update stats
  if (this.isModified('uploadedSongs')) {
    this.stats.totalSongs = this.uploadedSongs.length;
  }
  
  next();
});

// Pre-find middleware to populate uploaded songs count
UserSchema.pre('find', function() {
  this.populate('uploadedSongs', 'title artist uploadDate');
});

// Static method to find by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by username
UserSchema.statics.findByUsername = function(username: string) {
  return this.findOne({ username: username.toLowerCase() });
};

// Static method to find active users
UserSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

export default mongoose.model<IUser>('User', UserSchema); 