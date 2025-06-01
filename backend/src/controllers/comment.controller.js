// src/controllers/comment.controller.js
import Comment from '../models/Comment.js';
import { NotFoundError, AuthError } from '../utils/errors.js';

export class CommentController {
  static async createComment(memeId, text, userId) {
    const comment = new Comment({
      meme: memeId,
      author: userId,
      text
    });
    
    await comment.save();
    return comment;
  }

  static async getCommentsForMeme(memeId) {
    return await Comment.find({ meme: memeId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
  }

  static async updateComment(commentId, text, userId) {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new NotFoundError('Commento non trovato');
    }

    if (comment.author.toString() !== userId) {
      throw new AuthError('Non autorizzato a modificare questo commento');
    }

    comment.text = text;
    return await comment.save();
  }

  static async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      throw new NotFoundError('Commento non trovato');
    }

    if (comment.author.toString() !== userId) {
      throw new AuthError('Non autorizzato a eliminare questo commento');
    }

    await comment.deleteOne();
    return { message: 'Commento eliminato con successo' };
  }
}

export default CommentController;
