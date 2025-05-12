// src/routes/user.routes.js
import express from 'express';
import { register, login } from '../controllers/user.controller.js'; // Use named imports

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

export default router;
