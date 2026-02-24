import express from 'express';

import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { resetAllDemoData } from '../services/devResetService.js';
import { clearSessionCookie } from '../services/sessionService.js';

export const devRoutes = express.Router();

devRoutes.post('/reset', async (req, res, next) => {
  try {
    if (!env.DEV_RESET_ENABLED || env.NODE_ENV === 'production') {
      throw new AppError(404, 'NOT_FOUND', 'Endpoint not available');
    }

    await resetAllDemoData();
    clearSessionCookie(res);

    res.json({ ok: true, message: 'Demo data reset complete' });
  } catch (error) {
    next(error);
  }
});
