# MEMEMUSEUM

mememuseum/
└── backend/
    ├── uploads/                      # Cartella dove verranno salvate le immagini dei meme
    ├── .env                          # Variabili d'ambiente
    ├── package.json                  # Configurazione npm
    ├── src/
    │   ├── server.js                 # Entry point del server Express
    │
    │   ├── models/
    │   │   ├── User.js               # Modello per l'utente
    │   │   ├── Meme.js               # Modello per il meme
    │   │   ├── Comment.js            # Modello per i commenti ai meme
    │   │   └── Vote.js               # Modello per voti upvote/downvote
    │
    │   ├── routes/
    │   │   ├── auth.routes.js        # Rotte di autenticazione (login/register)
    │   │   ├── meme.routes.js        # Rotte per meme (upload, ricerca, visualizzazione)
    │   │   └── comment.routes.js     # Rotte per i commenti
    │
    │   ├── controllers/
    │   │   ├── auth.controller.js    # Logica delle rotte di autenticazione
    │   │   ├── meme.controller.js    # Logica delle rotte per i meme
    │   │   └── comment.controller.js # Logica per i commenti
    │
    │   ├── middlewares/
    │   │   ├── authMiddleware.js     # Middleware per proteggere rotte (verifica JWT)
    │   │   └── uploadMiddleware.js   # Middleware Multer per gestire l’upload immagini
    │
    │   └── utils/
    │       └── rotation.js           # Algoritmo per selezionare il "meme del giorno"

