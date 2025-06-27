import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const result = await AuthController.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Errore registrazione:', error);
    if (error.name === 'AuthError' || error.name === 'ValidationError') {
      return res.status(error.status || 400).json({
        message: error.message
      });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await AuthController.login(req.body);
    res.json(result);
  } catch (error) {
    console.error('Errore login:', error);
    if (error.name === 'AuthError' || error.name === 'ValidationError') {
      return res.status(error.status || 401).json({
        message: error.message
      });
    }
    next(error);
  }
});

export default router;
