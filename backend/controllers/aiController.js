const Topic = require('../models/Topic');
const Task = require('../models/Task');
const sendResponse = require('../utils/responseHelper');
const Groq = require('groq-sdk');

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

/**
 * @desc    AI Task Chat Assistant with Groq Integration
 * @route   POST /api/ai/chat
 */
const chatAssistant = async (req, res) => {
  try {
    const { taskId, message, history } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return sendResponse(
        res,
        400,
        'AI service not configured',
        'Please set GROQ_API_KEY in your .env file'
      );
    }

    if (!message || !message.trim()) {
      return sendResponse(res, 400, 'Invalid request', 'Message cannot be empty');
    }

    let taskContext = null;
    if (taskId) {
      taskContext = await Task.findOne({ _id: taskId, user: req.user?._id });
    }

    // Build task context for the AI
    let systemPrompt = `You are a helpful AI Study Coach for the Smart Study Planner app. Your role is to:
1. Help students understand complex topics and tasks
2. Break down difficult problems into manageable steps
3. Create personalized study plans
4. Provide study strategies and tips
5. Encourage and motivate students
6. Adapt explanations based on difficulty level

Be concise, clear, and use simple language. Use bullet points and numbered lists when appropriate.`;

    if (taskContext) {
      const deadline = taskContext.deadline
        ? new Date(taskContext.deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        : 'No deadline';

      systemPrompt += `\n\nCurrent Study Task Context:
- Title: ${taskContext.title || 'Untitled'}
- Difficulty: ${taskContext.difficulty || 'N/A'}/5
- Due Date: ${deadline}
- Description: ${taskContext.description || 'No description provided'}
- Subject: ${taskContext.subject || 'General'}`;
    }

    // Convert message history format for Groq
    const messages = [];

    // Add previous messages from history if provided
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          });
        }
      });
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantResponse =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response. Please try again.';

    sendResponse(res, 200, 'AI assistant response generated', {
      response: assistantResponse,
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);

    if (error.status === 401 || error.message?.includes('authentication')) {
      return sendResponse(
        res,
        401,
        'AI authentication failed',
        'Invalid Groq API key. Please check your configuration.'
      );
    }

    if (error.message?.includes('rate_limit')) {
      return sendResponse(
        res,
        429,
        'Rate limit exceeded',
        'Too many requests. Please wait a moment and try again.'
      );
    }

    sendResponse(res, 500, 'AI assistant error', error.message);
  }
};

module.exports = { getWeeklyRoadmap, recordFeedback, chatAssistant };
