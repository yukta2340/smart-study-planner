const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Generate a smart study plan based on difficulty and revision cycles
 * @route   GET /api/ai/plan
 * @access  Private
 */
const generateSmartPlan = async (req, res) => {
  try {
    // Fetch all incomplete topics for the user (via their subjects)
    // For simplicity, we fetch all topics and filter
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });

    const userTopics = topics.filter(t => t.subject !== null);

    if (!userTopics.length) {
      return sendResponse(res, 200, 'No pending topics found. Great job!');
    }

    // Advanced Scheduling Algorithm:
    // Sort by Difficulty (Descending) and CreatedAt (Ascending for revision)
    const sortedTopics = userTopics.sort((a, b) => {
      if (b.difficulty !== a.difficulty) {
        return b.difficulty - a.difficulty; // Harder topics first
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Older revisions first
    });

    const plan = sortedTopics.map((topic, index) => ({
      slot: `Session ${index + 1}`,
      topic: topic.name,
      subject: topic.subject.name,
      difficulty: topic.difficulty,
      recommendedDuration: topic.difficulty * 30, // 30-150 mins
      advice: topic.difficulty >= 4 ? 'Requires high focus. Use deep work techniques.' : 'Good for a light study session.'
    }));

    sendResponse(res, 200, 'AI-powered study plan generated', plan);
  } catch (error) {
    sendResponse(res, 500, 'Failed to generate plan', error.message);
  }
};

module.exports = { generateSmartPlan };
