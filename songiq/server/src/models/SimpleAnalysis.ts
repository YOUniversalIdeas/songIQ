import mongoose, { Document, Schema } from 'mongoose';

export interface ISimpleAnalysis extends Document {
  songId: mongoose.Types.ObjectId;
  successScore: number;
  marketPotential: number;
  socialScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const SimpleAnalysisSchema = new Schema<ISimpleAnalysis>({
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
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SimpleAnalysisSchema.index({ songId: 1 });
SimpleAnalysisSchema.index({ successScore: -1 });
SimpleAnalysisSchema.index({ marketPotential: -1 });
SimpleAnalysisSchema.index({ socialScore: -1 });

export default mongoose.model<ISimpleAnalysis>('SimpleAnalysis', SimpleAnalysisSchema);
