import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  db: {
    storage: process.env.DB_STORAGE || './database.sqlite',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxUploadSize: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10) * 1024 * 1024,
};
