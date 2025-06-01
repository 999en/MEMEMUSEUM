// src/controllers/meme.controller.js
import Meme from '../models/Meme.js';
import Comment from '../models/Comment.js';
import path from 'path';
import fs from 'fs';
import { NotFoundError, ValidationError, AuthError } from '../utils/errors.js';

export class MemeController {
  static async uploadMeme(data, file, user) {
    if (!file) {
      throw new ValidationError('Nessuna immagine caricata');
    }

    const parsedTags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];

    const meme = new Meme({
      title: data.title || 'Meme senza titolo',
      tags: parsedTags,
      imageUrl: `/uploads/${file.filename}`,
      uploader: user.id
    });

    await meme.save();
    return meme;
  }

  static async getAllMemes() {
    return await Meme.aggregate([
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'meme',
          as: 'comments'
        }
      },
      {
        $addFields: {
          firstCommentTimestamp: { $min: '$comments.createdAt' }
        }
      },
      {
        $sort: { firstCommentTimestamp: 1 }
      }
    ]);
  }

  static async getMemeById(id) {
    const meme = await Meme.findById(id)
      .populate('uploader', 'username _id')
      .lean();
    
    if (!meme) {
      throw new NotFoundError('Meme non trovato');
    }

    if (!meme.uploader) {
      meme.uploader = { username: 'Utente eliminato', _id: null };
    }

    return meme;
  }

  static async searchMemes(query) {
    const { tag, sortBy = 'createdAt', order = 'desc', page = 1 } = query;
    const searchQuery = {};
    
    if (tag) {
      searchQuery.tags = { $in: [tag] };
    }

    const sortOptions = {};
    if (sortBy === 'votes') {
      sortOptions.upvotes = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'createdAt') {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    return await Meme.find(searchQuery)
      .sort(sortOptions)
      .skip((page - 1) * 10)
      .limit(10)
      .populate('author', 'username');
  }

  static async deleteMeme(memeId, userId) {
    const meme = await Meme.findById(memeId);
    
    if (!meme) {
      throw new NotFoundError('Meme non trovato');
    }

    if (meme.uploader.toString() !== userId) {
      throw new AuthError('Non sei autorizzato a eliminare questo meme');
    }

    await Comment.deleteMany({ meme: memeId });
    await Meme.findByIdAndDelete(memeId);

    const fileName = meme.imageUrl.split('/').pop();
    const imagePath = path.join(process.cwd(), 'uploads', fileName);

    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (fileErr) {
      console.error('Errore durante l\'eliminazione del file:', fileErr);
    }

    return { message: 'Meme eliminato con successo' };
  }

  static async updateMeme(memeId, data, file, userId) {
    const meme = await Meme.findById(memeId).populate('uploader');

    if (!meme) {
      throw new NotFoundError('Meme non trovato');
    }

    if (!meme.uploader || !meme.uploader._id) {
      throw new AuthError('Proprietario del meme non trovato');
    }

    if (meme.uploader._id.toString() !== userId) {
      throw new AuthError('Non sei autorizzato a modificare questo meme');
    }

    if (data.title) meme.title = data.title;
    if (data.tags) {
      meme.tags = data.tags.split(',').map(tag => tag.trim());
    }

    if (file) {
      if (meme.imageUrl) {
        const oldImagePath = path.join(process.cwd(), 'uploads', path.basename(meme.imageUrl));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      meme.imageUrl = `/uploads/${file.filename}`;
    }

    return await meme.save();
  }
}

export default MemeController;

