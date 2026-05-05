const express = require('express');
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const router = express.Router();

router.route('/').get(getTasks);
router.route('/add-task').post(addTask);
router.route('/update-task/:id').put(updateTask);
router.route('/delete-task/:id').delete(deleteTask);

module.exports = router;
