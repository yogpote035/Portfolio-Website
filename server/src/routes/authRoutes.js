import { Router } from 'express';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  resetPassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from '../validators/authSchemas.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/refresh-token', validate(refreshSchema), asyncHandler(refreshToken));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(getMe));

export default router;
