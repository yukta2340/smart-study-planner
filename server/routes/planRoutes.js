const express = require("express");
const router = express.Router();
const { generatePlan } = require("../controllers/planController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/generate-plan", authMiddleware, generatePlan);

module.exports = router;
