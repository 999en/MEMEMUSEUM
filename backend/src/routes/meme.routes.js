// src/routes/meme.routes.js
import express from 'express';
import { MemeController } from '../controllers/meme.controller.js';
import upload from '../middlewares/uploadMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/search', (req, res, next) => {
  MemeController.searchMemes(req.query)
    .then(memes => res.json(memes))
    .catch(next);
});

router.get('/', (req, res, next) => {
  MemeController.getAllMemes()
    .then(memes => res.json(memes))
    .catch(next);
});

router.post('/', authMiddleware, upload.single('image'), (req, res, next) => {
  MemeController.uploadMeme(req.body, req.file, req.user)
    .then(meme => res.status(201).json(meme))
    .catch(next);
});

router.get('/:id', (req, res, next) => {
  MemeController.getMemeById(req.params.id)
    .then(meme => res.json(meme))
    .catch(next);
});

router.delete('/:id', authMiddleware, (req, res, next) => {
  MemeController.deleteMeme(req.params.id, req.user.id)
    .then(result => res.json(result))
    .catch(next);
});

router.patch('/:id', authMiddleware, upload.single('image'), (req, res, next) => {
  MemeController.updateMeme(req.params.id, req.body, req.file, req.user.id)
    .then(meme => res.json(meme))
    .catch(next);
});

export default router;
