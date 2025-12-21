import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import bcrypt from 'bcryptjs';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/songiq');
    console.log('✅ Connected to MongoDB');

    const email = 'admin@songiq.ai';
    const newPassword = 'Admin123!';

    // Find admin user
    const admin = await User.findOne({ email }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin...');
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const newAdmin = new User({
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        bandName: 'Artist/Musician',
        username: 'admin',
        telephone: '+1234567890',
        role: 'superadmin',
        isVerified: true,
        isActive: true,
      });
      await newAdmin.save();
      console.log('✅ Admin user created!');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${newPassword}`);
    } else {
      console.log('✅ Admin user found');
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👤 Role: ${admin.role}`);
      
      // Test current password
      const isCurrentPasswordValid = await bcrypt.compare(newPassword, admin.password);
      console.log(`🔑 Current password test: ${isCurrentPasswordValid ? '✅ CORRECT' : '❌ WRONG'}`);
      
      if (!isCurrentPasswordValid) {
        console.log('🔄 Resetting password...');
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        admin.password = hashedPassword;
        admin.role = 'superadmin';
        admin.isVerified = true;
        admin.isActive = true;
        await admin.save();
        console.log('✅ Password reset complete!');
      }
      
      console.log(`\n📋 Login Credentials:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Role: ${admin.role}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();

