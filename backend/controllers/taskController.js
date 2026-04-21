const Task = require('../models/Task');
const sendResponse = require('../utils/responseHelper');

/**
 * @desc    Get all user tasks
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ deadline: 1 });
    sendResponse(res, 200, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    sendResponse(res, 500, 'Failed to retrieve tasks', error.message);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks/add-task
 * @access  Private
 */
const addTask = async (req, res) => {
  try {
    const { title, description, deadline, difficulty } = req.body;

    if (!title) {
      return sendResponse(res, 400, 'Task title is required');
    }

    const task = new Task({
      user: req.user._id,
      title,
      description,
      deadline: deadline || new Date(),
      difficulty: difficulty || 3,
    });

    const createdTask = await task.save();
    sendResponse(res, 201, 'Task created successfully', createdTask);
  } catch (error) {
    sendResponse(res, 500, 'Failed to create task', error.message);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/update-task/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendResponse(res, 404, 'Task not found');
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 401, 'Not authorized to update this task');
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    sendResponse(res, 200, 'Task updated successfully', updatedTask);
  } catch (error) {
    sendResponse(res, 500, 'Failed to update task', error.message);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/delete-task/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendResponse(res, 404, 'Task not found');
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return sendResponse(res, 401, 'Not authorized to delete this task');
    }

    await task.deleteOne();
    sendResponse(res, 200, 'Task removed successfully');
  } catch (error) {
    sendResponse(res, 500, 'Failed to delete task', error.message);
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask };
