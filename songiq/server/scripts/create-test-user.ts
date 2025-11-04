import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: '../env.development' });

async function createTestUser() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    let existingUser = await User.findOne({ email: 'test@songiq.ai' });
    
    if (!existingUser) {
      // Also check by username
      existingUser = await User.findOne({ username: 'testuser' });
    }
    
    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log('\n📧 Login Credentials:');
      console.log('   Email: test@songiq.ai');
      console.log('   Password: password123');
      console.log('\n💰 Account Details:');
      console.log(`   Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Verified: ${existingUser.isVerified ? '✅' : '❌'}`);
      console.log('\n🎯 You can now login at: http://localhost:3001/auth');
      await mongoose.connection.close();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const testUser = new User({
      email: 'test@songiq.ai',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      username: 'testsongiq',
      telephone: '+1234567890',
      bandName: 'Artist/Musician',
      role: 'user',
      isVerified: true, // Pre-verify for testing
      isActive: true,
    });

    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: test@songiq.ai');
    console.log('   Password: password123');
    console.log('\n💰 Account Details:');
    console.log('   Name: Test User');
    console.log('   Role: user');
    console.log('   Credits: 100');
    console.log('   Verified: ✅');
    console.log('\n🎯 You can now login at: http://localhost:3001/auth');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

// Run the function
createTestUser();

