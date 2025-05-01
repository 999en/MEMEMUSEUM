// src/models/Vote.js
import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  meme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    enum: [1, -1], // 1 = upvote, -1 = downvote
    required: true
  }
}, {
  timestamps: true
});

voteSchema.index({ meme: 1, user: 1 }, { unique: true }); // un solo voto per utente per meme

export default mongoose.model('Vote', voteSchema);
