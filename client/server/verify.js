const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Task = require("./models/Task");
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-study-planner";
console.log("Connecting to:", MONGO_URI.split("@").pop() || MONGO_URI);
mongoose.connect(MONGO_URI).then(async () => {
  const all = await Task.find().sort({ deadline: 1 });
  const now = new Date();
  console.log("TOTAL:", all.length);
  all.forEach(t => {
    const d = Math.round((new Date(t.deadline) - now) / 86400000);
    const s = t.completed ? "DONE" : (d < 0 ? "OVERDUE" : (d < 1 ? "CRITICAL" : (d < 3 ? "WARNING" : "OK")));
    console.log("[" + s + "]", t.subject, "|", t.difficulty, "|", d + "d");
  });
  const done = all.filter(x => x.completed).length;
  console.log("\nDone:", done, "| Pending:", all.length - done, "| Total:", all.length);
  await mongoose.disconnect();
  process.exit(0);
});
