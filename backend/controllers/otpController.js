// Mock OTP logic (can be integrated with Twilio/SendGrid later)

const sendOTP = async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  console.log(`Sending mock OTP to ${phone}: 123456`);
  
  res.json({ message: 'OTP sent successfully (Demo Mode: 123456)' });
};

const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  
  if (otp === '123456') {
    res.json({ message: 'OTP verified successfully', token: 'mock-jwt-token-for-otp-auth' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

module.exports = { sendOTP, verifyOTP };
