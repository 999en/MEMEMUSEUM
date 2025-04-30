// src/server.js
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

dotenv.config();

// Supporto per __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inizializzazione app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);

// Connessione a MongoDB e avvio del server
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connesso a MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Errore di connessione a MongoDB:', err);
});
