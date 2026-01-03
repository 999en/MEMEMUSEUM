// src/controllers/vote.controller.js
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
    const memes = await Meme.find({ 'votedBy.user': userId })
      .select('title imageUrl votedBy upvotes downvotes createdAt')
      .lean();

    return memes.map(meme => {
      const userVote = meme.votedBy.find(v => v.user.toString() === userId);
      return {
        _id: meme._id,
        meme: {
          _id: meme._id,
          title: meme.title,
          imageUrl: meme.imageUrl
        },
        voteType: userVote ? userVote.voteType : null,
        createdAt: meme.createdAt
      };
    });
  }

  static async deleteVote(memeId, userId) {
    const meme = await Meme.findById(memeId);
    if (!meme) {
      throw new NotFoundError('Meme non trovato');
    }

    const voteIndex = meme.votedBy.findIndex(
      vote => vote.user.toString() === userId
    );

    if (voteIndex === -1) {
      throw new NotFoundError('Voto non trovato');
    }

    const voteType = meme.votedBy[voteIndex].voteType;
    if (voteType === 'up') meme.upvotes--;
    else meme.downvotes--;

    meme.votedBy.splice(voteIndex, 1);
    await meme.save();

    return { message: 'Voto rimosso con successo' };
  }
}

export default VoteController;
