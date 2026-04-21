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
 * @desc    Create a new topic within a subject
 * @route   POST /api/topics
 * @access  Private
 */
const createTopic = async (req, res) => {
  try {
    const { subjectId, name, difficulty } = req.body;

    const topic = await Topic.create({
      subject: subjectId,
      name,
      difficulty: difficulty || 3,
    });

    sendResponse(res, 201, 'Topic created successfully', topic);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update a topic (e.g., mark as completed or change difficulty)
 * @route   PUT /api/topics/:id
 * @access  Private
 */
const updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return sendResponse(res, 404, 'Topic not found');
    }

    // Update fields
    topic.name = req.body.name || topic.name;
    topic.difficulty = req.body.difficulty || topic.difficulty;
    topic.isCompleted = req.body.isCompleted !== undefined ? req.body.isCompleted : topic.isCompleted;

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
