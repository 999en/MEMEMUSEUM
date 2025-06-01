import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AuthError, ValidationError } from '../utils/errors.js';

export class AuthController {
  static async register(userData) {
    const { username, email, password } = userData;

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      throw new ValidationError('Username o email già in uso');
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      message: 'Utente registrato con successo',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    };
  }

  static async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthError('Credenziali non valide');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthError('Credenziali non valide');
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      message: 'Login effettuato con successo',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    };
  }

  static async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        throw new AuthError('Utente non trovato');
      }

      return user;
    } catch (err) {
      throw new AuthError('Token non valido');
    }
  }
}

export default AuthController;
