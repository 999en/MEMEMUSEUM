// src/routes/meme.routes.js
import express from 'express';
import { uploadMeme, getAllMemes, getMemeById, searchMemes, deleteMeme, updateMeme } from '../controllers/meme.controller.js';
import upload from '../middlewares/uploadMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotte specifiche prima
router.get('/search', searchMemes);
router.get('/', getAllMemes);
router.post('/', authMiddleware, upload.single('image'), uploadMeme);

// Rotte parametriche dopo
router.get('/:id', getMemeById);
router.delete('/:id', authMiddleware, deleteMeme);
router.patch('/:id', authMiddleware, upload.single('image'), updateMeme);

export default router;
