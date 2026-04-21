const express = require('express');
const { getDailyPlan, getWeakTopics } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/daily-plan', protect, getDailyPlan);
router.get('/weak-topics', protect, getWeakTopics);

module.exports = router;
