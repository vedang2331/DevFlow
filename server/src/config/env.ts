import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  databaseUrl: process.env.DATABASE_URL || 'postgresql://devflow_user:devflow_password@localhost:5432/devflow_db?schema=public',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'devflow_access_secret_super_key_2026_x99!',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'devflow_refresh_secret_super_key_2026_z88!',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || 'mock_github_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock_github_client_secret',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || 'devflow_github_webhook_secret_key',
  }
};
