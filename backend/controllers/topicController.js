const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Get all topics for a specific subject
 * @route   GET /api/topics/:subjectId
 * @access  Private
 */
const getTopicsBySubject = async (req, res) => {
  try {
    const topics = await Topic.find({ subject: req.params.subjectId });
    sendResponse(res, 200, 'Topics retrieved successfully', topics);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Create a new topic with full AI metadata
 * @route   POST /api/topics
 * @access  Private
 */
const createTopic = async (req, res) => {
  try {
    const { subjectId, name, difficulty, deadline, estimatedTime } = req.body;

    if (!subjectId || !name) {
      return sendResponse(res, 400, 'Subject ID and Name are required');
    }

    const topic = await Topic.create({
      subject: subjectId,
      name,
      difficulty: difficulty || 3,
      deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      estimatedTime: estimatedTime || 60,
    });

    sendResponse(res, 201, 'Topic created with AI metadata', topic);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update a topic (Full Support for AI metrics)
 * @route   PUT /api/topics/:id
 * @access  Private
 */
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return sendResponse(res, 404, 'Topic not found');
    }

    // Dynamic update
    const fieldsToUpdate = ['name', 'difficulty', 'isCompleted', 'deadline', 'estimatedTime', 'isWeakTopic'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        topic[field] = req.body[field];
      }
    });

    const updatedTopic = await topic.save();
    sendResponse(res, 200, 'Topic updated successfully', updatedTopic);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete a topic
 * @route   DELETE /api/topics/:id
 * @access  Private
 */
const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return sendResponse(res, 404, 'Topic not found');
    }

    await topic.deleteOne();
    sendResponse(res, 200, 'Topic removed successfully');
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

module.exports = { getTopicsBySubject, createTopic, updateTopic, deleteTopic };
