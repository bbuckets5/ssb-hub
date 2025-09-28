// models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
  },
  community: {
    type: String,
    enum: [null, 'ytg', 'bau', 'arl', 'ktf', 'shniggers'],
    default: null,
  },
  allegianceChangesLeft: {
    type: Number,
    default: 3,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  rax: {
    type: Number,
    required: true,
    default: 100,
  },
  // --- NEW FIELD ADDED ---
  raxEarned: {
    type: Number,
    required: true,
    default: 100, // Matches the initial Rax balance
  },
  // -----------------------
  lastLogin: {
    type: Date,
  },
  dailyLikesCount: {
    type: Number,
    default: 0
  },
  lastLikeDate: {
    type: Date
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
