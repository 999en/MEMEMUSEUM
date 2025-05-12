// src/models/Meme.js
import mongoose from 'mongoose';

const memeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  tags: [String],
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0 // Valore iniziale dei voti
  }
}, {
  timestamps: true
});

export default mongoose.model('Meme', memeSchema);
