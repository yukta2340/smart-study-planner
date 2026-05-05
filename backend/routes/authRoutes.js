const express = require('express');
const { registerUser, loginUser, verifyEmail, registerWithOTP, loginWithOTP, verifyCredentials, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validationMiddleware');
const router = express.Router();

router.post('/register', validateUserRegistration, registerUser);
router.post('/login', validateUserLogin, loginUser);
router.post('/verify-credentials', verifyCredentials);
router.get('/verify-email', verifyEmail);

// OTP-based auth
router.post('/register-otp', registerWithOTP);
router.post('/login-otp', loginWithOTP);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
