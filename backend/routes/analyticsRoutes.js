const express = require('express');
const { getDashboardStats } = require('../controllers/analyticsController');
const { completeStudySession } = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.post('/session', protect, completeStudySession);

module.exports = router;
