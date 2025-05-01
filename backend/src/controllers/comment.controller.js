// src/controllers/comment.controller.js
import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const memeId = req.params.memeId;
    const userId = req.user.id;

    const comment = new Comment({
      meme: memeId,
      author: userId,
      text
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Errore nella creazione del commento' });
  }
};

export const getCommentsForMeme = async (req, res) => {
  try {
    const memeId = req.params.memeId;
    const comments = await Comment.find({ meme: memeId }).populate('author', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei commenti' });
  }
};
