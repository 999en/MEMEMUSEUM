// src/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  meme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // Aggiunge automaticamente createdAt e updatedAt
});

export default mongoose.model('Comment', commentSchema);
