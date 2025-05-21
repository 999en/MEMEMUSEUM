// src/controllers/meme.controller.js
import Meme from '../models/Meme.js';
import path from 'path';
import fs from 'fs';

// Upload di un nuovo meme
export const uploadMeme = async (req, res) => {
  try {
    const { title, tags } = req.body;
    const uploader = req.user.id; // Disponibile grazie a authMiddleware

    if (!req.file) {
      return res.status(400).json({ message: 'Nessuna immagine caricata' });
    }

    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const meme = new Meme({
      title: title || 'Meme senza titolo',
      tags: parsedTags,
      imageUrl: `/uploads/${req.file.filename}`, // Salva il percorso relativo dell'immagine
      uploader, // Associa l'utente autenticato
    });

    await meme.save();
    res.status(201).json(meme); // Ritorna il meme salvato
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante il caricamento del meme' });
  }
};

// Recupera tutti i meme
export const getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 }).populate('uploader', 'username');
    res.json(memes);
  } catch (err) {
    console.error('Errore nel recupero dei meme:', err);
    res.status(500).json({ message: 'Errore nel recupero dei meme.' });
  }
};

// Recupera un meme specifico
export const getMemeById = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id).populate('uploader', 'username');
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

