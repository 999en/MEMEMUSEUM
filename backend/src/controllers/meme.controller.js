// src/controllers/meme.controller.js
import Meme from '../models/Meme.js';
import path from 'path';

// Upload di un nuovo meme
export const uploadMeme = async (req, res) => {
  try {
    const { title, tags } = req.body;
    const uploader = req.user.id; // disponibile grazie a authMiddleware

    if (!req.file) return res.status(400).json({ message: 'Nessuna immagine caricata' });

    const meme = new Meme({
      title,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      imageUrl: `/uploads/${req.file.filename}`,
      uploader
    });

    await meme.save();
    res.status(201).json(meme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante il caricamento del meme' });
  }
};

// Recupera tutti i meme
export const getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei meme' });
  }
};

// Recupera un meme specifico
export const getMemeById = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) return res.status(404).json({ message: 'Meme non trovato' });
    res.json(meme);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero del meme' });
  }
};

export const searchMemes = async (req, res) => {
  try {
    const { tag, sortBy = 'createdAt', order = 'desc', page = 1 } = req.query;

    const query = {};

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const sortOptions = {};
    if (sortBy === 'votes') {
      sortOptions.upvotes = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'createdAt') {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    const memes = await Meme.find(query)
      .sort(sortOptions)
      .skip((page - 1) * 10)
      .limit(10)
      .populate('author', 'username');

    res.json(memes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la ricerca dei meme.' });
  }
};

