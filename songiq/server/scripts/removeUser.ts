import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';

async function removeUser(email: string) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Import the User model
    const { User } = await import('../src/models');
    
    console.log(`\n🔍 Looking for user with email: ${email}`);
    
    // Find the user first to see what we're removing
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }
    
    console.log(`\n👤 Found user:`);
    console.log(`   - Name: ${user.firstName} ${user.lastName}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Created: ${user.createdAt}`);
    
    // Remove the user
    const result = await User.deleteOne({ email: email.toLowerCase() });
    
    if (result.deletedCount > 0) {
      console.log(`\n✅ Successfully removed user: ${email}`);
      console.log(`   - Deleted count: ${result.deletedCount}`);
    } else {
      console.log(`\n❌ Failed to remove user: ${email}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'allan@carpediem.works';

console.log(`🗑️  User Removal Script`);
console.log(`📧 Target email: ${email}`);
console.log('');

// Run the script
removeUser(email).catch(console.error);
