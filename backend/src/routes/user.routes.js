// src/routes/user.routes.js
import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes
router.get('/memes', authMiddleware, (req, res, next) => {
  UserController.getUserMemes(req.user.id)
    .then(memes => res.json(memes))
    .catch(next);
});
router.get('/:id', authMiddleware, (req, res, next) => {
  UserController.getUser(req.params.id)
    .then(user => res.json(user))
    .catch(next);
});
router.patch('/:id', authMiddleware, (req, res, next) => {
  UserController.updateUser(req.params.id, req.user.id, req.body)
    .then(user => res.json(user))
    .catch(next);
});
router.delete('/:id', authMiddleware, (req, res, next) => {
  UserController.deleteUser(req.params.id, req.user.id)
    .then(result => res.json(result))
    .catch(next);
});

export default router;
