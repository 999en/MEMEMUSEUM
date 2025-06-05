// src/middlewares/uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import config from '../config/config.js';

// Configurazione dello storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

// Filtro per immagini
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Solo immagini jpeg, jpg, png o gif'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize }
});

export default upload;
