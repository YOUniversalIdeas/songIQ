const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified version for this script)
const userSchema = new mongoose.Schema({
  email: String,
  subscription: {
    plan: String,
    usage: {
      songsAnalyzed: Number,
      currentPeriodStart: Date,
      currentPeriodEnd: Date
    }
  }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

// Reset usage for a specific user by email
const resetUserUsage = async (email) => {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`📊 Current usage: ${user.subscription.usage.songsAnalyzed} songs`);
    console.log(`📅 Current period end: ${user.subscription.usage.currentPeriodEnd}`);
    
    // Reset the usage
    user.subscription.usage.songsAnalyzed = 0;
    user.subscription.usage.currentPeriodStart = new Date();
    
    // Set next period end (1 month from now)
    const nextPeriodEnd = new Date();
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
    user.subscription.usage.currentPeriodEnd = nextPeriodEnd;
    
    await user.save();
    
    console.log('✅ Usage reset successfully!');
    console.log(`📊 New usage: ${user.subscription.usage.songsAnalyzed} songs`);
    console.log(`📅 New period end: ${user.subscription.usage.currentPeriodEnd}`);
    
  } catch (error) {
    console.error('❌ Error resetting usage:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    
    // Get email from command line argument
    const email = process.argv[2];
    if (!email) {
      console.log('❌ Please provide an email address as an argument');
      console.log('Usage: node resetUserUsage.js <email>');
      process.exit(1);
    }
    
    await resetUserUsage(email);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

main();
