import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '../env.development' });

async function verifyUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq');
    console.log('✅ Connected to MongoDB');
    
    const user = await User.findOne({ email: 'test@songiq.ai' });
    
    if (!user) {
      console.log('❌ Test user not found');
      return;
    }
    
    user.isVerified = true;
    user.isActive = true;
    await user.save();
    
    console.log('✅ Test user verified and activated!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
    console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyUser();

