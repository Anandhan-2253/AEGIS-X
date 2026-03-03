import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { env } from '../config/env';
import { ValidationError } from '../utils/errors';

const allowedMimeTypes = new Set([
  'application/octet-stream',
  'application/x-dosexec',
  'application/x-msdownload',
  'application/x-elf',
  'application/zip',
  'application/x-zip-compressed',
  'application/pdf',
]);

const uploadRoot = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new ValidationError(`Unsupported MIME type: ${file.mimetype}`));
    return;
  }
  cb(null, true);
};

export const malwareUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});
