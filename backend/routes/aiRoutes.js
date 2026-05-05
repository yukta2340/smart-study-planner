const express = require('express');
const { getWeeklyRoadmap, recordFeedback, chatAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.get('/weekly-roadmap', getWeeklyRoadmap);
router.post('/feedback', recordFeedback);
router.post('/chat', chatAssistant);

module.exports = router;
