const cron = require('node-cron');
const User = require('../models/User');
const Task = require('../models/Task');
const sendReminderEmail = require('../utils/emailService');

/**
 * Schedule daily study alerts at 8:00 AM
 */
const initSchedules = () => {
  // Schedule a task to run every day at 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running daily study alert job...');
    
    try {
      const users = await User.find({});
      
      for (const user of users) {
        // Find tasks due today for this user
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasksToday = await Task.find({
          user: user._id,
          completed: false,
          deadline: { $gte: today, $lt: tomorrow }
        });

        if (tasksToday.length > 0) {
          console.log(`📧 Sending daily alert to ${user.email} for ${tasksToday.length} tasks.`);
          await sendReminderEmail(user.email, `${tasksToday.length} tasks due today`, today);
        }
      }
    } catch (error) {
      console.error('❌ Error in daily alert job:', error.message);
    }
  });

  console.log('✅ Daily study alerts scheduled.');
};

module.exports = initSchedules;
