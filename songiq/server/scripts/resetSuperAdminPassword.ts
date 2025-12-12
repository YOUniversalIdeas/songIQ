import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from '../src/models/User';

const resetSuperAdminPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find superadmin
    const superAdmin = await User.findOne({ role: 'superadmin' });

    if (!superAdmin) {
      console.log('❌ No superadmin found');
      process.exit(1);
    }

    // Generate a new secure password
    const newPassword = 'Admin123!@#';
    
    // Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and revert email
    superAdmin.password = hashedPassword;
    superAdmin.email = 'allan@carpediem.works';
    await superAdmin.save();

    console.log('✅ Superadmin password reset and email reverted!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Username:', superAdmin.username);
    console.log('🔑 Role:', superAdmin.role);
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error resetting superadmin password:', error);
    process.exit(1);
  }
};

// Run the script
resetSuperAdminPassword();

