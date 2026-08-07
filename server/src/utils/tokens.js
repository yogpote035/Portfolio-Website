import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn },
  );
}

export function signRefreshToken(user, tokenVersion) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      tokenVersion,
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

export function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

export function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
