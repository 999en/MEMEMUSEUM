// src/controllers/vote.controller.js
import Vote from '../models/Vote.js';
import Meme from '../models/Meme.js';

export const voteMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { value } = req.body; // value: 1 (like) o -1 (dislike)
    const userId = req.user.id;

    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Valore di voto non valido. Deve essere 1 o -1.' });
    }

    // Verifica se l'utente ha già votato questo meme
    let existingVote = await Vote.findOne({ meme: memeId, user: userId });

    let updatedVotes;
    if (!existingVote) {
      // Nuovo voto
      const vote = new Vote({ meme: memeId, user: userId, value });
      await vote.save();

      const meme = await Meme.findByIdAndUpdate(memeId, {
        $inc: { votes: value }
      }, { new: true });

      updatedVotes = meme.votes;
    } else {
      if (existingVote.value === value) {
        // Annulla il voto
        await existingVote.deleteOne();

        const meme = await Meme.findByIdAndUpdate(memeId, {
          $inc: { votes: -value }
        }, { new: true });

        updatedVotes = meme.votes;
      } else {
        // Modifica il voto
        const previousValue = existingVote.value;
        existingVote.value = value;
        await existingVote.save();

        const meme = await Meme.findByIdAndUpdate(memeId, {
          $inc: { votes: value - previousValue }
        }, { new: true });

        updatedVotes = meme.votes;
      }
    }

    return res.status(200).json({ updatedVotes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la votazione.' });
  }
};

export default { voteMeme };
