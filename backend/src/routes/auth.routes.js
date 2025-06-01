import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', (req, res, next) => {
  AuthController.register(req.body)
    .then(result => res.status(201).json(result))
    .catch(next);
});

router.post('/login', (req, res, next) => {
  AuthController.login(req.body)
    .then(result => res.json(result))
    .catch(next);
});

// Route di test
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Auth routes funzionano correttamente!' });
});

export default router;
