const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const planRoutes = require("./routes/planRoutes");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-study-planner";

app.use(helmet()); // 🛡️ Security headers
app.use(compression()); // 📦 Compress responses

// 🌍 Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// 🚦 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

app.use(express.json({ limit: "1mb" })); // Limit JSON size

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/otp", otpRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Smart Study Planner API is running", version: "1.0.0" });
});

// 🛡️ Error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// 📡 Connect MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const server = app.listen(PORT, () => {
      console.log(`✅ Server listening on port ${PORT}`);
    });

    // 🛑 Graceful Shutdown
    const shutdown = () => {
      console.log("Shutting down gracefully...");
      server.close(() => {
        mongoose.connection.close(false).then(() => {
          console.log("MongoDB connection closed.");
          process.exit(0);
        });
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// 🛠️ Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Global Error:", err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" 
      ? "Internal Server Error" 
      : err.message
  });
});
