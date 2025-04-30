// src/routes/meme.routes.js
const express = require('express');
const router = express.Router();
const memeController = require('../controllers/meme.controller.js');
const upload = require('../middlewares/uploadMiddleware.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// Carica un nuovo meme (autenticazione + upload immagine)
router.post('/', authMiddleware, upload.single('image'), memeController.uploadMeme);

// Recupera tutti i meme
router.get('/', memeController.getAllMemes);

// Recupera un meme specifico per ID
router.get('/:id', memeController.getMemeById);

// Cerca meme per tag, ordine, data, ecc.
router.get('/search', memeController.searchMemes);


module.exports = router;
