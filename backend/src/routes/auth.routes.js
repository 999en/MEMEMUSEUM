import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await AuthController.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Errore registrazione:', error);
    res.status(400).json({ 
      error: error.name,
      message: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await AuthController.login(req.body);
    res.json(result);
  } catch (error) {
    console.error('Errore login:', error);
    res.status(401).json({ 
      error: error.name,
      message: error.message 
    });
  }
});

export default router;
