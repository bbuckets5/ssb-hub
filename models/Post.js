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
  likes: {
    type: Number,
    default: 0,
  },
  community: {
    type: String,
    // This will store the author's community at the time of posting
    enum: ['ytg', 'bau', 'arl', 'ktf', 'shniggers'],
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
