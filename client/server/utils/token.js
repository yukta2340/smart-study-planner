
const jwt = require("jsonwebtoken");

// 🔐 Generate JWT Token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "SECRET_KEY", {
    expiresIn: "7d",
  });
};

// 🔍 Verify Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};