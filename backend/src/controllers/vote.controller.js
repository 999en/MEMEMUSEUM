// src/controllers/vote.controller.js
import Vote from '../models/Vote.js';
import Meme from '../models/Meme.js';
import { NotFoundError } from '../utils/errors.js';

export class VoteController {
  static async voteMeme(memeId, userId, value) {
    const meme = await Meme.findById(memeId);
    if (!meme) {
      throw new NotFoundError('Meme non trovato');
    }

    const existingVoteIndex = meme.votedBy.findIndex(
      vote => vote.user.toString() === userId
    );

    if (existingVoteIndex > -1) {
      const oldVote = meme.votedBy[existingVoteIndex];
      if (oldVote.voteType === 'up') meme.upvotes--;
      else meme.downvotes--;
      
      if (oldVote.voteType === (value === 1 ? 'up' : 'down')) {
        meme.votedBy.splice(existingVoteIndex, 1);
      } else {
        meme.votedBy[existingVoteIndex].voteType = value === 1 ? 'up' : 'down';
        if (value === 1) meme.upvotes++;
        else meme.downvotes++;
      }
    } else {
      meme.votedBy.push({
        user: userId,
        voteType: value === 1 ? 'up' : 'down'
      });
      if (value === 1) meme.upvotes++;
      else meme.downvotes++;
    }

    await meme.save();
    return {
      upvotes: meme.upvotes,
      downvotes: meme.downvotes
    };
  }

  static async getUserVotes(userId) {
    return await Vote.find({ user: userId })
      .populate('meme', 'title imageUrl')
      .sort({ createdAt: -1 });
  }

  static async deleteVote(memeId, userId) {
    const vote = await Vote.findOne({ meme: memeId, user: userId });
    if (!vote) {
      throw new NotFoundError('Voto non trovato');
    }

    await vote.deleteOne();
    return { message: 'Voto rimosso con successo' };
  }
}

export default VoteController;
