const express = require('express');
const { getTopicsBySubject, createTopic, updateTopic, deleteTopic } = require('../controllers/topicController');
const { validateTopic } = require('../middleware/validationMiddleware');
const router = express.Router();

router.get('/:subjectId', getTopicsBySubject);
router.post('/', validateTopic, createTopic);

router.route('/:id')
  .put(validateTopic, updateTopic)
  .delete(deleteTopic);

module.exports = router;
