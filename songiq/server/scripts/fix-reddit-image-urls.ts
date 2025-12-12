import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import NewsArticle model
import NewsArticle from '../src/models/NewsArticle';

const fixRedditImageUrls = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all Reddit articles with encoded image URLs
    const redditArticles = await NewsArticle.find({
      sourceType: 'reddit',
      imageUrl: { $exists: true, $ne: null, $nin: ['', null] }
    });

    console.log(`Found ${redditArticles.length} Reddit articles with images`);

    let fixed = 0;
    for (const article of redditArticles) {
      if (article.imageUrl && article.imageUrl.includes('&amp;')) {
        const fixedUrl = article.imageUrl
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

        article.imageUrl = fixedUrl;
        await article.save();
        fixed++;
      }
    }

    console.log(`✅ Fixed ${fixed} Reddit image URLs`);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error fixing Reddit image URLs:', error);
    process.exit(1);
  }
};

// Run the script
fixRedditImageUrls();

