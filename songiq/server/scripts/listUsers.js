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
  firstName: String,
  lastName: String,
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

// List all users
const listUsers = async () => {
  try {
    console.log('🔍 Listing all users...\n');
    
    const users = await User.find({}, 'email firstName lastName subscription.plan subscription.usage.songsAnalyzed subscription.usage.currentPeriodEnd');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Plan: ${user.subscription.plan}`);
      console.log(`   Songs Analyzed: ${user.subscription.usage.songsAnalyzed}`);
      console.log(`   Period End: ${user.subscription.usage.currentPeriodEnd}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await listUsers();
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

main();
