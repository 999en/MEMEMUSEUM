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
  const votesToggleButton = document.getElementById('votes-toggle-button');

  let isDescendingOrder = true; // Ordine predefinito: dal più recente al meno recente
  let sortByVotes = false;

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

  function resetAllForms() {
    // Reset dei form di autenticazione
    loginForm.reset();
    registerForm.reset();
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('register-error').classList.remove('show');
    
    // Reset del form di upload
    uploadMemeForm.reset();
    
    // Reset del form dei commenti
    commentForm?.reset();
    
    // Reset della barra di ricerca
    searchBar.value = '';
  }

  function refreshPage() {
    resetAllForms();
    loadMemes();
    window.scrollTo(0, 0);
  }

  function setUnauthenticatedState() {
    welcomeMessage.style.display = 'none';
    authButton.style.display = 'inline-block';
    registerButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
    uploadMemeButton.style.display = 'none';
    refreshPage();
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
    loginForm.reset();
  });

  closeRegisterModal.addEventListener('click', () => {
    registerModal.style.display = 'none';
    registerForm.reset();
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('login-error');

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem('token', data.token);
        checkAuthentication();
        loginModal.style.display = 'none';
        refreshPage();
      } else {
        if (data.error === 'user_not_found') {
          errorMessage.textContent = 'Utente non trovato. Vuoi registrarti?';
          errorMessage.classList.add('show');
          // Aggiungi un pulsante per passare alla registrazione
          const registerLink = document.createElement('a');
          registerLink.textContent = ' Clicca qui per registrarti';
          registerLink.style.color = '#6c63ff';
          registerLink.style.cursor = 'pointer';
          registerLink.onclick = switchToRegister;
          errorMessage.appendChild(registerLink);
        } else if (data.error === 'invalid_password') {
          errorMessage.textContent = 'Password errata. Riprova.';
          errorMessage.classList.add('show');
        } else {
          errorMessage.textContent = 'Errore durante l\'accesso. Riprova.';
          errorMessage.classList.add('show');
        }
      }
    } catch (err) {
      console.error('Errore durante l\'autenticazione:', err);
      errorMessage.textContent = 'Errore di connessione. Riprova più tardi.';
      errorMessage.classList.add('show');
    }
  });

  // Funzione per passare dalla login alla registrazione
  const switchToRegister = () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
    loginForm.reset();
    registerForm.reset();
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('register-error').classList.remove('show');
  }

  // Funzione per passare dalla registrazione alla login
  const switchToLogin = () => {
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
    loginForm.reset();
    registerForm.reset();
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('register-error').classList.remove('show');
  }

  // Aggiungere queste funzioni all'oggetto window per renderle disponibili globalmente
  window.switchToRegister = switchToRegister;
  window.switchToLogin = switchToLogin;

  registerForm.addEventListener('submit', async (e) => {
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
          refreshPage();
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
    refreshPage();
  });

  // Verifica autenticazione al caricamento della pagina
  checkAuthentication();

  closePostButton.addEventListener('click', () => {
    postDetails.style.display = 'none';
  });

  async function openPost(memeId) {
    try {
      const res = await fetch(`/api/memes/${memeId}`);
      if (!res.ok) {
        throw new Error('Errore nel recupero del meme');
      }

      const meme = await res.json();
      if (!meme) {
        throw new Error('Meme non trovato');
      }

      // Mostra/nascondi i bottoni di modifica ed eliminazione in base all'autore
      const deleteButton = document.getElementById('delete-meme');
      const editButton = document.getElementById('edit-meme');
      const token = localStorage.getItem('token');
      
      // Nascondi i bottoni di default
      deleteButton.style.display = 'none';
      editButton.style.display = 'none';

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Verifica che sia meme.uploader che payload.id esistano
          const isOwner = meme.uploader && payload.id && meme.uploader._id === payload.id;
          
          if (isOwner) {
            deleteButton.style.display = 'block';
            editButton.style.display = 'block';
            
            editButton.onclick = () => openEditModal(meme);
            deleteButton.onclick = () => deleteMeme(meme._id);
          }
        } catch (error) {
          console.error('Errore nella verifica del proprietario:', error);
        }
      }

      // Aggiorna la visualizzazione dell'autore in modo sicuro
      postAuthor.textContent = meme.uploader?.username || 'Utente sconosciuto';
      postImage.src = meme.imageUrl || '';
      postImage.alt = meme.title || 'Meme';

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
            const newComment = await res.json();
            commentText.value = '';
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>${username}</strong>
              <span>${newComment.text}</span>
            `;
            commentsList.appendChild(li);
            commentForm.reset();
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
      alert('Errore durante l\'apertura del post: ' + error.message);
    }
  }

  async function deleteMeme(memeId) {
    if (!confirm('Sei sicuro di voler eliminare questo meme?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token non disponibile');
      }

      const response = await fetch(`/api/memes/${memeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore durante l\'eliminazione');
      }

      alert('Meme eliminato con successo');
      document.getElementById('post-details').style.display = 'none';
      loadMemes();
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      alert('Errore durante l\'eliminazione: ' + error.message);
    }
  }

  function openEditModal(meme) {
    try {
      const editModal = document.getElementById('edit-meme-modal');
      const editForm = document.getElementById('edit-meme-form');
      const titleInput = document.getElementById('edit-title');
      const tagsInput = document.getElementById('edit-tags');

      if (!meme) {
        throw new Error('Dati del meme non disponibili');
      }

      titleInput.value = meme.title || '';
      tagsInput.value = meme.tags ? meme.tags.join(', ') : '';

      editModal.style.display = 'flex';

      editForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(editForm);
        
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token non disponibile');
          }

          const response = await fetch(`/api/memes/${meme._id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const updatedMeme = await response.json();
            alert('Meme modificato con successo!');
            editModal.style.display = 'none';
            loadMemes();
            document.getElementById('post-details').style.display = 'none';
          } else {
            const error = await response.json();
            throw new Error(error.message || 'Errore durante la modifica');
          }
        } catch (error) {
          console.error('Errore durante la modifica:', error);
          alert('Errore durante la modifica del meme: ' + error.message);
        }
      };
    } catch (error) {
      console.error('Errore nell\'apertura del modal di modifica:', error);
      alert('Errore nell\'apertura del modal di modifica');
    }
  }

  // Aggiungi event listener per chiudere il modal di modifica
  document.getElementById('close-edit-modal').addEventListener('click', () => {
    document.getElementById('edit-meme-modal').style.display = 'none';
    document.getElementById('edit-meme-form').reset();
  });

  // Attiva la modalità dark mode sempre
  document.body.classList.add('dark-mode');
  document.querySelector('header').classList.add('dark-mode');
  document.querySelector('footer').classList.add('dark-mode');

  async function loadMemes() {
    try {
      const res = await fetch('/api/memes');
      const memes = await res.json();
      grid.innerHTML = '';

      // Debug per verificare i dati
      console.log('Dati meme ricevuti:', memes);

      // Creiamo prima tutti gli elementi
      const memeElements = await Promise.all(memes.map(async (meme) => {
        // Recupera i dettagli del meme per assicurarci di avere l'autore
        const memeDetailsRes = await fetch(`/api/memes/${meme._id}`);
        const memeDetails = await memeDetailsRes.json();
        
        const memeContainer = document.createElement('div');
        memeContainer.classList.add('meme-container');

        const img = document.createElement('img');
        img.src = memeDetails.imageUrl;
        img.alt = 'Meme';

        const infoPanel = document.createElement('div');
        infoPanel.classList.add('info-panel');

        const title = document.createElement('h2');
        title.textContent = memeDetails.title || 'Titolo non disponibile';

        const author = document.createElement('p');
        // Usa i dati del meme completo che includono l'uploader
        author.textContent = memeDetails.uploader?.username || 'Sconosciuto';
        author.classList.add('author');

        const tagsAndVotes = document.createElement('div');
        tagsAndVotes.classList.add('tags-and-votes');

        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        if (memeDetails.tags?.length) {
          memeDetails.tags.forEach(tag => {
            const tagElement = document.createElement('button'); // Cambiato da span a button
            tagElement.classList.add('tag');
            tagElement.textContent = `#${tag.trim()}`;
            tagElement.onclick = (e) => {
              e.stopPropagation();
              // Imposta il valore nella barra di ricerca
              searchBar.value = tag.trim();
              // Esegue la ricerca
              filterMemesByTag(tag.trim());
            };
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
        upvoteCount.textContent = memeDetails.upvotes || 0;
        upvoteCount.classList.add('vote-count', 'upvotes');

        const downvoteButton = document.createElement('button');
        downvoteButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        `;
        downvoteButton.classList.add('vote-button', 'downvote');
        const downvoteCount = document.createElement('span');
        downvoteCount.textContent = memeDetails.downvotes || 0;
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

        return { element: memeContainer, meme: memeDetails };
      }));

      // Applica il sorting dopo aver recuperato tutti i dati
      const sortedElements = memeElements.sort((a, b) => {
        if (sortByVotes) {
          return (b.meme.upvotes || 0) - (a.meme.upvotes || 0);
        } else {
          const dateA = new Date(a.meme.createdAt);
          const dateB = new Date(b.meme.createdAt);
          return isDescendingOrder ? dateB - dateA : dateA - dateB;
        }
      });

      // Aggiungi gli elementi ordinati alla griglia
      sortedElements.forEach(({ element }) => {
        grid.appendChild(element);
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
    sortByVotes = false;
    orderToggleButton.classList.add('active');
    votesToggleButton.classList.remove('active');
    isDescendingOrder = !isDescendingOrder;
    orderToggleButton.textContent = isDescendingOrder
      ? 'Dal più recente'
      : 'Dal meno recente';
    loadMemes(); // Ricarica i meme con il nuovo ordine
  });

  votesToggleButton.addEventListener('click', () => {
    sortByVotes = true;
    votesToggleButton.classList.add('active');
    orderToggleButton.classList.remove('active');
    loadMemes();
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
      const res = await fetch('/api/memes');
      const memes = await res.json();

      const filteredMemes = memes.filter(meme =>
        meme.tags?.some(t => t.toLowerCase().includes(tag))
      );

      grid.innerHTML = '';

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
        author.classList.add('author');

        const tagsAndVotes = document.createElement('div');
        tagsAndVotes.classList.add('tags-and-votes');

        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        if (meme.tags?.length) {
          meme.tags.forEach(tag => {
            const tagElement = document.createElement('button');
            tagElement.classList.add('tag');
            tagElement.textContent = `#${tag.trim()}`;
            tagElement.onclick = (e) => {
              e.stopPropagation();
              searchBar.value = tag.trim();
              filterMemesByTag(tag.trim());
            };
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
    uploadMemeForm.reset();
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
        refreshPage();
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
