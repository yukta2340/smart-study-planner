const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    AI Chatbot: "What should I study today?"
 * @route   POST /api/ai/chatbot
 * @access  Private
 */
const chatWithAssistant = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = message.toLowerCase();

    // 1. Check for "what should I study" or "plan" keywords
    if (lowerMessage.includes('study') || lowerMessage.includes('today') || lowerMessage.includes('plan')) {
      
      // Find topics due for review today (Spaced Repetition)
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const reviewTopics = await Topic.find({
        nextReviewDate: { $lte: today },
        isCompleted: false
      }).populate({
        path: 'subject',
        match: { user: req.user._id }
      });

      const userTopics = reviewTopics.filter(t => t.subject !== null);

      if (userTopics.length > 0) {
        const topTopic = userTopics[0];
        return sendResponse(res, 200, 'AI Suggestion', {
          response: `Based on your Spaced Repetition schedule, you should focus on "${topTopic.name}" in ${topTopic.subject.name} today. It's due for a revision cycle!`,
          recommendation: topTopic
        });
      }

      return sendResponse(res, 200, 'AI Suggestion', {
        response: "You're all caught up on revisions! Why not start a new topic or take a well-deserved break? 🏆"
      });
    }

    // Default response
    sendResponse(res, 200, 'Chat Response', {
      response: `I'm your Smart Study Assistant. Ask me "What should I study today?" to see your AI-optimized plan based on Spaced Repetition.`
    });
  } catch (error) {
    sendResponse(res, 500, 'Chatbot error', error.message);
  }
};

module.exports = { chatWithAssistant };
