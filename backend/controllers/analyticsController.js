const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Performance Intelligence: Weak Topic Risk Report
 * @route   GET /api/analytics/weak-areas
 * @access  Private
 */
const getWeakAreaReport = async (req, res) => {
  try {
    // 1. Fetch all user topics and sessions
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });
    
    const userTopics = topics.filter(t => t.subject !== null);
    const sessions = await StudySession.find({ user: req.user._id });

    // 2. Perform Detection Logic
    const riskReport = userTopics.map(topic => {
      const topicSessions = sessions.filter(s => s.topic.toString() === topic._id.toString());
      
      const totalTime = topicSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
      const avgProductivity = topicSessions.length > 0 
        ? (topicSessions.reduce((acc, s) => acc + s.productivityScore, 0) / topicSessions.length).toFixed(1)
        : 0;

      // RISK CRITERIA:
      // - High Difficulty (>=4) but low time (< 60 mins)
      // - OR Low Productivity Score (< 5)
      // - OR Zero sessions but deadline is close
      let riskLevel = 'LOW';
      let reason = '';

      if (totalTime < 30) {
        riskLevel = 'HIGH';
        reason = 'Insufficient study time detected.';
      } else if (avgProductivity > 0 && avgProductivity < 5) {
        riskLevel = 'MEDIUM';
        reason = 'Low productivity reported in recent sessions.';
      }

      return {
        topic: topic.name,
        subject: topic.subject.name,
        totalStudyTime: `${totalTime} mins`,
        avgProductivity,
        riskLevel,
        reason
      };
    });

    // Filter only those that are Medium or High risk
    const detectedWeakAreas = riskReport.filter(r => r.riskLevel !== 'LOW');

    sendResponse(res, 200, 'Weak Areas Detected', {
      count: detectedWeakAreas.length,
      report: detectedWeakAreas
    });
  } catch (error) {
    sendResponse(res, 500, 'Analytics Error', error.message);
  }
};

module.exports = { getWeakAreaReport };
