const express = require('express');
const { getWeeklyRoadmap } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/weekly-roadmap', protect, getWeeklyRoadmap);

module.exports = router;
