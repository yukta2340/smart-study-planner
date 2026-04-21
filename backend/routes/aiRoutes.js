const express = require('express');
const { getAssistantAdvice } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/chat', protect, getAssistantAdvice);

module.exports = router;
