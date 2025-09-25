// models/Post.js

import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This creates a direct link to the User model
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [280, 'Post cannot be more than 280 characters'],
  },
  // --- MODIFIED: 'likes' is now an array of User references ---
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // -----------------------------------------------------------
  community: {
    type: String,
    enum: ['ytg', 'bau', 'arl', 'ktf', 'shniggers'],
  },
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
