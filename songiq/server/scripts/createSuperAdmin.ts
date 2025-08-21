import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model
import User from '../src/models/User';

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperAdmin) {
      console.log('⚠️  Superadmin already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create superadmin user
    const superAdminData = {
      email: 'admin@songiq.com',
      password: 'SuperAdmin123!',
      firstName: 'System',
      lastName: 'Administrator',
      bandName: 'songIQ System',
      username: 'superadmin',
      telephone: '+1234567890',
      role: 'superadmin',
      isVerified: true,
      isActive: true,
      subscription: {
        plan: 'enterprise',
        startDate: new Date(),
        status: 'active',
        features: ['basic_analysis', 'advanced_analysis', 'market_insights', 'priority_support', 'bulk_upload', 'api_access', 'white_label', 'custom_integrations'],
        usage: {
          songsAnalyzed: 0,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      preferences: {
        genres: ['pop', 'rock', 'hip-hop', 'electronic', 'country', 'jazz', 'classical', 'r&b', 'folk', 'metal', 'indie', 'latin', 'reggae', 'blues', 'punk', 'alternative', 'dance', 'soul', 'funk', 'disco', 'other'],
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profilePublic: false,
          songsPublic: false,
          analyticsPublic: false
        }
      },
      stats: {
        totalSongs: 0,
        totalAnalyses: 0,
        totalPlays: 0,
        memberSince: new Date()
      }
    };

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    // Create user with hashed password
    const superAdmin = new User({
      ...superAdminData,
      password: hashedPassword
    });

    await superAdmin.save();
    console.log('✅ Superadmin created successfully!');
    console.log('📧 Email:', superAdminData.email);
    console.log('🔑 Password:', superAdminData.password);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    process.exit(1);
  }
};

// Run the script
createSuperAdmin();
