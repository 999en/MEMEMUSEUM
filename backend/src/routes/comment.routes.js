import express from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Aggiungi commento a un meme
router.post('/:memeId', authMiddleware, (req, res, next) => {
  CommentController.createComment(req.params.memeId, req.body.text, req.user.id)
    .then(comment => res.status(201).json(comment))
    .catch(next);
});

// Ottieni i commenti di un meme
router.get('/:memeId', (req, res, next) => {
  CommentController.getCommentsForMeme(req.params.memeId)
    .then(comments => res.json(comments))
    .catch(next);
});

// Modifica commento
router.patch('/:id', authMiddleware, (req, res, next) => {
  CommentController.updateComment(req.params.id, req.body.text, req.user.id)
    .then(comment => res.json(comment))
    .catch(next);
});

// Elimina commento
router.delete('/:id', authMiddleware, (req, res, next) => {
  CommentController.deleteComment(req.params.id, req.user.id)
    .then(result => res.json(result))
    .catch(next);
});

export default router;