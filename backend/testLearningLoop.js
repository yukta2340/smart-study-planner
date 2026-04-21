const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const User = require('./models/User');
require('./models/Subject');

dotenv.config();

const testLearningLoop = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@student.com' });
    const topic = await Topic.findOne({ name: 'SQL Queries' });

    console.log('\n--- 🧠 LEARNING FEEDBACK LOOP TEST ---');
    console.log(`Initial State: ${topic.name} | isWeak: ${topic.isWeakTopic}`);

    console.log('Sending Feedback: "This was very hard (Rating: 5)"');
    
    // Simulate feedback controller logic
    topic.isWeakTopic = true;
    topic.difficulty = 5;
    topic.studyIntensity += 1;
    await topic.save();

    console.log(`Post-Feedback: ${topic.name} | isWeak: ${topic.isWeakTopic} | New Difficulty: ${topic.difficulty}`);

    // Verify priority calculation boost
    const today = new Date();
    const deadline = new Date(topic.deadline);
    const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    const urgency = 1 - (daysUntil / 14);
    const diff = topic.difficulty / 5;
    const time = topic.estimatedTime / 360;
    const boost = 0.25; // Boost for weak topic

    const score = (0.4 * urgency) + (0.3 * diff) + (0.2 * time) + (0.1 * boost);
    console.log(`Calculated Priority Score with Boost: ${score.toFixed(4)}`);

    // Reset for next time
    topic.isWeakTopic = false;
    topic.difficulty = 3;
    await topic.save();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testLearningLoop();
