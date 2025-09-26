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
    // This validation ensures there are always exactly 4 answer options
    validate: [
      (val) => val.length === 4,
      'A question must have exactly 4 options.'
    ],
  },
  correctAnswer: {
    type: String,
    required: [true, 'Please provide the correct answer.'],
  },
  // You could add a category later, e.g., 'ytg', 'bau', etc.
  // category: { type: String }
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
