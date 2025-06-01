import express from 'express';
import { createComment, getCommentsForMeme, updateComment, deleteComment } from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aggiungi commento a un meme
router.post('/:memeId', authMiddleware, createComment);

// Ottieni i commenti di un meme
router.get('/:memeId', getCommentsForMeme);

// Modifica commento
router.patch('/:id', authMiddleware, updateComment);

// Elimina commento
router.delete('/:id', authMiddleware, deleteComment);

export default router;