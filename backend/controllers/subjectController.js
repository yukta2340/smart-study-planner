const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Get all subjects for the user
 * @route   GET /api/subjects
 * @access  Private
 */
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id });
    sendResponse(res, 200, 'Subjects retrieved successfully', subjects);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Create a new subject
 * @route   POST /api/subjects
 * @access  Private
 */
const createSubject = async (req, res) => {
  try {
    const { name, color } = req.body;

    const subject = await Subject.create({
      user: req.user._id,
      name,
      color: color || '#4f46e5',
    });

    sendResponse(res, 201, 'Subject created successfully', subject);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Update a subject
 * @route   PUT /api/subjects/:id
 * @access  Private
 */
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject || subject.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 404, 'Subject not found or unauthorized');
    }

    subject.name = req.body.name || subject.name;
    subject.color = req.body.color || subject.color;

    const updatedSubject = await subject.save();
    sendResponse(res, 200, 'Subject updated successfully', updatedSubject);
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

/**
 * @desc    Delete a subject and its associated topics
 * @route   DELETE /api/subjects/:id
 * @access  Private
 */
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject || subject.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 404, 'Subject not found or unauthorized');
    }

    // Cascade delete topics associated with this subject
    await Topic.deleteMany({ subject: req.params.id });
    await subject.deleteOne();

    sendResponse(res, 200, 'Subject and associated topics removed');
  } catch (error) {
    sendResponse(res, 500, 'Server Error', error.message);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
