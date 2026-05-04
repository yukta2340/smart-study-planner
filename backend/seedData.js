const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const Task = require('./models/Task');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Seeding...');

    // 1. Clear existing data (Careful!)
    await Task.deleteMany({});
    await Topic.deleteMany({});
    await Subject.deleteMany({});
    await User.deleteMany({});

    // 2. Create a Dummy User
    const user = await User.create({
      name: 'Yukta Khatter',
      email: 'yuktakhatter5301@gmail.com',
      password: 'Khatter55@',
      fullName: 'Yukta Khatter',
      isVerified: true,
    });

    console.log('✅ User created:', user._id);

    // 3. Create Subjects
    const sub1 = await Subject.create({ user: user._id, name: 'DBMS', color: '#ff0000' });
    const sub2 = await Subject.create({ user: user._id, name: 'Mathematics', color: '#00ff00' });
    const sub3 = await Subject.create({ user: user._id, name: 'Computer Networks', color: '#0000ff' });
    const sub4 = await Subject.create({ user: user._id, name: 'Operating Systems', color: '#ffff00' });

    console.log('✅ Subjects created');

    // 4. Create 24 Dummy Tasks (14 completed, 10 pending)
    const taskTitles = [
      // Completed Tasks (14)
      'Read Chapter 1 of DBMS',
      'Complete SQL Queries Assignment',
      'Practice Normalization Problems',
      'Review Database Design Patterns',
      'Solve 10 Calculus Integration Problems',
      'Study Differential Equations',
      'Review Trigonometry Basics',
      'Practice Matrix Operations',
      'Read Networking Fundamentals',
      'Study OSI Model Layers',
      'Practice TCP/IP Protocol',
      'Review Routing Algorithms',
      'Study CPU Scheduling Algorithms',
      'Analyze Process Management',

      // Pending Tasks (10)
      'Complete DBMS Project Milestone 1',
      'Solve Advanced Calculus Problems',
      'Create Network Topology Diagram',
      'Write Operating System Report',
      'Study Advanced SQL Joins',
      'Practice Statistical Analysis',
      'Review Cloud Computing Concepts',
      'Study Cryptography Algorithms',
      'Complete Database Indexing Exercise',
      'Analyze Real-time OS Requirements',
    ];

    const tasks = [];
    
    // Create 14 completed tasks
    for (let i = 0; i < 14; i++) {
      tasks.push({
        user: user._id,
        title: taskTitles[i],
        description: `Complete the task: ${taskTitles[i]}`,
        deadline: new Date(Date.now() + Math.random() * 86400000 * 14),
        completed: true,
        difficulty: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
      });
    }

    // Create 10 pending tasks
    for (let i = 14; i < 24; i++) {
      tasks.push({
        user: user._id,
        title: taskTitles[i],
        description: `Complete the task: ${taskTitles[i]}`,
        deadline: new Date(Date.now() + Math.random() * 86400000 * 14),
        completed: false,
        difficulty: Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
      });
    }

    const createdTasks = await Task.insertMany(tasks);
    console.log('✅ Tasks created:', createdTasks.length);
    console.log(`   - Completed: 14`);
    console.log(`   - Pending: 10`);
    console.log(`   - Total: 24`);

    console.log('\n✅ Dummy Data Seeded Successfully!');
    console.log('\nSummary:');
    console.log('- 1 Test User (email: yuktakhatter5301@gmail.com)');
    console.log('- 4 Subjects');
    console.log('- 24 Tasks (14 completed, 10 pending)');
    console.log('\nYou can now log in with the test credentials and see the data in MongoDB.');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
