// models/GameSession.js

import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the game session.'],
    trim: true,
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question', // A list of questions
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'finished'],
    default: 'pending', // A new game is pending until you start it
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // We can add results here later
  // results: [{ userId: ..., score: ... }]
}, { timestamps: true });

export default mongoose.models.GameSession || mongoose.model('GameSession', GameSessionSchema);
