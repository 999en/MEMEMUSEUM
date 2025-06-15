import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { AuthError, ValidationError } from '../utils/errors.js';

export class AuthController {
  static async register(userData) {
    const { username, password } = userData;

    if (!username || !password) {
      throw new ValidationError('Username e password sono richiesti');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new ValidationError('Username già in uso');
    }

    const user = new User({ username, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username
      }
    };
  }

  static async login(credentials) {
    const { username, password } = credentials;

    if (!username || !password) {
      throw new ValidationError('Username e password sono richiesti');
    }

    const user = await User.findOne({ username });
    if (!user) {
      throw new AuthError('Utente non trovato');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new AuthError('Password non valida');
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user._id,
        username: user.username
      }
    };
  }
}

export default AuthController;
