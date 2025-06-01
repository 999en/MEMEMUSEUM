// src/controllers/vote.controller.js
import Vote from '../models/Vote.js';
import Meme from '../models/Meme.js';

export const voteMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    const meme = await Meme.findById(memeId);
    if (!meme) {
      return res.status(404).json({ message: 'Meme non trovato' });
    }

    const existingVoteIndex = meme.votedBy.findIndex(
      vote => vote.user.toString() === userId
    );

    if (existingVoteIndex > -1) {
      // Rimuovi il voto precedente
      const oldVote = meme.votedBy[existingVoteIndex];
      if (oldVote.voteType === 'up') meme.upvotes--;
      else meme.downvotes--;
      
      if (oldVote.voteType === (value === 1 ? 'up' : 'down')) {
        // Se l'utente clicca lo stesso voto, rimuovilo
        meme.votedBy.splice(existingVoteIndex, 1);
      } else {
        // Cambia il voto
        meme.votedBy[existingVoteIndex].voteType = value === 1 ? 'up' : 'down';
        if (value === 1) meme.upvotes++;
        else meme.downvotes++;
      }
    } else {
      // Aggiungi nuovo voto
      meme.votedBy.push({
        user: userId,
        voteType: value === 1 ? 'up' : 'down'
      });
      if (value === 1) meme.upvotes++;
      else meme.downvotes++;
    }

    await meme.save();
    
    res.json({
      upvotes: meme.upvotes,
      downvotes: meme.downvotes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la votazione.' });
  }
};

export const getUserVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user.id })
      .populate('meme', 'title imageUrl')
      .sort({ createdAt: -1 });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei voti' });
  }
};

export const deleteVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      meme: req.params.memeId,
      user: req.user.id
    });

    if (!vote) {
      return res.status(404).json({ message: 'Voto non trovato' });
    }

    await vote.deleteOne();
    res.json({ message: 'Voto rimosso con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella rimozione del voto' });
  }
};

export default { voteMeme, getUserVotes, deleteVote };
