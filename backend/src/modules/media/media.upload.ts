import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { AppError } from '@utils/AppError';
import { env } from '@config/env';

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.pdf', '.doc', '.docx', '.txt', '.mp4', '.webm',
]);

export function ensureUploadDir(): string {
  const dir = path.resolve(process.cwd(), env.uploadDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ensureUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    cb(AppError.badRequest(`File type not allowed: ${ext || 'unknown'}`));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadSize },
  fileFilter,
});
