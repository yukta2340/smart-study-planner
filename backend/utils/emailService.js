const nodemailer = require('nodemailer');

// Create reusable transporter using environment variables
const createTransporter = () => {
  const missingConfig = !process.env.EMAIL_USER || !process.env.EMAIL_PASS;
  if (missingConfig && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ SMTP credentials are not configured. OTP emails will not be sent by email in development mode.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send email verification link
 */
const sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const mailOptions = {
      from: '"Smart Study Planner" <no-reply@smartstudyplanner.com>',
      to: email,
      subject: '📧 Verify Your Email - Smart Study Planner',
      text: `Welcome! Click the link to verify your email: ${verifyUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Smart Study Planner! 🎓</h2>
          <p>Hello,</p>
          <p>Thank you for registering. Please verify your email address to activate your account.</p>
          <div style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link:</p>
          <p style="color: #4f46e5; font-size: 13px; word-break: break-all;">${verifyUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
          <footer style="font-size: 12px; color: #777; margin-top: 20px;">© 2026 Smart Study Planner</footer>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    return false;
  }
};

/**
 * Send OTP via email
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"Smart Study Planner" <no-reply@smartstudyplanner.com>',
      to: email,
      subject: '🔐 Your OTP for Smart Study Planner',
      text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">🔐 OTP Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for verification is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
          <footer style="font-size: 12px; color: #777; margin-top: 20px;">© 2026 Smart Study Planner</footer>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 OTP email sent:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    return { success: false, error: error.message || 'OTP email send failed' };
  }
};

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

module.exports = {
  sendVerificationEmail,
  sendOTPEmail,
  sendReminderEmail,
};
