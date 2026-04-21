const express = require('express');
const { getProductivityAnalytics, getWeakAreaReport } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/productivity', protect, getProductivityAnalytics);
router.get('/weak-areas', protect, getWeakAreaReport);

module.exports = router;
