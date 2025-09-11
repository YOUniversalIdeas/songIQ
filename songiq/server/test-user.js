require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testUser() {
  try {
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ email: 'debuguser@example.com' }).select('+password');
    console.log('User found:', !!user);
    if (user) {
      console.log('User email:', user.email);
      console.log('User password length:', user.password.length);
      console.log('User password starts with $2b$:', user.password.startsWith('$2b$'));
      
      // Test password comparison
      const isValid = await user.comparePassword('password123');
      console.log('Password comparison result:', isValid);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testUser();
