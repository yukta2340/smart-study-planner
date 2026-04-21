const mongoose = require('mongoose');

const studySessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Topic',
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    productivityScore: {
      type: Number, // 1-10
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession;
