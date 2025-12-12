/**
 * Script to import tracks by indie genres (more likely to be independent)
 * Run with: npx tsx scripts/import-tracks-by-genre.ts
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

async function importTracksByGenre() {
  try {
    console.log('🎵 Starting track import by indie genres...\n');
    
    const genres = ['indie', 'indie pop', 'indie rock', 'bedroom pop', 'dream pop', 'alternative', 'lo-fi'];
    let totalImported = 0;
    
    for (const genre of genres) {
      console.log(`\n📀 Importing tracks for genre: ${genre}`);
      try {
        const imported = await trackDataAggregator.importByGenre(genre, 30);
        console.log(`  ✅ Imported ${imported} tracks for ${genre}`);
        totalImported += imported;
      } catch (error: any) {
        console.error(`  ❌ Error importing ${genre}:`, error.message);
      }
    }
    
    console.log(`\n✅ Total imported: ${totalImported} tracks`);
    
    if (totalImported > 0) {
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

importTracksByGenre();


