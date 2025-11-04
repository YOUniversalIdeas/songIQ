import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config({ path: '../env.development' });

async function makeSuperadmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/songiq');
    console.log('✅ Connected to MongoDB');

    const email = 'allan@carpediem.works';

    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      await mongoose.connection.close();
      return;
    }

    user.role = 'superadmin';
    user.isVerified = true;
    user.isActive = true;
    
    await user.save();
    
    console.log('✅ User upgraded to superadmin!');
    console.log('\n🔐 Superadmin Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: songiq123`);
    console.log(`   Role:     ${user.role} 🔑`);
    console.log('\n💡 Account Status:');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Verified: ${user.isVerified ? '✅' : '❌'}`);
    console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
    console.log('\n🎯 Admin Panel: http://localhost:3001/admin');
    console.log('   → Click "Markets" tab to manage prediction markets');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error upgrading user:', error);
    process.exit(1);
  }
}

makeSuperadmin();

