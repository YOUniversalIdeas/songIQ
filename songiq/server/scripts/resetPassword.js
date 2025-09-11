const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
  password: String,
  firstName: String,
  lastName: String
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

// Reset password function
const resetPassword = async (email, newPassword) => {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }
    
    console.log(`\n👤 Found user:`);
    console.log(`   - Name: ${user.firstName} ${user.lastName}`);
    console.log(`   - Email: ${user.email}`);
    
    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`\n✅ Password reset successfully for: ${email}`);
    console.log(`   - New password: ${newPassword}`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    
    // Get email and password from command line arguments
    const email = process.argv[2] || 'allan@carpediem.works';
    const newPassword = process.argv[3] || 'test123';
    
    console.log(`🔐 Password Reset Script`);
    console.log(`📧 Target email: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log('');
    
    await resetPassword(email, newPassword);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

main();
