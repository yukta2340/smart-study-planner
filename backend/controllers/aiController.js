const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    AI Decision Engine with Learning Feedback Loop
 */
const getWeeklyRoadmap = async (req, res) => {
  try {
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });

    const userTopics = topics.filter(t => t.subject !== null);

    if (!userTopics.length) {
      return sendResponse(res, 200, 'Schedule clear! Keep it up. 🚀');
    }

    const MAX_DAILY_MINS = 360;
    const MAX_SESSION_MINS = 60;
    const today = new Date();

    // 1. DYNAMIC RANKING WITH LEARNING LOOP
    const analyzed = userTopics.map(t => {
      const deadline = new Date(t.deadline);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      const isMissed = daysUntil < 0;
      
      // Factor 1: Urgency
      let urgencyNorm = isMissed ? 1.0 : (daysUntil > 14 ? 0.2 : 1 - (daysUntil / 14));
      
      // Factor 2: Difficulty
      let difficultyNorm = t.difficulty / 5;

      // Factor 3: Time
      let timeNorm = Math.min(t.estimatedTime / MAX_DAILY_MINS, 1.0);

      // --- THE LEARNING LOOP BOOST ---
      // If the topic is marked "Weak", it gets a significant priority bump
      const weakBoost = t.isWeakTopic ? 0.25 : 0;

      // Master Formula (Total weights = 1.0 + Boost)
      const priorityScore = (0.4 * urgencyNorm) + (0.3 * difficultyNorm) + (0.2 * timeNorm) + (0.1 * weakBoost);

      return { 
        ...t._doc, 
        priorityScore, 
        isMissed,
        isWeak: t.isWeakTopic,
        subjectName: t.subject.name, 
        deadlineInDays: daysUntil 
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);

    // 2. SESSION SPLITTING
    let sessionQueue = [];
    analyzed.forEach(topic => {
      let remainingTime = topic.estimatedTime;
      let part = 1;
      while (remainingTime > 0) {
        const sessionTime = Math.min(remainingTime, MAX_SESSION_MINS);
        sessionQueue.push({
          name: topic.name,
          topicId: topic._id,
          part: part,
          isMissed: topic.isMissed,
          isWeak: topic.isWeak,
          duration: sessionTime,
          priority: topic.priorityScore,
          deadlineInDays: topic.deadlineInDays,
          subject: topic.subjectName
        });
        remainingTime -= sessionTime;
        part++;
      }
    });

    // 3. ADAPTIVE DISTRIBUTION
    const roadmap = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      roadmap.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        remainingMins: MAX_DAILY_MINS,
        sessions: [],
        status: 'Optimal'
      });
    }

    sessionQueue.forEach(session => {
      let assigned = false;
      for (let dayIdx = 0; dayIdx < roadmap.length; dayIdx++) {
        const currentDay = roadmap[dayIdx];
        if (dayIdx > session.deadlineInDays && session.deadlineInDays >= 0) continue;

        if (currentDay.remainingMins >= session.duration) {
          let label = session.name;
          if (session.isMissed) label = `⚠️ CATCH UP: ${label}`;
          if (session.isWeak) label = `🧠 WEAK AREA: ${label}`;

          currentDay.sessions.push({ ...session, label });
          currentDay.remainingMins -= session.duration;
          assigned = true;
          break;
        }
      }
    });

    sendResponse(res, 200, 'Learning-Loop Roadmap Generated', {
        summary: {
            totalTopics: userTopics.length,
            weakTopicsDetected: analyzed.filter(t => t.isWeak).length
        },
        roadmap
    });

  } catch (error) {
    sendResponse(res, 500, 'Learning Engine Error', error.message);
  }
};

/**
 * @desc    Feedback Loop: Mark a topic as weak to increase its future priority
 * @route   POST /api/ai/feedback
 */
const recordFeedback = async (req, res) => {
  try {
    const { topicId, rating } = req.body; // rating 1-5 (1=Easy, 5=Very Hard)
    
    const topic = await Topic.findById(topicId);
    if (!topic) return sendResponse(res, 404, 'Topic not found');

    // Logic: If user marks it 4 or 5, it's a weak topic
    if (rating >= 4) {
      topic.isWeakTopic = true;
      topic.difficulty = Math.min(topic.difficulty + 1, 5); // Increase difficulty
    } else {
      topic.isWeakTopic = false;
    }

    topic.studyIntensity += 1;
    await topic.save();

    sendResponse(res, 200, 'Feedback captured. The AI has adjusted your learning curve. 🧠');
  } catch (error) {
    sendResponse(res, 500, 'Feedback Error', error.message);
  }
};

module.exports = { getWeeklyRoadmap, recordFeedback };
