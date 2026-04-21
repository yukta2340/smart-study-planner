const express = require('express');
const { getTaskHelp, getSuggestions, chatWithAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/help', protect, getTaskHelp);
router.get('/suggestions', protect, getSuggestions);
router.post('/chat', protect, chatWithAssistant);

module.exports = router;
