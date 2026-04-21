const express = require('express');
const { getWeeklyRoadmap, recordFeedback } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/weekly-roadmap', protect, getWeeklyRoadmap);
router.post('/feedback', protect, recordFeedback);

module.exports = router;
