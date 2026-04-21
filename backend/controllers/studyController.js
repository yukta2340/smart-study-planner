const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const User = require('../models/User');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Start and complete a study session with Spaced Repetition and XP logic
 * @route   POST /api/analytics/session
 * @access  Private
 */
const completeStudySession = async (req, res) => {
  try {
    const { topicId, durationMinutes, productivityScore, notes } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendResponse(res, 404, 'Topic not found');

    // 1. Create the session
    const session = await StudySession.create({
      user: req.user._id,
      topic: topicId,
      durationMinutes,
      productivityScore,
      notes,
    });

    // 2. Spaced Repetition Logic (1, 3, 7, 14, 30 days)
    const intervals = [1, 3, 7, 14, 30];
    const nextInterval = intervals[topic.reviewCount] || 30;
    
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    topic.reviewCount += 1;
    topic.nextReviewDate = nextReview;
    topic.lastReviewedDate = new Date();
    await topic.save();

    // 3. Gamification Logic (XP & Level Up)
    const user = await User.findById(req.user._id);
    const xpGained = durationMinutes * 2 + (productivityScore * 10);
    user.xp += xpGained;
    
    // Simple leveling: 1000 XP per level
    const newLevel = Math.floor(user.xp / 1000) + 1;
    const leveledUp = newLevel > user.level;
    user.level = newLevel;

    // Streak Logic
    const today = new Date().toDateString();
    if (user.lastActiveDate?.toDateString() !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (user.lastActiveDate?.toDateString() === yesterday.toDateString()) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastActiveDate = new Date();
    }

    await user.save();

    sendResponse(res, 201, leveledUp ? 'LEVEL UP! 🚀 Session saved.' : 'Session saved and rewards earned!', {
      session,
      xpGained,
      currentLevel: user.level,
      streak: user.streak,
      nextReview: topic.nextReviewDate
    });
  } catch (error) {
    sendResponse(res, 500, 'Failed to save session', error.message);
  }
};

module.exports = { completeStudySession };
