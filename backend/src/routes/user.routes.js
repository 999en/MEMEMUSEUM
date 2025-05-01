// src/routes/user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

export default router;
