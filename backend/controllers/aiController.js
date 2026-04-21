const Topic = require('../models/Topic');
const StudySession = require('../models/StudySession');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    AI Assistant: "What should I study today?"
 * @route   POST /api/ai/chat
 * @access  Private
 */
const getAssistantAdvice = async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();

    // 1. Fetch data for analysis
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });
    const userTopics = topics.filter(t => t.subject !== null);
    const sessions = await StudySession.find({ user: req.user._id });

    // 2. Identify the #1 priority using the Decision Engine logic
    if (lowerMsg.includes('study') || lowerMsg.includes('today') || lowerMsg.includes('plan')) {
      if (!userTopics.length) {
        return sendResponse(res, 200, 'AI Advice', {
          response: "You've conquered all your units! 🏆 Take a break or start a new subject."
        });
      }

      // Calculate priorities
      const analyzed = userTopics.map(t => {
        const topicSessions = sessions.filter(s => s.topic.toString() === t._id.toString());
        const totalTime = topicSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
        const weakScore = totalTime < 30 ? 5 : 0;
        const daysUntil = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const deadlineWeight = daysUntil <= 2 ? 10 : 3;
        
        return { topic: t, score: deadlineWeight + t.difficulty + weakScore, daysUntil };
      });

      const top = analyzed.sort((a, b) => b.score - a.score)[0];

      // 3. Build a Conversational Response
      let personality = `Based on your deadlines and progress, you should definitely focus on **${top.topic.name}** (${top.topic.subject.name}) today.`;
      
      if (top.daysUntil <= 2) {
        personality += " ⚠️ The deadline is critical!";
      } else if (top.score > 12) {
        personality += " 📉 It looks like you haven't spent much time here recently, so it's a high-priority weak area.";
      } else {
        personality += " 📚 It's the perfect time for a routine revision to keep the knowledge fresh.";
      }

      return sendResponse(res, 200, 'AI Assistant Advice', {
        response: personality,
        recommendation: {
          topic: top.topic.name,
          subject: top.topic.subject.name,
          priority: top.score,
          timebox: top.topic.difficulty * 25
        }
      });
    }

    // Default chat
    sendResponse(res, 200, 'AI Chat', {
      response: "I'm your AI Study Coach. Ask me 'What should I study today?' to see your optimized plan!"
    });
  } catch (error) {
    sendResponse(res, 500, 'AI error', error.message);
  }
};

module.exports = { getAssistantAdvice };
