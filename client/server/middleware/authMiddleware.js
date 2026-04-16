const { verifyToken } = require("../utils/token");

const authMiddleware = (req, res, next) => {
  console.log("🔐 Auth Middleware - Checking authorization for:", req.method, req.path);
  
  // First, try to get user ID from Clerk header (X-User-ID)
  const clerkUserId = req.headers["x-user-id"];
  if (clerkUserId) {
    console.log("✅ Clerk User ID found:", clerkUserId);
    req.user = { id: clerkUserId };
    return next();
  }

  console.log("ℹ️ No Clerk header found, trying JWT token...");

  // Fallback to legacy JWT authentication
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    console.error("❌ No authorization token found");
    return res.status(401).json({ error: "Unauthorized - Missing token and user ID" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    console.error("❌ Invalid JWT token");
    return res.status(401).json({ error: "Invalid token" });
  }

  console.log("✅ JWT Token verified, user ID:", decoded.id);
  req.user = { id: decoded.id };
  next();
};

module.exports = authMiddleware;
