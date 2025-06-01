// src/routes/vote.routes.js
import express from 'express';
import { VoteController } from '../controllers/vote.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotta per votare un meme
router.post('/:memeId', authMiddleware, (req, res, next) => {
  VoteController.voteMeme(req.params.memeId, req.user.id, req.body.value)
    .then(result => res.json(result))
    .catch(next);
});

// Ottieni voti dell'utente
router.get('/user', authMiddleware, (req, res, next) => {
  VoteController.getUserVotes(req.user.id)
    .then(votes => res.json(votes))
    .catch(next);
});

// Rimuovi voto
router.delete('/:memeId', authMiddleware, (req, res, next) => {
  VoteController.deleteVote(req.params.memeId, req.user.id)
    .then(result => res.json(result))
    .catch(next);
});

export default router;
