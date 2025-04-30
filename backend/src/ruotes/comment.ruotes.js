// src/routes/comment.routes.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// Aggiungi commento a un meme
router.post('/:memeId', authMiddleware, commentController.createComment);

// Ottieni i commenti di un meme
router.get('/:memeId', commentController.getCommentsForMeme);

module.exports = router;
