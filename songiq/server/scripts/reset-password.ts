import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '../env.development' });

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq');
    console.log('✅ Connected to MongoDB');

    const email = 'allan@carpediem.works';
    const newPassword = 'songiq123';

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      await mongoose.connection.close();
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isVerified = true;
    user.isActive = true;
    
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('\n🔐 New Login Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n💡 Account Details:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
    console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
    console.log('\n🎯 Login at: http://localhost:3001/auth');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  }
}

resetPassword();

