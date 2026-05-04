const express = require('express');
const { getWeeklyRoadmap, recordFeedback, chatAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/weekly-roadmap', protect, getWeeklyRoadmap);
router.post('/feedback', protect, recordFeedback);
router.post('/chat', protect, chatAssistant);

module.exports = router;
