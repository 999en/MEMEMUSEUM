// src/controllers/meme.controller.js
import Meme from '../models/Meme.js';
import Comment from '../models/Comment.js';
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

// Recupera tutti i meme ordinati per timestamp del primo commento
export const getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.aggregate([
      {
        $lookup: {
          from: 'comments', // Collezione dei commenti
          localField: '_id',
          foreignField: 'meme',
          as: 'comments'
        }
      },
      {
        $addFields: {
          firstCommentTimestamp: { $min: '$comments.createdAt' } // Trova il timestamp del primo commento
        }
      },
      {
        $sort: { firstCommentTimestamp: 1 } // Ordina in base al timestamp del primo commento (ascendente)
      }
    ]);

    res.json(memes);
  } catch (err) {
    console.error('Errore nel recupero dei meme:', err);
    res.status(500).json({ message: 'Errore nel recupero dei meme.' });
  }
};

// Recupera un meme specifico
export const getMemeById = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id)
      .populate('uploader', 'username _id')
      .lean();
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme non trovato' });
    }

    // Verifica che l'uploader esista
    if (!meme.uploader) {
      meme.uploader = { username: 'Utente eliminato', _id: null };
    }

    res.json(meme);
  } catch (err) {
    console.error('Errore nel recupero del meme:', err);
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

export const deleteMeme = async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    
    if (!meme) {
      return res.status(404).json({ message: "Meme non trovato" });
    }

    // Verifica che l'utente sia il proprietario del meme
    if (meme.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non sei autorizzato a eliminare questo meme" });
    }

    // Elimina tutti i commenti associati al meme
    await Comment.deleteMany({ meme: req.params.id });
    
    // Elimina il meme
    await Meme.findByIdAndDelete(req.params.id);

    // Ottieni il nome del file dall'URL
    const fileName = meme.imageUrl.split('/').pop();
    const imagePath = path.join(process.cwd(), 'uploads', fileName);

    // Prova a eliminare il file se esiste
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (fileErr) {
      console.error('Errore durante l\'eliminazione del file:', fileErr);
    }

    res.json({ message: "Meme eliminato con successo" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMeme = async (req, res) => {
  try {
    // Popoliamo esplicitamente il campo uploader
    const meme = await Meme.findById(req.params.id).populate('uploader');

    if (!meme) {
      return res.status(404).json({ message: "Meme non trovato" });
    }

    // Controlli di sicurezza sull'autorizzazione
    if (!meme.uploader || !meme.uploader._id) {
      return res.status(403).json({ message: "Proprietario del meme non trovato" });
    }

    // Confronto sicuro degli ID
    if (meme.uploader._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non sei autorizzato a modificare questo meme" });
    }

    // Aggiorna i campi forniti
    if (req.body.title) meme.title = req.body.title;
    if (req.body.tags) {
      meme.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    // Se è stata caricata una nuova immagine
    if (req.file) {
      // Elimina la vecchia immagine se esiste
      if (meme.imageUrl) {
        const oldImagePath = path.join(process.cwd(), 'uploads', path.basename(meme.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      meme.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedMeme = await meme.save();
    res.json(updatedMeme);

  } catch (error) {
    console.error('Errore durante la modifica del meme:', error);
    res.status(500).json({ message: "Errore durante la modifica del meme" });
  }
};

