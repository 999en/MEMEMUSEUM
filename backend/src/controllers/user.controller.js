// src/controllers/user.controller.js
import User from '../models/User.js';
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
