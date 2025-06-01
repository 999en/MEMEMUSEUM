// src/routes/vote.routes.js
import express from 'express';
import voteController from '../controllers/vote.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotta per votare un meme
router.post('/:memeId', authMiddleware, voteController.voteMeme);

// Ottieni voti dell'utente
router.get('/user', authMiddleware, voteController.getUserVotes);

// Rimuovi voto
router.delete('/:memeId', authMiddleware, voteController.deleteVote);

export default router;
