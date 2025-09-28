// models/DailyAnswer.js

import mongoose from 'mongoose';

const DailyAnswerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  date: {
    // Storing date as YYYY-MM-DD string to avoid timezone issues
    type: String,
    required: true,
  },
  selectedAnswer: {
    type: String,
    required: true,
  },
  wasCorrect: {
    type: Boolean,
    required: true,
  },
  raxAwarded: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// This ensures that a user can only have one entry per day.
DailyAnswerSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyAnswer || mongoose.model('DailyAnswer', DailyAnswerSchema);
