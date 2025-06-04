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
app.use(express.json({ limit: '10mb' }));
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// API health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API routes - devono venire prima della route generica '/'
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);

// Route home page - deve venire dopo le API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    code: err.status || 500,
    description: err.message || "An error occurred"
  });
});

// 404 handler - deve essere l'ultimo
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    description: "Route not found"
  });
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