import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  uploadsDir: path.join(__dirname, '../../uploads'),
  maxFileSize: 5 * 1024 * 1024 // 5MB in bytes
};

export default config;
