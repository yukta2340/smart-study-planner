const Topic = require('../models/Topic');
const StudySession = require('../models/StudySession');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Decision Engine: Generates a prioritized study plan
 * @route   GET /api/ai/daily-plan
 * @access  Private
 */
const getDailyPlan = async (req, res) => {
  try {
    // 1. Fetch topics and their sessions
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });

    const userTopics = topics.filter(t => t.subject !== null);

    if (!userTopics.length) {
      return sendResponse(res, 200, 'All units completed! 🏆');
    }

    // 2. Fetch recent study sessions to calculate "Weakness"
    const sessions = await StudySession.find({ user: req.user._id });

    // 3. Decision Engine Logic
    const prioritizedPlan = userTopics.map(topic => {
      // Calculate Weak Score (inverse of total study time for this topic)
      const topicSessions = sessions.filter(s => s.topic.toString() === topic._id.toString());
      const totalTime = topicSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      
      // Weakness is higher if time spent is lower than average topic time
      const weakScore = totalTime < 30 ? 5 : (totalTime < 60 ? 3 : 1);

      // Deadline Weight (Mocking a deadline proximity for now, or using a default)
      const deadlineWeight = 3; 

      // Priority Formula: priority = (deadline_weight + difficulty + weak_score)
      const priority = deadlineWeight + topic.difficulty + weakScore;

      return {
        topic: topic.name,
        subject: topic.subject.name,
        priority,
        status: weakScore >= 5 ? '⚠️ WEAK TOPIC' : '✅ ON TRACK',
        recommendedTime: topic.difficulty * 20,
        reason: weakScore >= 5 ? 'Low study time detected.' : 'Scheduled for maintenance.'
      };
    });

    // Sort by Priority (Descending)
    const sortedPlan = prioritizedPlan.sort((a, b) => b.priority - a.priority);

    sendResponse(res, 200, 'AI Smart Study Plan Generated', sortedPlan);
  } catch (error) {
    sendResponse(res, 500, 'Decision Engine Error', error.message);
  }
};

/**
 * @desc    Weak Topic Detection
 * @route   GET /api/ai/weak-topics
 * @access  Private
 */
const getWeakTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });

    const userTopics = topics.filter(t => t.subject !== null);
    const sessions = await StudySession.find({ user: req.user._id });

    const weakTopics = userTopics
      .map(topic => {
        const totalTime = sessions
          .filter(s => s.topic.toString() === topic._id.toString())
          .reduce((acc, s) => acc + s.durationMinutes, 0);
        
        return { name: topic.name, subject: topic.subject.name, totalTime };
      })
      .filter(t => t.totalTime < 30); // Less than 30 mins spent

    sendResponse(res, 200, 'Weak topics detected', weakTopics);
  } catch (error) {
    sendResponse(res, 500, 'Detection Error', error.message);
  }
};

module.exports = { getDailyPlan, getWeakTopics };
