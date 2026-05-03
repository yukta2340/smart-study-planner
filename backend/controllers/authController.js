const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/emailService').sendVerificationEmail;

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

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    isVerified: false,
    verificationToken,
    verificationExpires,
  });

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

module.exports = { registerUser, loginUser, verifyEmail };
