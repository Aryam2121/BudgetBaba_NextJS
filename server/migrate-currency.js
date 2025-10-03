// Migration script to add currency field to existing users
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrateCurrency() {
  try {
    console.log('🔄 Starting currency migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://your-connection-string');
    console.log('✅ Connected to MongoDB');

    // Update all users without currency field
    const result = await User.updateMany(
      { currency: { $exists: false } }, // Users without currency field
      { $set: { currency: 'INR' } }      // Set default to INR
    );

    console.log(`✅ Updated ${result.modifiedCount} users with default currency (INR)`);

    // Also update users with null or empty currency
    const result2 = await User.updateMany(
      { $or: [{ currency: null }, { currency: '' }] },
      { $set: { currency: 'INR' } }
    );

    console.log(`✅ Updated ${result2.modifiedCount} users with null/empty currency`);

    console.log('🎉 Currency migration completed successfully!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateCurrency();
}

module.exports = migrateCurrency;