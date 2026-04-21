const express = require('express');
const { getTopicsBySubject, createTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/authMiddleware');
const { validateTopic } = require('../middleware/validationMiddleware');
const router = express.Router();

router.get('/:subjectId', protect, getTopicsBySubject);
router.post('/', protect, validateTopic, createTopic);

router.route('/:id')
  .put(protect, validateTopic, updateTopic)
  .delete(protect, deleteTopic);

module.exports = router;
