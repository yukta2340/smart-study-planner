const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Clean up any stale clerkId index that stores null values.
    const userCollection = conn.connection.collection(User.collection.name);
    const indexes = await userCollection.indexes();
    const clerkIndex = indexes.find((index) => index.name === 'clerkId_1');
    if (clerkIndex) {
      try {
        await userCollection.dropIndex('clerkId_1');
        console.log('Dropped stale clerkId_1 index');
      } catch (dropErr) {
        console.error('Failed to drop clerkId_1 index:', dropErr.message);
      }
    }

    // Ensure schema indexes match database indexes.
    await User.syncIndexes();
    console.log('MongoDB user indexes synced');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
