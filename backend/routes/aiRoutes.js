const express = require('express');
const { getWeeklyRoadmap, recordFeedback, chatAssistant } = require('../controllers/aiController');
const router = express.Router();

router.get('/weekly-roadmap', getWeeklyRoadmap);
router.post('/feedback', recordFeedback);
router.post('/chat', chatAssistant);

module.exports = router;
