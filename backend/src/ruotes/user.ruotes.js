// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');

router.post('/register', userController.register); // rotta per la registrazione
router.post('/login', userController.login); // rotta per il login

module.exports = router;
