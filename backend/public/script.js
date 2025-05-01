document.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/api/memes');
      const memes = await res.json();
  
      const grid = document.getElementById('meme-grid');
  
      memes.slice(0, 9).forEach(meme => {
        const img = document.createElement('img');
        img.src = `/uploads/${meme.image}`; // `image` deve essere il nome del file salvato
        img.alt = meme.title || 'Meme';
        grid.appendChild(img);
      });
    } catch (error) {
      console.error('Errore durante il caricamento dei meme:', error);
    }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('meme-grid');
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
  
    // Funzione per caricare i meme
    async function loadMemes() {
      try {
        const res = await fetch('/api/memes');
        const memes = await res.json();
  
        grid.innerHTML = ''; // Pulisce la griglia
  
        memes.slice(0, 9).forEach(meme => {
          const img = document.createElement('img');
          img.src = `/uploads/${meme.image}`; // Assicurati che 'image' sia il nome del file
          img.alt = meme.title || 'Meme';
          grid.appendChild(img);
        });
      } catch (error) {
        console.error('Errore durante il caricamento dei meme:', error);
      }
    }
  
    // Carica i meme al caricamento della pagina
    loadMemes();
  
    // Gestione dell'invio del modulo di upload
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);
  
      try {
        const res = await fetch('/api/memes', {
          method: 'POST',
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
  