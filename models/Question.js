// models/Question.js

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please provide the question text.'],
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [
      (val) => val.length === 4,
      'A question must have exactly 4 options.'
    ],
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please provide the correct answer.'],
  },
  // --- NEW FIELDS ADDED ---
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
  }
  // ------------------------
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
