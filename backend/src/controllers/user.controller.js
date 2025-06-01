// src/controllers/user.controller.js
import User from '../models/User.js';
import Meme from '../models/Meme.js';
import { AuthError, NotFoundError } from '../utils/errors.js';

export class UserController {
  static async getUserMemes(userId) {
    return await Meme.find({ uploader: userId })
      .sort({ createdAt: -1 })
      .populate('uploader', 'username');
  }

  static async getUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('Utente non trovato');
    }
    return user;
  }

  static async updateUser(userId, authenticatedUserId, userData) {
    if (userId !== authenticatedUserId) {
      throw new AuthError('Non autorizzato');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Utente non trovato');
    }

    if (userData.username) user.username = userData.username;
    if (userData.password) user.password = userData.password;

    return await user.save();
  }

  static async deleteUser(userId, authenticatedUserId) {
    if (userId !== authenticatedUserId) {
      throw new AuthError('Non autorizzato');
    }

    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundError('Utente non trovato');
    }

    return { message: 'Utente eliminato con successo' };
  }
}

export default UserController;
