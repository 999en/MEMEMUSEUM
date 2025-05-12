import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.routes.js';
import memeRoutes from './routes/meme.routes.js';
import commentRoutes from './routes/comment.routes.js';
import voteRoutes from './routes/vote.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

// Supporto per __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inizializzazione app
const app = express();

// Middleware
// Serve il frontend statico
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Route home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
app.use(express.json({ limit: '10mb' })); // Aumenta il limite per upload
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Connessione a MongoDB e avvio del server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI non definita nel file .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connesso a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
      console.log(`📁 Percorso uploads: ${path.join(__dirname, '../uploads')}`);
    });
  })
  .catch((err) => {
    console.error('❌ Errore di connessione a MongoDB:', err.message);
    process.exit(1);
  });

// Gestione errori centralizzata
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Errore non gestito:', err);
});

// Export per testing
export default app;