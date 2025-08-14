const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv', // .csv
    'application/pdf', // .pdf
    'text/plain' // .txt
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: .xls, .xlsx, .csv, .pdf, .txt'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB por defecto
    files: 5 // Máximo 5 archivos por request
  }
});

// Middleware de validación
const validateUpload = [
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('La categoría no puede exceder 100 caracteres')
];

// POST /api/upload - Subir archivo
router.post('/', auth, upload.single('file'), validateUpload, async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Crear objeto de respuesta
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      description: req.body.description || '',
      category: req.body.category || 'general',
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    // Log de auditoría
    console.log(`📁 Archivo subido: ${fileInfo.originalName} por usuario ${req.user.id}`);

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: fileInfo
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ 
      error: 'Error al subir el archivo',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// POST /api/upload/multiple - Subir múltiples archivos
router.post('/multiple', auth, upload.array('files', 5), validateUpload, async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      description: req.body.description || '',
      category: req.body.category || 'general',
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    }));

    // Log de auditoría
    console.log(`📁 ${uploadedFiles.length} archivos subidos por usuario ${req.user.id}`);

    res.status(201).json({
      message: `${uploadedFiles.length} archivos subidos exitosamente`,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ 
      error: 'Error al subir los archivos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// GET /api/upload - Listar archivos del usuario
router.get('/', auth, async (req, res) => {
  try {
    // Por ahora retornamos un mensaje, pero aquí podrías implementar
    // la lógica para listar archivos desde la base de datos
    res.json({
      message: 'Lista de archivos',
      files: [] // Implementar lógica de base de datos
    });

  } catch (error) {
    console.error('Error al listar archivos:', error);
    res.status(500).json({ 
      error: 'Error al listar archivos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// DELETE /api/upload/:filename - Eliminar archivo
router.delete('/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Eliminar archivo
    fs.unlinkSync(filePath);

    // Log de auditoría
    console.log(`🗑️ Archivo eliminado: ${filename} por usuario ${req.user.id}`);

    res.json({
      message: 'Archivo eliminado exitosamente',
      filename: filename
    });

  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el archivo',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// Middleware de manejo de errores de multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Archivo demasiado grande',
        message: `El archivo excede el tamaño máximo permitido (${process.env.MAX_FILE_SIZE || '10MB'})`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Demasiados archivos',
        message: 'Se permite un máximo de 5 archivos por request'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'Campo de archivo inesperado',
        message: 'El nombre del campo debe ser "file" o "files"'
      });
    }
  }
  
  next(error);
});

module.exports = router;
