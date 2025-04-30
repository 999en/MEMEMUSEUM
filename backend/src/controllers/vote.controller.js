// src/controllers/vote.controller.js
const Vote = require('../models/Vote.js');
const Meme = require('../models/Meme.js');

exports.voteMeme = async (req, res) => {
  try {
    const { memeId } = req.params;
    const { value } = req.body; // value: 1 (upvote) o -1 (downvote)
    const userId = req.user.id;

    if (![1, -1].includes(value)) {
      return res.status(400).json({ message: 'Valore di voto non valido. Deve essere 1 o -1.' });
    }

    // Verifica se l'utente ha già votato questo meme
    let existingVote = await Vote.findOne({ meme: memeId, user: userId });

    if (!existingVote) {
      // Nuovo voto
      const vote = new Vote({ meme: memeId, user: userId, value });
      await vote.save();

      // Aggiorna il conteggio dei voti nel meme
      await Meme.findByIdAndUpdate(memeId, {
        $inc: {
          upvotes: value === 1 ? 1 : 0,
          downvotes: value === -1 ? 1 : 0
        }
      });

      return res.status(201).json({ message: 'Voto registrato.' });
    } else {
      if (existingVote.value === value) {
        // Annulla il voto
        await existingVote.deleteOne();

        await Meme.findByIdAndUpdate(memeId, {
          $inc: {
            upvotes: value === 1 ? -1 : 0,
            downvotes: value === -1 ? -1 : 0
          }
        });

        return res.status(200).json({ message: 'Voto annullato.' });
      } else {
        // Modifica il voto
        const previousValue = existingVote.value;
        existingVote.value = value;
        await existingVote.save();

        await Meme.findByIdAndUpdate(memeId, {
          $inc: {
            upvotes: value === 1 ? 1 : -1,
            downvotes: value === -1 ? 1 : -1
          }
        });

        return res.status(200).json({ message: 'Voto aggiornato.' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore durante la votazione.' });
  }
};
