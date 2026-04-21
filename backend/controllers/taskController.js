const Task = require('../models/Task');

const getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
};

const addTask = async (req, res) => {
  const { title, description, deadline, difficulty } = req.body;

  const task = new Task({
    user: req.user._id,
    title,
    description,
    deadline,
    difficulty,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
};

const updateTask = async (req, res) => {
  const { title, description, deadline, difficulty, completed } = req.body;

  const task = await Task.findById(req.params.id);

  if (task) {
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.difficulty = difficulty || task.difficulty;
    task.completed = completed !== undefined ? completed : task.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask };
