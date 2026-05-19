const express = require('express');
const { getDashboardStats } = require('../controllers/analyticsController');
const { completeStudySession } = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.post('/session', completeStudySession);

module.exports = router;
