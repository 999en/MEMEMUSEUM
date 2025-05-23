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
  const searchBar = document.getElementById('search-bar');
  const searchButton = document.getElementById('search-button');
  const orderToggleButton = document.getElementById('order-toggle-button');

  let isDescendingOrder = true; // Ordine predefinito: dal più recente al meno recente

  // Funzione per verificare se l'utente è autenticato
  function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        // Verifica se il token è scaduto
        if (payload.exp && payload.exp < currentTime) {
          alert('La sessione è scaduta. Effettua nuovamente il login.');
          localStorage.removeItem('token');
          return setUnauthenticatedState();
        }

        usernameSpan.textContent = payload.username;
        welcomeMessage.style.display = 'block';
        authButton.style.display = 'none';
        registerButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        uploadMemeButton.style.display = 'inline-block';
      } catch (error) {
        console.error('Errore durante la decodifica del token:', error);
        localStorage.removeItem('token');
        setUnauthenticatedState();
      }
    } else {
      setUnauthenticatedState();
    }
  }

  function setUnauthenticatedState() {
    welcomeMessage.style.display = 'none';
    authButton.style.display = 'inline-block';
    registerButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
    uploadMemeButton.style.display = 'none';
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

      // Carica i commenti
      const commentsRes = await fetch(`/api/comments/${memeId}`);
      const comments = await commentsRes.json();

      commentsList.innerHTML = '';
      comments
        .slice() // Crea una copia dell'array
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Ordina dal meno recente al più recente
        .forEach(comment => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${comment.author?.username || 'Anonimo'}</strong>
            <span>${comment.text}</span>
          `;
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

        try {
          const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica il token per ottenere il nome utente
          const username = payload.username;

          const res = await fetch(`/api/comments/${memeId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ text: commentText.value })
          });

          if (res.ok) {
            const newComment = await res.json(); // Ottieni il nuovo commento dal server
            commentText.value = ''; // Resetta il campo di testo
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>${username}</strong>
              <span>${newComment.text}</span>
            `;
            commentsList.appendChild(li); // Aggiungi il nuovo commento all'ultima posizione
          } else if (res.status === 401) {
            alert('Sessione scaduta. Effettua nuovamente il login.');
            localStorage.removeItem('token');
            checkAuthentication();
          } else {
            const errorData = await res.json();
            alert(`Errore: ${errorData.message || 'Impossibile aggiungere il commento.'}`);
          }
        } catch (error) {
          console.error('Errore durante l\'invio del commento:', error);
          alert('Errore durante l\'invio del commento.');
        }
      };
    } catch (error) {
      console.error('Errore durante l\'apertura del post:', error);
    }
  }

  // Attiva la modalità dark mode sempre
  document.body.classList.add('dark-mode');
  document.querySelector('header').classList.add('dark-mode');
  document.querySelector('footer').classList.add('dark-mode');

  async function loadMemes() {
    try {
      const res = await fetch('/api/memes');
      const memes = await res.json();
      grid.innerHTML = '';

      const sortedMemes = memes.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return isDescendingOrder ? dateB - dateA : dateA - dateB;
      });

      sortedMemes.forEach((meme) => {
        const memeContainer = document.createElement('div');
        memeContainer.classList.add('meme-container');

        const img = document.createElement('img');
        img.src = meme.imageUrl;
        img.alt = 'Meme';

        const infoPanel = document.createElement('div');
        infoPanel.classList.add('info-panel');

        const title = document.createElement('h2');
        title.textContent = meme.title || 'Titolo non disponibile';

        const author = document.createElement('p');
        author.textContent = `Autore: ${meme.uploader?.username || 'Sconosciuto'}`;

        const tagsAndVotes = document.createElement('div');
        tagsAndVotes.classList.add('tags-and-votes');

        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        if (meme.tags?.length) {
          meme.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag');
            tagElement.textContent = `#${tag.trim()}`;
            tagsContainer.appendChild(tagElement);
          });
        }

        const votingContainer = document.createElement('div');
        votingContainer.classList.add('voting-container');
        
        const upvoteButton = document.createElement('button');
        upvoteButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        `;
        upvoteButton.classList.add('vote-button', 'upvote');
        const upvoteCount = document.createElement('span');
        upvoteCount.textContent = meme.upvotes || 0;
        upvoteCount.classList.add('vote-count', 'upvotes');

        const downvoteButton = document.createElement('button');
        downvoteButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        `;
        downvoteButton.classList.add('vote-button', 'downvote');
        const downvoteCount = document.createElement('span');
        downvoteCount.textContent = meme.downvotes || 0;
        downvoteCount.classList.add('vote-count', 'downvotes');

        upvoteButton.onclick = async (e) => {
          e.stopPropagation();
          await handleVote(meme._id, 1, upvoteCount, downvoteCount);
        };

        downvoteButton.onclick = async (e) => {
          e.stopPropagation();
          await handleVote(meme._id, -1, upvoteCount, downvoteCount);
        };

        votingContainer.appendChild(upvoteButton);
        votingContainer.appendChild(upvoteCount);
        votingContainer.appendChild(downvoteButton);
        votingContainer.appendChild(downvoteCount);

        tagsAndVotes.appendChild(tagsContainer);
        tagsAndVotes.appendChild(votingContainer);

        infoPanel.appendChild(title);
        infoPanel.appendChild(author);
        infoPanel.appendChild(tagsAndVotes);

        memeContainer.appendChild(img);
        memeContainer.appendChild(infoPanel);
        memeContainer.addEventListener('click', () => openPost(meme._id));
        
        grid.appendChild(memeContainer);
      });
    } catch (error) {
      console.error('Errore durante il caricamento dei meme:', error);
      grid.innerHTML = `<p style="color: red;">Errore durante il caricamento dei meme: ${error.message}</p>`;
    }
  }

  async function handleVote(memeId, value, upvoteElement, downvoteElement) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Devi essere autenticato per votare.');
      return;
    }

    try {
      const response = await fetch(`/api/votes/${memeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });

      if (response.ok) {
        const data = await response.json();
        upvoteElement.textContent = data.upvotes;
        downvoteElement.textContent = data.downvotes;
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Errore durante il voto:', error);
      alert('Errore durante il voto.');
    }
  }

  orderToggleButton.addEventListener('click', () => {
    isDescendingOrder = !isDescendingOrder;
    orderToggleButton.textContent = isDescendingOrder
      ? 'Dal più recente'
      : 'Dal meno recente';
    loadMemes(); // Ricarica i meme con il nuovo ordine
  });

  function voteMeme(memeId, value, likeCountElement, dislikeCountElement) {
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
        if (data.updatedLikes !== undefined && data.updatedDislikes !== undefined) {
          // Aggiorna dinamicamente il conteggio dei like e dislike
          likeCountElement.textContent = data.updatedLikes;
          dislikeCountElement.textContent = data.updatedDislikes;
        }
      })
      .catch(err => console.error('Errore durante la votazione:', err));
  }

  searchButton.addEventListener('click', () => {
    const query = searchBar.value.trim().toLowerCase();
    if (query) {
      filterMemesByTag(query);
    } else {
      loadMemes(); // Ricarica tutti i meme se la barra di ricerca è vuota
    }
  });

  async function filterMemesByTag(tag) {
    try {
      const res = await fetch('/api/memes'); // Recupera tutti i meme dal backend
      const memes = await res.json();

      const filteredMemes = memes.filter(meme =>
        meme.tags?.some(t => t.toLowerCase().includes(tag))
      );

      grid.innerHTML = ''; // Pulisce la griglia

      if (filteredMemes.length === 0) {
        grid.innerHTML = '<p style="color: white;">Nessun meme trovato con il tag specificato.</p>';
        return;
      }

      filteredMemes.forEach((meme) => {
        const memeContainer = document.createElement('div');
        memeContainer.classList.add('meme-container');

        const img = document.createElement('img');
        img.src = meme.imageUrl;
        img.alt = 'Meme';

        const infoPanel = document.createElement('div');
        infoPanel.classList.add('info-panel');

        const title = document.createElement('h2');
        title.textContent = meme.title || 'Titolo non disponibile';

        const author = document.createElement('p');
        author.textContent = `Autore: ${meme.uploader?.username || 'Sconosciuto'}`;

        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        if (meme.tags?.length) {
          meme.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.classList.add('tag');
            tagElement.textContent = `#${tag.trim()}`;
            tagsContainer.appendChild(tagElement);
          });
        }

        infoPanel.appendChild(title);
        infoPanel.appendChild(author);
        if (tagsContainer.childElementCount > 0) infoPanel.appendChild(tagsContainer);

        memeContainer.appendChild(img);
        memeContainer.appendChild(infoPanel);
        memeContainer.addEventListener('click', () => openPost(meme._id));
        grid.appendChild(memeContainer);
      });
    } catch (error) {
      console.error('Errore durante il filtraggio dei meme:', error);
      grid.innerHTML = `<p style="color: red;">Errore durante il filtraggio dei meme: ${error.message}</p>`;
    }
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
