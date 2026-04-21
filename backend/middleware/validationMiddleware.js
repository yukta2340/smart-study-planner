/**
 * Comprehensive Input Validation Suite
 */

// 1. Auth Validations
const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  next();
};

const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  next();
};

// 2. Subject Validations
const validateSubject = (req, res, next) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Subject name cannot be empty' });
  }
  next();
};

// 3. Topic Validations
const validateTopic = (req, res, next) => {
  const { name, difficulty, subjectId } = req.body;
  if (!name || !subjectId) {
    return res.status(400).json({ success: false, message: 'Topic name and Subject ID are required' });
  }
  if (difficulty && (difficulty < 1 || difficulty > 5)) {
    return res.status(400).json({ success: false, message: 'Difficulty must be between 1 and 5' });
  }
  next();
};

// 4. Study Session Validations
const validateStudySession = (req, res, next) => {
  const { topicId, durationMinutes, productivityScore } = req.body;
  if (!topicId || !durationMinutes || !productivityScore) {
    return res.status(400).json({ success: false, message: 'TopicId, duration, and productivity score are required' });
  }
  if (productivityScore < 1 || productivityScore > 10) {
    return res.status(400).json({ success: false, message: 'Productivity score must be between 1 and 10' });
  }
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateSubject,
  validateTopic,
  validateStudySession
};
