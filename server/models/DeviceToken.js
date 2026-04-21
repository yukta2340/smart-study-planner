const mongoose = require("mongoose");

const deviceTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Optional: link token to a Clerk user ID
    userId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeviceToken", deviceTokenSchema);
