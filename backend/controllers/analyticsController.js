const StudySession = require('../models/StudySession');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Get user productivity analytics
 * @route   GET /api/analytics/productivity
 * @access  Private
 */
const getProductivityAnalytics = async (req, res) => {
  try {
    const sessions = await StudySession.find({ user: req.user._id });

    if (!sessions.length) {
      return sendResponse(res, 200, 'No sessions found', { streak: 0, averageProductivity: 0 });
    }

    // Calculate Average Productivity
    const totalScore = sessions.reduce((acc, s) => acc + s.productivityScore, 0);
    const averageProductivity = (totalScore / sessions.length).toFixed(2);

    // Calculate Streak (Consecutive days)
    const dates = sessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i); // Unique dates

    let streak = 0;
    const today = new Date().toDateString();
    let checkDate = new Date();

    while (dates.includes(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    sendResponse(res, 200, 'Analytics retrieved', {
      streak,
      averageProductivity,
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((acc, s) => acc + s.durationMinutes, 0)
    });
  } catch (error) {
    sendResponse(res, 500, 'Failed to fetch analytics', error.message);
  }
};

module.exports = { getProductivityAnalytics };
