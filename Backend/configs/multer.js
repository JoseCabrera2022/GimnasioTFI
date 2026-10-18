import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan los archivos
  },
  filename: (req, file, cb) => {
    // nombre único: timestamp + extensión original
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filtro opcional: solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

export const upload = multer({ storage, fileFilter });
