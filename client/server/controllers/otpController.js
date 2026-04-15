const OTP = require("../models/OTP");
const User = require("../models/User");
const { generateToken } = require("../utils/token");
const { sendSMS, normalizePhoneForSms } = require("../utils/sms");

// 📱 Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const formattedPhone = normalizePhoneForSms(phone);
    if (!formattedPhone) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this phone
    await OTP.deleteMany({ phone });

    // Create new OTP record
    const otpRecord = new OTP({
      phone,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await otpRecord.save();

    try {
      await sendSMS({
        to: formattedPhone,
        text: `Your Smart Study Planner OTP is: ${otp}. Valid for 10 minutes.`,
      });

      console.log(`📱 OTP sent to ${formattedPhone}: ${otp}`);

      res.json({
        message: "OTP sent successfully to your phone",
      });
    } catch (smsError) {
      console.error("SMS Error:", smsError);
      res.status(500).json({ error: "Failed to send OTP. Please check SMS provider configuration." });
    }
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone, otp });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ error: "OTP expired" });
    }

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user if signing up
      if (!name) {
        return res.status(400).json({ error: "Name required for signup" });
      }

      user = new User({
        name,
        phone,
      });

      await user.save();
    }

    // Mark OTP as verified and delete
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate token
    const token = generateToken({ id: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};