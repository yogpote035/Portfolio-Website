import { Router } from 'express';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  sendSuccess(res, 'Portfolio CMS API is healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
