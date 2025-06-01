// src/routes/user.routes.js
import express from 'express';
import { register, login, getUserMemes, updateUser, deleteUser, getUser } from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import Meme from '../models/Meme.js'; 

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/memes', authMiddleware, getUserMemes);
router.get('/:id', authMiddleware, getUser);
router.patch('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

// Endpoint di test pubblico
router.get('/test-memes', async (req, res) => {
    try {
        const userId = "INSERISCI_QUI_UN_ID_UTENTE_VALIDO"; // Sostituisci con un ID utente valido dal tuo database
        const memes = await Meme.find({ uploader: userId })
            .sort({ createdAt: -1 })
            .populate('uploader', 'username');
        res.json(memes);
    } catch (err) {
        res.status(500).json({ message: 'Errore nel test', error: err.message });
    }
});

export default router;
