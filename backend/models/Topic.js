const mongoose = require('mongoose');

const topicSchema = mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Subject',
    },
    name: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    deadline: {
      type: Date,
      default: Date.now,
    },
    estimatedTime: {
      type: Number,
      default: 60, // Default 60 mins
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    // Spaced Repetition Features
    reviewCount: {
      type: Number,
      default: 0,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    lastReviewedDate: {
      type: Date,
    },
    isWeakTopic: {
      type: Boolean,
      default: false,
    },
    studyIntensity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
