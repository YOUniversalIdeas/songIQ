import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createSongSchema } from '../validations/songValidation';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File validation configuration
const ALLOWED_AUDIO_TYPES = {
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/flac': '.flac',
  'audio/x-flac': '.flac'
};

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.flac'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Custom file filter with detailed error messages
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file extension
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return cb(new Error(`Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }

  // Check MIME type
  if (!ALLOWED_AUDIO_TYPES[file.mimetype as keyof typeof ALLOWED_AUDIO_TYPES]) {
    return cb(new Error(`Invalid file type. Allowed types: ${Object.values(ALLOWED_AUDIO_TYPES).join(', ')}`));
  }

  // Check if file extension matches MIME type
  const expectedExtension = ALLOWED_AUDIO_TYPES[file.mimetype as keyof typeof ALLOWED_AUDIO_TYPES];
  if (fileExtension !== expectedExtension) {
    return cb(new Error(`File extension (${fileExtension}) doesn't match MIME type (${file.mimetype})`));
  }

  cb(null, true);
};

// Configure storage with unique naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    
    // Sanitize base name (remove special characters, limit length)
    const sanitizedName = baseName
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    
    const uniqueFilename = `${sanitizedName}_${timestamp}_${randomSuffix}${fileExtension}`;
    cb(null, uniqueFilename);
  }
});

// Configure multer with error handling
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow one file per request
  },
  fileFilter
});

// Enhanced error handling middleware
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          error: 'Too many files',
          details: 'Only one file is allowed per upload'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          error: 'Unexpected file field',
          details: 'Please use the field name "audioFile"'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'File upload error',
          details: error.message
        });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      error: 'File validation error',
      details: error.message
    });
  }

  next(error);
};

// Single file upload middleware
export const uploadSingleAudio = upload.single('audioFile');

// Multiple files upload middleware (for future use)
export const uploadMultipleAudio = upload.array('audioFiles', 5);

// File metadata extraction
export const extractFileMetadata = (file: Express.Multer.File) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    sizeInMB: parseFloat(fileSizeInMB),
    extension: fileExtension,
    path: file.path,
    url: `/uploads/${file.filename}`
  };
};

// File cleanup utility
export const cleanupFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Validate upload request body
export const validateUploadRequest = (req: Request) => {
  const { error } = createSongSchema.validate(req.body);
  if (error && error.details && error.details[0]) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
};

export default upload; 