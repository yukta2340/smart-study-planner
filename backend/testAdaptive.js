const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const User = require('./models/User');
require('./models/Subject');

dotenv.config();

const testAdaptive = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@student.com' });
    const mathSubject = await mongoose.model('Subject').findOne({ name: 'Mathematics', user: user._id });

    console.log('\n--- 🔄 ADAPTIVE BEHAVIOR TEST ---');
    console.log('Creating an OVERDUE task...');

    const overdueTask = await Topic.create({
      name: 'Missed Algebra Quiz',
      subject: mathSubject._id,
      difficulty: 3,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      estimatedTime: 45,
      isCompleted: false
    });

    console.log('Task created. Checking if it rises to the top of the plan...');
    
    // Simulating the logic
    const today = new Date();
    const deadline = new Date(overdueTask.deadline);
    const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    console.log(`Deadline: ${overdueTask.deadline.toDateString()}`);
    console.log(`Days Until: ${daysUntil} (Should be negative)`);
    
    const urgency = daysUntil < 0 ? 1.0 : 1 - (daysUntil / 14);
    console.log(`Urgency Score: ${urgency} (Should be 1.0)`);

    // Clean up
    await Topic.deleteOne({ _id: overdueTask._id });
    console.log('Cleaned up test data.');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testAdaptive();
