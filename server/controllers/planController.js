
const { spawn } = require("child_process");
const Task = require("../models/Task");

// 🚀 Generate AI Study Plan
exports.generatePlan = async (req, res) => {
  try {
    // 📥 1. Fetch tasks from DB
    const tasks = await Task.find();

    if (!tasks.length) {
      return res.status(400).json({ msg: "No tasks found" });
    }

    // 🧠 2. Run Optimizer (Python)
    const optimizer = spawn("python", [
      "ai/optimizer.py",
      JSON.stringify(tasks),
    ]);

    let optimizedData = "";

    optimizer.stdout.on("data", (data) => {
      optimizedData += data.toString();
    });

    optimizer.stderr.on("data", (err) => {
      console.error("Optimizer Error:", err.toString());
    });

    optimizer.on("close", () => {
      try {
        const optimizedTasks = JSON.parse(optimizedData);

        // ⏰ 3. Run Scheduler (Python)
        const scheduler = spawn("python", [
          "ai/scheduler.py",
          JSON.stringify(optimizedTasks),
        ]);

        let scheduleData = "";

        scheduler.stdout.on("data", (data) => {
          scheduleData += data.toString();
        });

        scheduler.stderr.on("data", (err) => {
          console.error("Scheduler Error:", err.toString());
        });

        scheduler.on("close", () => {
          try {
            const finalPlan = JSON.parse(scheduleData);

            // 📤 4. Send final AI plan
            res.json({
              success: true,
              plan: finalPlan,
            });

          } catch (err) {
            console.error("Schedule Parse Error:", err);
            res.status(500).json({ error: "Failed to parse schedule" });
          }
        });

      } catch (err) {
        console.error("Optimizer Parse Error:", err);
        res.status(500).json({ error: "Failed to parse optimizer output" });
      }
    });

  } catch (err) {
    console.error("Controller Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};