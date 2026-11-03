import dotenv from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';

if (nodeEnv === 'production' && (
  jwtSecret === 'your-super-secret-jwt-key-change-in-production' ||
  jwtRefreshSecret === 'your-refresh-secret-change-in-production' ||
  jwtSecret.startsWith('replace-with-') ||
  jwtRefreshSecret.startsWith('replace-with-')
)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production.');
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwt: {
    secret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
    accessExpiry: (process.env.JWT_ACCESS_EXPIRY || '15m') as SignOptions['expiresIn'],
    refreshExpiry: (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'],
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/localvibe',
  },

  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'sieuechxanh <noreply@localvibe.com>',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  ai: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    openRouterModel: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3.5-super-vl:free',
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};