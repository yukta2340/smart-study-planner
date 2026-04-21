const StudySession = require('../models/StudySession');
const sendResponse = require('../utils/responseHelper');
const mongoose = require('mongoose');

/**
 * @desc    Get comprehensive study analytics using MongoDB Aggregation
 * @route   GET /api/analytics/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Total Stats (Time, Sessions, Avg Productivity)
    const overallStats = await StudySession.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$durationMinutes' },
          totalSessions: { $count: {} },
          avgProductivity: { $avg: '$productivityScore' }
        }
      }
    ]);

    // 2. Subject Breakdown (Which subjects get the most time?)
    const subjectBreakdown = await StudySession.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topicData'
        }
      },
      { $unwind: '$topicData' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'topicData.subject',
          foreignField: '_id',
          as: 'subjectData'
        }
      },
      { $unwind: '$subjectData' },
      {
        $group: {
          _id: '$subjectData.name',
          timeSpent: { $sum: '$durationMinutes' },
          color: { $first: '$subjectData.color' }
        }
      },
      { $sort: { timeSpent: -1 } }
    ]);

    // 3. Weekly Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrend = await StudySession.aggregate([
      { 
        $match: { 
          user: userId,
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          minutes: { $sum: "$durationMinutes" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    sendResponse(res, 200, 'Analytics retrieved successfully', {
      summary: overallStats[0] || { totalMinutes: 0, totalSessions: 0, avgProductivity: 0 },
      subjects: subjectBreakdown,
      weeklyTrend
    });

  } catch (error) {
    sendResponse(res, 500, 'Analytics Engine Error', error.message);
  }
};

module.exports = { getDashboardStats };
