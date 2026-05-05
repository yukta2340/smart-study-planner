const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/emailService').sendVerificationEmail;
const sendOTPEmail = require('../utils/emailService').sendOTPEmail;
const sendPasswordResetEmail = require('../utils/emailService').sendPasswordResetEmail;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isVerified: false,
      verificationToken,
      verificationExpires,
    });
  } catch (error) {
    console.error('Registration failed:', error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'email';
      const duplicateMessage = duplicateField === 'email'
        ? 'Email already registered.'
        : 'Registration conflict detected. Please try a different account.';
      return res.status(400).json({ success: false, message: duplicateMessage });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please check your inputs.' });
  }

  if (user) {
    // Send verification email (don't block registration if email fails)
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
    }

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      message: 'Registration successful. Please check your email to verify your account.',
      needsVerification: true,
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid user data' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (user && !user.isVerified) {
    return res.status(401).json({ success: false, message: 'Email not verified. Please check your email for the verification link.' });
  }

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

const verifyCredentials = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    return res.json({ success: true, message: 'Credentials verified' });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password' });
};

// OTP-based registration
const registerWithOTP = async (req, res) => {
  const { name, email, password, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required' });
  }

  // Verify OTP (this would be implemented in otpController)
  const otpStore = require('./otpController').otpStore;
  const stored = otpStore.get(normalizedEmail);

  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      isVerified: true, // OTP verified
    });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }

  if (user) {
    // Clear OTP
    otpStore.delete(normalizedEmail);
    
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ success: false, message: 'Invalid user data' });
  }
};

// OTP-based login
const loginWithOTP = async (req, res) => {
  const { email, password, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required' });
  }

  // Verify OTP
  const otpStore = require('./otpController').otpStore;
  const stored = otpStore.get(normalizedEmail);

  if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (user && (await user.matchPassword(password))) {
    // Clear OTP
    otpStore.delete(normalizedEmail);
    
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
};

// Password reset functionality
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  // Send password reset email with OTP
  try {
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);
    const response = { success: true, message: 'Password reset OTP sent to your email' };

    // In development mode, include the OTP in the response
    if (emailResult.otp) {
      response.otp = emailResult.otp;
      response.devHint = emailResult.devHint;
    }

    res.json(response);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    res.status(500).json({ success: false, message: 'Failed to send password reset email' });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
    resetPasswordToken: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully' });
};

module.exports = { registerUser, loginUser, verifyEmail, registerWithOTP, loginWithOTP, verifyCredentials, forgotPassword, resetPassword };
