// src/controllers/user.controller.js
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();

    // Generazione del token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Registrazione completata con successo!',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la registrazione.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Verifica della password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Password errata' });
    }

    // Generazione del token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login riuscito!',
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante il login.' });
  }
};
