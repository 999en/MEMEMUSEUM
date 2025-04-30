// src/routes/vote.routes.js
const express = require('express');
const router = express.Router();
const voteController = require('../controllers/vote.controller.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// Rotta per votare un meme
router.post('/:memeId', authMiddleware, voteController.voteMeme);

module.exports = router;
