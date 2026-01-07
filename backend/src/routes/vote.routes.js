// src/routes/vote.routes.js
import express from 'express';
import { VoteController } from '../controllers/vote.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// IMPORTANTE: Le route specifiche devono venire PRIMA delle route con parametri dinamici
// Ottieni voti dell'utente - deve venire prima di /:memeId
router.get('/user', authMiddleware, (req, res, next) => {
  VoteController.getUserVotes(req.user.id)
    .then(votes => res.json(votes))
    .catch(next);
});

// Rotta per votare un meme
router.post('/:memeId', authMiddleware, (req, res, next) => {
  VoteController.voteMeme(req.params.memeId, req.user.id, req.body.value)
    .then(result => res.json(result))
    .catch(next);
});

// Rimuovi voto
router.delete('/:memeId', authMiddleware, (req, res, next) => {
  VoteController.deleteVote(req.params.memeId, req.user.id)
    .then(result => res.json(result))
    .catch(next);
});

export default router;
