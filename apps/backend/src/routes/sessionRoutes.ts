import express from 'express';

import { destroySession } from '../services/sessionService.js';
import { clearSessionCookie } from '../services/sessionService.js';

export const sessionRoutes = express.Router();

sessionRoutes.get('/me', (req, res) => {
  if (!req.currentUser) {
    res.json({ authenticated: false, user: null });
    return;
  }

  res.json({
    authenticated: true,
    user: req.currentUser,
  });
});

sessionRoutes.post('/logout', async (req, res, next) => {
  try {
    if (req.sessionId) {
      await destroySession(req.sessionId);
    }

    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
