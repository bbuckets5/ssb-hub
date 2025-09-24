// models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true, // Ensures no two users can have the same username
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
    enum: [null, 'ytg', 'bau', 'arl', 'ktf', 'shniggers'], // Updated list
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
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
