const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const planRoutes = require("./routes/planRoutes");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-study-planner";

app.use(cors());
app.use(express.json());

app.use(userRoutes);
app.use(taskRoutes);
app.use(planRoutes);
app.use(otpRoutes);

app.get("/", (req, res) => {
  res.json({ status: "API is running" });
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
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⏰ Retrying in 5 seconds...");
    setTimeout(() => {
      process.exit(1);
    }, 5000);
  });
