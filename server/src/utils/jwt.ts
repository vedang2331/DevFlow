import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { JwtPayload } from '../types';

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date;
};
