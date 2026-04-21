const nodemailer = require('nodemailer');

/**
 * Send a study reminder email
 */
const sendReminderEmail = async (email, taskTitle, deadline) => {
  try {
    // Create a transporter (Mocked for Demo - use real SMTP for production)
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', // Demo SMTP service
      port: 587,
      auth: {
        user: 'mock_user@ethereal.email',
        pass: 'mock_pass'
      }
    });

    const mailOptions = {
      from: '"StudyAI" <no-reply@studyai.com>',
      to: email,
      subject: '📚 Study Reminder: Stay on Track!',
      text: `Hello! This is a reminder to work on your task: "${taskTitle}". Deadline: ${new Date(deadline).toLocaleString()}. Keep up the great work!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Study Reminder 📚</h2>
          <p>Hello!</p>
          <p>Don't forget to stay on track with your studies. You have a task coming up:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 10px 0;">
            <strong>Task:</strong> ${taskTitle}<br>
            <strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}
          </div>
          <p>Keep pushing towards your goals!</p>
          <footer style="font-size: 12px; color: #777;">Sent by Smart Study Planner</footer>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};

module.exports = sendReminderEmail;
