const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const User = require('./models/User');
require('./models/Subject');

dotenv.config();

const auditFormula = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@student.com' });
    const topics = await Topic.find({ isCompleted: false }).populate('subject');
    const userTopics = topics.filter(t => t.subject.user.toString() === user._id.toString());

    console.log('\n--- 📏 TRIPLE-FACTOR FORMULA AUDIT ---');
    console.log('Formula: (0.5 * Urgency) + (0.3 * Difficulty) + (0.2 * Time)');
    
    const results = userTopics.map(t => {
      const today = new Date();
      const deadline = new Date(t.deadline);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      const urgency = daysUntil <= 0 ? 1.0 : (daysUntil > 14 ? 0.2 : 1 - (daysUntil / 14));
      const difficulty = t.difficulty / 5;
      const time = Math.min(t.estimatedTime / 360, 1.0);
      
      const score = (0.5 * urgency) + (0.3 * difficulty) + (0.2 * time);
      
      return {
        name: t.name,
        urgency: urgency.toFixed(2),
        diff: difficulty.toFixed(2),
        time: time.toFixed(2),
        score: score.toFixed(4)
      };
    }).sort((a, b) => b.score - a.score);

    results.forEach((r, i) => {
      console.log(`${i+1}. ${r.name.padEnd(25)} | Score: ${r.score} (U:${r.urgency} D:${r.diff} T:${r.time})`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

auditFormula();
