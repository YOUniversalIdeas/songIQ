import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from '../src/models/User';

const updateSuperAdminEmail = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    const newEmail = 'allan.restrepo@youniversalideas.com';
    const oldEmail = 'allan@carpediem.works';

    // Find superadmin by old email or by role
    const superAdmin = await User.findOne({ 
      $or: [
        { email: oldEmail, role: 'superadmin' },
        { role: 'superadmin' }
      ]
    });

    if (!superAdmin) {
      console.log('❌ No superadmin found');
      process.exit(1);
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== superAdmin._id.toString()) {
      console.log('❌ Email already in use by another user:', newEmail);
      process.exit(1);
    }

    // Update email
    superAdmin.email = newEmail;
    await superAdmin.save();

    console.log('✅ Superadmin email updated successfully!');
    console.log('📧 Old email:', oldEmail);
    console.log('📧 New email:', newEmail);
    console.log('👤 Username:', superAdmin.username);
    console.log('🔑 Role:', superAdmin.role);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error updating superadmin email:', error);
    process.exit(1);
  }
};

// Run the script
updateSuperAdminEmail();

