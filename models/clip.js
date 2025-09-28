// models/Clip.js

import mongoose from 'mongoose';

const ClipSchema = new mongoose.Schema({
  vodId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for the clip.'],
    trim: true,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  clippedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending',
  },
  // This is where an admin can add the final video URL later
  clipUrl: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.Clip || mongoose.model('Clip', ClipSchema);
