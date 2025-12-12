import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import NewsArticle model
import NewsArticle from '../src/models/NewsArticle';

// Music-related keywords (required for posts)
const MUSIC_KEYWORDS = [
  'music', 'song', 'album', 'track', 'artist', 'musician', 'band', 'singer',
  'indie', 'independent', 'release', 'single', 'ep', 'mixtape', 'playlist',
  'concert', 'tour', 'gig', 'festival', 'live', 'performance', 'show',
  'genre', 'rock', 'pop', 'jazz', 'hip hop', 'rap', 'electronic', 'folk',
  'country', 'blues', 'metal', 'punk', 'alternative', 'r&b', 'soul',
  'producer', 'beat', 'lyrics', 'melody', 'rhythm', 'sound', 'audio',
  'streaming', 'spotify', 'apple music', 'bandcamp', 'soundcloud', 'youtube music',
  'new music', 'latest release', 'music video', 'mv', 'music industry'
];

// Non-music keywords to filter out (politics, news, etc.)
const NON_MUSIC_KEYWORDS = [
  'politics', 'political', 'election', 'vote', 'president', 'government',
  'news', 'breaking', 'update', 'report', 'article', 'journalism',
  'sports', 'football', 'basketball', 'soccer', 'game', 'match',
  'technology', 'tech', 'software', 'hardware', 'computer', 'programming',
  'cooking', 'recipe', 'food', 'restaurant', 'travel', 'trip', 'vacation',
  'fashion', 'clothing', 'style', 'design'
];

function hasMusicKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return MUSIC_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function hasNonMusicKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return NON_MUSIC_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'i');
    return regex.test(lowerText);
  });
}

function isMusicRelated(article: any): boolean {
  const fullText = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  // Must have at least one music keyword
  if (!hasMusicKeyword(fullText)) {
    return false;
  }
  
  // Check for non-music keywords
  if (hasNonMusicKeyword(fullText)) {
    // Exception: allow "art" if it's clearly about music/artists
    if (!fullText.includes('artist') && !fullText.includes('music')) {
      return false;
    }
  }
  
  // Check relevance score - must be at least 30 (lower threshold for cleanup)
  if (article.relevanceScore !== undefined && article.relevanceScore < 30) {
    return false;
  }
  
  return true;
}

const cleanupNonMusicPosts = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all articles
    const allArticles = await NewsArticle.find({ isActive: true });
    console.log(`\n📊 Found ${allArticles.length} total articles\n`);

    let deleted = 0;
    let kept = 0;
    const deletedBySource: { [key: string]: number } = {};

    for (const article of allArticles) {
      if (!isMusicRelated(article)) {
        // Mark as inactive instead of deleting (safer)
        article.isActive = false;
        await article.save();
        
        deleted++;
        const source = article.source || 'Unknown';
        deletedBySource[source] = (deletedBySource[source] || 0) + 1;
        
        if (deleted <= 10) {
          console.log(`❌ Deactivating: "${article.title?.substring(0, 60)}..." (${source})`);
        }
      } else {
        kept++;
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Kept: ${kept} music-related posts`);
    console.log(`   Deactivated: ${deleted} non-music posts\n`);

    if (Object.keys(deletedBySource).length > 0) {
      console.log('📊 Deactivated posts by source:');
      Object.entries(deletedBySource)
        .sort((a, b) => b[1] - a[1])
        .forEach(([source, count]) => {
          console.log(`   ${source}: ${count}`);
        });
    }

    console.log('\n💡 Note: Posts were deactivated (not deleted) so they can be recovered if needed.');
    console.log('   To permanently delete, run: NewsArticle.deleteMany({ isActive: false })\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error cleaning up non-music posts:', error);
    process.exit(1);
  }
};

// Run the script
cleanupNonMusicPosts();

