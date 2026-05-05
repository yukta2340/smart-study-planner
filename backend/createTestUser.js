const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'yukta3005@gmail.com' });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }

    // Create the user
    const user = await User.create({
      name: 'Yukta Test',
      email: 'yukta3005@gmail.com',
      password: 'Test123!',
      isVerified: true,
    });

    console.log('✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('ID:', user._id);

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser();