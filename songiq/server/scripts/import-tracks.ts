/**
 * Script to import tracks from Last.fm
 * Run with: npx tsx scripts/import-tracks.ts
 */

import trackDataAggregator from '../src/services/trackDataAggregator';
import chartScoringEngine from '../src/services/chartScoringEngine';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function importTracks() {
  try {
    console.log('🎵 Starting track import from Last.fm...\n');
    
    const limit = 100;
    console.log(`Importing up to ${limit} tracks...`);
    
    const imported = await trackDataAggregator.importFromLastfm(limit);
    
    console.log(`\n✅ Imported ${imported} tracks`);
    
    if (imported > 0) {
      console.log('\n🔄 Updating track scores...');
      await chartScoringEngine.updateAllTrackScores();
      console.log('✅ Track scores updated');
    }
    
    console.log('\n✅ Track import completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error importing tracks:', error);
    process.exit(1);
  }
}

importTracks();

