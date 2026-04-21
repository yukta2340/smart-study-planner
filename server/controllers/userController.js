
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/token");

// 📝 Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 🔐 Strong Password Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters long and include uppercase, lowercase, a digit, and a special character." 
      });
    }

    // Check existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user", // default role
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (err) {
    console.error("Register Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists" });
    }

    res.status(500).json({ error: "Registration failed" });
  }
};

// 🔑 Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken({ id: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// 👤 Get Profile (Protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);

  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};