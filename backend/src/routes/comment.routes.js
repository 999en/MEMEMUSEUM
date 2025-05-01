import express from 'express';
import { createComment, getCommentsForMeme } from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aggiungi commento a un meme
router.post('/:memeId', authMiddleware, createComment);

// Ottieni i commenti di un meme
router.get('/:memeId', getCommentsForMeme);

export default router;