const express = require('express');
const { registerUser, loginUser, verifyEmail } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');
const router = express.Router();

router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.get('/verify-email', verifyEmail);

module.exports = router;
