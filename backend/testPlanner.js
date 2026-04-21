const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Topic = require('./models/Topic');
const User = require('./models/User');
require('./models/Subject');

dotenv.config();

const testFinalLogic = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@student.com' });
    const topics = await Topic.find({ isCompleted: false }).populate('subject');
    const userTopics = topics.filter(t => t.subject.user.toString() === user._id.toString());

    console.log('\n--- 🧠 FINAL NORMALIZED ENGINE + REVISION AUDIT ---');
    
    const analyzed = userTopics.map(t => {
      const today = new Date();
      const deadline = new Date(t.deadline);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

      // 1. Normalization Logic
      let deadlineNorm = daysUntil <= 0 ? 1.0 : (daysUntil <= 2 ? 0.9 : (daysUntil <= 7 ? 0.5 : 0.2));
      const difficultyNorm = t.difficulty / 5;
      let revisionNorm = (t.nextReviewDate && new Date(t.nextReviewDate) <= today) ? 1.0 : 0.1;

      // 2. Weights
      const score = (deadlineNorm * 0.5) + (difficultyNorm * 0.2) + (revisionNorm * 0.3);

      return { 
        name: t.name, 
        score: score.toFixed(4), 
        isRevision: revisionNorm === 1.0,
        isOverdue: daysUntil < 0 
      };
    }).sort((a, b) => b.score - a.score);

    analyzed.forEach((t, i) => {
        console.log(`${i+1}. ${t.name} | Score: ${t.score} | ${t.isRevision ? '[REVISION]' : '[NEW]'}${t.isOverdue ? ' ⚠️ OVERDUE' : ''}`);
    });

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testFinalLogic();
