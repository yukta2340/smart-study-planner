const Topic = require('../models/Topic');
const Task = require('../models/Task');
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

/**
 * @desc    AI Task Chat Assistant
 * @route   POST /api/ai/chat
 */
const chatAssistant = async (req, res) => {
  try {
    const { taskId, message } = req.body;

    let taskContext = null;
    if (taskId) {
      taskContext = await Task.findOne({ _id: taskId, user: req.user?._id });
    }

    const taskLabel = taskContext ? taskContext.title : 'your current study task';
    const dueDateText = taskContext && taskContext.deadline ? ` It is due on ${new Date(taskContext.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.` : '';
    const difficultyText = taskContext ? ` The difficulty level is ${taskContext.difficulty}/5.` : '';
    const descriptionText = taskContext && taskContext.description ? ` Here is the task description: ${taskContext.description}.` : '';

    const normalizedMessage = (message || '').toLowerCase();
    let assistantResponse = `I can help you with ${taskLabel}.${dueDateText}${difficultyText}${descriptionText} `;

    if (normalizedMessage.includes('plan') || normalizedMessage.includes('study plan')) {
      assistantResponse +=
        'Here is a simple study plan:\n' +
        '- Review the task requirements and break it into 2–3 focused subtopics.\n' +
        '- Allocate one study session for understanding the concept, one for practice, and one for review.\n' +
        '- If the deadline is soon, prioritize the most urgent sections first and keep each session to 25–45 minutes with short breaks.';
    } else if (normalizedMessage.includes('explain') || normalizedMessage.includes('understand')) {
      assistantResponse +=
        'Start by identifying the goal of the task, then split it into small steps. ' +
        'Focus on the core concept first, then practice with an example or outline what you need to do next.';
    } else if (normalizedMessage.includes('solve') || normalizedMessage.includes('strategy')) {
      assistantResponse +=
        'A strong strategy is to start with the easiest part of the task and build confidence, then move to harder sections. ' +
        'Use active recall, practice problems, and explain the solution aloud to make the learning stick.';
    } else if (normalizedMessage.includes('similar') || normalizedMessage.includes('related')) {
      assistantResponse +=
        'Look for similar topics in your current syllabus and compare how the concepts are related. ' +
        'This will help you apply what you already know and make the task easier to complete.';
    } else {
      assistantResponse +=
        'I recommend breaking the work into smaller steps, focusing on one concept at a time, and using short study sessions with regular review.';
    }

    assistantResponse += ' If you want, share the exact problem statement or ask for a step-by-step study plan.';

    sendResponse(res, 200, 'AI assistant response generated', {
      response: assistantResponse,
    });
  } catch (error) {
    sendResponse(res, 500, 'AI assistant error', error.message);
  }
};

module.exports = { getWeeklyRoadmap, recordFeedback, chatAssistant };
