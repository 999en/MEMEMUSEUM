document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('meme-grid');
  const uploadForm = document.getElementById('upload-form');
  const uploadStatus = document.getElementById('upload-status');
  const authButton = document.getElementById('auth-button');
  const welcomeMessage = document.getElementById('welcome-message');
  const usernameSpan = document.getElementById('username');
  const registerButton = document.getElementById('register-button');
  const postDetails = document.getElementById('post-details');
  const closePostButton = document.getElementById('close-post');
  const postAuthor = document.getElementById('post-author');
  const postImage = document.getElementById('post-image');
  const commentsList = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');

  // Funzione per verificare se l'utente è autenticato
  function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      usernameSpan.textContent = payload.username;
      welcomeMessage.style.display = 'block';
      authButton.style.display = 'none';
    } else {
      welcomeMessage.style.display = 'none';
      authButton.style.display = 'block';
    }
  }

  // Gestione del click sul bottone di autenticazione
  authButton.addEventListener('click', () => {
    const username = prompt('Inserisci il tuo username:');
    const password = prompt('Inserisci la tua password:');
    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          checkAuthentication();
        } else {
          alert('Autenticazione fallita!');
        }
      })
      .catch(err => console.error('Errore durante l\'autenticazione:', err));
  });

  // Gestione del click sul bottone di registrazione
  registerButton.addEventListener('click', () => {
    const username = prompt('Scegli un username:');
    const password = prompt('Scegli una password:');
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          alert('Registrazione completata con successo!');
          checkAuthentication();
        } else {
          alert(`Errore durante la registrazione: ${data.message}`);
        }
      })
      .catch(err => console.error('Errore durante la registrazione:', err));
  });

  // Verifica autenticazione al caricamento della pagina
  checkAuthentication();

  closePostButton.addEventListener('click', () => {
    postDetails.style.display = 'none';
  });

  async function openPost(memeId) {
    try {
      const res = await fetch(`/api/memes/${memeId}`);
      const meme = await res.json();

      // Correggi il nome dell'autore
      postAuthor.textContent = `Autore: ${meme.uploader?.username || 'Sconosciuto'}`;
      postImage.src = meme.imageUrl;
      postImage.alt = 'Meme';

      // Carica i commenti
      const commentsRes = await fetch(`/api/comments/${memeId}`);
      const comments = await commentsRes.json();

      commentsList.innerHTML = '';
      comments.forEach(comment => {
        const li = document.createElement('li');
        li.textContent = `${comment.author.username}: ${comment.text}`;
        commentsList.appendChild(li);
      });

      // Mostra i dettagli del post
      postDetails.style.display = 'flex';

      // Gestione invio commento
      commentForm.onsubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Devi essere autenticato per commentare.');
          return;
        }

        const res = await fetch(`/api/comments/${memeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ text: commentText.value })
        });

        if (res.ok) {
          commentText.value = '';
          openPost(memeId); // Ricarica i commenti
        }
      };
    } catch (error) {
      console.error('Errore durante l\'apertura del post:', error);
    }
  }

  async function loadMemes() {
    try {
      const res = await fetch('/api/memes'); // Recupera i meme dal backend
      const memes = await res.json();

      grid.innerHTML = ''; // Pulisce la griglia

      memes.forEach((meme) => {
        const memeContainer = document.createElement('div');
        memeContainer.classList.add('meme-container');

        const img = document.createElement('img');
        img.src = meme.imageUrl; // Imposta l'URL dell'immagine
        img.alt = 'Meme';
        img.addEventListener('click', () => openPost(meme._id)); // Apre il post

        const voteContainer = document.createElement('div');
        voteContainer.classList.add('vote-container');

        const likeButton = document.createElement('button');
        likeButton.textContent = '👍';
        const voteCount = document.createElement('span');
        voteCount.textContent = meme.votes;
        const dislikeButton = document.createElement('button');
        dislikeButton.textContent = '👎';

        likeButton.addEventListener('click', () => voteMeme(meme._id, 1, voteCount));
        dislikeButton.addEventListener('click', () => voteMeme(meme._id, -1, voteCount));

        voteContainer.appendChild(likeButton);
        voteContainer.appendChild(voteCount);
        voteContainer.appendChild(dislikeButton);

        memeContainer.appendChild(img);
        memeContainer.appendChild(voteContainer);
        grid.appendChild(memeContainer);
      });
    } catch (error) {
      console.error('Errore durante il caricamento dei meme:', error);
    }
  }

  function voteMeme(memeId, value, voteCountElement) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Devi essere autenticato per votare.');
      return;
    }

    fetch(`/api/votes/${memeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ value })
    })
      .then(res => res.json())
      .then(data => {
        if (data.updatedVotes !== undefined) {
          // Aggiorna dinamicamente il conteggio dei voti
          voteCountElement.textContent = data.updatedVotes;
        }
      })
      .catch(err => console.error('Errore durante la votazione:', err));
  }

  // Carica i meme al caricamento della pagina
  loadMemes();

  // Gestione dell'invio del modulo di upload
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      uploadStatus.textContent = '❌ Devi essere autenticato per caricare un meme.';
      return;
    }

    const formData = new FormData(uploadForm);
    const tags = document.getElementById('meme-tags').value.trim();

    if (tags) formData.append('tags', tags);

    try {
      const res = await fetch('/api/memes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (res.ok) {
        uploadStatus.textContent = '✅ Meme caricato con successo!';
        uploadForm.reset();
        loadMemes(); // Ricarica la griglia dei meme
      } else {
        const errorData = await res.json();
        uploadStatus.textContent = `❌ Errore: ${errorData.message || 'Impossibile caricare il meme.'}`;
      }
    } catch (error) {
      console.error('Errore durante il caricamento del meme:', error);
      uploadStatus.textContent = '❌ Errore durante il caricamento del meme.';
    }
  });
});
