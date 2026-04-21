const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Topic = require('./models/Topic');
const StudySession = require('./models/StudySession');
const Subject = require('./models/Subject');

dotenv.config();

const proveDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB for System Audit...');
    await mongoose.connect(process.env.MONGO_URI);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n--- 📂 DATABASE COLLECTION PROOF ---');
    console.log(`Active Collections: ${collections.map(c => c.name).join(', ')}`);

    const stats = [
      { name: 'Users', model: User },
      { name: 'Topics (Tasks)', model: Topic },
      { name: 'Subjects', model: Subject },
      { name: 'StudySessions (Analytics)', model: StudySession }
    ];

    console.log('\n--- 📊 DOCUMENT METRICS ---');
    for (const s of stats) {
      const count = await s.model.countDocuments();
      console.log(`${s.name.padEnd(25)} | Count: ${count}`);
    }

    console.log('\n--- 🧬 SCHEMA INTEGRITY SAMPLE (Topic) ---');
    const sampleTopic = await Topic.findOne().populate('subject');
    if (sampleTopic) {
      console.log(JSON.stringify({
        topicName: sampleTopic.name,
        subject: sampleTopic.subject?.name,
        isWeak: sampleTopic.isWeakTopic,
        difficulty: sampleTopic.difficulty,
        hasAI_Metadata: !!sampleTopic.priorityScore || !!sampleTopic.estimatedTime
      }, null, 2));
    }

    console.log('\n--- 🧠 ANALYTICS ENGINE PROOF (StudySession) ---');
    const sampleSession = await StudySession.findOne();
    if (sampleSession) {
      console.log(JSON.stringify({
        sessionId: sampleSession._id,
        duration: sampleSession.durationMinutes,
        productivity: sampleSession.productivityScore,
        recordedAt: sampleSession.createdAt
      }, null, 2));
    }

    console.log('\n✅ DATABASE PROOF COMPLETE. SYSTEM IS LIVE AND DATA-CONSCIOUS.');
    process.exit();
  } catch (error) {
    console.error('❌ Database Proof Failed:', error.message);
    process.exit(1);
  }
};

proveDatabase();
