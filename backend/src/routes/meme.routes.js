// src/routes/meme.routes.js
import express from 'express';
import { uploadMeme, getAllMemes, getMemeById, searchMemes } from '../controllers/meme.controller.js';
import upload from '../middlewares/uploadMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Carica un nuovo meme (autenticazione + upload immagine)
router.post('/', authMiddleware, upload.single('image'), uploadMeme);
// Recupera tutti i meme
router.get('/', getAllMemes);

// Recupera un meme specifico per ID
router.get('/:id', getMemeById);

// Cerca meme per tag, ordine, data, ecc.
router.get('/search', searchMemes);

export default router;
