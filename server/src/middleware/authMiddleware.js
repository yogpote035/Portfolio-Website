import { findUserById } from '../models/userModel.js';
import { verifyAccessToken } from '../utils/tokens.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.sub);

    if (!user || !user.is_active) {
      const error = new Error('Invalid or inactive user');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    if (error.name === 'TokenExpiredError') {
      error.message = 'Access token expired';
      error.code = 'ACCESS_TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      error.message = 'Invalid access token';
      error.code = 'INVALID_ACCESS_TOKEN';
    } else {
      error.message = error.message || 'Unauthorized';
    }
    next(error);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}
