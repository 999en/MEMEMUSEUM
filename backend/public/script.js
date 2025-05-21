document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('meme-grid');
  const authButton = document.getElementById('auth-button');
  const welcomeMessage = document.getElementById('welcome-message');
  const usernameSpan = document.getElementById('username');
  const registerButton = document.getElementById('register-button');
  const logoutButton = document.getElementById('logout-button');
  const postDetails = document.getElementById('post-details');
  const closePostButton = document.getElementById('close-post');
  const postAuthor = document.getElementById('post-author');
  const postImage = document.getElementById('post-image');
  const commentsList = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const closeLoginModal = document.getElementById('close-login-modal');
  const closeRegisterModal = document.getElementById('close-register-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const uploadMemeButton = document.getElementById('upload-meme-button');
  const uploadMemeModal = document.getElementById('upload-meme-modal');
  const closeUploadModal = document.getElementById('close-upload-modal');
  const uploadMemeForm = document.getElementById('upload-meme-form');

  // Funzione per verificare se l'utente è autenticato
  function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      usernameSpan.textContent = payload.username;
      welcomeMessage.style.display = 'block';
      authButton.style.display = 'none';
      registerButton.style.display = 'none';
      logoutButton.style.display = 'inline-block';
    } else {
      welcomeMessage.style.display = 'none';
      authButton.style.display = 'inline-block';
      registerButton.style.display = 'inline-block';
      logoutButton.style.display = 'none';
    }
  }

  // Gestione del click sul bottone di autenticazione
  authButton.addEventListener('click', () => {
    loginModal.style.display = 'flex';
  });

  registerButton.addEventListener('click', () => {
    registerModal.style.display = 'flex';
  });

  closeLoginModal.addEventListener('click', () => {
    loginModal.style.display = 'none';
  });

  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

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
          loginModal.style.display = 'none';
        } else {
          alert('Autenticazione fallita!');
        }
      })
      .catch(err => console.error('Errore durante l\'autenticazione:', err));
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

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
          registerModal.style.display = 'none';
        } else {
          alert(`Errore durante la registrazione: ${data.message}`);
        }
      })
      .catch(err => console.error('Errore durante la registrazione:', err));
  });

  // Gestione del click sul bottone di logout
  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuthentication();
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

      // Visualizza i tag
      const tags = meme.tags?.length ? meme.tags.join(', ') : 'Nessun tag';
      document.getElementById('post-tags').textContent = `Tag: ${tags}`;

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

  uploadMemeButton.addEventListener('click', () => {
    uploadMemeModal.style.display = 'flex';
  });

  closeUploadModal.addEventListener('click', () => {
    uploadMemeModal.style.display = 'none';
  });

  uploadMemeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to upload a meme.');
      return;
    }

    const formData = new FormData(uploadMemeForm);

    try {
      const res = await fetch('/api/memes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        alert('Meme uploaded successfully!');
        uploadMemeModal.style.display = 'none';
        uploadMemeForm.reset();
        loadMemes(); // Reload memes
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message || 'Failed to upload meme.'}`);
      }
    } catch (error) {
      console.error('Error uploading meme:', error);
      alert('Error uploading meme.');
    }
  });
});
