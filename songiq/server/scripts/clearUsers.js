const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified version for this script)
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  firstName: String,
  lastName: String,
  // ... other fields
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

// Clear all users from the database
const clearAllUsers = async () => {
  try {
    console.log('🔍 Checking current user count...');
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in the database`);
    
    if (userCount === 0) {
      console.log('✅ Database is already empty. No users to clear.');
      return;
    }
    
    console.log('🗑️  Clearing all users from the database...');
    const result = await User.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} users from the database`);
    console.log('🎉 Registration database has been cleared! You can now register again.');
    
  } catch (error) {
    console.error('❌ Error clearing users:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting database cleanup...');
    await connectDB();
    await clearAllUsers();
    
    console.log('✅ Database cleanup completed successfully!');
    console.log('💡 You can now register a new account.');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
