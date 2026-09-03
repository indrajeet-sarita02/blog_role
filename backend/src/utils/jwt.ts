import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@config/env';

export interface JwtPayload extends jwt.JwtPayload {
  sub: string;
  type: 'access' | 'refresh';
}

export function signAccessToken(userId: string): string {
  return jwt.sign(
    { type: 'access' },
    env.jwt.accessSecret,
    {
      subject: userId,
      expiresIn: env.jwt.accessExpiresIn,
    } as SignOptions,
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign(
    { type: 'refresh' },
    env.jwt.refreshSecret,
    {
      subject: userId,
      expiresIn: env.jwt.refreshExpiresIn,
    } as SignOptions,
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}
