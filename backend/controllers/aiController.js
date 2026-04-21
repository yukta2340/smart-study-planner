const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Smart 7-Day Scheduler: Automated Workload Distribution
 * @route   GET /api/ai/weekly-roadmap
 * @access  Private
 */
const getWeeklyRoadmap = async (req, res) => {
  try {
    const topics = await Topic.find({ isCompleted: false }).populate({
      path: 'subject',
      match: { user: req.user._id }
    });

    const userTopics = topics.filter(t => t.subject !== null);

    if (!userTopics.length) {
      return sendResponse(res, 200, 'Your schedule is clear! ⛱️');
    }

    // 1. RANKING (Decision Engine Logic)
    const analyzed = userTopics.map(t => {
      const today = new Date();
      const deadline = new Date(t.deadline);
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      let deadlineNorm = daysUntil <= 1 ? 1.0 : (daysUntil <= 3 ? 0.8 : (daysUntil <= 7 ? 0.5 : 0.2));
      let revisionNorm = (t.nextReviewDate && new Date(t.nextReviewDate) <= today) ? 1.0 : 0.1;
      
      const score = (deadlineNorm * 0.5) + (t.difficulty / 5 * 0.2) + (revisionNorm * 0.3);

      return { 
        ...t._doc, 
        priority: score, 
        subjectName: t.subject.name, 
        deadlineInDays: daysUntil 
      };
    }).sort((a, b) => b.priority - a.priority);

    // 2. 7-DAY SMART DISTRIBUTION (Bin Packing)
    const MAX_DAILY_MINS = 360; // 6 hours
    const roadmap = [];
    
    // Initialize 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      roadmap.push({
        date: date.toDateString(),
        remainingMins: MAX_DAILY_MINS,
        tasks: [],
        status: 'Optimal'
      });
    }

    const unassigned = [];

    analyzed.forEach(topic => {
      let assigned = false;
      
      // Try to find the earliest day that has room AND is before the deadline
      for (let dayIdx = 0; dayIdx < roadmap.length; dayIdx++) {
        const currentDay = roadmap[dayIdx];
        
        // Constraint: Must be scheduled before deadline day
        if (dayIdx > topic.deadlineInDays && topic.deadlineInDays >= 0) continue;

        if (currentDay.remainingMins >= topic.estimatedTime) {
          currentDay.tasks.push({
            name: `${topic.subjectName}: ${topic.name}`,
            time: topic.estimatedTime,
            isRevision: topic.nextReviewDate && new Date(topic.nextReviewDate) <= new Date()
          });
          currentDay.remainingMins -= topic.estimatedTime;
          assigned = true;
          break;
        }
      }

      if (!assigned) unassigned.push(topic.name);
    });

    // 3. Post-process Status (Identify Overload)
    roadmap.forEach(day => {
      if (day.remainingMins < 60) day.status = '🔥 Intense';
      if (day.tasks.length === 0) day.status = '🍀 Light';
    });

    sendResponse(res, 200, '7-Day Smart Roadmap Generated', {
        roadmap,
        overloadWarnings: unassigned.length > 0 ? {
            message: "Some tasks couldn't fit into the 7-day window. Consider increasing daily capacity.",
            tasks: unassigned
        } : null
    });

  } catch (error) {
    sendResponse(res, 500, 'Scheduler Error', error.message);
  }
};

module.exports = { getWeeklyRoadmap };
