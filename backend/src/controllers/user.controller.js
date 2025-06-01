// src/controllers/user.controller.js
import User from '../models/User.js';
import Meme from '../models/Meme.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username già in uso' });
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Registrazione completata con successo!',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la registrazione.' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login riuscito!',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante il login.' });
  }
};

export const getUserMemes = async (req, res) => {
  try {
    const userId = req.user.id;
    const memes = await Meme.find({ uploader: userId })
      .sort({ createdAt: -1 })
      .populate('uploader', 'username');

    res.json(memes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore nel recupero dei meme' });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dell\'utente' });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    const { username, password } = req.body;
    const user = await User.findById(req.params.id);

    if (username) user.username = username;
    if (password) user.password = password;

    await user.save();
    res.json({ message: 'Utente aggiornato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'utente' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Non autorizzato' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utente eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'eliminazione dell\'utente' });
  }
};
