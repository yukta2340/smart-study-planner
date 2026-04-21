const express = require('express');
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTasks);
router.route('/add-task').post(protect, addTask);
router.route('/update-task/:id').put(protect, updateTask);
router.route('/delete-task/:id').delete(protect, deleteTask);

module.exports = router;
