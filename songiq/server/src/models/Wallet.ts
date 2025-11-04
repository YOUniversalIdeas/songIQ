import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  address: string; // Blockchain wallet address
  privateKeyEncrypted?: string; // Encrypted private key (custodial wallet)
  type: 'custodial' | 'non-custodial';
  chainId: number;
  isActive: boolean;
  isPrimary: boolean;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  privateKeyEncrypted: {
    type: String,
    select: false // Never return in queries by default
  },
  type: {
    type: String,
    required: true,
    enum: ['custodial', 'non-custodial'],
    default: 'custodial'
  },
  chainId: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

// Indexes
WalletSchema.index({ userId: 1, chainId: 1 });
WalletSchema.index({ address: 1, chainId: 1 });
WalletSchema.index({ userId: 1, isPrimary: 1 });

// Ensure only one primary wallet per user per chain
WalletSchema.pre('save', async function(next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    await mongoose.model('Wallet').updateMany(
      { 
        userId: this.userId, 
        chainId: this.chainId,
        _id: { $ne: this._id }
      },
      { isPrimary: false }
    );
  }
  next();
});

export default mongoose.model<IWallet>('Wallet', WalletSchema);

