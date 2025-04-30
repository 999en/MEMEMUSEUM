// src/controllers/comment.controller.js
const Comment = require('../models/Comment.js');

exports.createComment = async (req, res) => {
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

exports.getCommentsForMeme = async (req, res) => {
  try {
    const memeId = req.params.memeId;
    const comments = await Comment.find({ meme: memeId }).populate('author', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei commenti' });
  }
};
