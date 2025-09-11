import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';

async function clearDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n🗂️  Found collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Clear each collection
    console.log('\n🧹 Clearing collections...');
    
    for (const collection of collections) {
      try {
        const result = await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`   ✅ Cleared ${collection.name}: ${result.deletedCount} documents deleted`);
      } catch (error) {
        console.error(`   ❌ Error clearing ${collection.name}:`, error);
      }
    }

    // Also clear the specific models we know about
    console.log('\n🔍 Clearing known models...');
    
    try {
      const { User, Song, Analysis, AnalysisResults, AudioFeatures, PerformanceMetrics } = await import('../src/models');
      
      const userResult = await User.deleteMany({});
      console.log(`   ✅ Cleared Users: ${userResult.deletedCount} documents deleted`);
      
      const songResult = await Song.deleteMany({});
      console.log(`   ✅ Cleared Songs: ${songResult.deletedCount} documents deleted`);
      
      const analysisResult = await Analysis.deleteMany({});
      console.log(`   ✅ Cleared Analyses: ${analysisResult.deletedCount} documents deleted`);
      
      const analysisResultsResult = await AnalysisResults.deleteMany({});
      console.log(`   ✅ Cleared Analysis Results: ${analysisResultsResult.deletedCount} documents deleted`);
      
      const audioFeaturesResult = await AudioFeatures.deleteMany({});
      console.log(`   ✅ Cleared Audio Features: ${audioFeaturesResult.deletedCount} documents deleted`);
      
      const performanceMetricsResult = await PerformanceMetrics.deleteMany({});
      console.log(`   ✅ Cleared Performance Metrics: ${performanceMetricsResult.deletedCount} documents deleted`);
      
    } catch (error) {
      console.error('   ❌ Error clearing models:', error);
    }

    console.log('\n🎉 Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
clearDatabase().catch(console.error);
