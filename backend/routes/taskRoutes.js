const express = require('express');
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Protect all task routes so req.user is available for task operations
router.use(protect);

router.route('/').get(getTasks);
router.route('/add-task').post(addTask);
router.route('/update-task/:id').put(updateTask);
router.route('/delete-task/:id').delete(deleteTask);

module.exports = router;
