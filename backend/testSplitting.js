const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const User = require('./models/User');
require('./models/Subject');

dotenv.config();

const testSplitting = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@student.com' });
    const topics = await Topic.find({ isCompleted: false }).populate('subject');
    const userTopics = topics.filter(t => t.subject.user.toString() === user._id.toString());

    const MAX_SESSION = 60;
    console.log('\n--- ✂️ SESSION SPLITTING AUDIT ---');
    
    userTopics.forEach(t => {
      console.log(`\nTopic: ${t.name} (${t.estimatedTime} mins)`);
      let remaining = t.estimatedTime;
      let part = 1;
      while (remaining > 0) {
        const time = Math.min(remaining, MAX_SESSION);
        console.log(`   > Part ${part}: ${time} mins`);
        remaining -= time;
        part++;
      }
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testSplitting();
