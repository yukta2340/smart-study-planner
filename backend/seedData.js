const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');

    // 1. Clear existing data (Careful!)
    await Topic.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});

    // 2. Create a Dummy User
    const user = await User.create({
      name: 'Test Student',
      email: 'test@student.com',
      password: 'password123'
    });

    // 3. Create Subjects
    const sub1 = await Subject.create({ user: user._id, name: 'DBMS', color: '#ff0000' });
    const sub2 = await Subject.create({ user: user._id, name: 'Mathematics', color: '#00ff00' });

    // 4. Create Topics (Mixed Priorities)
    
    // Topic A: URGENT & HARD (Should be Today #1)
    await Topic.create({
      subject: sub1._id,
      name: 'Normalization (Critical)',
      difficulty: 5,
      estimatedTime: 120,
      deadline: new Date(Date.now() + 86400000) // Tomorrow
    });

    // Topic B: LARGE but not urgent (Should fill Today)
    await Topic.create({
      subject: sub2._id,
      name: 'Calculus Integration',
      difficulty: 4,
      estimatedTime: 200,
      deadline: new Date(Date.now() + 86400000 * 5) // 5 days away
    });

    // Topic C: OVERFLOW (Should go to Tomorrow)
    await Topic.create({
      subject: sub1._id,
      name: 'SQL Queries',
      difficulty: 3,
      estimatedTime: 100,
      deadline: new Date(Date.now() + 86400000 * 3) // 3 days away
    });

    console.log('✅ Dummy Data Seeded Successfully!');
    console.log('Summary:');
    console.log('- 1 Urgent Task (120m)');
    console.log('- 1 Medium Task (200m)');
    console.log('- 1 Overflow Task (100m)');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
