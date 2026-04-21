const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require(path.join(__dirname, "models/User"));
const Task = require(path.join(__dirname, "models/Task"));

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-study-planner";

// Helper: date offset from today at 23:59
// Helper: date offset from today at 23:59
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 0, 0);
  return d;
};

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    password: "$2b$10$examplehashedpassword",
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+0987654321",
    password: "$2b$10$examplehashedpassword",
    role: "admin",
  },
];

const tasks = [
  // ── Overdue (past deadline, not done) ──
  {
    subject: "DBMS Assignment",
    description: "Complete ER diagrams and normalization exercises",
    deadline: daysFromNow(-3),
    difficulty: "Hard",
    completed: false,
  },
  {
    subject: "Operating Systems Lab",
    description: "Write process scheduling simulation in C",
    deadline: daysFromNow(-1),
    difficulty: "Hard",
    completed: false,
  },

  // ── Due today ──
  {
    subject: "Mathematics – Integration",
    description: "Practice definite and indefinite integrals (Chapter 7)",
    deadline: daysFromNow(0),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "English Essay",
    description: "500-word essay on climate change impact",
    deadline: daysFromNow(0),
    difficulty: "Easy",
    completed: false,
  },

  // ── Critical: due within 24 hours ──
  {
    subject: "Physics – Wave Optics",
    description: "Revise interference and diffraction patterns",
    deadline: daysFromNow(1),
    difficulty: "Hard",
    completed: false,
  },

  // ── Warning: due in 2–3 days ──
  {
    subject: "Chemistry – Organic Reactions",
    description: "Memorize substitution and elimination mechanisms",
    deadline: daysFromNow(2),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Data Structures – Trees",
    description: "Implement AVL tree with rotation in Python",
    deadline: daysFromNow(3),
    difficulty: "Hard",
    completed: false,
  },

  // ── Upcoming: safe window ──
  {
    subject: "Computer Networks",
    description: "Study OSI model and TCP/IP stack",
    deadline: daysFromNow(6),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Maths – Probability",
    description: "Practice conditional probability and Bayes theorem",
    deadline: daysFromNow(9),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Software Engineering",
    description: "Prepare UML diagrams for the project report",
    deadline: daysFromNow(12),
    difficulty: "Easy",
    completed: false,
  },

  // ── Completed tasks (for progress/chart stats) ──
  {
    subject: "Biology – Cell Division",
    description: "Studied mitosis and meiosis stages",
    deadline: daysFromNow(-5),
    difficulty: "Easy",
    completed: true,
  },
  {
    subject: "History – World War II",
    description: "Essay on causes and consequences",
    deadline: daysFromNow(-4),
    difficulty: "Medium",
    completed: true,
  },
  {
    subject: "Python – File Handling",
    description: "Complete file I/O exercises from lab manual",
    deadline: daysFromNow(-2),
    difficulty: "Easy",
    completed: true,
  },
  {
    subject: "Algorithms – Sorting",
    description: "Implement and compare merge sort vs quicksort",
    deadline: daysFromNow(-1),
    difficulty: "Medium",
    completed: true,
  },
];
    difficulty: "Hard",
    completed: false,
  },

  // ── Warning: due in 2–3 days ──
  {
    subject: "Chemistry – Organic Reactions",
    description: "Memorize substitution and elimination mechanisms",
    deadline: daysFromNow(2),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Data Structures – Trees",
    description: "Implement AVL tree with rotation in Python",
    deadline: daysFromNow(3),
    difficulty: "Hard",
    completed: false,
  },

  // ── Upcoming: safe window ──
  {
    subject: "Computer Networks",
    description: "Study OSI model and TCP/IP stack",
    deadline: daysFromNow(6),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Maths – Probability",
    description: "Practice conditional probability and Bayes theorem",
    deadline: daysFromNow(9),
    difficulty: "Medium",
    completed: false,
  },
  {
    subject: "Software Engineering",
    description: "Prepare UML diagrams for the project report",
    deadline: daysFromNow(12),
    difficulty: "Easy",
    completed: false,
  },

  // ── Completed tasks (for progress/chart stats) ──
  {
    subject: "Biology – Cell Division",
    description: "Studied mitosis and meiosis stages",
    deadline: daysFromNow(-5),
    difficulty: "Easy",
    completed: true,
  },
  {
    subject: "History – World War II",
    description: "Essay on causes and consequences",
    deadline: daysFromNow(-4),
    difficulty: "Medium",
    completed: true,
  },
  {
    subject: "Python – File Handling",
    description: "Complete file I/O exercises from lab manual",
    deadline: daysFromNow(-2),
    difficulty: "Easy",
    completed: true,
  },
  {
    subject: "Algorithms – Sorting",
    description: "Implement and compare merge sort vs quicksort",
    deadline: daysFromNow(-1),
    difficulty: "Medium",
    completed: true,
  },
];

const seedDatabase = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("🧹 Cleared existing data");
    console.log("👥 Inserting dummy users...");
    await User.insertMany(users);
    console.log("👥 Inserted dummy users");
    console.log("📚 Inserting dummy tasks...");
    await Task.insertMany(tasks);
    console.log("📚 Inserted dummy tasks");
    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();