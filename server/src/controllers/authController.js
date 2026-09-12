import { env } from '../config/env.js';
import {
  findUserByEmail,
  findUserById,
  findUserByResetTokenHash,
  rotateTokenVersion,
  savePasswordResetToken,
  updateLastLogin,
  updatePassword,
} from '../models/userModel.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  createResetToken,
  hashResetToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

function buildAuthPayload(user) {
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken: signAccessToken(user),
    refreshToken: signRefreshToken(user, user.token_version),
  };
}

export async function login(req, res) {
  const { email, password } = req.validated.body;
  const user = await findUserByEmail(email, true);

  if (!user || !user.is_active) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  await updateLastLogin(user.id);
  return sendSuccess(res, 'Login successful', buildAuthPayload(user));
}

export async function refreshToken(req, res) {
  const { refreshToken: token } = req.validated.body;
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch (error) {
    const authError = new Error(error.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token');
    authError.statusCode = 401;
    throw authError;
  }
  const user = await findUserById(payload.sub);

  if (!user || !user.is_active || user.token_version !== payload.tokenVersion) {
    const error = new Error('Invalid refresh token');
    error.statusCode = 401;
    throw error;
  }

  return sendSuccess(res, 'Token refreshed', buildAuthPayload(user));
}

export async function logout(req, res) {
  await rotateTokenVersion(req.user.id);
  return sendSuccess(res, 'Logout successful');
}

export async function forgotPassword(req, res) {
  const { email } = req.validated.body;
  const user = await findUserByEmail(email);

  if (user) {
    const { rawToken, tokenHash } = createResetToken();
    const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

    await savePasswordResetToken(user.id, tokenHash, expiresAt);

    // Replace this with email delivery in the notification feature slice.
    if (env.nodeEnv !== 'production') {
      return sendSuccess(res, 'Password reset token generated', {
        resetToken: rawToken,
        expiresAt,
      });
    }
  }

  return sendSuccess(
    res,
    'If an account exists for this email, a reset link will be sent shortly',
  );
}

export async function resetPassword(req, res) {
  const { token, password } = req.validated.body;
  const tokenHash = hashResetToken(token);
  const user = await findUserByResetTokenHash(tokenHash);

  if (!user) {
    const error = new Error('Invalid or expired reset token');
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  await updatePassword(user.id, passwordHash);

  return sendSuccess(res, 'Password reset successful');
}

export async function getMe(req, res) {
  return sendSuccess(res, 'Authenticated user fetched', {
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
}
