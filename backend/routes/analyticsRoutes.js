const express = require('express');
const { getDashboardStats } = require('../controllers/analyticsController');
const { completeStudySession } = require('../controllers/studyController');
const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.post('/session', completeStudySession);

module.exports = router;
