const crypto = require('crypto');
const sendOTPEmail = require('../utils/emailService').sendOTPEmail;

// In-memory store for OTPs (use Redis in production)
const otpStore = new Map();

const sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store OTP
  otpStore.set(email, { otp, expires });

  // Send real OTP via email
  const sent = await sendOTPEmail(email, otp);
  
  if (sent) {
    console.log(`🔐 OTP for ${email}: ${otp}`); // For testing - remove in production
    res.json({ message: 'OTP sent successfully to your email.' });
  } else {
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const stored = otpStore.get(email);
  
  if (!stored) {
    return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP verified - clear it
  otpStore.delete(email);

  // Generate a temporary token for the verified session
  const token = crypto.randomBytes(32).toString('hex');
  
  res.json({ message: 'OTP verified successfully', token });
};

module.exports = { sendOTP, verifyOTP, otpStore };
