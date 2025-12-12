import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import NewsArticle model
import NewsArticle from '../src/models/NewsArticle';

const deleteDeactivatedPosts = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Count deactivated posts
    const deactivatedCount = await NewsArticle.countDocuments({ isActive: false });
    const activeCount = await NewsArticle.countDocuments({ isActive: true });

    if (deactivatedCount === 0) {
      console.log('ℹ️  No deactivated posts found. Nothing to delete.\n');
      process.exit(0);
    }

    console.log('⚠️  PERMANENTLY DELETING deactivated posts...');
    console.log(`\n📊 Current status:`);
    console.log(`   Active posts: ${activeCount}`);
    console.log(`   Deactivated posts: ${deactivatedCount}`);
    console.log(`   Total posts: ${activeCount + deactivatedCount}\n`);

    // Show breakdown by source
    const deactivatedBySource = await NewsArticle.aggregate([
      { $match: { isActive: false } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    if (deactivatedBySource.length > 0) {
      console.log('📋 Top deactivated sources to be deleted:');
      deactivatedBySource.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item._id}: ${item.count} posts`);
      });
      console.log('');
    }

    console.log('🗑️  Deleting deactivated posts...\n');

    // Delete deactivated posts
    const result = await NewsArticle.deleteMany({ isActive: false });

    console.log('✅ Deletion complete!');
    console.log(`   Deleted: ${result.deletedCount} posts`);
    console.log(`   Remaining active posts: ${activeCount}\n`);

    // Verify
    const remainingDeactivated = await NewsArticle.countDocuments({ isActive: false });
    const finalActive = await NewsArticle.countDocuments({ isActive: true });

    console.log('📊 Final status:');
    console.log(`   Active posts: ${finalActive}`);
    console.log(`   Deactivated posts: ${remainingDeactivated}`);
    console.log(`   Total posts: ${finalActive + remainingDeactivated}\n`);

    if (remainingDeactivated === 0) {
      console.log('✅ All deactivated posts have been permanently deleted.\n');
    } else {
      console.log(`⚠️  Warning: ${remainingDeactivated} deactivated posts still remain.\n`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error deleting deactivated posts:', error);
    process.exit(1);
  }
};

// Run the script
deleteDeactivatedPosts();


